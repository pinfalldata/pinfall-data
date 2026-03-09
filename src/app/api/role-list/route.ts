// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
const PER_PAGE = 40

/**
 * GET /api/role-list?role=commentator&page=1&...filters
 * 
 * KEY LOGIC: People are found via ACTIVITY TABLES, not just superstars.role:
 *   commentator  → show_commentators (normal) | match_commentators (guests)
 *   ring_announcer → show_ring_announcers
 *   referee → match_referees where is_special_referee=false (normal) | =true (guests)
 *   interviewer → show_segment_participants role='interviewer' + superstars.role='interviewer'
 *   general_manager → superstars.role='general_manager'
 *   executive → superstars.role='executive'
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
    // ======== STEP 1: Get candidate IDs from activity tables ========
    let candidateIds: Set<number> | null = null // null = use superstars.role filter instead

    if (role === 'commentator' && !guestsOnly) {
      // Normal commentators: from show_commentators
      const { data } = await supabase.from('show_commentators').select('superstar_id')
      candidateIds = new Set<number>()
      for (const r of (data || [])) candidateIds.add(r.superstar_id)
      // Also include anyone with superstars.role = 'commentator'
      const { data: byRole } = await supabase.from('superstars').select('id').eq('role', 'commentator')
      for (const r of (byRole || [])) candidateIds.add(r.id)
    } else if (role === 'commentator' && guestsOnly) {
      // Guest commentators: from match_commentators
      const { data } = await supabase.from('match_commentators').select('superstar_id')
      candidateIds = new Set<number>()
      for (const r of (data || [])) candidateIds.add(r.superstar_id)
    } else if (role === 'ring_announcer') {
      // From show_ring_announcers + superstars.role
      const { data } = await supabase.from('show_ring_announcers').select('superstar_id')
      candidateIds = new Set<number>()
      for (const r of (data || [])) candidateIds.add(r.superstar_id)
      const { data: byRole } = await supabase.from('superstars').select('id').eq('role', 'ring_announcer')
      for (const r of (byRole || [])) candidateIds.add(r.id)
    } else if (role === 'referee' && !guestsOnly) {
      // Normal referees: match_referees where NOT special
      const { data } = await supabase.from('match_referees').select('superstar_id').not('superstar_id', 'is', null).or('is_special_referee.is.null,is_special_referee.eq.false')
      candidateIds = new Set<number>()
      for (const r of (data || [])) if (r.superstar_id) candidateIds.add(r.superstar_id)
      const { data: byRole } = await supabase.from('superstars').select('id').eq('role', 'referee')
      for (const r of (byRole || [])) candidateIds.add(r.id)
    } else if (role === 'referee' && guestsOnly) {
      // Special guest referees
      const { data } = await supabase.from('match_referees').select('superstar_id').eq('is_special_referee', true).not('superstar_id', 'is', null)
      candidateIds = new Set<number>()
      for (const r of (data || [])) if (r.superstar_id) candidateIds.add(r.superstar_id)
    } else if (role === 'interviewer') {
      // From show_segment_participants role='interviewer' + superstars.role
      const { data } = await supabase.from('show_segment_participants').select('superstar_id').eq('role', 'interviewer')
      candidateIds = new Set<number>()
      for (const r of (data || [])) candidateIds.add(r.superstar_id)
      const { data: byRole } = await supabase.from('superstars').select('id').eq('role', 'interviewer')
      for (const r of (byRole || [])) candidateIds.add(r.id)
    }
    // general_manager & executive: candidateIds stays null → filter by superstars.role

    if (candidateIds !== null && candidateIds.size === 0) {
      return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })
    }

    // ======== STEP 2: Pre-filters ========
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

    // ======== STEP 3: Stat-based sort ========
    const isStatSort = sortBy === 'stat'

    if (isStatSort) {
      const statsMap = await fetchRoleStats(role, guestsOnly)

      let sortedIds = [...statsMap.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)

      // Filter by candidates
      if (candidateIds) { sortedIds = sortedIds.filter(id => candidateIds!.has(id)) }
      if (searchIds) { const s = new Set(searchIds); sortedIds = sortedIds.filter(id => s.has(id)) }
      if (eraIds) { const s = new Set(eraIds); sortedIds = sortedIds.filter(id => s.has(id)) }

      // Apply DB filters
      let fq = supabase.from('superstars').select('id')
      if (candidateIds) fq = fq.in('id', [...candidateIds].slice(0, 2000))
      else fq = fq.eq('role', role)
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
        return m ? { ...m, role_stat: statsMap.get(id) || 0 } : null
      }).filter(Boolean)

      return NextResponse.json({ items: ordered, total, page, totalPages })
    }

    // ======== STEP 4: Standard name sort ========
    let query = supabase.from('superstars')
      .select('id, name, slug, photo_url, gender, status, is_hall_of_fame, birth_country, birth_date, debut_date, role', { count: 'exact' })

    if (candidateIds) {
      query = query.in('id', [...candidateIds].slice(0, 2000))
    } else {
      query = query.eq('role', role)
    }

    query = query.order('name', { ascending: true })

    if (letter) query = query.ilike('name', `${letter}%`)
    if (searchIds) query = query.in('id', searchIds.slice(0, 2000))
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

/* ============================================================ STATS */
async function fetchRoleStats(role: string, guestsOnly: boolean): Promise<Map<number, number>> {
  const map = new Map<number, number>()

  if (role === 'commentator' && !guestsOnly) {
    const { data } = await supabase.from('show_commentators').select('superstar_id')
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'commentator' && guestsOnly) {
    const { data } = await supabase.from('match_commentators').select('superstar_id')
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'ring_announcer') {
    const { data } = await supabase.from('show_ring_announcers').select('superstar_id')
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'referee' && !guestsOnly) {
    const { data } = await supabase.from('match_referees').select('superstar_id').not('superstar_id', 'is', null).or('is_special_referee.is.null,is_special_referee.eq.false')
    for (const r of (data || [])) if (r.superstar_id) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'referee' && guestsOnly) {
    const { data } = await supabase.from('match_referees').select('superstar_id').eq('is_special_referee', true).not('superstar_id', 'is', null)
    for (const r of (data || [])) if (r.superstar_id) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'interviewer') {
    const { data } = await supabase.from('show_segment_participants').select('superstar_id').eq('role', 'interviewer')
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  }
  return map
}

async function fetchRoleStatsForIds(role: string, ids: number[], guestsOnly: boolean): Promise<Map<number, number>> {
  const map = new Map<number, number>()
  if (ids.length === 0) return map

  if (role === 'commentator' && !guestsOnly) {
    const { data } = await supabase.from('show_commentators').select('superstar_id').in('superstar_id', ids)
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'commentator' && guestsOnly) {
    const { data } = await supabase.from('match_commentators').select('superstar_id').in('superstar_id', ids)
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'ring_announcer') {
    const { data } = await supabase.from('show_ring_announcers').select('superstar_id').in('superstar_id', ids)
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'referee' && !guestsOnly) {
    const { data } = await supabase.from('match_referees').select('superstar_id').in('superstar_id', ids).or('is_special_referee.is.null,is_special_referee.eq.false')
    for (const r of (data || [])) if (r.superstar_id) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'referee' && guestsOnly) {
    const { data } = await supabase.from('match_referees').select('superstar_id').in('superstar_id', ids).eq('is_special_referee', true)
    for (const r of (data || [])) if (r.superstar_id) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'interviewer') {
    const { data } = await supabase.from('show_segment_participants').select('superstar_id').in('superstar_id', ids).eq('role', 'interviewer')
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  }
  return map
}
