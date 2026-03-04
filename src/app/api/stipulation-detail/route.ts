// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/stipulation-detail?slug=steel-cage-match&page=1&limit=50
 *
 * Additional filters:
 * year, showSeriesId, minRating, maxRating, resultType, championshipOnly
 *
 * Returns: matchType info, paginated matches, win method statistics
 *
 * FIX: Separated count query from data query to avoid PostgREST issues
 * with nested joins returning count=0 on large tables.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')))
  const offset = (page - 1) * limit

  // Filters
  const year = searchParams.get('year')
  const showSeriesId = searchParams.get('showSeriesId')
  const minRating = searchParams.get('minRating')
  const maxRating = searchParams.get('maxRating')
  const resultType = searchParams.get('resultType')
  const championshipOnly = searchParams.get('championshipOnly') === 'true'
  const titleChangeOnly = searchParams.get('titleChangeOnly') === 'true'

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  try {
    // Fetch match type info
    const { data: matchType, error: mtError } = await supabase
      .from('match_types')
      .select('*')
      .eq('slug', slug)
      .single()

    if (mtError || !matchType) {
      console.error('[stipulation-detail] match type error:', mtError)
      return NextResponse.json({ error: 'Match type not found', details: mtError?.message }, { status: 404 })
    }

    // ===== STEP 1: Get accurate total count with a SIMPLE query (no nested joins) =====
    let countQuery = supabase
      .from('matches')
      .select('id', { count: 'exact', head: true })
      .eq('match_type_id', matchType.id)

    if (year) {
      countQuery = countQuery.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
    }
    if (minRating) countQuery = countQuery.gte('rating', parseFloat(minRating))
    if (maxRating) countQuery = countQuery.lte('rating', parseFloat(maxRating))
    if (resultType) countQuery = countQuery.eq('result_type', resultType)
    if (championshipOnly) countQuery = countQuery.not('championship_id', 'is', null)
    if (titleChangeOnly) countQuery = countQuery.eq('is_title_change', true)

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error('[stipulation-detail] count error:', countError)
    }

    const total = totalCount || 0
    const totalPages = Math.ceil(total / limit)

    // ===== STEP 2: Fetch paginated matches with full data =====
    let dataQuery = supabase
      .from('matches')
      .select(`
        id, slug, date, duration_seconds, rating, result_type, winner_team,
        is_title_change, card_position, match_order, is_dark_match,
        championship:championships(id, name, slug, image_url),
        show:shows(
          id, name, slug, date, city, state_province, country, show_series_id,
          show_series:show_series_id(id, name, short_name, logo_url)
        ),
        participants:match_participants(
          id, team_number, is_winner, entry_number,
          superstar:superstars(id, name, slug, photo_url)
        )
      `)
      .eq('match_type_id', matchType.id)
      .order('date', { ascending: false })

    // Apply same filters to data query
    if (year) {
      dataQuery = dataQuery.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
    }
    if (minRating) dataQuery = dataQuery.gte('rating', parseFloat(minRating))
    if (maxRating) dataQuery = dataQuery.lte('rating', parseFloat(maxRating))
    if (resultType) dataQuery = dataQuery.eq('result_type', resultType)
    if (championshipOnly) dataQuery = dataQuery.not('championship_id', 'is', null)
    if (titleChangeOnly) dataQuery = dataQuery.eq('is_title_change', true)

    // Pagination
    dataQuery = dataQuery.range(offset, offset + limit - 1)

    const { data: matches, error: mError } = await dataQuery

    if (mError) {
      console.error('[stipulation-detail] matches error:', mError)
      return NextResponse.json({ error: 'Failed to fetch matches', details: mError?.message }, { status: 500 })
    }

    // Post-filter for showSeriesId (can't filter in Supabase nested join)
    let filtered = matches || []
    if (showSeriesId) {
      filtered = filtered.filter((m: any) => m.show?.show_series_id === parseInt(showSeriesId))
    }

    // Enrich matches with teams structure
    const enriched = filtered.map((m: any) => {
      const participants = m.participants || []
      const teams = new Map<number, any[]>()
      for (const p of participants) {
        const t = p.team_number ?? 0
        if (!teams.has(t)) teams.set(t, [])
        teams.get(t)!.push(p)
      }

      const isDraw = m.result_type === 'no_contest' || m.result_type === 'time_limit_draw'

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

    // ===== STEP 3: WIN METHOD STATISTICS (using individual count queries) =====
    let winMethodStats: Record<string, number> = {}
    let totalForStats = total // use the already-computed total
    let avgRating: number | null = null
    let avgDuration: number | null = null
    let titleChangeCount = 0

    try {
      // Get aggregate stats using paginated approach only for stats
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

        if (!statsData || statsData.length === 0) {
          hasMore = false
          break
        }

        for (const m of statsData) {
          if (m.result_type) {
            winMethodStats[m.result_type] = (winMethodStats[m.result_type] || 0) + 1
          }
          if (m.rating) ratingValues.push(Number(m.rating))
          if (m.duration_seconds) durationValues.push(m.duration_seconds)
          if (m.is_title_change) titleChangeCount++
        }

        if (statsData.length < PAGE_SIZE) hasMore = false
        else statsOffset += PAGE_SIZE
      }

      if (ratingValues.length > 0) {
        avgRating = Math.round((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) * 100) / 100
      }
      if (durationValues.length > 0) {
        avgDuration = Math.round(durationValues.reduce((a, b) => a + b, 0) / durationValues.length)
      }
    } catch (statsErr) {
      console.error('[stipulation-detail] stats error (non-blocking):', statsErr)
    }

    // Sort win methods by count descending
    const sortedWinMethods = Object.entries(winMethodStats)
      .map(([method, count]) => ({ method, count, percentage: totalForStats > 0 ? Math.round((count / totalForStats) * 1000) / 10 : 0 }))
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
        totalMatches: totalForStats,
        avgRating,
        avgDuration,
        titleChangeCount,
        titleChangePercentage: totalForStats > 0 ? Math.round((titleChangeCount / totalForStats) * 1000) / 10 : 0,
      },
    })
  } catch (err: any) {
    console.error('[stipulation-detail] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 })
  }
}
