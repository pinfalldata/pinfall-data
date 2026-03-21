// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

/**
 * GET /api/segment-search-filters
 * Returns all filter options for the segment search page
 */
export async function GET() {
  try {
    const [
      { data: showSeries },
      { data: locations },
      { data: catCounts },
    ] = await Promise.all([
      supabase.from('show_series').select('id, name, short_name, slug').order('name', { ascending: true }),
      supabase.from('shows').select('country, city').not('country', 'is', null),
      supabase.from('show_segments').select('category'),
    ])

    // Segment categories with counts
    const catMap = new Map<string, number>()
    if (catCounts) {
      for (const s of catCounts) {
        if (s.category) catMap.set(s.category, (catMap.get(s.category) || 0) + 1)
      }
    }
    const segmentCategories = [...catMap.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)

    // Countries
    const countrySet = new Set<string>()
    if (locations) {
      for (const l of locations) {
        if (l.country) countrySet.add(l.country)
      }
    }

    // OMG categories
    const omgCategories = [
      { value: 'extreme', label: '🔥 Extreme' },
      { value: 'wtf', label: '🤯 WTF' },
      { value: 'sexy', label: '💋 Sexy' },
      { value: 'return', label: '🚀 Return' },
      { value: 'betrayal', label: '🗡️ Betrayal' },
      { value: 'emotional', label: '💎 Emotional' },
    ]

    return NextResponse.json({
      segmentCategories,
      showSeries: showSeries || [],
      countries: [...countrySet].sort(),
      omgCategories,
    })
  } catch (err) {
    console.error('[segment-search-filters]', err)
    return NextResponse.json({ segmentCategories: [], showSeries: [], countries: [], omgCategories: [] })
  }
}
