// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
const PER_PAGE = 40

/**
 * GET /api/role-list?role=commentator&page=1&...filters
 * 
 * Supports: commentator, ring_announcer, referee, interviewer, general_manager, executive
 * 
 * Special modes for referee/commentator:
 *   includeGuests=true → show wrestlers who guest-refereed/guest-commented
 *   guestsOnly=true → show ONLY guest referees/commentators
 * 
 * Sort: sortBy (name|stat) — stat = role-specific count (shows commented, matches refereed, etc.)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const role = searchParams.get('role') || ''
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const letter = searchParams.get('letter') || ''
  const search = searchParams.get('search') || ''
  const eraId = searchParams.get('eraId') || ''
  const status = searchParams.get('status') || ''
  const gender = searchParams.get('gender') || ''
  const hofOnly = searchParams.get('hofOnly') === 'true'
  const country = searchParams.get('country') || ''
  const city = searchParams.get('city') || ''
  const birthYear = searchParams.get('birthYear') || ''
  const debutYear = searchParams.get('debutYear') || ''
  const sortBy = searchParams.get('sortBy') || 'name'
  const guestsOnly = searchParams.get('guestsOnly') === 'true'

  if (!role) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

  try {
    // ---- Pre-filters ----
    let eraIds: number[] | null = null
    if (eraId) {
      const { data } = await supabase.from('superstar_eras').select('superstar_id').eq('era_id', parseInt(eraId))
      eraIds = data?.map(r => r.superstar_id) || []
      if (eraIds.length === 0) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })
    }

    let searchIds: number[] | null = null
    if (search && search.length >= 2) {
      const clean = search.replace(/^the\s+/i, '')
      const [{ data: a }, { data: b }, { data: c }, { data: d }] = await Promise.all([
        supabase.from('superstars').select('id').or(`name.ilike.%${search}%,name.ilike.%${clean}%`),
        supabase.from('superstar_aliases').select('superstar_id').or(`alias.ilike.%${search}%,alias.ilike.%${clean}%`),
        supabase.from('superstar_nicknames').select('superstar_id').or(`nickname.ilike.%${search}%,nickname.ilike.%${clean}%`),
        supabase.from('superstars').select('id').or(`real_name.ilike.%${search}%,real_name.ilike.%${clean}%`),
      ])
      const set = new Set<number>()
      for (const r of (a || [])) set.add(r.id)
      for (const r of (b || [])) set.add(r.superstar_id)
      for (const r of (c || [])) set.add(r.superstar_id)
      for (const r of (d || [])) set.add(r.id)
      searchIds = [...set]
      if (searchIds.length === 0) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })
    }

    // ---- For guests mode (referee/commentator): find IDs from activity tables ----
    if (guestsOnly && (role === 'referee' || role === 'commentator')) {
      // Get all IDs who appear in the activity table but whose primary role is NOT this role
      let activityIds: number[] = []
      if (role === 'referee') {
        const { data } = await supabase.from('match_referees').select('superstar_id').eq('is_special_referee', true).not('superstar_id', 'is', null)
        const set = new Set<number>()
        for (const r of (data || [])) if (r.superstar_id) set.add(r.superstar_id)
        activityIds = [...set]
      } else {
        // Guest commentators: appear in show_commentators but role != 'commentator'
        const { data: allComm } = await supabase.from('show_commentators').select('superstar_id')
        const commIds = new Set<number>()
        for (const r of (allComm || [])) commIds.add(r.superstar_id)
        // Filter: only those whose primary role is NOT commentator
        if (commIds.size > 0) {
          const { data: notComm } = await supabase.from('superstars').select('id').in('id', [...commIds]).neq('role', 'commentator')
          activityIds = (notComm || []).map(r => r.id)
        }
      }
      if (activityIds.length === 0) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })
      // Override searchIds to include only these
      if (searchIds) {
        const s = new Set(searchIds)
        activityIds = activityIds.filter(id => s.has(id))
      }
      searchIds = activityIds
    }

    // ---- Stat-based sort ----
    const isStatSort = sortBy === 'stat'

    if (isStatSort) {
      // Fetch stats, sort by them, then paginate
      const statsMap = await fetchRoleStats(role, guestsOnly)

      let sortedIds = [...statsMap.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)

      // Apply filters
      if (searchIds) { const s = new Set(searchIds); sortedIds = sortedIds.filter(id => s.has(id)) }
      if (eraIds) { const s = new Set(eraIds); sortedIds = sortedIds.filter(id => s.has(id)) }

      // Get matching superstars with other filters
      let fq = supabase.from('superstars').select('id')
      if (!guestsOnly) fq = fq.eq('role', role)
      if (letter) fq = fq.ilike('name', `${letter}%`)
      if (status) fq = fq.eq('status', status)
      if (gender) fq = fq.eq('gender', gender)
      if (hofOnly) fq = fq.eq('is_hall_of_fame', true)
      if (country) fq = fq.eq('birth_country', country)
      if (city) fq = fq.eq('birth_city', city)
      if (birthYear) fq = fq.gte('birth_date', `${birthYear}-01-01`).lte('birth_date', `${birthYear}-12-31`)
      if (debutYear) fq = fq.gte('debut_date', `${debutYear}-01-01`).lte('debut_date', `${debutYear}-12-31`)

      const { data: filteredRows } = await fq
      const filterSet = new Set((filteredRows || []).map((r: any) => r.id))
      sortedIds = sortedIds.filter(id => filterSet.has(id))

      // Also include those with 0 stats at end
      const rest = [...filterSet].filter(id => !statsMap.has(id))
      const finalIds = [...sortedIds, ...rest]

      const total = finalIds.length
      const totalPages = Math.ceil(total / PER_PAGE)
      const offset = (page - 1) * PER_PAGE
      const pageIds = finalIds.slice(offset, offset + PER_PAGE)

      if (pageIds.length === 0) return NextResponse.json({ items: [], total, page, totalPages })

      const { data: items } = await supabase.from('superstars')
        .select('id, name, slug, photo_url, gender, status, is_hall_of_fame, birth_country, birth_date, debut_date, role')
        .in('id', pageIds)

      const itemMap = new Map((items || []).map((m: any) => [m.id, m]))
      const ordered = pageIds.map(id => {
        const m = itemMap.get(id)
        if (!m) return null
        return { ...m, role_stat: statsMap.get(id) || 0 }
      }).filter(Boolean)

      return NextResponse.json({ items: ordered, total, page, totalPages })
    }

    // ---- Standard name sort ----
    let query = supabase.from('superstars')
      .select('id, name, slug, photo_url, gender, status, is_hall_of_fame, birth_country, birth_date, debut_date, role', { count: 'exact' })

    if (!guestsOnly) query = query.eq('role', role)
    if (guestsOnly && searchIds) query = query.in('id', searchIds.slice(0, 2000))
    else if (searchIds) query = query.in('id', searchIds.slice(0, 2000))

    query = query.order('name', { ascending: true })

    if (letter) query = query.ilike('name', `${letter}%`)
    if (eraIds) query = query.in('id', eraIds.slice(0, 2000))
    if (status) query = query.eq('status', status)
    if (gender) query = query.eq('gender', gender)
    if (hofOnly) query = query.eq('is_hall_of_fame', true)
    if (country) query = query.eq('birth_country', country)
    if (city) query = query.eq('birth_city', city)
    if (birthYear) query = query.gte('birth_date', `${birthYear}-01-01`).lte('birth_date', `${birthYear}-12-31`)
    if (debutYear) query = query.gte('debut_date', `${debutYear}-01-01`).lte('debut_date', `${debutYear}-12-31`)

    const offset = (page - 1) * PER_PAGE
    query = query.range(offset, offset + PER_PAGE - 1)

    const { data: items, error, count } = await query
    if (error) { console.error('[role-list]', error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }

    // Enrich with stats
    const ids = (items || []).map((m: any) => m.id)
    const statsMap = ids.length > 0 ? await fetchRoleStatsForIds(role, ids, guestsOnly) : new Map()

    const enriched = (items || []).map((m: any) => ({ ...m, role_stat: statsMap.get(m.id) || 0 }))

    return NextResponse.json({ items: enriched, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER_PAGE) })
  } catch (err) {
    console.error('[role-list] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/* ============================================================
   ROLE-SPECIFIC STATS
   ============================================================ */

/** Fetch ALL stats for a role (for sorting) */
async function fetchRoleStats(role: string, guestsOnly: boolean): Promise<Map<number, number>> {
  const map = new Map<number, number>()

  if (role === 'commentator') {
    const table = guestsOnly ? 'show_commentators' : 'show_commentators'
    const { data } = await supabase.from(table).select('superstar_id')
    for (const r of (data || [])) {
      map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
    }
  } else if (role === 'ring_announcer') {
    const { data } = await supabase.from('show_ring_announcers').select('superstar_id')
    for (const r of (data || [])) {
      map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
    }
  } else if (role === 'referee') {
    const q = guestsOnly
      ? supabase.from('match_referees').select('superstar_id').eq('is_special_referee', true).not('superstar_id', 'is', null)
      : supabase.from('match_referees').select('superstar_id').not('superstar_id', 'is', null)
    const { data } = await q
    for (const r of (data || [])) {
      if (r.superstar_id) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
    }
  } else if (role === 'interviewer') {
    const { data } = await supabase.from('show_segment_participants').select('superstar_id').eq('role', 'interviewer')
    for (const r of (data || [])) {
      map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
    }
  }
  // general_manager and executive have no count table

  return map
}

/** Fetch stats for specific IDs only (for page enrichment) */
async function fetchRoleStatsForIds(role: string, ids: number[], guestsOnly: boolean): Promise<Map<number, number>> {
  const map = new Map<number, number>()
  if (ids.length === 0) return map

  if (role === 'commentator') {
    const { data } = await supabase.from('show_commentators').select('superstar_id').in('superstar_id', ids)
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'ring_announcer') {
    const { data } = await supabase.from('show_ring_announcers').select('superstar_id').in('superstar_id', ids)
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'referee') {
    const q = guestsOnly
      ? supabase.from('match_referees').select('superstar_id').in('superstar_id', ids).eq('is_special_referee', true)
      : supabase.from('match_referees').select('superstar_id').in('superstar_id', ids)
    const { data } = await q
    for (const r of (data || [])) if (r.superstar_id) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'interviewer') {
    const { data } = await supabase.from('show_segment_participants').select('superstar_id').in('superstar_id', ids).eq('role', 'interviewer')
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  }

  return map
}
