// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
const PER_PAGE = 40

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
  const guestsOnly = searchParams.get('guestsOnly') === 'true'

  if (!role) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

  try {
    let candidateIds: Set<number> | null = null

    if (role === 'commentator' && !guestsOnly) {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('show_commentators').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'commentator'),
      ])
      candidateIds = new Set()
      for (const r of (a || [])) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    } else if (role === 'commentator' && guestsOnly) {
      // Guest = everyone in match_commentators (don't exclude regulars)
      const { data } = await supabase.from('match_commentators').select('superstar_id')
      candidateIds = new Set()
      for (const r of (data || [])) candidateIds.add(r.superstar_id)
    } else if (role === 'manager') {
      // FROM match_managers + superstars.role
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('match_managers').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'manager'),
      ])
      candidateIds = new Set()
      for (const r of (a || [])) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    } else if (role === 'ring_announcer') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('show_ring_announcers').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'ring_announcer'),
      ])
      candidateIds = new Set()
      for (const r of (a || [])) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    } else if (role === 'referee' && !guestsOnly) {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('match_referees').select('superstar_id').not('superstar_id', 'is', null).or('is_special_referee.is.null,is_special_referee.eq.false'),
        supabase.from('superstars').select('id').eq('role', 'referee'),
      ])
      candidateIds = new Set()
      for (const r of (a || [])) if (r.superstar_id) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    } else if (role === 'referee' && guestsOnly) {
      const { data } = await supabase.from('match_referees').select('superstar_id').eq('is_special_referee', true).not('superstar_id', 'is', null)
      candidateIds = new Set()
      for (const r of (data || [])) if (r.superstar_id) candidateIds.add(r.superstar_id)
    } else if (role === 'interviewer') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('show_segment_participants').select('superstar_id').eq('role', 'interviewer'),
        supabase.from('superstars').select('id').eq('role', 'interviewer'),
      ])
      candidateIds = new Set()
      for (const r of (a || [])) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    } else if (role === 'general_manager') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('general_manager_tenures').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'general_manager'),
      ])
      candidateIds = new Set()
      for (const r of (a || [])) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    } else if (role === 'executive') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('executive_tenures').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'executive'),
      ])
      candidateIds = new Set()
      for (const r of (a || [])) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    }

    if (candidateIds !== null && candidateIds.size === 0)
      return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

    // Pre-filters
    let eraIds = null
    if (eraId) {
      const { data } = await supabase.from('superstar_eras').select('superstar_id').eq('era_id', parseInt(eraId))
      eraIds = data?.map(r => r.superstar_id) || []
      if (eraIds.length === 0) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })
    }
    let searchIds = null
    if (search && search.length >= 2) {
      const clean = search.replace(/^the\s+/i, '')
      const [{ data: a }, { data: b }, { data: c }, { data: d }] = await Promise.all([
        supabase.from('superstars').select('id').or(`name.ilike.%${search}%,name.ilike.%${clean}%`),
        supabase.from('superstar_aliases').select('superstar_id').or(`alias.ilike.%${search}%,alias.ilike.%${clean}%`),
        supabase.from('superstar_nicknames').select('superstar_id').or(`nickname.ilike.%${search}%,nickname.ilike.%${clean}%`),
        supabase.from('superstars').select('id').or(`real_name.ilike.%${search}%,real_name.ilike.%${clean}%`),
      ])
      const set = new Set()
      for (const r of (a || [])) set.add(r.id)
      for (const r of (b || [])) set.add(r.superstar_id)
      for (const r of (c || [])) set.add(r.superstar_id)
      for (const r of (d || [])) set.add(r.id)
      searchIds = [...set]
      if (searchIds.length === 0) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })
    }

    // Build query
    let query = supabase.from('superstars')
      .select('id, name, slug, photo_url, gender, status, is_hall_of_fame, birth_country, birth_date, debut_date, role', { count: 'exact' })
    if (candidateIds) query = query.in('id', [...candidateIds].slice(0, 2000))
    else query = query.eq('role', role)
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
    if (error) return NextResponse.json({ error: 'Failed' }, { status: 500 })

    // Enrich: for executives show titles, for GMs show brands, for others show counts
    const ids = (items || []).map(m => m.id)
    let enriched = items || []

    if (role === 'executive' && ids.length > 0) {
      const { data: tenures } = await supabase.from('executive_tenures').select('superstar_id, title').in('superstar_id', ids)
      const titleMap = new Map<number, string[]>()
      for (const t of (tenures || [])) {
        if (!titleMap.has(t.superstar_id)) titleMap.set(t.superstar_id, [])
        titleMap.get(t.superstar_id)!.push(t.title)
      }
      enriched = enriched.map(m => ({ ...m, role_stat: 0, role_titles: titleMap.get(m.id) || [] }))
    } else if (role === 'general_manager' && ids.length > 0) {
      const { data: tenures } = await supabase.from('general_manager_tenures').select('superstar_id, title, brand_name').in('superstar_id', ids)
      const titleMap = new Map<number, string[]>()
      for (const t of (tenures || [])) {
        if (!titleMap.has(t.superstar_id)) titleMap.set(t.superstar_id, [])
        const label = t.brand_name ? `${t.title} — ${t.brand_name}` : t.title
        titleMap.get(t.superstar_id)!.push(label)
      }
      enriched = enriched.map(m => ({ ...m, role_stat: 0, role_titles: titleMap.get(m.id) || [] }))
    } else {
      const statsMap = ids.length > 0 ? await fetchStats(role, ids, guestsOnly) : new Map()
      enriched = enriched.map(m => ({ ...m, role_stat: statsMap.get(m.id) || 0, role_titles: [] }))
    }

    return NextResponse.json({ items: enriched, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER_PAGE) })
  } catch (err) {
    console.error('[role-list]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

async function fetchStats(role, ids, guestsOnly) {
  const map = new Map()
  if (ids.length === 0) return map
  if (role === 'commentator' && !guestsOnly) {
    const { data } = await supabase.from('show_commentators').select('superstar_id').in('superstar_id', ids)
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'commentator' && guestsOnly) {
    const { data } = await supabase.from('match_commentators').select('superstar_id').in('superstar_id', ids)
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'manager') {
    const { data } = await supabase.from('match_managers').select('superstar_id').in('superstar_id', ids)
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'ring_announcer') {
    const { data } = await supabase.from('show_ring_announcers').select('superstar_id').in('superstar_id', ids)
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'referee') {
    const q = guestsOnly
      ? supabase.from('match_referees').select('superstar_id').in('superstar_id', ids).eq('is_special_referee', true)
      : supabase.from('match_referees').select('superstar_id').in('superstar_id', ids).or('is_special_referee.is.null,is_special_referee.eq.false')
    const { data } = await q
    for (const r of (data || [])) if (r.superstar_id) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'interviewer') {
    const { data } = await supabase.from('show_segment_participants').select('superstar_id').in('superstar_id', ids).eq('role', 'interviewer')
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  }
  return map
}
