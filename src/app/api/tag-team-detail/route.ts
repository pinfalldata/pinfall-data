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
  const { data: team } = await supabase
    .from('tag_teams')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!team) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // 2. Get members
  const { data: members } = await supabase
    .from('tag_team_members')
    .select('*, superstar:superstar_id ( id, name, slug, photo_url, birth_date, death_date, nationalities, height_cm, weight_kg )')
    .eq('tag_team_id', team.id)
    .order('joined_date', { ascending: true })

  const memberIds = (members || []).map(m => m.superstar?.id).filter(Boolean)

  // 3. Get matches where BOTH members participated on the same team
  // We find matches where at least 2 members were on the same team_number
  let matches: any[] = []
  let matchCount = 0

  if (memberIds.length >= 2) {
    // Get all match_ids for member[0]
    const { data: p0 } = await supabase
      .from('match_participants')
      .select('match_id, team_number')
      .eq('superstar_id', memberIds[0])

    const { data: p1 } = await supabase
      .from('match_participants')
      .select('match_id, team_number')
      .eq('superstar_id', memberIds[1])

    if (p0 && p1) {
      // Find matches where both are on the same team
      const p0Map = new Map<number, number>()
      for (const r of p0) p0Map.set(r.match_id, r.team_number)

      const sharedMatchIds: number[] = []
      for (const r of p1) {
        if (p0Map.has(r.match_id) && p0Map.get(r.match_id) === r.team_number) {
          sharedMatchIds.push(r.match_id)
        }
      }

      matchCount = sharedMatchIds.length
      const pageIds = sharedMatchIds.slice(offset, offset + limit)

      if (pageIds.length > 0) {
        const { data: matchData } = await supabase
          .from('matches')
          .select(`
            id, slug, date, rating, duration_seconds, is_title_change,
            match_type:match_type_id ( name ),
            championship:championship_id ( name, slug ),
            show:show_id ( id, name, slug, date ),
            participants:match_participants (
              id, team_number, result, is_winner, entrance_order,
              superstar:superstar_id ( id, name, slug, photo_url )
            )
          `)
          .in('id', pageIds)
          .order('date', { ascending: false })

        matches = matchData || []
      }
    }
  }

  // 4. Calculate stats from ALL shared matches
  let stats: any = null
  if (memberIds.length >= 2) {
    const { data: p0All } = await supabase.from('match_participants').select('match_id, team_number, is_winner, result').eq('superstar_id', memberIds[0])
    const { data: p1All } = await supabase.from('match_participants').select('match_id, team_number, is_winner, result').eq('superstar_id', memberIds[1])

    if (p0All && p1All) {
      const p0Map = new Map<number, any>()
      for (const r of p0All) p0Map.set(r.match_id, r)

      let wins = 0, losses = 0, draws = 0, nc = 0
      for (const r of p1All) {
        const p0r = p0Map.get(r.match_id)
        if (!p0r || p0r.team_number !== r.team_number) continue
        if (r.is_winner) wins++
        else if (r.result === 'loss') losses++
        else if (r.result === 'draw') draws++
        else nc++
      }
      stats = { totalMatches: matchCount, wins, losses, draws, nc, winRate: matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0 }
    }
  }

  // 5. Prev/Next
  const { data: prev } = await supabase.from('tag_teams').select('slug, name').lt('name', team.name).order('name', { ascending: false }).limit(1).single()
  const { data: next } = await supabase.from('tag_teams').select('slug, name').gt('name', team.name).order('name', { ascending: true }).limit(1).single()

  return NextResponse.json({
    team,
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
