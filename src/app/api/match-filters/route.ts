// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/match-filters
 * Returns filter options: match types (sorted by most used), show series (full name)
 */
export async function GET() {
  try {
    const [
      { data: allTypes },
      { data: showSeries },
      { data: matchCounts },
    ] = await Promise.all([
      supabase
        .from('match_types')
        .select('id, name, slug')
        .order('name', { ascending: true }),
      supabase
        .from('show_series')
        .select('id, name, short_name, slug')
        .order('name', { ascending: true }),
      // Count matches per type for sorting
      supabase
        .from('matches')
        .select('match_type_id'),
    ])

    // Build count map and sort match types by frequency
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

    return NextResponse.json({
      matchTypes,
      showSeries: showSeries || [],
    })
  } catch (err) {
    console.error('[match-filters] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
