// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/shows-list
 * Returns all show series with accurate episode counts and last show date
 * Uses individual HEAD count queries to bypass PostgREST 1000-row limit
 */
export async function GET() {
  try {
    const { data: series, error } = await supabase
      .from('show_series')
      .select('id, name, slug, short_name, logo_url, description, first_episode_date, is_active, sort_order, is_ple')
      .order('is_active', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('first_episode_date', { ascending: false, nullsFirst: true })

    if (error) {
      console.error('[shows-list] error:', error)
      return NextResponse.json({ error: 'Failed to fetch shows' }, { status: 500 })
    }

    // For each series: get accurate count + last episode date using individual queries
    const enriched = await Promise.all(
      (series || []).map(async (s) => {
        // Get accurate episode count
        const { count, error: countErr } = await supabase
          .from('shows')
          .select('*', { count: 'exact', head: true })
          .eq('show_series_id', s.id)

        if (countErr) {
          console.error(`[shows-list] count error for ${s.slug}:`, countErr)
        }

        // Get last episode date
        const { data: lastEp, error: lastErr } = await supabase
          .from('shows')
          .select('date')
          .eq('show_series_id', s.id)
          .order('date', { ascending: false })
          .limit(1)
          .single()

        if (lastErr && lastErr.code !== 'PGRST116') {
          // PGRST116 = no rows found — that's ok
          console.error(`[shows-list] last ep error for ${s.slug}:`, lastErr)
        }

        const startYear = s.first_episode_date ? new Date(s.first_episode_date).getFullYear() : null
        const lastDate = lastEp?.date || null
        const endYear = lastDate ? new Date(lastDate).getFullYear() : null

        return {
          ...s,
          episode_count: count || 0,
          start_year: startYear,
          end_year: s.is_active ? null : endYear,
          last_show_date: lastDate,
        }
      })
    )

    return NextResponse.json({ shows: enriched })
  } catch (err) {
    console.error('[shows-list] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
