// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 300 // 5 min cache

export async function GET(req: NextRequest) {
  try {
    const today = new Date()
    const m = today.getMonth() + 1
    const d = today.getDate()

    const [
      { data: birthdays },
      { data: recentMatches },
      { data: recentSegments },
      { data: championships },
      { data: omgMoments },
      { data: tagTeams },
      { data: stables },
      { data: hofEntries },
      { data: slammyAwards },
      { data: arenas },
      { data: objects },
      { data: shows },
      { data: ples },
    ] = await Promise.all([
      // Birthdays today
      supabase.rpc('get_birthdays_today', { p_month: m, p_day: d }).then(r => r).catch(() => ({ data: null })),
      // Last 5 matches
      supabase.from('matches').select(`
        id, slug, date, rating, duration_seconds, result_type,
        match_type:match_types(id, name),
        show:shows!matches_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)),
        participants:match_participants(
          team_number, is_winner,
          superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url)
        )
      `).order('date', { ascending: false }).limit(5),
      // Last 5 segments
      supabase.from('show_segments').select(`
        id, title, slug, category,
        show:shows!show_segments_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)),
        participants:show_segment_participants(
          superstar:superstars(id, name, slug, photo_url)
        )
      `).order('created_at', { ascending: false }).limit(5),
      // All championships for belt carousel
      supabase.from('championships').select('id, name, slug, image_url, status').eq('status', 'active').order('sort_order', { ascending: true }),
      // Random OMG moments
      supabase.from('omg_moments').select('id, title, date, category, video_url, thumbnail_url, show:shows(id, name, slug)').order('date', { ascending: false }).limit(20),
      // Random tag teams
      supabase.from('tag_teams').select('id, name, slug, photo_url').not('photo_url', 'is', null).limit(20),
      // Random stables
      supabase.from('stables').select('id, name, slug, photo_url').not('photo_url', 'is', null).limit(20),
      // Random HOF
      supabase.from('hall_of_fame').select('id, year, wing, superstar:superstars(id, name, slug, photo_url)').order('year', { ascending: false }).limit(20),
      // Random Slammy
      supabase.from('slammy_awards').select('id, year, category, winner:superstars!slammy_awards_winner_id_fkey(id, name, slug, photo_url)').order('year', { ascending: false }).limit(20),
      // Random arenas
      supabase.from('arenas').select('id, name, slug, image_url, city, country').not('image_url', 'is', null).limit(20),
      // Random objects
      supabase.from('match_objects').select('id, name, slug, image_url').not('image_url', 'is', null).limit(20),
      // Random shows
      supabase.from('shows').select('id, name, slug, date, logo_url, show_series:show_series_id(id, name, short_name, logo_url, is_ple)').not('logo_url', 'is', null).eq('show_type', 'weekly').order('date', { ascending: false }).limit(20),
      // Random PLEs
      supabase.from('shows').select('id, name, slug, date, logo_url, show_series:show_series_id(id, name, short_name, logo_url, is_ple)').not('logo_url', 'is', null).eq('show_type', 'ppv').order('date', { ascending: false }).limit(20),
    ])

    // If RPC doesn't exist, fallback for birthdays
    let birthdayList = birthdays || []
    if (birthdayList.length === 0) {
      // Manual fallback: query superstars born on this month/day
      const monthStr = String(m).padStart(2, '0')
      const dayStr = String(d).padStart(2, '0')
      const { data: bFallback } = await supabase
        .from('superstars')
        .select('id, name, slug, photo_url, birth_date')
        .not('birth_date', 'is', null)
        .like('birth_date', `%-${monthStr}-${dayStr}`)
        .limit(20)
      birthdayList = (bFallback || []).map(s => ({
        ...s,
        birth_year: s.birth_date ? parseInt(s.birth_date.slice(0, 4)) : null,
      }))
    }

    // Shuffle helpers
    const shuffle = (arr: any[]) => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] }
      return a
    }

    return NextResponse.json({
      birthdays: birthdayList,
      recentMatches: recentMatches || [],
      recentSegments: recentSegments || [],
      championships: championships || [],
      omgMoments: shuffle(omgMoments || []).slice(0, 5),
      tagTeam: shuffle(tagTeams || [])[0] || null,
      stable: shuffle(stables || [])[0] || null,
      hofEntry: shuffle(hofEntries || [])[0] || null,
      slammyAward: shuffle(slammyAwards || [])[0] || null,
      arena: shuffle(arenas || [])[0] || null,
      object: shuffle(objects || [])[0] || null,
      show: shuffle(shows || [])[0] || null,
      ple: shuffle(ples || [])[0] || null,
    })
  } catch (err) {
    console.error('[homepage-data]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
