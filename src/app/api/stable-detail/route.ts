// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 30
  const offset = (page - 1) * limit

  if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 })

  const { data: stable, error: stableErr } = await supabase
    .from('stables')
    .select('*')
    .eq('slug', slug)
    .single()

  if (stableErr || !stable) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: members } = await supabase
    .from('stable_members')
    .select('*, superstar:superstar_id ( id, name, slug, photo_url, birth_date, death_date, nationalities, height_cm, weight_kg )')
    .eq('stable_id', stable.id)
    .order('joined_date', { ascending: true })

  const memberIds = (members || []).map(m => m.superstar?.id).filter(Boolean)

  // ==================================================================
  // MATCHES — Find matches where 2+ stable members are on the same team
  // ==================================================================
  let qualifiedMatchIds: number[] = []
  let matchWinMap = new Map<number, boolean>()

  if (memberIds.length >= 2) {
    // Query participations for EACH member separately to avoid huge IN clauses
    const allParts: { match_id: number; team_number: number; superstar_id: number; is_winner: boolean }[] = []

    // Batch members in smaller groups
    for (const mid of memberIds) {
      const { data } = await supabase
        .from('match_participants')
        .select('match_id, team_number, superstar_id, is_winner')
        .eq('superstar_id', mid)

      if (data) allParts.push(...data.map(d => ({ ...d, is_winner: !!d.is_winner })))
    }

    // Group by match_id + team_number
    const matchTeamGroups = new Map<string, { matchId: number; parts: typeof allParts }>()
    for (const p of allParts) {
      const key = `${p.match_id}_${p.team_number}`
      if (!matchTeamGroups.has(key)) {
        matchTeamGroups.set(key, { matchId: p.match_id, parts: [] })
      }
      matchTeamGroups.get(key)!.parts.push(p)
    }

    // Find matches where 2+ stable members on same team
    const seen = new Set<number>()
    for (const [, group] of matchTeamGroups) {
      if (group.parts.length >= 2 && !seen.has(group.matchId)) {
        seen.add(group.matchId)
        qualifiedMatchIds.push(group.matchId)
        matchWinMap.set(group.matchId, group.parts[0].is_winner)
      }
    }
  }

  // Filter by stable active dates
  if ((stable.formed_date || stable.split_date) && qualifiedMatchIds.length > 0) {
    const { data: matchDates } = await supabase
      .from('matches')
      .select('id, date')
      .in('id', qualifiedMatchIds)

    if (matchDates) {
      qualifiedMatchIds = matchDates
        .filter(m => {
          if (!m.date) return true
          if (stable.formed_date && m.date < stable.formed_date) return false
          if (stable.split_date && m.date > stable.split_date) return false
          return true
        })
        .map(m => m.id)
    }
  }

  const matchCount = qualifiedMatchIds.length

  // Sort and paginate
  let matches: any[] = []
  if (qualifiedMatchIds.length > 0) {
    const { data: matchDates } = await supabase
      .from('matches')
      .select('id, date')
      .in('id', qualifiedMatchIds)

    if (matchDates) {
      matchDates.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      const pageIds = matchDates.map(m => m.id).slice(offset, offset + limit)

      if (pageIds.length > 0) {
        const { data: matchData } = await supabase
          .from('matches')
          .select(`
            id, slug, date, rating, duration_seconds, is_title_change,
            match_type:match_type_id ( name ),
            championship:championship_id ( name, slug, image_url ),
            show:show_id ( id, name, slug, date ),
            participants:match_participants (
              id, team_number, result, is_winner,
              superstar:superstar_id ( id, name, slug, photo_url )
            )
          `)
          .in('id', pageIds)

        const mm = new Map((matchData || []).map(m => [m.id, m]))
        matches = pageIds.map(id => mm.get(id)).filter(Boolean)
      }
    }
  }

  // Stats
  let wins = 0, losses = 0
  for (const id of qualifiedMatchIds) {
    if (matchWinMap.get(id)) wins++; else losses++
  }
  const stats = {
    totalMatches: matchCount,
    wins,
    losses,
    draws: matchCount - wins - losses,
    winRate: matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0,
  }

  // Prev/Next
  const { data: prev } = await supabase.from('stables').select('slug, name').lt('name', stable.name).order('name', { ascending: false }).limit(1).single()
  const { data: next } = await supabase.from('stables').select('slug, name').gt('name', stable.name).order('name', { ascending: true }).limit(1).single()

  return NextResponse.json({
    stable,
    members: members || [],
    matches,
    matchCount,
    matchPage: page,
    matchTotalPages: Math.ceil(matchCount / limit),
    stats,
    prev: prev || null,
    next: next || null,
  })
}
