// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/shows-list
 * Returns all show series sorted by activity (active first) then by first_episode_date desc
 */
export async function GET() {
  try {
    const { data: series, error } = await supabase
      .from('show_series')
      .select('id, name, slug, short_name, logo_url, description, first_episode_date, is_active, sort_order')
      .order('is_active', { ascending: false })
      .order('first_episode_date', { ascending: false, nullsFirst: true })

    if (error) {
      console.error('[shows-list] error:', error)
      return NextResponse.json({ error: 'Failed to fetch shows' }, { status: 500 })
    }

    // Get episode count per series for display
    const { data: counts } = await supabase
      .from('shows')
      .select('show_series_id')

    const countMap = new Map<number, number>()
    if (counts) {
      for (const c of counts) {
        if (c.show_series_id) {
          countMap.set(c.show_series_id, (countMap.get(c.show_series_id) || 0) + 1)
        }
      }
    }

    const enriched = (series || []).map(s => {
      // Extract years from first_episode_date
      const startYear = s.first_episode_date ? new Date(s.first_episode_date).getFullYear() : null
      return {
        ...s,
        episode_count: countMap.get(s.id) || 0,
        start_year: startYear,
        end_year: s.is_active ? null : null, // Would need last episode date; show "Present" if active
      }
    })

    return NextResponse.json({ shows: enriched })
  } catch (err) {
    console.error('[shows-list] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
