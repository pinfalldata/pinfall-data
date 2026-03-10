// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') || ''
  const country = searchParams.get('country') || ''
  if (!role) return NextResponse.json({ eras: [], countries: [], cities: [] })

  try {
    // Get candidate IDs (same logic as role-list)
    let candidateIds: number[] | null = null
    if (role === 'general_manager') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('general_manager_tenures').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'general_manager'),
      ])
      const set = new Set<number>()
      for (const r of (a || [])) set.add(r.superstar_id)
      for (const r of (b || [])) set.add(r.id)
      candidateIds = [...set]
    } else if (role === 'executive') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('executive_tenures').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'executive'),
      ])
      const set = new Set<number>()
      for (const r of (a || [])) set.add(r.superstar_id)
      for (const r of (b || [])) set.add(r.id)
      candidateIds = [...set]
    } else if (role === 'commentator') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('show_commentators').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'commentator'),
      ])
      const set = new Set<number>()
      for (const r of (a || [])) set.add(r.superstar_id)
      for (const r of (b || [])) set.add(r.id)
      candidateIds = [...set]
    } else if (role === 'ring_announcer') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('show_ring_announcers').select('superstar_id'),
        supabase.from('superstars').select('id').eq('role', 'ring_announcer'),
      ])
      const set = new Set<number>()
      for (const r of (a || [])) set.add(r.superstar_id)
      for (const r of (b || [])) set.add(r.id)
      candidateIds = [...set]
    } else if (role === 'referee') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('match_referees').select('superstar_id').not('superstar_id', 'is', null),
        supabase.from('superstars').select('id').eq('role', 'referee'),
      ])
      const set = new Set<number>()
      for (const r of (a || [])) if (r.superstar_id) set.add(r.superstar_id)
      for (const r of (b || [])) set.add(r.id)
      candidateIds = [...set]
    } else if (role === 'interviewer') {
      const [{ data: a }, { data: b }] = await Promise.all([
        supabase.from('show_segment_participants').select('superstar_id').eq('role', 'interviewer'),
        supabase.from('superstars').select('id').eq('role', 'interviewer'),
      ])
      const set = new Set<number>()
      for (const r of (a || [])) set.add(r.superstar_id)
      for (const r of (b || [])) set.add(r.id)
      candidateIds = [...set]
    }

    let countryQuery, cityQueryFn
    if (candidateIds && candidateIds.length > 0) {
      countryQuery = supabase.from('superstars').select('birth_country').in('id', candidateIds.slice(0, 2000)).not('birth_country', 'is', null).neq('birth_country', '')
      cityQueryFn = () => supabase.from('superstars').select('birth_city').in('id', candidateIds.slice(0, 2000)).eq('birth_country', country).not('birth_city', 'is', null).neq('birth_city', '')
    } else {
      countryQuery = supabase.from('superstars').select('birth_country').eq('role', role).not('birth_country', 'is', null).neq('birth_country', '')
      cityQueryFn = () => supabase.from('superstars').select('birth_city').eq('role', role).eq('birth_country', country).not('birth_city', 'is', null).neq('birth_city', '')
    }

    const [{ data: eras }, { data: countriesRaw }] = await Promise.all([
      supabase.from('eras').select('id, name, slug, start_year, end_year, sort_order').order('sort_order', { ascending: true }),
      countryQuery,
    ])

    const countrySet = new Set<string>()
    for (const r of (countriesRaw || [])) if (r.birth_country) countrySet.add(r.birth_country)

    let cities: string[] = []
    if (country) {
      const { data: citiesRaw } = await cityQueryFn()
      const citySet = new Set<string>()
      for (const r of (citiesRaw || [])) if (r.birth_city) citySet.add(r.birth_city)
      cities = [...citySet].sort()
    }

    return NextResponse.json({ eras: eras || [], countries: [...countrySet].sort(), cities })
  } catch (err) {
    console.error('[role-filters]', err)
    return NextResponse.json({ eras: [], countries: [], cities: [] })
  }
}
