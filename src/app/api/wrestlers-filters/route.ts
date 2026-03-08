// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600 // Cache 1 hour

/**
 * GET /api/wrestlers-filters
 * Returns filter options: eras, championships, countries, brands
 */
export async function GET() {
  try {
    const [
      { data: eras },
      { data: championships },
      { data: countriesRaw },
      { data: brandsRaw },
    ] = await Promise.all([
      supabase
        .from('eras')
        .select('id, name, slug, start_year, end_year, sort_order')
        .order('sort_order', { ascending: true }),
      supabase
        .from('championships')
        .select('id, name, slug, image_url, status')
        .order('sort_order', { ascending: true }),
      supabase
        .from('superstars')
        .select('birth_country')
        .eq('role', 'wrestler')
        .not('birth_country', 'is', null)
        .neq('birth_country', ''),
      supabase
        .from('superstars')
        .select('current_brand')
        .eq('role', 'wrestler')
        .eq('status', 'active')
        .not('current_brand', 'is', null)
        .neq('current_brand', ''),
    ])

    // Unique countries sorted
    const countrySet = new Set<string>()
    for (const r of (countriesRaw || [])) {
      if (r.birth_country) countrySet.add(r.birth_country)
    }
    const countries = [...countrySet].sort()

    // Unique brands sorted
    const brandSet = new Set<string>()
    for (const r of (brandsRaw || [])) {
      if (r.current_brand) brandSet.add(r.current_brand)
    }
    const brands = [...brandSet].sort()

    return NextResponse.json({
      eras: eras || [],
      championships: championships || [],
      countries,
      brands,
    })
  } catch (err) {
    console.error('[wrestlers-filters]', err)
    return NextResponse.json({ eras: [], championships: [], countries: [], brands: [] })
  }
}
