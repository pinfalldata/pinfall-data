// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

/**
 * GET /api/wrestlers-filters?country=United+States
 * Returns filter options. If country param is given, also returns cities for that country.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const country = searchParams.get('country') || ''

  try {
    const queries: Promise<any>[] = [
      supabase.from('eras').select('id, name, slug, start_year, end_year, sort_order').order('sort_order', { ascending: true }),
      supabase.from('championships').select('id, name, slug, image_url, status').order('sort_order', { ascending: true }),
      supabase.from('superstars').select('birth_country').eq('role', 'wrestler').not('birth_country', 'is', null).neq('birth_country', ''),
      supabase.from('superstars').select('current_brand').eq('role', 'wrestler').eq('status', 'active').not('current_brand', 'is', null).neq('current_brand', ''),
      // Height range (min/max)
      supabase.from('superstars').select('height_cm').eq('role', 'wrestler').not('height_cm', 'is', null).order('height_cm', { ascending: true }).limit(1),
      supabase.from('superstars').select('height_cm').eq('role', 'wrestler').not('height_cm', 'is', null).order('height_cm', { ascending: false }).limit(1),
    ]

    // Cities for selected country
    if (country) {
      queries.push(
        supabase.from('superstars').select('birth_city').eq('role', 'wrestler').eq('birth_country', country).not('birth_city', 'is', null).neq('birth_city', '')
      )
    }

    const results = await Promise.all(queries)

    const [{ data: eras }, { data: championships }, { data: countriesRaw }, { data: brandsRaw }, { data: minH }, { data: maxH }] = results

    const countrySet = new Set<string>()
    for (const r of (countriesRaw || [])) if (r.birth_country) countrySet.add(r.birth_country)

    const brandSet = new Set<string>()
    for (const r of (brandsRaw || [])) if (r.current_brand) brandSet.add(r.current_brand)

    const heightMin = minH?.[0]?.height_cm || null
    const heightMax = maxH?.[0]?.height_cm || null

    let cities: string[] = []
    if (country && results[6]) {
      const citySet = new Set<string>()
      for (const r of (results[6].data || [])) if (r.birth_city) citySet.add(r.birth_city)
      cities = [...citySet].sort()
    }

    return NextResponse.json({
      eras: eras || [],
      championships: championships || [],
      countries: [...countrySet].sort(),
      brands: [...brandSet].sort(),
      heightMin,
      heightMax,
      cities,
    })
  } catch (err) {
    console.error('[wrestlers-filters]', err)
    return NextResponse.json({ eras: [], championships: [], countries: [], brands: [], heightMin: null, heightMax: null, cities: [] })
  }
}
