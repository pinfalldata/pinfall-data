// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/stipulation-detail?slug=steel-cage-match&page=1&limit=50
 * Returns match type info + paginated matches with participants
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')))
  const offset = (page - 1) * limit

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  try {
    // Fetch match type info — use * to avoid missing column errors
    const { data: matchType, error: mtError } = await supabase
      .from('match_types')
      .select('*')
      .eq('slug', slug)
      .single()

    if (mtError || !matchType) {
      console.error('[stipulation-detail] match type error:', mtError)
      return NextResponse.json({ error: 'Match type not found', details: mtError?.message }, { status: 404 })
    }

    // Fetch paginated matches of this type
    const { data: matches, error: mError, count } = await supabase
      .from('matches')
      .select(`
        id, slug, date, duration_seconds, rating, result_type, winner_team,
        is_title_change, card_position, match_order, is_dark_match,
        championship:championships(id, name, slug, image_url),
        show:shows(
          id, name, slug, date, city, state_province, country,
          show_series:show_series_id(id, name, short_name, logo_url)
        ),
        participants:match_participants(
          id, team_number, is_winner, entry_number,
          superstar:superstars(id, name, slug, photo_url)
        )
      `, { count: 'exact' })
      .eq('match_type_id', matchType.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (mError) {
      console.error('[stipulation-detail] matches error:', mError)
      return NextResponse.json({ error: 'Failed to fetch matches', details: mError?.message }, { status: 500 })
    }

    // Enrich matches with teams structure
    const enriched = (matches || []).map((m: any) => {
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

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      matchType,
      matches: enriched,
      total,
      page,
      limit,
      totalPages,
    })
  } catch (err: any) {
    console.error('[stipulation-detail] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 })
  }
}
