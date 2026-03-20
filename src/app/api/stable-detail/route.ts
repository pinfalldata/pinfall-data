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

  const { data: stable } = await supabase.from('stables').select('*').eq('slug', slug).single()
  if (!stable) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: members } = await supabase
    .from('stable_members')
    .select('*, superstar:superstar_id ( id, name, slug, photo_url, birth_date, death_date, nationalities, height_cm, weight_kg )')
    .eq('stable_id', stable.id)
    .order('joined_date', { ascending: true })

  const memberIds = (members || []).map(m => m.superstar?.id).filter(Boolean)

  let sharedMatchIds: number[] = []
  let matchWinMap = new Map<number, boolean>()

  if (memberIds.length >= 2) {
    // Get all participations for stable members
    const { data: allParts } = await supabase
      .from('match_participants')
      .select('match_id, team_number, superstar_id, is_winner')
      .in('superstar_id', memberIds)

    if (allParts) {
      // Group by match_id + team_number
      const matchTeam = new Map<string, any[]>()
      for (const p of allParts) {
        const key = `${p.match_id}-${p.team_number}`
        if (!matchTeam.has(key)) matchTeam.set(key, [])
        matchTeam.get(key)!.push(p)
      }

      // Need 2+ stable members on same team
      for (const [, parts] of matchTeam) {
        if (parts.length >= 2) {
          const mid = parts[0].match_id
          if (!sharedMatchIds.includes(mid)) {
            sharedMatchIds.push(mid)
            matchWinMap.set(mid, !!parts[0].is_winner)
          }
        }
      }
    }
  }

  // Filter by stable active dates
  let filteredMatchIds = sharedMatchIds
  if ((stable.formed_date || stable.split_date) && sharedMatchIds.length > 0) {
    const { data: matchDates } = await supabase
      .from('matches')
      .select('id, date')
      .in('id', sharedMatchIds)

    if (matchDates) {
      filteredMatchIds = matchDates
        .filter(m => {
          if (!m.date) return true
          if (stable.formed_date && m.date < stable.formed_date) return false
          if (stable.split_date && m.date > stable.split_date) return false
          return true
        })
        .map(m => m.id)
    }
  }

  const matchCount = filteredMatchIds.length

  // Sort and paginate
  let matches: any[] = []
  if (filteredMatchIds.length > 0) {
    const { data: matchDates } = await supabase
      .from('matches')
      .select('id, date')
      .in('id', filteredMatchIds)

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

        const matchMap = new Map((matchData || []).map(m => [m.id, m]))
        matches = pageIds.map(id => matchMap.get(id)).filter(Boolean)
      }
    }
  }

  // Stats
  let wins = 0, losses = 0
  for (const id of filteredMatchIds) {
    if (matchWinMap.get(id)) wins++; else losses++
  }
  const stats = { totalMatches: matchCount, wins, losses, draws: matchCount - wins - losses, winRate: matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0 }

  const { data: prev } = await supabase.from('stables').select('slug, name').lt('name', stable.name).order('name', { ascending: false }).limit(1).single()
  const { data: next } = await supabase.from('stables').select('slug, name').gt('name', stable.name).order('name', { ascending: true }).limit(1).single()

  return NextResponse.json({
    stable, members: members || [], matches, matchCount,
    matchPage: page, matchTotalPages: Math.ceil(matchCount / limit),
    stats, prev: prev || null, next: next || null,
  })
}
