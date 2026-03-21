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

  // Members
  const { data: members } = await supabase
    .from('tag_team_members')
    .select('*, superstar:superstar_id ( id, name, slug, photo_url, birth_date, death_date, nationalities, height_cm, weight_kg )')
    .eq('tag_team_id', team.id)
    .order('joined_date', { ascending: true })

  const memberIds = (members || []).map(m => m.superstar?.id).filter(Boolean)

  // ================================================================
  // FIND SHARED MULTI-MAN MATCHES (no singles!)
  // Both members must be on the same team_number in the same match
  // ================================================================
  let matchIdWinMap = new Map<number, boolean>()

  if (memberIds.length >= 2) {
    // Get participations for member 0
    const { data: p0 } = await supabase
      .from('match_participants')
      .select('match_id, team_number, is_winner')
      .eq('superstar_id', memberIds[0])

    // Get participations for member 1
    const { data: p1 } = await supabase
      .from('match_participants')
      .select('match_id, team_number, is_winner')
      .eq('superstar_id', memberIds[1])

    if (p0 && p1) {
      // Index member 0 by match_id
      const map0 = new Map<number, { tn: number; win: boolean }>()
      for (const r of p0) map0.set(r.match_id, { tn: r.team_number, win: !!r.is_winner })

      // Find matches where member 1 is on SAME team_number as member 0
      for (const r of p1) {
        const p0r = map0.get(r.match_id)
        if (p0r && p0r.tn === r.team_number) {
          matchIdWinMap.set(r.match_id, p0r.win)
        }
      }
    }

    // Now filter out singles matches — only keep matches with 3+ participants total
    if (matchIdWinMap.size > 0) {
      const allIds = Array.from(matchIdWinMap.keys())
      // Count participants per match
      const batchSize = 300
      const toRemove = new Set<number>()

      for (let i = 0; i < allIds.length; i += batchSize) {
        const batch = allIds.slice(i, i + batchSize)
        const { data: counts } = await supabase
          .from('match_participants')
          .select('match_id')
          .in('match_id', batch)

        if (counts) {
          // Count participants per match
          const countMap = new Map<number, number>()
          for (const c of counts) {
            countMap.set(c.match_id, (countMap.get(c.match_id) || 0) + 1)
          }
          // Remove singles (2 participants = 1v1)
          for (const [mid, cnt] of countMap) {
            if (cnt <= 2) toRemove.add(mid)
          }
        }
      }

      for (const id of toRemove) {
        matchIdWinMap.delete(id)
      }
    }
  }

  const allMatchIds = Array.from(matchIdWinMap.keys())
  const matchCount = allMatchIds.length

  // ================================================================
  // FETCH MATCHES WITH PARTICIPANTS
  // ================================================================
  let matches: any[] = []

  if (allMatchIds.length > 0) {
    // Get dates for sorting
    const batchSize = 300
    let allWithDates: { id: number; date: string | null }[] = []
    for (let i = 0; i < allMatchIds.length; i += batchSize) {
      const batch = allMatchIds.slice(i, i + batchSize)
      const { data } = await supabase.from('matches').select('id, date').in('id', batch)
      if (data) allWithDates.push(...data)
    }

    allWithDates.sort((a, b) => (b.date || '0000').localeCompare(a.date || '0000'))
    const pageIds = allWithDates.slice(offset, offset + limit).map(m => m.id)

    if (pageIds.length > 0) {
      // Query 1: matches base info
      const { data: matchData } = await supabase
        .from('matches')
        .select(`
          id, slug, date, rating, duration_seconds, is_title_change,
          match_type:match_type_id ( name ),
          championship:championship_id ( name, slug, image_url ),
          show:show_id ( id, name, slug, date )
        `)
        .in('id', pageIds)

      // Query 2: participants SEPARATE (this is the key fix)
      // NOTE: 'result' field does NOT exist in match_participants — removed to fix silent query failure
      const { data: partsData } = await supabase
        .from('match_participants')
        .select(`
          id, match_id, team_number, is_winner, photo_url_override,
          superstar:superstar_id ( id, name, slug, photo_url )
        `)
        .in('match_id', pageIds)

      // Build participants map
      const partsMap = new Map<number, any[]>()
      for (const p of (partsData || [])) {
        if (!partsMap.has(p.match_id)) partsMap.set(p.match_id, [])
        partsMap.get(p.match_id)!.push(p)
      }

      // Merge and sort
      const matchMap = new Map<number, any>()
      for (const m of (matchData || [])) {
        matchMap.set(m.id, { ...m, participants: partsMap.get(m.id) || [] })
      }

      matches = pageIds.map(id => matchMap.get(id)).filter(Boolean)
    }
  }

  // ================================================================
  // STATS
  // ================================================================
  let wins = 0, losses = 0
  for (const [, isWin] of matchIdWinMap) {
    if (isWin) wins++; else losses++
  }
  const stats = {
    totalMatches: matchCount, wins, losses,
    draws: Math.max(0, matchCount - wins - losses),
    winRate: matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0,
  }

  // ================================================================
  // CHAMPIONSHIPS
  // ================================================================
  let championships: any[] = []
  if (memberIds.length >= 2) {
    const { data: r0 } = await supabase.from('championship_reigns').select('reign_group_id').eq('superstar_id', memberIds[0]).not('reign_group_id', 'is', null)
    const { data: r1 } = await supabase.from('championship_reigns').select('reign_group_id').eq('superstar_id', memberIds[1]).not('reign_group_id', 'is', null)

    if (r0 && r1) {
      const set0 = new Set(r0.map(r => r.reign_group_id))
      const shared = [...new Set(r1.map(r => r.reign_group_id).filter(id => set0.has(id)))]

      if (shared.length > 0) {
        const { data: reigns } = await supabase
          .from('championship_reigns')
          .select('id, won_date, lost_date, days_held, reign_number, reign_group_id, championship:championship_id ( id, name, slug, image_url )')
          .eq('superstar_id', memberIds[0])
          .in('reign_group_id', shared)
          .order('won_date', { ascending: false })

        championships = reigns || []
      }
    }
  }

  // Prev/Next
  const { data: prev } = await supabase.from('tag_teams').select('slug, name').lt('name', team.name).order('name', { ascending: false }).limit(1).single()
  const { data: next } = await supabase.from('tag_teams').select('slug, name').gt('name', team.name).order('name', { ascending: true }).limit(1).single()

  return NextResponse.json({
    team, members: members || [], matches, matchCount,
    matchPage: page, matchTotalPages: Math.ceil(matchCount / limit),
    stats, championships, prev: prev || null, next: next || null,
  })
}
