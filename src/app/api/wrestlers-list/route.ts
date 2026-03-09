// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
const PER_PAGE = 40

/**
 * GET /api/wrestlers-list
 * 
 * Filters: page, letter, search, eraId, status, brand, gender,
 *   weightClass, championOnly, hofOnly, championshipId, country, city,
 *   birthYear, minHeight, maxHeight, debutYear
 * 
 * Sort: sortBy (name|matches|wins|losses) default=name
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const letter = searchParams.get('letter') || ''
  const search = searchParams.get('search') || ''
  const eraId = searchParams.get('eraId') || ''
  const status = searchParams.get('status') || ''
  const brand = searchParams.get('brand') || ''
  const gender = searchParams.get('gender') || ''
  const weightClass = searchParams.get('weightClass') || ''
  const championOnly = searchParams.get('championOnly') === 'true'
  const hofOnly = searchParams.get('hofOnly') === 'true'
  const championshipId = searchParams.get('championshipId') || ''
  const country = searchParams.get('country') || ''
  const city = searchParams.get('city') || ''
  const birthYear = searchParams.get('birthYear') || ''
  const minHeight = searchParams.get('minHeight') || ''
  const maxHeight = searchParams.get('maxHeight') || ''
  const debutYear = searchParams.get('debutYear') || ''
  const sortBy = searchParams.get('sortBy') || 'name'

  try {
    // ---- Pre-filter: find IDs from related tables ----
    let eraIds: number[] | null = null
    if (eraId) {
      const { data: eraRows } = await supabase.from('superstar_eras').select('superstar_id').eq('era_id', parseInt(eraId))
      eraIds = eraRows?.map(r => r.superstar_id) || []
      if (eraIds.length === 0) return NextResponse.json({ wrestlers: [], total: 0, page, totalPages: 0 })
    }

    let champIds: number[] | null = null
    if (championshipId) {
      const { data: reignRows } = await supabase.from('championship_reigns').select('superstar_id').eq('championship_id', parseInt(championshipId))
      const set = new Set<number>()
      for (const r of (reignRows || [])) set.add(r.superstar_id)
      champIds = [...set]
      if (champIds.length === 0) return NextResponse.json({ wrestlers: [], total: 0, page, totalPages: 0 })
    }

    let anyChampIds: number[] | null = null
    if (championOnly && !championshipId) {
      const { data: reignRows } = await supabase.from('championship_reigns').select('superstar_id')
      const set = new Set<number>()
      for (const r of (reignRows || [])) set.add(r.superstar_id)
      anyChampIds = [...set]
      if (anyChampIds.length === 0) return NextResponse.json({ wrestlers: [], total: 0, page, totalPages: 0 })
    }

    let searchIds: number[] | null = null
    if (search && search.length >= 2) {
      const cleanSearch = search.replace(/^the\s+/i, '')
      const [{ data: byName }, { data: byAlias }, { data: byNick }, { data: byReal }] = await Promise.all([
        supabase.from('superstars').select('id').eq('role', 'wrestler').or(`name.ilike.%${search}%,name.ilike.%${cleanSearch}%`),
        supabase.from('superstar_aliases').select('superstar_id').or(`alias.ilike.%${search}%,alias.ilike.%${cleanSearch}%`),
        supabase.from('superstar_nicknames').select('superstar_id').or(`nickname.ilike.%${search}%,nickname.ilike.%${cleanSearch}%`),
        supabase.from('superstars').select('id').eq('role', 'wrestler').or(`real_name.ilike.%${search}%,real_name.ilike.%${cleanSearch}%`),
      ])
      const set = new Set<number>()
      for (const r of (byName || [])) set.add(r.id)
      for (const r of (byAlias || [])) set.add(r.superstar_id)
      for (const r of (byNick || [])) set.add(r.superstar_id)
      for (const r of (byReal || [])) set.add(r.id)
      searchIds = [...set]
      if (searchIds.length === 0) return NextResponse.json({ wrestlers: [], total: 0, page, totalPages: 0 })
    }

    // ---- Determine sort ----
    const sortAsc = sortBy === 'name'
    const sortCol = sortBy === 'matches' ? 'total_matches' : sortBy === 'wins' ? 'win_count' : sortBy === 'losses' ? 'loss_count' : 'name'
    const nullsFirst = sortBy === 'name'

    // ---- Build main query ----
    let query = supabase
      .from('superstars')
      .select('id, name, slug, photo_url, gender, status, weight_kg, height_cm, current_brand, is_hall_of_fame, birth_country, birth_city, birth_date, debut_date, total_matches, win_count, loss_count, total_reigns', { count: 'exact' })
      .eq('role', 'wrestler')
      .order(sortCol, { ascending: sortAsc, nullsFirst })

    if (letter && letter.length === 1) query = query.ilike('name', `${letter}%`)
    if (searchIds) query = query.in('id', searchIds.slice(0, 2000))
    if (eraIds) query = query.in('id', eraIds.slice(0, 2000))
    if (champIds) query = query.in('id', champIds.slice(0, 2000))
    if (anyChampIds) query = query.in('id', anyChampIds.slice(0, 2000))
    if (status) query = query.eq('status', status)
    if (brand) query = query.eq('current_brand', brand)
    if (gender) query = query.eq('gender', gender)
    if (hofOnly) query = query.eq('is_hall_of_fame', true)
    if (country) query = query.eq('birth_country', country)
    if (city) query = query.eq('birth_city', city)

    // Weight class
    if (weightClass === 'cruiserweight') query = query.not('weight_kg', 'is', null).lte('weight_kg', 93)
    else if (weightClass === 'heavyweight') query = query.not('weight_kg', 'is', null).gt('weight_kg', 93)
    else if (weightClass === 'super_heavyweight') query = query.not('weight_kg', 'is', null).gte('weight_kg', 136)

    // Height range (in cm)
    if (minHeight) query = query.gte('height_cm', parseFloat(minHeight))
    if (maxHeight) query = query.lte('height_cm', parseFloat(maxHeight))

    // Birth year
    if (birthYear) {
      query = query.gte('birth_date', `${birthYear}-01-01`).lte('birth_date', `${birthYear}-12-31`)
    }

    // Debut year
    if (debutYear) {
      query = query.gte('debut_date', `${debutYear}-01-01`).lte('debut_date', `${debutYear}-12-31`)
    }

    // Pagination
    const offset = (page - 1) * PER_PAGE
    query = query.range(offset, offset + PER_PAGE - 1)

    const { data: wrestlers, error, count } = await query

    if (error) {
      console.error('[wrestlers-list]', error)
      return NextResponse.json({ error: 'Failed to fetch wrestlers' }, { status: 500 })
    }

    const total = count || 0
    return NextResponse.json({ wrestlers: wrestlers || [], total, page, totalPages: Math.ceil(total / PER_PAGE) })
  } catch (err) {
    console.error('[wrestlers-list] unexpected:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
