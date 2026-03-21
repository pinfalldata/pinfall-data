// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/arenas-list?page=1&limit=40&year=2012&month=3&country=US&state=NY&city=New+York&sort=most_used
 * sort: alphabetical | most_used | highest_attendance
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(12, parseInt(searchParams.get('limit') || '40')))
  const offset = (page - 1) * limit

  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const country = searchParams.get('country')
  const state = searchParams.get('state')
  const city = searchParams.get('city')
  const sort = searchParams.get('sort') || 'most_used'

  try {
    // === Step 1: Get arena IDs matching date filter ===
    let arenaIdFilter: number[] | null = null

    if (year) {
      let showQ = supabase.from('shows').select('arena_id').not('arena_id', 'is', null)
      if (month) {
        const m = month.padStart(2, '0')
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        showQ = showQ.gte('date', `${year}-${m}-01`).lte('date', `${year}-${m}-${lastDay}`)
      } else {
        showQ = showQ.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
      }
      const { data: showArenas } = await showQ
      if (showArenas) {
        arenaIdFilter = [...new Set(showArenas.map(s => s.arena_id).filter(Boolean))]
      }
      if (!arenaIdFilter || arenaIdFilter.length === 0) {
        return NextResponse.json({ arenas: [], total: 0, page, totalPages: 0, filterOptions: await getFilterOptions() })
      }
    }

    // === Step 2: Get all arenas with location filters ===
    let query = supabase.from('arenas').select('*', { count: 'exact' })

    if (arenaIdFilter) query = query.in('id', arenaIdFilter.slice(0, 2000))
    if (country) query = query.eq('country', country)
    if (state) query = query.eq('state_province', state)
    if (city) query = query.eq('city', city)

    // Don't paginate yet — we need to sort in memory for most_used/highest_attendance
    const { data: allArenas, error, count } = await query

    if (error) {
      console.error('[arenas-list] error:', error)
      return NextResponse.json({ error: 'Failed to fetch arenas' }, { status: 500 })
    }

    if (!allArenas || allArenas.length === 0) {
      return NextResponse.json({ arenas: [], total: 0, page, totalPages: 0, filterOptions: await getFilterOptions() })
    }

    // === Step 3: Get show counts and max attendance per arena ===
    const arenaIds = allArenas.map(a => a.id)
    const batchSize = 500
    let showStats: { arena_id: number; attendance: number | null }[] = []

    for (let i = 0; i < arenaIds.length; i += batchSize) {
      const batch = arenaIds.slice(i, i + batchSize)
      let sq = supabase.from('shows').select('arena_id, attendance').in('arena_id', batch)
      // If year filter, only count shows in that year
      if (year) {
        if (month) {
          const m = month.padStart(2, '0')
          const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
          sq = sq.gte('date', `${year}-${m}-01`).lte('date', `${year}-${m}-${lastDay}`)
        } else {
          sq = sq.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
        }
      }
      const { data } = await sq
      if (data) showStats.push(...data)
    }

    // Compute stats per arena
    const countMap = new Map<number, number>()
    const maxAttMap = new Map<number, number>()
    for (const s of showStats) {
      if (s.arena_id) {
        countMap.set(s.arena_id, (countMap.get(s.arena_id) || 0) + 1)
        if (s.attendance && s.attendance > (maxAttMap.get(s.arena_id) || 0)) {
          maxAttMap.set(s.arena_id, s.attendance)
        }
      }
    }

    // === Step 4: Get arena name histories ===
    let nameMap: Record<number, any[]> = {}
    for (let i = 0; i < arenaIds.length; i += batchSize) {
      const batch = arenaIds.slice(i, i + batchSize)
      const { data: names } = await supabase
        .from('arena_names')
        .select('arena_id, name, start_date, end_date, is_current')
        .in('arena_id', batch)
        .order('start_date', { ascending: true, nullsFirst: true })
      for (const n of (names || [])) {
        if (!nameMap[n.arena_id]) nameMap[n.arena_id] = []
        nameMap[n.arena_id].push(n)
      }
    }

    // === Step 5: Enrich and sort ===
    let enriched = allArenas.map(a => ({
      ...a,
      show_count: countMap.get(a.id) || 0,
      max_attendance: maxAttMap.get(a.id) || 0,
      name_history: nameMap[a.id] || [],
    }))

    if (sort === 'most_used') {
      enriched.sort((a, b) => b.show_count - a.show_count)
    } else if (sort === 'highest_attendance') {
      enriched.sort((a, b) => (b.max_attendance || 0) - (a.max_attendance || 0))
    } else {
      enriched.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }

    // Paginate
    const total = enriched.length
    const totalPages = Math.ceil(total / limit)
    const paged = enriched.slice(offset, offset + limit)

    return NextResponse.json({
      arenas: paged,
      total,
      page,
      totalPages,
      filterOptions: await getFilterOptions(),
    })
  } catch (err) {
    console.error('[arenas-list] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function getFilterOptions() {
  try {
    const [
      { data: countries },
      { data: states },
      { data: cities },
      { data: showYears },
    ] = await Promise.all([
      supabase.from('arenas').select('country').not('country', 'is', null),
      supabase.from('arenas').select('state_province').not('state_province', 'is', null),
      supabase.from('arenas').select('city').not('city', 'is', null),
      supabase.from('shows').select('date').not('arena_id', 'is', null),
    ])

    const years = [...new Set((showYears || []).map(s => s.date?.slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a))

    return {
      countries: [...new Set((countries || []).map(c => c.country).filter(Boolean))].sort(),
      states: [...new Set((states || []).map(s => s.state_province).filter(Boolean))].sort(),
      cities: [...new Set((cities || []).map(c => c.city).filter(Boolean))].sort(),
      years,
    }
  } catch {
    return { countries: [], states: [], cities: [], years: [] }
  }
}
