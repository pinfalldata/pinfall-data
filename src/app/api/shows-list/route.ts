// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/shows-list
 * Returns all show series sorted by activity (active first) then by first_episode_date desc
 * 
 * FIX: Uses individual COUNT queries per show series instead of fetching all rows.
 * This avoids the Supabase 1000-row default limit issue.
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

    if (!series || series.length === 0) {
      return NextResponse.json({ shows: [] })
    }

    // Get episode count per series using individual COUNT queries (reliable)
    const countResults = await Promise.all(
      series.map(async (s) => {
        const { count, error: countError } = await supabase
          .from('shows')
          .select('*', { count: 'exact', head: true })
          .eq('show_series_id', s.id)

        if (countError) {
          console.error(`[shows-list] count error for series ${s.id}:`, countError)
          return { id: s.id, count: 0 }
        }
        return { id: s.id, count: count || 0 }
      })
    )

    const countMap = new Map<number, number>()
    for (const r of countResults) {
      countMap.set(r.id, r.count)
    }

    const enriched = (series || []).map(s => {
      const startYear = s.first_episode_date ? new Date(s.first_episode_date).getFullYear() : null
      return {
        ...s,
        episode_count: countMap.get(s.id) || 0,
        start_year: startYear,
        end_year: s.is_active ? null : null,
      }
    })

    return NextResponse.json({ shows: enriched })
  } catch (err) {
    console.error('[shows-list] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
