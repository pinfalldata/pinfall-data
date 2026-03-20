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

  const { data: stable } = await supabase
    .from('stables')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!stable) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: members } = await supabase
    .from('stable_members')
    .select('*, superstar:superstar_id ( id, name, slug, photo_url, birth_date, death_date, nationalities, height_cm, weight_kg )')
    .eq('stable_id', stable.id)
    .order('joined_date', { ascending: true })

  const memberIds = (members || []).map(m => m.superstar?.id).filter(Boolean)

  // Find matches where 2+ stable members are on the same team, within stable active dates
  let matches: any[] = []
  let matchCount = 0
  let stats: any = null

  if (memberIds.length >= 2) {
    // Get all participations for all members
    const { data: allParts } = await supabase
      .from('match_participants')
      .select('match_id, team_number, superstar_id, is_winner, result')
      .in('superstar_id', memberIds)

    if (allParts) {
      // Group by match_id + team_number → count stable members on that team
      const matchTeamMap = new Map<string, any[]>()
      for (const p of allParts) {
        const key = `${p.match_id}-${p.team_number}`
        if (!matchTeamMap.has(key)) matchTeamMap.set(key, [])
        matchTeamMap.get(key)!.push(p)
      }

      // Filter: need 2+ stable members on same team
      const qualifyingMatchIds = new Set<number>()
      const matchResultMap = new Map<number, any>()

      for (const [key, parts] of matchTeamMap) {
        if (parts.length >= 2) {
          const matchId = parts[0].match_id
          qualifyingMatchIds.add(matchId)
          matchResultMap.set(matchId, parts[0]) // store one participant for win/loss
        }
      }

      // Filter by stable active dates if available
      let filteredIds = Array.from(qualifyingMatchIds)

      if (stable.formed_date || stable.split_date) {
        // Get match dates
        const { data: matchDates } = await supabase
          .from('matches')
          .select('id, date')
          .in('id', filteredIds)

        if (matchDates) {
          filteredIds = matchDates
            .filter(m => {
              if (!m.date) return true
              if (stable.formed_date && m.date < stable.formed_date) return false
              if (stable.split_date && m.date > stable.split_date) return false
              return true
            })
            .map(m => m.id)
        }
      }

      matchCount = filteredIds.length

      // Stats
      let wins = 0, losses = 0, draws = 0, nc = 0
      for (const id of filteredIds) {
        const r = matchResultMap.get(id)
        if (r?.is_winner) wins++
        else if (r?.result === 'loss') losses++
        else if (r?.result === 'draw') draws++
        else nc++
      }
      stats = { totalMatches: matchCount, wins, losses, draws, nc, winRate: matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0 }

      // Paginate
      const pageIds = filteredIds.slice(offset, offset + limit)
      if (pageIds.length > 0) {
        const { data: matchData } = await supabase
          .from('matches')
          .select(`
            id, slug, date, rating, duration_seconds, is_title_change,
            match_type:match_type_id ( name ),
            championship:championship_id ( name, slug ),
            show:show_id ( id, name, slug, date ),
            participants:match_participants (
              id, team_number, result, is_winner,
              superstar:superstar_id ( id, name, slug, photo_url )
            )
          `)
          .in('id', pageIds)
          .order('date', { ascending: false })

        matches = matchData || []
      }
    }
  }

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
