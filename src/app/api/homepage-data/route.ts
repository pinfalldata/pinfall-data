// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 300

export async function GET(req: NextRequest) {
  try {
    const today = new Date()
    const m = today.getMonth() + 1
    const d = today.getDate()
    const monthStr = String(m).padStart(2, '0')
    const dayStr = String(d).padStart(2, '0')

    const [
      { data: allStarsForBday },
      { data: recentMatches },
      { data: recentSegments },
      { data: championships },
      { data: tagTeams },
      { data: stables },
      { data: hofEntries },
      { data: slammyAwards },
      { data: arenas },
      { data: objects },
    ] = await Promise.all([
      // ★ FIX: Fetch all superstars with birth_date, filter month/day in JS
      // (Supabase .like() on date columns is unreliable)
      supabase.from('superstars').select('id, name, slug, photo_url, birth_date, total_matches').not('birth_date', 'is', null).order('total_matches', { ascending: false, nullsFirst: false }),
      supabase.from('matches').select('id, slug, date, rating, duration_seconds, result_type, match_type:match_types(id, name), show:shows!matches_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)), participants:match_participants(team_number, is_winner, superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url))').order('date', { ascending: false }).limit(5),
      supabase.from('show_segments').select('id, title, slug, category, show:shows!show_segments_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)), participants:show_segment_participants(superstar:superstars(id, name, slug, photo_url))').order('created_at', { ascending: false }).limit(5),
      supabase.from('championships').select('id, name, slug, image_url, status').order('sort_order', { ascending: true }),
      supabase.from('tag_teams').select('id, name, slug, photo_url').not('photo_url', 'is', null).limit(50),
      supabase.from('stables').select('id, name, slug, photo_url').not('photo_url', 'is', null).limit(50),
      supabase.from('hall_of_fame').select('id, year, wing, superstar:superstars(id, name, slug, photo_url)').order('year', { ascending: false }).limit(50),
      supabase.from('slammy_awards').select('id, year, category, winner:superstars!slammy_awards_winner_id_fkey(id, name, slug, photo_url)').order('year', { ascending: false }).limit(50),
      supabase.from('arenas').select('id, name, slug, image_url, city, country').not('image_url', 'is', null).limit(50),
      supabase.from('match_objects').select('id, name, slug, image_url').not('image_url', 'is', null).limit(50),
    ])

    // ★ FIX: Filter birthdays in JS by month/day (already sorted by total_matches)
    const birthdays = (allStarsForBday || [])
      .filter(s => {
        if (!s.birth_date) return false
        return s.birth_date.endsWith(`-${monthStr}-${dayStr}`)
      })
      .slice(0, 20)
      .map(s => ({
        ...s,
        birth_year: s.birth_date ? parseInt(s.birth_date.slice(0, 4)) : null,
      }))

    const shuffle = (arr) => {
      const a = [...(arr || [])]
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
      return a
    }

    return NextResponse.json({
      birthdays,
      recentMatches: recentMatches || [],
      recentSegments: recentSegments || [],
      championships: championships || [],
      tagTeam: shuffle(tagTeams)[0] || null,
      stable: shuffle(stables)[0] || null,
      hofEntry: shuffle(hofEntries)[0] || null,
      slammyAward: shuffle(slammyAwards)[0] || null,
      arena: shuffle(arenas)[0] || null,
      object: shuffle(objects)[0] || null,
    })
  } catch (err) {
    console.error('[homepage-data]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
