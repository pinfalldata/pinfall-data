// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country') || ''

  try {
    // Get candidate IDs from match_managers + superstars.role
    const [{ data: mmData }] = await Promise.all([
      supabase.from('match_managers').select('superstar_id'),
    ])
    const candidateIds = new Set<number>()
    for (const r of (mmData || [])) candidateIds.add(r.superstar_id)
    const ids = [...candidateIds].slice(0, 2000)

    const queries: Promise<any>[] = [
      supabase.from('eras').select('id, name, slug, start_year, end_year, sort_order').order('sort_order', { ascending: true }),
      ids.length > 0 ? supabase.from('superstars').select('birth_country').in('id', ids).not('birth_country', 'is', null).neq('birth_country', '') : Promise.resolve({ data: [] }),
      ids.length > 0 ? supabase.from('superstars').select('height_cm').in('id', ids).not('height_cm', 'is', null).order('height_cm', { ascending: true }).limit(1) : Promise.resolve({ data: [] }),
      ids.length > 0 ? supabase.from('superstars').select('height_cm').in('id', ids).not('height_cm', 'is', null).order('height_cm', { ascending: false }).limit(1) : Promise.resolve({ data: [] }),
    ]
    if (country && ids.length > 0) {
      queries.push(supabase.from('superstars').select('birth_city').in('id', ids).eq('birth_country', country).not('birth_city', 'is', null).neq('birth_city', ''))
    }

    const results = await Promise.all(queries)
    const [{ data: eras }, { data: countriesRaw }, { data: minH }, { data: maxH }] = results

    const countrySet = new Set<string>()
    for (const r of (countriesRaw || [])) if (r.birth_country) countrySet.add(r.birth_country)

    let cities: string[] = []
    if (country && results[4]) {
      const citySet = new Set<string>()
      for (const r of (results[4].data || [])) if (r.birth_city) citySet.add(r.birth_city)
      cities = [...citySet].sort()
    }

    return NextResponse.json({
      eras: eras || [],
      countries: [...countrySet].sort(),
      heightMin: minH?.[0]?.height_cm || null,
      heightMax: maxH?.[0]?.height_cm || null,
      cities,
    })
  } catch (err) {
    console.error('[managers-filters]', err)
    return NextResponse.json({ eras: [], countries: [], heightMin: null, heightMax: null, cities: [] })
  }
}
