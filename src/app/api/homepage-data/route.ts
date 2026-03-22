// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 300

function shuffle(arr: any[]) {
  const a = [...(arr || [])]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function GET(req: NextRequest) {
  try {
    const today = new Date()
    const m = today.getMonth() + 1
    const d = today.getDate()
    const monthStr = String(m).padStart(2, '0')
    const dayStr = String(d).padStart(2, '0')

    // ═══════════════════════════════════════════
    // SEPARATE QUERIES — no nested joins (rule #1)
    // Supabase nested joins fail silently
    // ═══════════════════════════════════════════

    const [
      { data: allStarsForBday },
      { data: recentMatchesRaw },
      { data: recentSegmentsRaw },
      { data: championships },
      { data: tagTeams },
      { data: stables },
      { data: hofEntries },
      { data: slammyAwardsRaw },
      { data: arenas },
      { data: objects },
    ] = await Promise.all([
      // Birthdays — simple query, no join
      supabase
        .from('superstars')
        .select('id, name, slug, photo_url, birth_date, total_matches')
        .not('birth_date', 'is', null)
        .order('total_matches', { ascending: false, nullsFirst: false }),

      // Recent matches — flat query
      supabase
        .from('matches')
        .select('id, slug, date, rating, duration_seconds, result_type, match_type_id, show_id')
        .order('date', { ascending: false })
        .limit(5),

      // Recent segments — flat query
      supabase
        .from('show_segments')
        .select('id, title, slug, category, show_id')
        .order('created_at', { ascending: false })
        .limit(5),

      // Championships — simple query, no join
      supabase
        .from('championships')
        .select('id, name, slug, image_url, status')
        .order('sort_order', { ascending: true }),

      // Tag teams with photo
      supabase
        .from('tag_teams')
        .select('id, name, slug, photo_url')
        .not('photo_url', 'is', null)
        .limit(50),

      // Stables with photo
      supabase
        .from('stables')
        .select('id, name, slug, photo_url')
        .not('photo_url', 'is', null)
        .limit(50),

      // ★ FIX: Hall of Fame — correct columns: induction_year, class (NOT year, wing)
      supabase
        .from('hall_of_fame')
        .select('id, superstar_id, inductee_name, induction_year, class')
        .not('superstar_id', 'is', null)
        .order('induction_year', { ascending: false })
        .limit(50),

      // Slammy Awards — flat query (join winner separately)
      supabase
        .from('slammy_awards')
        .select('id, year, category, winner_id, winner_name')
        .not('winner_id', 'is', null)
        .order('year', { ascending: false })
        .limit(50),

      // Arenas with image
      supabase
        .from('arenas')
        .select('id, name, slug, image_url, city, country')
        .not('image_url', 'is', null)
        .limit(50),

      // Objects with image
      supabase
        .from('match_objects')
        .select('id, name, slug, image_url')
        .not('image_url', 'is', null)
        .limit(50),
    ])

    // ═══════════════════════════════════════════
    // BIRTHDAYS — filter month/day in JavaScript
    // (Supabase .like() on date columns is unreliable)
    // ═══════════════════════════════════════════
    const birthdays = (allStarsForBday || [])
      .filter(s => {
        if (!s.birth_date) return false
        const bd = String(s.birth_date)
        return bd.endsWith(`-${monthStr}-${dayStr}`)
      })
      .slice(0, 20)
      .map(s => ({
        ...s,
        birth_year: s.birth_date ? parseInt(String(s.birth_date).slice(0, 4)) : null,
      }))

    // ═══════════════════════════════════════════
    // MERGE: Recent Matches + related data
    // Separate queries for shows, match_types, participants
    // ═══════════════════════════════════════════
    let recentMatches = []
    if (recentMatchesRaw && recentMatchesRaw.length > 0) {
      const matchIds = recentMatchesRaw.map(m => m.id)
      const showIds = [...new Set(recentMatchesRaw.map(m => m.show_id).filter(Boolean))]
      const matchTypeIds = [...new Set(recentMatchesRaw.map(m => m.match_type_id).filter(Boolean))]

      const [
        { data: shows },
        { data: matchTypes },
        { data: participants },
      ] = await Promise.all([
        showIds.length > 0
          ? supabase.from('shows').select('id, name, slug, date, show_series_id').in('id', showIds)
          : { data: [] },
        matchTypeIds.length > 0
          ? supabase.from('match_types').select('id, name').in('id', matchTypeIds)
          : { data: [] },
        supabase.from('match_participants').select('id, match_id, team_number, is_winner, superstar_id').in('match_id', matchIds),
      ])

      // Fetch show_series for shows
      const seriesIds = [...new Set((shows || []).map(s => s.show_series_id).filter(Boolean))]
      let showSeriesMap = {}
      if (seriesIds.length > 0) {
        const { data: series } = await supabase.from('show_series').select('id, name, short_name, logo_url').in('id', seriesIds)
        for (const s of (series || [])) showSeriesMap[s.id] = s
      }

      // Fetch superstar photos for participants
      const starIds = [...new Set((participants || []).map(p => p.superstar_id).filter(Boolean))]
      let starsMap = {}
      if (starIds.length > 0) {
        const { data: starsList } = await supabase.from('superstars').select('id, name, slug, photo_url').in('id', starIds)
        for (const s of (starsList || [])) starsMap[s.id] = s
      }

      const showsMap = {}
      for (const s of (shows || [])) {
        showsMap[s.id] = { ...s, show_series: showSeriesMap[s.show_series_id] || null }
      }
      const typesMap = {}
      for (const t of (matchTypes || [])) typesMap[t.id] = t

      recentMatches = recentMatchesRaw.map(m => ({
        ...m,
        show: showsMap[m.show_id] || null,
        match_type: typesMap[m.match_type_id] || null,
        participants: (participants || [])
          .filter(p => p.match_id === m.id)
          .map(p => ({ ...p, superstar: starsMap[p.superstar_id] || null })),
      }))
    }

    // ═══════════════════════════════════════════
    // MERGE: Recent Segments + related data
    // ═══════════════════════════════════════════
    let recentSegments = []
    if (recentSegmentsRaw && recentSegmentsRaw.length > 0) {
      const segIds = recentSegmentsRaw.map(s => s.id)
      const segShowIds = [...new Set(recentSegmentsRaw.map(s => s.show_id).filter(Boolean))]

      const [
        { data: segShows },
        { data: segParts },
      ] = await Promise.all([
        segShowIds.length > 0
          ? supabase.from('shows').select('id, name, slug, date, show_series_id').in('id', segShowIds)
          : { data: [] },
        supabase.from('show_segment_participants').select('id, show_segment_id, superstar_id').in('show_segment_id', segIds),
      ])

      // Show series for segment shows
      const segSeriesIds = [...new Set((segShows || []).map(s => s.show_series_id).filter(Boolean))]
      let segSeriesMap = {}
      if (segSeriesIds.length > 0) {
        const { data: series } = await supabase.from('show_series').select('id, name, short_name, logo_url').in('id', segSeriesIds)
        for (const s of (series || [])) segSeriesMap[s.id] = s
      }

      // Superstar photos for segment participants
      const segStarIds = [...new Set((segParts || []).map(p => p.superstar_id).filter(Boolean))]
      let segStarsMap = {}
      if (segStarIds.length > 0) {
        const { data: segStarsList } = await supabase.from('superstars').select('id, name, slug, photo_url').in('id', segStarIds)
        for (const s of (segStarsList || [])) segStarsMap[s.id] = s
      }

      const segShowsMap = {}
      for (const s of (segShows || [])) {
        segShowsMap[s.id] = { ...s, show_series: segSeriesMap[s.show_series_id] || null }
      }

      recentSegments = recentSegmentsRaw.map(s => ({
        ...s,
        show: segShowsMap[s.show_id] || null,
        participants: (segParts || [])
          .filter(p => p.show_segment_id === s.id)
          .map(p => ({ ...p, superstar: segStarsMap[p.superstar_id] || null })),
      }))
    }

    // ═══════════════════════════════════════════
    // MERGE: HOF entry — separate query for superstar
    // ★ FIX: uses induction_year and class (NOT year, wing)
    // ═══════════════════════════════════════════
    let hofEntry = null
    const pickedHof = shuffle(hofEntries || [])[0]
    if (pickedHof && pickedHof.superstar_id) {
      const { data: hofStar } = await supabase
        .from('superstars')
        .select('id, name, slug, photo_url')
        .eq('id', pickedHof.superstar_id)
        .single()

      if (hofStar) {
        hofEntry = {
          id: pickedHof.id,
          year: pickedHof.induction_year,        // ★ mapped to "year" for component
          wing: pickedHof.class,                  // ★ mapped to "wing" for component
          inductee_name: pickedHof.inductee_name,
          superstar: { ...hofStar },              // ★ new object (not frozen)
        }
      }
    }

    // ═══════════════════════════════════════════
    // MERGE: Slammy Award — separate query for winner superstar
    // ═══════════════════════════════════════════
    let slammyAward = null
    const pickedSlammy = shuffle(slammyAwardsRaw || [])[0]
    if (pickedSlammy && pickedSlammy.winner_id) {
      const { data: slammyStar } = await supabase
        .from('superstars')
        .select('id, name, slug, photo_url')
        .eq('id', pickedSlammy.winner_id)
        .single()

      if (slammyStar) {
        slammyAward = {
          id: pickedSlammy.id,
          year: pickedSlammy.year,
          category: pickedSlammy.category,
          winner: { ...slammyStar },              // ★ new object (not frozen)
        }
      }
    }

    return NextResponse.json({
      birthdays,
      recentMatches,
      recentSegments,
      championships: championships || [],
      tagTeam: shuffle(tagTeams || [])[0] || null,
      stable: shuffle(stables || [])[0] || null,
      hofEntry,
      slammyAward,
      arena: shuffle(arenas || [])[0] || null,
      object: shuffle(objects || [])[0] || null,
    })
  } catch (err) {
    console.error('[homepage-data]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
