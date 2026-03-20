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

  // 1. Get tag team
  const { data: team, error: teamErr } = await supabase
    .from('tag_teams')
    .select('*')
    .eq('slug', slug)
    .single()

  if (teamErr || !team) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 2. Get members
  const { data: members } = await supabase
    .from('tag_team_members')
    .select('*, superstar:superstar_id ( id, name, slug, photo_url, birth_date, death_date, nationalities, height_cm, weight_kg )')
    .eq('tag_team_id', team.id)
    .order('joined_date', { ascending: true })

  const memberIds = (members || []).map(m => m.superstar?.id).filter(Boolean)

  // ==================================================================
  // 3. MATCHES — Use match_participants.tag_team_id directly
  // ==================================================================
  // Get all match_ids where this tag team was entered
  const { data: tagTeamParts } = await supabase
    .from('match_participants')
    .select('match_id, is_winner')
    .eq('tag_team_id', team.id)

  // Deduplicate match IDs (multiple members per match)
  const matchIdMap = new Map<number, boolean>()
  for (const p of (tagTeamParts || [])) {
    if (!matchIdMap.has(p.match_id)) {
      matchIdMap.set(p.match_id, !!p.is_winner)
    }
  }
  const allMatchIds = Array.from(matchIdMap.keys())
  const matchCount = allMatchIds.length

  // If no results from tag_team_id, fallback to same-team-number approach
  let fallbackMatchIds: number[] = []
  if (allMatchIds.length === 0 && memberIds.length >= 2) {
    const { data: p0 } = await supabase.from('match_participants').select('match_id, team_number, is_winner').eq('superstar_id', memberIds[0])
    const { data: p1 } = await supabase.from('match_participants').select('match_id, team_number, is_winner').eq('superstar_id', memberIds[1])
    if (p0 && p1) {
      const map0 = new Map<number, { tn: number; win: boolean }>()
      for (const r of p0) map0.set(r.match_id, { tn: r.team_number, win: !!r.is_winner })
      for (const r of p1) {
        const p0r = map0.get(r.match_id)
        if (p0r && p0r.tn === r.team_number) {
          fallbackMatchIds.push(r.match_id)
          matchIdMap.set(r.match_id, !!r.is_winner)
        }
      }
    }
  }

  const finalMatchIds = allMatchIds.length > 0 ? allMatchIds : fallbackMatchIds
  const finalMatchCount = finalMatchIds.length

  // Sort by date and paginate
  let matches: any[] = []
  if (finalMatchIds.length > 0) {
    const { data: matchDates } = await supabase
      .from('matches')
      .select('id, date')
      .in('id', finalMatchIds)

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

  // ==================================================================
  // 4. STATS
  // ==================================================================
  let wins = 0, losses = 0
  for (const [, isWin] of matchIdMap) {
    if (isWin) wins++; else losses++
  }
  const stats = {
    totalMatches: finalMatchCount,
    wins,
    losses,
    draws: finalMatchCount - wins - losses,
    winRate: finalMatchCount > 0 ? Math.round((wins / finalMatchCount) * 100) : 0,
  }

  // ==================================================================
  // 5. CHAMPIONSHIPS — Use reign_group_id shared between members
  // ==================================================================
  let championships: any[] = []
  if (memberIds.length >= 2) {
    // Get reigns for first member
    const { data: reigns0 } = await supabase
      .from('championship_reigns')
      .select('reign_group_id')
      .eq('superstar_id', memberIds[0])
      .not('reign_group_id', 'is', null)

    // Get reigns for second member
    const { data: reigns1 } = await supabase
      .from('championship_reigns')
      .select('reign_group_id')
      .eq('superstar_id', memberIds[1])
      .not('reign_group_id', 'is', null)

    if (reigns0 && reigns1) {
      // Find shared reign_group_ids
      const set0 = new Set(reigns0.map(r => r.reign_group_id))
      const sharedGroupIds = reigns1
        .map(r => r.reign_group_id)
        .filter(id => set0.has(id))

      const uniqueGroupIds = Array.from(new Set(sharedGroupIds))

      if (uniqueGroupIds.length > 0) {
        // Get one reign per group (they share the same championship/dates)
        const { data: sharedReigns } = await supabase
          .from('championship_reigns')
          .select(`
            id, won_date, lost_date, days_held, reign_number, reign_group_id,
            championship:championship_id ( id, name, slug, image_url )
          `)
          .eq('superstar_id', memberIds[0])
          .in('reign_group_id', uniqueGroupIds)
          .order('won_date', { ascending: false })

        championships = sharedReigns || []
      }
    }
  }

  // 6. Prev/Next
  const { data: prev } = await supabase.from('tag_teams').select('slug, name').lt('name', team.name).order('name', { ascending: false }).limit(1).single()
  const { data: next } = await supabase.from('tag_teams').select('slug, name').gt('name', team.name).order('name', { ascending: true }).limit(1).single()

  return NextResponse.json({
    team,
    members: members || [],
    matches,
    matchCount: finalMatchCount,
    matchPage: page,
    matchTotalPages: Math.ceil(finalMatchCount / limit),
    stats,
    championships,
    prev: prev || null,
    next: next || null,
  })
}
