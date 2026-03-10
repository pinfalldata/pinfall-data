// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
const PER_PAGE = 40

/**
 * GET /api/managers-list
 * 
 * Filters: page, letter, search, eraId, status, gender, hofOnly, country, city,
 *   birthYear, minHeight, maxHeight, debutYear
 * 
 * Sort: sortBy (name|manager_matches|manager_wins|manager_losses)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

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
  const minHeight = searchParams.get('minHeight') || ''
  const maxHeight = searchParams.get('maxHeight') || ''
  const debutYear = searchParams.get('debutYear') || ''
  const sortBy = searchParams.get('sortBy') || 'name'

  try {
    const isManagerSort = ['manager_matches', 'manager_wins', 'manager_losses'].includes(sortBy)

    // Get all manager candidate IDs from match_managers + superstars.role
    const [{ data: mmCandidates }] = await Promise.all([
      supabase.from('match_managers').select('superstar_id'),
    ])
    const candidateIds = new Set<number>()
    for (const r of (mmCandidates || [])) candidateIds.add(r.superstar_id)
    if (candidateIds.size === 0) return NextResponse.json({ managers: [], total: 0, page, totalPages: 0 })
    const candidateArr = [...candidateIds]

    // ---- Pre-filters ----
    let eraIds: number[] | null = null
    if (eraId) {
      const { data: eraRows } = await supabase.from('superstar_eras').select('superstar_id').eq('era_id', parseInt(eraId))
      eraIds = eraRows?.map(r => r.superstar_id) || []
      if (eraIds.length === 0) return NextResponse.json({ managers: [], total: 0, page, totalPages: 0 })
    }

    let searchIds: number[] | null = null
    if (search && search.length >= 2) {
      const cleanSearch = search.replace(/^the\s+/i, '')
      const [{ data: byName }, { data: byAlias }, { data: byNick }, { data: byReal }] = await Promise.all([
        supabase.from('superstars').select('id').in('id', candidateArr.slice(0, 2000)).or(`name.ilike.%${search}%,name.ilike.%${cleanSearch}%`),
        supabase.from('superstar_aliases').select('superstar_id').or(`alias.ilike.%${search}%,alias.ilike.%${cleanSearch}%`),
        supabase.from('superstar_nicknames').select('superstar_id').or(`nickname.ilike.%${search}%,nickname.ilike.%${cleanSearch}%`),
        supabase.from('superstars').select('id').in('id', candidateArr.slice(0, 2000)).or(`real_name.ilike.%${search}%,real_name.ilike.%${cleanSearch}%`),
      ])
      const set = new Set<number>()
      for (const r of (byName || [])) set.add(r.id)
      for (const r of (byAlias || [])) set.add(r.superstar_id)
      for (const r of (byNick || [])) set.add(r.superstar_id)
      for (const r of (byReal || [])) set.add(r.id)
      searchIds = [...set]
      if (searchIds.length === 0) return NextResponse.json({ managers: [], total: 0, page, totalPages: 0 })
    }

    // ---- Manager sort: compute stats first to determine order ----
    if (isManagerSort) {
      // Fetch ALL match_managers with match winner info
      const { data: mmData } = await supabase
        .from('match_managers')
        .select('superstar_id, match_id, team_number, matches!match_managers_match_id_fkey(winner_team, result_type)')

      // Aggregate stats per manager
      const statsMap = new Map<number, { matches: number; wins: number; losses: number }>()
      for (const row of (mmData || [])) {
        const sid = row.superstar_id
        if (!statsMap.has(sid)) statsMap.set(sid, { matches: 0, wins: 0, losses: 0 })
        const s = statsMap.get(sid)!
        s.matches++
        const m = row.matches
        if (m) {
          const isDraw = m.result_type === 'no_contest' || m.result_type === 'time_limit_draw'
          if (!isDraw && row.team_number != null && m.winner_team != null) {
            if (row.team_number === m.winner_team) s.wins++
            else s.losses++
          }
        }
      }

      // Get all manager IDs sorted by chosen stat
      let sortedIds = [...statsMap.entries()].sort((a, b) => {
        const key = sortBy === 'manager_matches' ? 'matches' : sortBy === 'manager_wins' ? 'wins' : 'losses'
        return b[1][key] - a[1][key]
      }).map(([id]) => id)

      // Apply pre-filters to IDs
      if (eraIds) { const set = new Set(eraIds); sortedIds = sortedIds.filter(id => set.has(id)) }
      if (searchIds) { const set = new Set(searchIds); sortedIds = sortedIds.filter(id => set.has(id)) }

      // Now build base query to get superstars that match other filters
      let filterQuery = supabase.from('superstars').select('id').in('id', candidateArr.slice(0, 2000))
      if (letter) filterQuery = filterQuery.ilike('name', `${letter}%`)
      if (status) filterQuery = filterQuery.eq('status', status)
      if (gender) filterQuery = filterQuery.eq('gender', gender)
      if (hofOnly) filterQuery = filterQuery.eq('is_hall_of_fame', true)
      if (country) filterQuery = filterQuery.eq('birth_country', country)
      if (city) filterQuery = filterQuery.eq('birth_city', city)
      if (minHeight) filterQuery = filterQuery.gte('height_cm', parseFloat(minHeight))
      if (maxHeight) filterQuery = filterQuery.lte('height_cm', parseFloat(maxHeight))
      if (birthYear) filterQuery = filterQuery.gte('birth_date', `${birthYear}-01-01`).lte('birth_date', `${birthYear}-12-31`)
      if (debutYear) filterQuery = filterQuery.gte('debut_date', `${debutYear}-01-01`).lte('debut_date', `${debutYear}-12-31`)

      const { data: filterResult } = await filterQuery
      const filterSet = new Set((filterResult || []).map((r: any) => r.id))
      sortedIds = sortedIds.filter(id => filterSet.has(id))

      // Also include managers with 0 managed matches (at end)
      const allFilteredIds = [...filterSet].filter(id => !statsMap.has(id))
      const finalIds = [...sortedIds, ...allFilteredIds]

      const total = finalIds.length
      const totalPages = Math.ceil(total / PER_PAGE)
      const offset = (page - 1) * PER_PAGE
      const pageIds = finalIds.slice(offset, offset + PER_PAGE)

      if (pageIds.length === 0) return NextResponse.json({ managers: [], total, page, totalPages })

      // Fetch full data for this page
      const { data: managers } = await supabase
        .from('superstars')
        .select('id, name, slug, photo_url, gender, status, height_cm, is_hall_of_fame, birth_country, birth_city, birth_date, debut_date, total_matches, win_count, loss_count, total_reigns')
        .in('id', pageIds)

      // Sort to match pageIds order
      const managerMap = new Map((managers || []).map((m: any) => [m.id, m]))
      const ordered = pageIds.map(id => {
        const m = managerMap.get(id)
        if (!m) return null
        const st = statsMap.get(id) || { matches: 0, wins: 0, losses: 0 }
        return { ...m, manager_matches: st.matches, manager_wins: st.wins, manager_losses: st.losses }
      }).filter(Boolean)

      return NextResponse.json({ managers: ordered, total, page, totalPages })
    }

    // ---- Standard sort (name) ----
    let query = supabase
      .from('superstars')
      .select('id, name, slug, photo_url, gender, status, height_cm, is_hall_of_fame, birth_country, birth_city, birth_date, debut_date, total_matches, win_count, loss_count, total_reigns', { count: 'exact' })
      .in('id', candidateArr.slice(0, 2000))
      .order('name', { ascending: true })

    if (letter) query = query.ilike('name', `${letter}%`)
    if (searchIds) query = query.in('id', searchIds.slice(0, 2000))
    if (eraIds) query = query.in('id', eraIds.slice(0, 2000))
    if (status) query = query.eq('status', status)
    if (gender) query = query.eq('gender', gender)
    if (hofOnly) query = query.eq('is_hall_of_fame', true)
    if (country) query = query.eq('birth_country', country)
    if (city) query = query.eq('birth_city', city)
    if (minHeight) query = query.gte('height_cm', parseFloat(minHeight))
    if (maxHeight) query = query.lte('height_cm', parseFloat(maxHeight))
    if (birthYear) query = query.gte('birth_date', `${birthYear}-01-01`).lte('birth_date', `${birthYear}-12-31`)
    if (debutYear) query = query.gte('debut_date', `${debutYear}-01-01`).lte('debut_date', `${debutYear}-12-31`)

    const offset = (page - 1) * PER_PAGE
    query = query.range(offset, offset + PER_PAGE - 1)

    const { data: managers, error, count } = await query
    if (error) { console.error('[managers-list]', error); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }

    // Add manager stats for display
    const ids = (managers || []).map((m: any) => m.id)
    let managerStats = new Map<number, { matches: number; wins: number; losses: number }>()
    if (ids.length > 0) {
      const { data: mmData } = await supabase
        .from('match_managers')
        .select('superstar_id, team_number, matches!match_managers_match_id_fkey(winner_team, result_type)')
        .in('superstar_id', ids)
      for (const row of (mmData || [])) {
        const sid = row.superstar_id
        if (!managerStats.has(sid)) managerStats.set(sid, { matches: 0, wins: 0, losses: 0 })
        const s = managerStats.get(sid)!
        s.matches++
        const m = row.matches
        if (m) {
          const isDraw = m.result_type === 'no_contest' || m.result_type === 'time_limit_draw'
          if (!isDraw && row.team_number != null && m.winner_team != null) {
            if (row.team_number === m.winner_team) s.wins++
            else s.losses++
          }
        }
      }
    }

    const enriched = (managers || []).map((m: any) => {
      const st = managerStats.get(m.id) || { matches: 0, wins: 0, losses: 0 }
      return { ...m, manager_matches: st.matches, manager_wins: st.wins, manager_losses: st.losses }
    })

    return NextResponse.json({ managers: enriched, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER_PAGE) })
  } catch (err) {
    console.error('[managers-list] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
