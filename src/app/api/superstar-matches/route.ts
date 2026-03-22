// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/superstar-matches?superstarId=...&page=1&limit=50&...filters
 *
 * Filters: year, month, opponentId, teammateId, showSeriesId, matchTypeId,
 *          minRating, maxRating, country, city, championshipOnly, result, resultType
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const superstarId = searchParams.get('superstarId')
  if (!superstarId) {
    return NextResponse.json({ error: 'superstarId is required' }, { status: 400 })
  }

  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')))
  const offset = (page - 1) * limit

  // Filters
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const opponentId = searchParams.get('opponentId')
  const teammateId = searchParams.get('teammateId')
  const showSeriesId = searchParams.get('showSeriesId')
  const matchTypeId = searchParams.get('matchTypeId')
  const minRating = searchParams.get('minRating')
  const maxRating = searchParams.get('maxRating')
  const country = searchParams.get('country')
  const city = searchParams.get('city')
  const championshipOnly = searchParams.get('championshipOnly') === 'true'
  const titleChangeOnly = searchParams.get('titleChangeOnly') === 'true'
  const result = searchParams.get('result') // 'win' | 'loss' | 'draw'
  const resultType = searchParams.get('resultType') // pinfall, submission, dq, etc.

  try {
    const sid = parseInt(superstarId)

    // Step 1: Get match IDs where superstar participated
    let matchIdsQuery = supabase
      .from('match_participants')
      .select('match_id, is_winner, team_number')
      .eq('superstar_id', sid)

    // Pre-filter wins/losses at participant level
    if (result === 'win') {
      matchIdsQuery = matchIdsQuery.eq('is_winner', true)
    } else if (result === 'loss') {
      matchIdsQuery = matchIdsQuery.eq('is_winner', false)
    }

    const { data: participantRows, error: pError } = await matchIdsQuery
    if (pError || !participantRows || participantRows.length === 0) {
      return NextResponse.json({ matches: [], total: 0, page, limit, totalPages: 0 })
    }

    let matchIds = participantRows.map(r => r.match_id)

    // Build a lookup for the superstar's team per match
    const teamLookup = new Map<number, number>()
    for (const r of participantRows) {
      teamLookup.set(r.match_id, r.team_number)
    }

    // Step 2: Opponent filter — intersect match sets
    if (opponentId) {
      const { data: oppRows } = await supabase
        .from('match_participants')
        .select('match_id, team_number')
        .eq('superstar_id', parseInt(opponentId))

      if (oppRows) {
        // Opponent must be on a DIFFERENT team
        const oppMap = new Map<number, number>()
        for (const r of oppRows) oppMap.set(r.match_id, r.team_number)

        matchIds = matchIds.filter(id => {
          const oppTeam = oppMap.get(id)
          const myTeam = teamLookup.get(id)
          return oppTeam !== undefined && oppTeam !== myTeam
        })
      }
    }

    // Step 2b: Teammate filter — must be on SAME team
    if (teammateId) {
      const { data: mateRows } = await supabase
        .from('match_participants')
        .select('match_id, team_number')
        .eq('superstar_id', parseInt(teammateId))

      if (mateRows) {
        const mateMap = new Map<number, number>()
        for (const r of mateRows) mateMap.set(r.match_id, r.team_number)

        matchIds = matchIds.filter(id => {
          const mateTeam = mateMap.get(id)
          const myTeam = teamLookup.get(id)
          return mateTeam !== undefined && mateTeam === myTeam
        })
      }
    }

    if (matchIds.length === 0) {
      return NextResponse.json({ matches: [], total: 0, page, limit, totalPages: 0 })
    }

    // Supabase .in() has a limit — chunk if needed
    const MAX_IN = 2000
    const idsToQuery = matchIds.length > MAX_IN ? matchIds.slice(0, MAX_IN) : matchIds

    // Step 3: Query matches with enrichment
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
        ),
        managers:match_managers(
          id, team_number,
          superstar:superstars!match_managers_superstar_id_fkey(id, name, slug, photo_url),
          managing_for:superstars!match_managers_managing_for_superstar_id_fkey(id, name, slug)
        )
      `, { count: 'exact' })
      .in('id', idsToQuery)
      .order('date', { ascending: false })

    // Date filters
    if (year) {
      query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
    }
    if (year && month) {
      const m = month.padStart(2, '0')
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
      query = query.gte('date', `${year}-${m}-01`).lte('date', `${year}-${m}-${lastDay}`)
    }

    // Match type
    if (matchTypeId) {
      query = query.eq('match_type_id', parseInt(matchTypeId))
    }

    // Championship only
    if (championshipOnly) {
      query = query.not('championship_id', 'is', null)
    }

    // Title change only
    if (titleChangeOnly) {
      query = query.eq('is_title_change', true)
    }

    // Rating range
    if (minRating) {
      query = query.gte('rating', parseFloat(minRating))
    }
    if (maxRating) {
      query = query.lte('rating', parseFloat(maxRating))
    }

    // Result type (pinfall, submission, dq, etc.)
    if (resultType) {
      query = query.eq('result_type', resultType)
    }

    // Draw filter (includes no_contest and time_limit_draw)
    if (result === 'draw') {
      query = query.in('result_type', ['no_contest', 'time_limit_draw'])
    }

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: matches, error: mError, count } = await query

    if (mError) {
      console.error('[superstar-matches] matches query error:', mError)
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
    }

    // Step 4: Post-filter (show series, location)
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

    // Step 5: Fetch multi-championships + era photos
    const filteredIds = filtered.map((m: any) => m.id)
    let mcMap = new Map()
    if (filteredIds.length > 0) {
      try {
        const { data: mcRows } = await supabase.from('match_championships').select('match_id, championship_id, is_title_change').in('match_id', filteredIds)
        if (mcRows && mcRows.length > 0) {
          const champIds = [...new Set(mcRows.map(r => r.championship_id))]
          const { data: mcChamps } = await supabase.from('championships').select('id, name, slug, image_url').in('id', champIds)
          const cMap = new Map((mcChamps || []).map(c => [c.id, c]))
          for (const r of mcRows) { const c = cMap.get(r.championship_id); if (!c) continue; if (!mcMap.has(r.match_id)) mcMap.set(r.match_id, []); mcMap.get(r.match_id).push({ ...c, is_title_change: r.is_title_change || false }) }
        }
      } catch {}
    }

    // ★ CHANGED: Era photos now use date (string) instead of year (integer)
    const allSids = new Set<number>()
    for (const m of filtered) {
      for (const p of (m.participants || [])) { if (p.superstar?.id) allSids.add(p.superstar.id) }
    }
    let photoMap = new Map<number, { date: string; photo_url: string }[]>()
    if (allSids.size > 0) {
      try {
        // ★ CHANGED: select 'date' instead of 'year', order by 'date'
        const { data: photos } = await supabase.from('superstar_photos').select('superstar_id, date, photo_url').in('superstar_id', [...allSids].slice(0, 500)).order('date', { ascending: true })
        for (const p of (photos || [])) {
          if (!photoMap.has(p.superstar_id)) photoMap.set(p.superstar_id, [])
          photoMap.get(p.superstar_id)!.push({ date: p.date, photo_url: p.photo_url })
        }
      } catch {}
    }

    // ★ CHANGED: pickPhoto now compares date strings (YYYY-MM-DD) instead of year integers
    const pickPhoto = (sid: number, matchDate: string | null, fallback: string | null): string | null => {
      const list = photoMap.get(sid)
      if (!list || list.length === 0) return fallback
      // Use match date directly for comparison (YYYY-MM-DD strings sort correctly)
      const compareDate = matchDate || '9999-12-31'
      let best = list[0]
      for (const p of list) {
        if (p.date <= compareDate) best = p
        else break
      }
      return best.photo_url
    }

    // Step 6: Enrich each match
    const enriched = filtered.map((m: any) => {
      const myParticipation = m.participants?.find((p: any) => p.superstar?.id === sid)
      const isWinner = myParticipation?.is_winner || false
      const isDraw = m.result_type === 'no_contest' || m.result_type === 'time_limit_draw'
      const matchResult = isDraw ? 'draw' : isWinner ? 'win' : 'loss'

      const myTeam = myParticipation?.team_number
      const teammates = m.participants?.filter((p: any) =>
        p.team_number === myTeam && p.superstar?.id !== sid
      ) || []
      const opponents = m.participants?.filter((p: any) =>
        p.team_number !== myTeam
      ) || []

      const myManagers = m.managers?.filter((mg: any) =>
        mg.team_number === myTeam || mg.managing_for?.id === sid
      ) || []

      const mc = mcMap.get(m.id)
      const championships = mc && mc.length > 0 ? mc : m.championship ? [{ ...m.championship, is_title_change: m.is_title_change || false }] : []

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
        match_type: m.match_type,
        championship: m.championship,
        championships,
        show: m.show ? {
          id: m.show.id,
          name: m.show.name,
          slug: m.show.slug,
          city: m.show.city,
          country: m.show.country,
          show_series: m.show.show_series,
        } : null,
        matchResult,
        teammates: teammates.map((p: any) => ({
          id: p.superstar?.id,
          name: p.superstar?.name,
          slug: p.superstar?.slug,
          photo_url: pickPhoto(p.superstar?.id, m.date, p.superstar?.photo_url),
        })),
        opponents: opponents.map((p: any) => ({
          id: p.superstar?.id,
          name: p.superstar?.name,
          slug: p.superstar?.slug,
          photo_url: pickPhoto(p.superstar?.id, m.date, p.superstar?.photo_url),
        })),
        managers: myManagers.map((mg: any) => ({
          id: mg.superstar?.id,
          name: mg.superstar?.name,
        })),
        participantCount: m.participants?.length || 0,
      }
    })

    const total = count || matchIds.length
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({ matches: enriched, total, page, limit, totalPages })
  } catch (err) {
    console.error('[superstar-matches] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
