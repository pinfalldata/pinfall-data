// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/match-search?page=1&limit=50&...filters
 *
 * Global match search with powerful filters:
 * year, month, superstarId, opponentId, teammateId, showSeriesId,
 * matchTypeId, minRating, maxRating, result (win/loss/draw for a superstar),
 * resultType (pinfall, submission, etc.), country, city, championshipId,
 * championshipOnly, sortBy, sortDir
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')))
  const offset = (page - 1) * limit

  // Filters
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const superstarId = searchParams.get('superstarId')
  const opponentId = searchParams.get('opponentId')
  const teammateId = searchParams.get('teammateId')
  const showSeriesId = searchParams.get('showSeriesId')
  const matchTypeId = searchParams.get('matchTypeId')
  const minRating = searchParams.get('minRating')
  const maxRating = searchParams.get('maxRating')
  const resultType = searchParams.get('resultType')
  const country = searchParams.get('country')
  const city = searchParams.get('city')
  const championshipId = searchParams.get('championshipId')
  const championshipOnly = searchParams.get('championshipOnly') === 'true'

  try {
    // If superstarId filter is set, first get match IDs from participants
    let superstarMatchIds: number[] | null = null
    let superstarTeamLookup: Map<number, number> | null = null

    if (superstarId) {
      const sid = parseInt(superstarId)
      const { data: pRows } = await supabase
        .from('match_participants')
        .select('match_id, team_number, is_winner')
        .eq('superstar_id', sid)

      if (!pRows || pRows.length === 0) {
        return NextResponse.json({ matches: [], total: 0, page, limit, totalPages: 0 })
      }

      superstarMatchIds = pRows.map(r => r.match_id)
      superstarTeamLookup = new Map()
      for (const r of pRows) {
        superstarTeamLookup.set(r.match_id, r.team_number)
      }

      // Opponent filter — different team
      if (opponentId) {
        const { data: oppRows } = await supabase
          .from('match_participants')
          .select('match_id, team_number')
          .eq('superstar_id', parseInt(opponentId))
        if (oppRows) {
          const oppMap = new Map<number, number>()
          for (const r of oppRows) oppMap.set(r.match_id, r.team_number)
          superstarMatchIds = superstarMatchIds.filter(id => {
            const oppTeam = oppMap.get(id)
            const myTeam = superstarTeamLookup!.get(id)
            return oppTeam !== undefined && oppTeam !== myTeam
          })
        }
      }

      // Teammate filter — same team
      if (teammateId) {
        const { data: mateRows } = await supabase
          .from('match_participants')
          .select('match_id, team_number')
          .eq('superstar_id', parseInt(teammateId))
        if (mateRows) {
          const mateMap = new Map<number, number>()
          for (const r of mateRows) mateMap.set(r.match_id, r.team_number)
          superstarMatchIds = superstarMatchIds.filter(id => {
            const mateTeam = mateMap.get(id)
            const myTeam = superstarTeamLookup!.get(id)
            return mateTeam !== undefined && mateTeam === myTeam
          })
        }
      }

      if (superstarMatchIds.length === 0) {
        return NextResponse.json({ matches: [], total: 0, page, limit, totalPages: 0 })
      }
    }

    // Main query
    let query = supabase
      .from('matches')
      .select(`
        id, slug, date, duration_seconds, rating, result_type, winner_id, winner_team,
        is_title_change, card_position, match_order, is_dark_match,
        match_type:match_types(id, name, slug),
        championship:championships(id, name, slug, image_url),
        show:shows!matches_show_id_fkey(id, name, slug, date, city, state_province, country, show_series_id, show_series:show_series_id(id, name, short_name, logo_url)),
        participants:match_participants(
          id, team_number, is_winner, entry_number,
          superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url)
        )
      `, { count: 'exact' })
      .order('date', { ascending: false })
      .order('match_order', { ascending: false, nullsFirst: true })

    // Apply superstar match ID filter
    if (superstarMatchIds) {
      const MAX_IN = 2000
      query = query.in('id', superstarMatchIds.slice(0, MAX_IN))
    }

    // Date filters
    if (year) {
      if (month) {
        const m = month.padStart(2, '0')
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        query = query.gte('date', `${year}-${m}-01`).lte('date', `${year}-${m}-${lastDay}`)
      } else {
        query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
      }
    }

    // Match type
    if (matchTypeId) query = query.eq('match_type_id', parseInt(matchTypeId))

    // Championship
    if (championshipId) query = query.eq('championship_id', parseInt(championshipId))
    if (championshipOnly) query = query.not('championship_id', 'is', null)

    // Rating
    if (minRating) query = query.gte('rating', parseFloat(minRating))
    if (maxRating) query = query.lte('rating', parseFloat(maxRating))

    // Result type
    if (resultType) query = query.eq('result_type', resultType)

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: matches, error, count } = await query

    if (error) {
      console.error('[match-search] error:', error)
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
    }

    // Post-filters (show series, location)
    let filtered = matches || []

    if (showSeriesId) {
      filtered = filtered.filter((m: any) => m.show?.show_series_id === parseInt(showSeriesId))
    }
    if (country) {
      filtered = filtered.filter((m: any) =>
        m.show?.country?.toLowerCase().includes(country.toLowerCase())
      )
    }
    if (city) {
      filtered = filtered.filter((m: any) =>
        m.show?.city?.toLowerCase().includes(city.toLowerCase())
      )
    }

    // Enrich matches
    const enriched = filtered.map((m: any) => {
      const participants = m.participants || []
      const teams = new Map<number, any[]>()
      for (const p of participants) {
        const t = p.team_number ?? 0
        if (!teams.has(t)) teams.set(t, [])
        teams.get(t)!.push(p)
      }

      // Determine winner team label
      const winnerTeam = m.winner_team
      const isDraw = m.result_type === 'no_contest' || m.result_type === 'time_limit_draw'

      // Build team arrays
      const teamArrays: any[] = []
      const sortedTeams = [...teams.entries()].sort((a, b) => a[0] - b[0])
      for (const [teamNum, members] of sortedTeams) {
        const isWinning = !isDraw && members.some((p: any) => p.is_winner)
        teamArrays.push({
          team_number: teamNum,
          is_winner: isWinning,
          members: members.map((p: any) => ({
            id: p.superstar?.id,
            name: p.superstar?.name,
            slug: p.superstar?.slug,
            photo_url: p.superstar?.photo_url,
            is_winner: p.is_winner,
          })),
        })
      }

      return {
        id: m.id,
        slug: m.slug,
        date: m.date,
        duration_seconds: m.duration_seconds,
        rating: m.rating,
        result_type: m.result_type,
        is_title_change: m.is_title_change,
        card_position: m.card_position,
        is_dark_match: m.is_dark_match,
        isDraw,
        match_type: m.match_type,
        championship: m.championship,
        show: m.show ? {
          id: m.show.id,
          name: m.show.name,
          slug: m.show.slug,
          city: m.show.city,
          country: m.show.country,
          show_series: m.show.show_series,
        } : null,
        teams: teamArrays,
        participantCount: participants.length,
      }
    })

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({ matches: enriched, total, page, limit, totalPages })
  } catch (err) {
    console.error('[match-search] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
