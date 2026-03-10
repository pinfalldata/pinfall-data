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
  const sortBy = searchParams.get('sortBy') || 'name'
  const guestsOnly = searchParams.get('guestsOnly') === 'true'

  if (!role) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

  try {
    // ======== STEP 1: Get candidate IDs ========
    let candidateIds: Set<number> | null = null

    if (role === 'commentator' && !guestsOnly) {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('show_commentators').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'commentator'),
      ])
      candidateIds = new Set<number>()
      for (const r of (a || [])) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
      // EXCLUDE anyone only in match_commentators (guests)
    } else if (role === 'commentator' && guestsOnly) {
      // Guest = in match_commentators BUT NOT a regular commentator
      const { data: mc } = await supabase.from('match_commentators').select('superstar_id')
      const guestSet = new Set<number>()
      for (const r of (mc || [])) guestSet.add(r.superstar_id)
      // Remove those who are regular commentators
      const { data: sc } = await supabase.from('show_commentators').select('superstar_id')
      const regularSet = new Set<number>()
      for (const r of (sc || [])) regularSet.add(r.superstar_id)
      const { data: byRole } = await supabase.from('superstars').select('id').eq('role', 'commentator')
      for (const r of (byRole || [])) regularSet.add(r.id)
      candidateIds = new Set<number>()
      for (const id of guestSet) {
        if (!regularSet.has(id)) candidateIds.add(id)
      }
    } else if (role === 'ring_announcer') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('show_ring_announcers').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'ring_announcer'),
      ])
      candidateIds = new Set<number>()
      for (const r of (a || [])) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    } else if (role === 'referee' && !guestsOnly) {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('match_referees').select('superstar_id').not('superstar_id', 'is', null).or('is_special_referee.is.null,is_special_referee.eq.false'),
        supabase.from('superstars').select('id').eq('role', 'referee'),
      ])
      candidateIds = new Set<number>()
      for (const r of (a || [])) if (r.superstar_id) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    } else if (role === 'referee' && guestsOnly) {
      const { data } = await supabase.from('match_referees').select('superstar_id').eq('is_special_referee', true).not('superstar_id', 'is', null)
      candidateIds = new Set<number>()
      for (const r of (data || [])) if (r.superstar_id) candidateIds.add(r.superstar_id)
    } else if (role === 'interviewer') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('show_segment_participants').select('superstar_id').eq('role', 'interviewer'),
        supabase.from('superstars').select('id').eq('role', 'interviewer'),
      ])
      candidateIds = new Set<number>()
      for (const r of (a || [])) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    } else if (role === 'general_manager') {
      // FROM tenure table + superstars.role
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('general_manager_tenures').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'general_manager'),
      ])
      candidateIds = new Set<number>()
      for (const r of (a || [])) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    } else if (role === 'executive') {
      // FROM tenure table + superstars.role
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('executive_tenures').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'executive'),
      ])
      candidateIds = new Set<number>()
      for (const r of (a || [])) candidateIds.add(r.superstar_id)
      for (const r of (b || [])) candidateIds.add(r.id)
    }

    if (candidateIds !== null && candidateIds.size === 0) {
      return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })
    }

    // ======== Pre-filters ========
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

    // ======== Build query ========
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

    // Enrich with stats
    const ids = (items || []).map(m => m.id)
    const statsMap = ids.length > 0 ? await fetchStats(role, ids, guestsOnly) : new Map()
    const enriched = (items || []).map(m => ({ ...m, role_stat: statsMap.get(m.id) || 0 }))

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
  } else if (role === 'general_manager') {
    const { data } = await supabase.from('general_manager_tenures').select('superstar_id').in('superstar_id', ids)
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  } else if (role === 'executive') {
    const { data } = await supabase.from('executive_tenures').select('superstar_id').in('superstar_id', ids)
    for (const r of (data || [])) map.set(r.superstar_id, (map.get(r.superstar_id) || 0) + 1)
  }
  return map
}
