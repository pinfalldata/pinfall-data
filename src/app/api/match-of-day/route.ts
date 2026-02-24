// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/match-of-day
 * Returns a random high-rated match. Changes daily based on date seed.
 */
export async function GET() {
  try {
    // Use today's date as seed for consistent daily pick
    const today = new Date().toISOString().split('T')[0]
    const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0)

    // Get count of highly rated matches
    const { count } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('rating', 7)
      .not('championship_id', 'is', null)

    if (!count || count === 0) {
      // Fallback: any match with rating >= 6
      const { count: fallbackCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .gte('rating', 6)

      if (!fallbackCount) return NextResponse.json({ match: null })

      const offset = seed % fallbackCount
      const { data } = await supabase
        .from('matches')
        .select(`
          id, slug, date, duration_seconds, rating, result_type, is_title_change,
          match_type:match_types(id, name, slug),
          championship:championships(id, name, slug, image_url),
          show:shows!matches_show_id_fkey(id, name, slug, city, country, show_series:show_series_id(id, name, short_name, logo_url)),
          participants:match_participants(
            id, team_number, is_winner,
            superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url)
          )
        `)
        .gte('rating', 6)
        .order('date', { ascending: false })
        .range(offset, offset)
        .single()

      return NextResponse.json({ match: data })
    }

    const offset = seed % count
    const { data } = await supabase
      .from('matches')
      .select(`
        id, slug, date, duration_seconds, rating, result_type, is_title_change,
        match_type:match_types(id, name, slug),
        championship:championships(id, name, slug, image_url),
        show:shows!matches_show_id_fkey(id, name, slug, city, country, show_series:show_series_id(id, name, short_name, logo_url)),
        participants:match_participants(
          id, team_number, is_winner,
          superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url)
        )
      `)
      .gte('rating', 7)
      .not('championship_id', 'is', null)
      .order('date', { ascending: false })
      .range(offset, offset)
      .single()

    return NextResponse.json({ match: data })
  } catch (err) {
    console.error('[match-of-day]', err)
    return NextResponse.json({ match: null })
  }
}
