// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/versus?slug1=john-cena&slug2=the-rock
 * Returns all matches where both superstars participated, with full details.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug1 = searchParams.get('slug1')
  const slug2 = searchParams.get('slug2')

  if (!slug1 || !slug2) {
    return NextResponse.json({ error: 'Two superstar slugs required' }, { status: 400 })
  }

  try {
    // 1. Fetch both superstars
    const { data: stars } = await supabase
      .from('superstars')
      .select('id, name, slug, photo_url, birth_date, status, height_cm, weight_kg, total_matches, win_count, loss_count, draw_count')
      .in('slug', [slug1, slug2])

    if (!stars || stars.length < 2) {
      return NextResponse.json({ error: 'One or both superstars not found' }, { status: 404 })
    }

    const s1 = stars.find(s => s.slug === slug1)!
    const s2 = stars.find(s => s.slug === slug2)!

    // 2. Get ALL match IDs for both (paginated — Supabase limits to 1000 rows per query)
    async function fetchAll(superstarId: number) {
      const all: { match_id: number; team_number: number; is_winner: boolean | null }[] = []
      let from = 0
      const batch = 1000
      while (true) {
        const { data } = await supabase
          .from('match_participants')
          .select('match_id, team_number, is_winner')
          .eq('superstar_id', superstarId)
          .range(from, from + batch - 1)
        if (!data || data.length === 0) break
        all.push(...data)
        if (data.length < batch) break
        from += batch
      }
      return all
    }

    const [p1, p2] = await Promise.all([fetchAll(s1.id), fetchAll(s2.id)])

    if (p1.length === 0 || p2.length === 0) return NextResponse.json({ superstar1: s1, superstar2: s2, matches: [], h2h: null })

    // 3. Find common match IDs
    const s1MatchIds = new Set(p1.map(p => p.match_id))
    const commonIds = p2.filter(p => s1MatchIds.has(p.match_id)).map(p => p.match_id)

    if (commonIds.length === 0) {
      return NextResponse.json({ superstar1: s1, superstar2: s2, matches: [], h2h: null })
    }

    // Build lookups for both superstars
    const s1Lookup = new Map()
    for (const r of p1) s1Lookup.set(r.match_id, r)
    const s2Lookup = new Map()
    for (const r of p2) s2Lookup.set(r.match_id, r)

    // 4. Fetch matches
    const { data: matchesRaw } = await supabase
      .from('matches')
      .select('id, slug, date, match_order, duration_seconds, rating, result_type, championship_id, is_title_change, is_dark_match, show_id, match_type_id, score_winner, score_loser')
      .in('id', commonIds)
      .order('date', { ascending: false })

    if (!matchesRaw || matchesRaw.length === 0) {
      return NextResponse.json({ superstar1: s1, superstar2: s2, matches: [], h2h: null })
    }

    // 5. Batch fetch related data
    const showIds = [...new Set(matchesRaw.map(m => m.show_id).filter(Boolean))]
    const matchTypeIds = [...new Set(matchesRaw.map(m => m.match_type_id).filter(Boolean))]
    const champIds = [...new Set(matchesRaw.map(m => m.championship_id).filter(Boolean))]
    const matchIds = matchesRaw.map(m => m.id)

    const [
      { data: shows },
      { data: matchTypes },
      { data: champs },
      { data: allParticipants },
    ] = await Promise.all([
      showIds.length > 0
        ? supabase.from('shows').select('id, name, slug, date, venue, city, country, show_series_id').in('id', showIds)
        : { data: [] },
      matchTypeIds.length > 0
        ? supabase.from('match_types').select('id, name, slug').in('id', matchTypeIds)
        : { data: [] },
      champIds.length > 0
        ? supabase.from('championships').select('id, name, slug, image_url').in('id', champIds)
        : { data: [] },
      supabase.from('match_participants').select('match_id, superstar_id, team_number, is_winner, tag_team_id').in('match_id', matchIds),
    ])

    // Fetch show_series for show logos
    const seriesIds = [...new Set((shows || []).map(s => s.show_series_id).filter(Boolean))]
    let seriesMap = {}
    if (seriesIds.length > 0) {
      const { data: series } = await supabase.from('show_series').select('id, name, short_name, logo_url').in('id', seriesIds)
      for (const s of (series || [])) seriesMap[s.id] = s
    }

    // Fetch superstar names/photos for all participants
    const allStarIds = [...new Set((allParticipants || []).map(p => p.superstar_id))]
    let starsMap = {}
    if (allStarIds.length > 0) {
      const { data: starsList } = await supabase.from('superstars').select('id, name, slug, photo_url').in('id', allStarIds)
      for (const s of (starsList || [])) starsMap[s.id] = s
    }

    // Build lookup maps
    const showsMap = {}
    for (const s of (shows || [])) showsMap[s.id] = { ...s, show_series: seriesMap[s.show_series_id] || null }
    const typesMap = {}
    for (const t of (matchTypes || [])) typesMap[t.id] = t
    const champsMap = {}
    for (const c of (champs || [])) champsMap[c.id] = c

    // 6. Assemble matches with participant data
    const matches = matchesRaw.map(m => {
      const s1Data = s1Lookup.get(m.id)
      const s2Data = s2Lookup.get(m.id)

      // Determine outcome relative to s1
      let outcome = 'draw'
      if (s1Data && s2Data) {
        if (s1Data.is_winner === true) outcome = 'win'
        else if (s2Data.is_winner === true) outcome = 'loss'
        else if (s1Data.is_winner === null && s2Data.is_winner === null) outcome = 'draw'
        else outcome = 'draw'
      }

      const participants = (allParticipants || [])
        .filter(p => p.match_id === m.id)
        .map(p => ({ ...p, superstar: starsMap[p.superstar_id] || null }))

      return {
        ...m,
        show: showsMap[m.show_id] || null,
        match_type: typesMap[m.match_type_id] || null,
        championship: champsMap[m.championship_id] || null,
        participants,
        outcome, // win/loss/draw relative to s1
      }
    })

    // 7. H2H stats
    const wins1 = matches.filter(m => m.outcome === 'win').length
    const wins2 = matches.filter(m => m.outcome === 'loss').length
    const draws = matches.filter(m => m.outcome === 'draw').length

    const h2h = {
      total: matches.length,
      wins1,
      wins2,
      draws,
      firstMatch: matches.length > 0 ? matches[matches.length - 1].date : null,
      lastMatch: matches.length > 0 ? matches[0].date : null,
    }

    return NextResponse.json({ superstar1: s1, superstar2: s2, matches, h2h })
  } catch (err) {
    console.error('[versus]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
