// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

/**
 * GET /api/role-filters?role=commentator&country=United+States
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') || ''
  const country = searchParams.get('country') || ''

  if (!role) return NextResponse.json({ eras: [], countries: [], cities: [] })

  try {
    const queries: Promise<any>[] = [
      supabase.from('eras').select('id, name, slug, start_year, end_year, sort_order').order('sort_order', { ascending: true }),
      supabase.from('superstars').select('birth_country').eq('role', role).not('birth_country', 'is', null).neq('birth_country', ''),
    ]
    if (country) {
      queries.push(supabase.from('superstars').select('birth_city').eq('role', role).eq('birth_country', country).not('birth_city', 'is', null).neq('birth_city', ''))
    }

    const results = await Promise.all(queries)
    const [{ data: eras }, { data: countriesRaw }] = results

    const countrySet = new Set<string>()
    for (const r of (countriesRaw || [])) if (r.birth_country) countrySet.add(r.birth_country)

    let cities: string[] = []
    if (country && results[2]) {
      const citySet = new Set<string>()
      for (const r of (results[2].data || [])) if (r.birth_city) citySet.add(r.birth_city)
      cities = [...citySet].sort()
    }

    return NextResponse.json({ eras: eras || [], countries: [...countrySet].sort(), cities })
  } catch (err) {
    console.error('[role-filters]', err)
    return NextResponse.json({ eras: [], countries: [], cities: [] })
  }
}
