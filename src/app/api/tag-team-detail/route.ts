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

  const { data: team } = await supabase.from('tag_teams').select('*').eq('slug', slug).single()
  if (!team) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: members } = await supabase
    .from('tag_team_members')
    .select('*, superstar:superstar_id ( id, name, slug, photo_url, birth_date, death_date, nationalities, height_cm, weight_kg )')
    .eq('tag_team_id', team.id)
    .order('joined_date', { ascending: true })

  const memberIds = (members || []).map(m => m.superstar?.id).filter(Boolean)

  // Find shared matches (both members on same team_number)
  let sharedMatchIds: number[] = []
  let matchResultsMap = new Map<number, boolean>() // match_id -> isWin

  if (memberIds.length >= 2) {
    const { data: p0 } = await supabase.from('match_participants').select('match_id, team_number, is_winner').eq('superstar_id', memberIds[0])
    const { data: p1 } = await supabase.from('match_participants').select('match_id, team_number, is_winner').eq('superstar_id', memberIds[1])

    if (p0 && p1) {
      const map0 = new Map<number, { tn: number; win: boolean }>()
      for (const r of p0) map0.set(r.match_id, { tn: r.team_number, win: !!r.is_winner })

      for (const r of p1) {
        const p0r = map0.get(r.match_id)
        if (p0r && p0r.tn === r.team_number) {
          sharedMatchIds.push(r.match_id)
          matchResultsMap.set(r.match_id, !!r.is_winner)
        }
      }
    }
  }

  // Sort by date — fetch dates first then sort
  let matches: any[] = []
  const matchCount = sharedMatchIds.length

  if (sharedMatchIds.length > 0) {
    // Get dates for sorting
    const { data: matchDates } = await supabase
      .from('matches')
      .select('id, date')
      .in('id', sharedMatchIds)

    if (matchDates) {
      matchDates.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
      const sortedIds = matchDates.map(m => m.id)
      const pageIds = sortedIds.slice(offset, offset + limit)

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

        // Sort matches to match our sorted order
        const matchMap = new Map((matchData || []).map(m => [m.id, m]))
        matches = pageIds.map(id => matchMap.get(id)).filter(Boolean)
      }
    }
  }

  // Stats
  let wins = 0, losses = 0, draws = 0
  for (const [, isWin] of matchResultsMap) {
    if (isWin) wins++; else losses++
  }
  const stats = { totalMatches: matchCount, wins, losses, draws: matchCount - wins - losses, winRate: matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0 }

  // Championship reigns for this tag team (by reign_group_id or both members)
  let championships: any[] = []
  const { data: reigns } = await supabase
    .from('championship_reigns')
    .select(`
      id, reign_start, reign_end, days_held, defense_count,
      championship:championship_id ( id, name, slug, image_url )
    `)
    .eq('tag_team_id', team.id)
    .order('reign_start', { ascending: false })

  championships = reigns || []

  // Prev/Next
  const { data: prev } = await supabase.from('tag_teams').select('slug, name').lt('name', team.name).order('name', { ascending: false }).limit(1).single()
  const { data: next } = await supabase.from('tag_teams').select('slug, name').gt('name', team.name).order('name', { ascending: true }).limit(1).single()

  return NextResponse.json({
    team, members: members || [], matches, matchCount,
    matchPage: page, matchTotalPages: Math.ceil(matchCount / limit),
    stats, championships,
    prev: prev || null, next: next || null,
  })
}
