// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/stipulation-detail?slug=steel-cage-match&page=1&limit=50
 *
 * Additional filters:
 * year, showSeriesId, minRating, maxRating, resultType, championshipOnly, titleChangeOnly
 *
 * Returns: matchType info, paginated matches, win method statistics
 *
 * ROBUST VERSION: Splits complex nested joins into separate queries
 * to avoid PostgREST timeout/failure on large tables (e.g. singles-match).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')))
  const offset = (page - 1) * limit

  // Filters
  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const showSeriesId = searchParams.get('showSeriesId')
  const minRating = searchParams.get('minRating')
  const maxRating = searchParams.get('maxRating')
  const resultType = searchParams.get('resultType')
  const championshipOnly = searchParams.get('championshipOnly') === 'true'
  const titleChangeOnly = searchParams.get('titleChangeOnly') === 'true'
  const superstarId = searchParams.get('superstarId')
  const opponentId = searchParams.get('opponentId')
  const country = searchParams.get('country')
  const city = searchParams.get('city')
  const championshipId = searchParams.get('championshipId')

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  try {
    // ===== STEP 1: Fetch match type info =====
    const { data: matchType, error: mtError } = await supabase
      .from('match_types')
      .select('*')
      .eq('slug', slug)
      .single()

    if (mtError || !matchType) {
      console.error('[stipulation-detail] match type error:', mtError)
      return NextResponse.json({ error: 'Match type not found', details: mtError?.message }, { status: 404 })
    }

    // ===== STEP 2: Build base filter helper =====
    function applyFilters(query: any) {
      query = query.eq('match_type_id', matchType.id)
      if (year && month) {
        const m = parseInt(month)
        const startDate = `${year}-${String(m).padStart(2, '0')}-01`
        const endDate = m === 12 ? `${parseInt(year) + 1}-01-01` : `${year}-${String(m + 1).padStart(2, '0')}-01`
        query = query.gte('date', startDate).lt('date', endDate)
      } else if (year) {
        query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
      }
      if (minRating) query = query.gte('rating', parseFloat(minRating))
      if (maxRating) query = query.lte('rating', parseFloat(maxRating))
      if (resultType) query = query.eq('result_type', resultType)
      if (championshipOnly) query = query.not('championship_id', 'is', null)
      if (titleChangeOnly) query = query.eq('is_title_change', true)
      if (championshipId) query = query.eq('championship_id', parseInt(championshipId))
      return query
    }

    // If showSeriesId filter is active, pre-filter show IDs
    let showIdFilter: number[] | null = null
    if (showSeriesId || country || city) {
      let showQuery = supabase.from('shows').select('id')
      if (showSeriesId) showQuery = showQuery.eq('show_series_id', parseInt(showSeriesId))
      if (country) showQuery = showQuery.eq('country', country)
      if (city) showQuery = showQuery.ilike('city', city)
      const { data: filteredShows } = await showQuery
      showIdFilter = (filteredShows || []).map(s => s.id)
      if (showIdFilter.length === 0) {
        return NextResponse.json({
          matchType, matches: [], total: 0, page, limit, totalPages: 0,
          stats: { winMethods: [], totalMatches: 0, avgRating: null, avgDuration: null, titleChangeCount: 0, titleChangePercentage: 0 },
        })
      }
    }

    // If superstarId filter is active, pre-filter match IDs
    let superstarMatchFilter: number[] | null = null
    if (superstarId) {
      let participantQuery = supabase.from('match_participants').select('match_id').eq('superstar_id', parseInt(superstarId))
      const { data: sMatches } = await participantQuery
      const sMatchIds = (sMatches || []).map(m => m.match_id)
      
      if (opponentId) {
        // Find matches where opponent is on a different team
        const { data: oMatches } = await supabase.from('match_participants').select('match_id').eq('superstar_id', parseInt(opponentId))
        const oMatchIds = new Set((oMatches || []).map(m => m.match_id))
        superstarMatchFilter = sMatchIds.filter(id => oMatchIds.has(id))
      } else {
        superstarMatchFilter = sMatchIds
      }
      
      if (superstarMatchFilter.length === 0) {
        return NextResponse.json({
          matchType, matches: [], total: 0, page, limit, totalPages: 0,
          stats: { winMethods: [], totalMatches: 0, avgRating: null, avgDuration: null, titleChangeCount: 0, titleChangePercentage: 0 },
        })
      }
    }

    // ===== STEP 3: Count query (simple, no joins) =====
    let countQuery = supabase.from('matches').select('id', { count: 'exact', head: true })
    countQuery = applyFilters(countQuery)
    if (showIdFilter) countQuery = countQuery.in('show_id', showIdFilter)
    if (superstarMatchFilter) countQuery = countQuery.in('id', superstarMatchFilter.slice(0, 500))

    const { count: totalCount, error: countError } = await countQuery
    if (countError) console.error('[stipulation-detail] count error:', countError)

    const total = totalCount || 0
    const totalPages = Math.ceil(total / limit)

    // ===== STEP 4: Fetch paginated matches (FLAT query — no nested joins) =====
    let dataQuery = supabase
      .from('matches')
      .select('id, slug, date, duration_seconds, rating, result_type, winner_team, is_title_change, card_position, match_order, is_dark_match, show_id, championship_id')
      .order('date', { ascending: false })

    dataQuery = applyFilters(dataQuery)
    if (showIdFilter) dataQuery = dataQuery.in('show_id', showIdFilter)
    if (superstarMatchFilter) dataQuery = dataQuery.in('id', superstarMatchFilter.slice(0, 500))
    dataQuery = dataQuery.range(offset, offset + limit - 1)

    const { data: matchRows, error: mError } = await dataQuery
    if (mError) {
      console.error('[stipulation-detail] matches error:', mError)
      return NextResponse.json({ error: 'Failed to fetch matches', details: mError?.message }, { status: 500 })
    }

    if (!matchRows || matchRows.length === 0) {
      return NextResponse.json({
        matchType, matches: [], total, page, limit, totalPages,
        stats: { winMethods: [], totalMatches: total, avgRating: null, avgDuration: null, titleChangeCount: 0, titleChangePercentage: 0 },
      })
    }

    const matchIds = matchRows.map(m => m.id)

    // ===== STEP 5: Fetch related data in parallel (separate simple queries) =====
    const showIds = [...new Set(matchRows.filter(m => m.show_id).map(m => m.show_id))]
    const champIds = [...new Set(matchRows.filter(m => m.championship_id).map(m => m.championship_id))]

    const [showsRes, champsRes, participantsRes] = await Promise.all([
      showIds.length > 0
        ? supabase.from('shows').select('id, name, slug, date, city, state_province, country, show_series_id').in('id', showIds)
        : Promise.resolve({ data: [] }),
      champIds.length > 0
        ? supabase.from('championships').select('id, name, slug, image_url').in('id', champIds)
        : Promise.resolve({ data: [] }),
      supabase.from('match_participants')
        .select('match_id, team_number, is_winner, entry_number, superstar:superstars(id, name, slug, photo_url)')
        .in('match_id', matchIds),
    ])

    const shows = showsRes.data || []
    const champs = champsRes.data || []
    const allParticipants = participantsRes.data || []

    // Fetch show_series for the shows that have one
    const seriesIds = [...new Set(shows.filter(s => s.show_series_id).map(s => s.show_series_id))]
    let seriesMap = new Map()
    if (seriesIds.length > 0) {
      const { data: seriesData } = await supabase
        .from('show_series')
        .select('id, name, short_name, logo_url')
        .in('id', seriesIds)
      seriesMap = new Map((seriesData || []).map(s => [s.id, s]))
    }

    // Build lookup maps
    const showMap = new Map(shows.map(s => [s.id, {
      ...s,
      show_series: s.show_series_id ? seriesMap.get(s.show_series_id) || null : null,
    }]))
    const champMap = new Map(champs.map(c => [c.id, c]))

    // Group participants by match_id
    const participantsByMatch = new Map<number, any[]>()
    for (const p of allParticipants) {
      if (!participantsByMatch.has(p.match_id)) participantsByMatch.set(p.match_id, [])
      participantsByMatch.get(p.match_id)!.push(p)
    }

    // ===== STEP 6: Assemble enriched matches =====
    const enriched = matchRows.map(m => {
      const matchParticipants = participantsByMatch.get(m.id) || []
      const teams = new Map<number, any[]>()
      for (const p of matchParticipants) {
        const t = p.team_number ?? 0
        if (!teams.has(t)) teams.set(t, [])
        teams.get(t)!.push(p)
      }

      const isDraw = m.result_type === 'no_contest' || m.result_type === 'time_limit_draw'

      const teamArrays: any[] = []
      for (const [teamNum, members] of [...teams.entries()].sort((a, b) => a[0] - b[0])) {
        const isWinning = !isDraw && members.some((p: any) => p.is_winner)
        teamArrays.push({
          team_number: teamNum,
          is_winner: isWinning,
          members: members.map((p: any) => ({
            id: p.superstar?.id || 0,
            name: p.superstar?.name || 'Unknown',
            slug: p.superstar?.slug || '',
            photo_url: p.superstar?.photo_url || null,
            is_winner: p.is_winner,
          })),
        })
      }

      const show = m.show_id ? showMap.get(m.show_id) || null : null

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
        championship: m.championship_id ? champMap.get(m.championship_id) || null : null,
        show: show ? {
          id: show.id, name: show.name, slug: show.slug,
          city: show.city, country: show.country,
          show_series: show.show_series || null,
        } : null,
        teams: teamArrays,
        participantCount: matchParticipants.length,
      }
    })

    // ===== STEP 7: WIN METHOD STATISTICS (paginated aggregation) =====
    let winMethodStats: Record<string, number> = {}
    let avgRating: number | null = null
    let avgDuration: number | null = null
    let titleChangeCount = 0

    try {
      const PAGE_SIZE = 1000
      let statsOffset = 0
      let hasMore = true
      const ratingValues: number[] = []
      const durationValues: number[] = []

      while (hasMore) {
        const { data: statsData } = await supabase
          .from('matches')
          .select('result_type, rating, duration_seconds, is_title_change')
          .eq('match_type_id', matchType.id)
          .range(statsOffset, statsOffset + PAGE_SIZE - 1)

        if (!statsData || statsData.length === 0) { hasMore = false; break }

        for (const m of statsData) {
          if (m.result_type) winMethodStats[m.result_type] = (winMethodStats[m.result_type] || 0) + 1
          if (m.rating) ratingValues.push(Number(m.rating))
          if (m.duration_seconds) durationValues.push(m.duration_seconds)
          if (m.is_title_change) titleChangeCount++
        }

        if (statsData.length < PAGE_SIZE) hasMore = false
        else statsOffset += PAGE_SIZE
      }

      if (ratingValues.length > 0) avgRating = Math.round((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) * 100) / 100
      if (durationValues.length > 0) avgDuration = Math.round(durationValues.reduce((a, b) => a + b, 0) / durationValues.length)
    } catch (statsErr) {
      console.error('[stipulation-detail] stats error (non-blocking):', statsErr)
    }

    const sortedWinMethods = Object.entries(winMethodStats)
      .map(([method, count]) => ({ method, count, percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0 }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      matchType,
      matches: enriched,
      total,
      page,
      limit,
      totalPages,
      stats: {
        winMethods: sortedWinMethods,
        totalMatches: total,
        avgRating,
        avgDuration,
        titleChangeCount,
        titleChangePercentage: total > 0 ? Math.round((titleChangeCount / total) * 1000) / 10 : 0,
      },
    })
  } catch (err: any) {
    console.error('[stipulation-detail] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 })
  }
}
