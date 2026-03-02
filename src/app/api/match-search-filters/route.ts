// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/match-search-filters
 * Returns all filter options for the global match search:
 * matchTypes (sorted by usage), showSeries, championships, countries, cities
 */
export async function GET() {
  try {
    const [
      { data: allTypes },
      { data: showSeries },
      { data: championships },
      { data: matchCounts },
      { data: locations },
    ] = await Promise.all([
      supabase
        .from('match_types')
        .select('id, name, slug')
        .order('name', { ascending: true }),
      supabase
        .from('show_series')
        .select('id, name, short_name, slug')
        .order('name', { ascending: true }),
      supabase
        .from('championships')
        .select('id, name, slug, image_url, status')
        .order('sort_order', { ascending: true }),
      supabase
        .from('matches')
        .select('match_type_id'),
      supabase
        .from('shows')
        .select('country, city')
        .not('country', 'is', null),
    ])

    // Build match type count map
    const countMap = new Map<number, number>()
    if (matchCounts) {
      for (const m of matchCounts) {
        if (m.match_type_id) {
          countMap.set(m.match_type_id, (countMap.get(m.match_type_id) || 0) + 1)
        }
      }
    }

    const matchTypes = (allTypes || [])
      .map(t => ({ ...t, match_count: countMap.get(t.id) || 0 }))
      .sort((a, b) => b.match_count - a.match_count)

    // Extract unique countries and cities
    const countrySet = new Set<string>()
    const citySet = new Set<string>()
    if (locations) {
      for (const l of locations) {
        if (l.country) countrySet.add(l.country)
        if (l.city) citySet.add(l.city)
      }
    }

    const countries = [...countrySet].sort()
    const cities = [...citySet].sort()

    return NextResponse.json({
      matchTypes,
      showSeries: showSeries || [],
      championships: championships || [],
      countries,
      cities,
    })
  } catch (err) {
    console.error('[match-search-filters] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
