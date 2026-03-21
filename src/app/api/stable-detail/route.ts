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

  // ================================================================
  // FIND MULTI-MAN MATCHES with 2+ stable members on same team
  // ================================================================
  let matchIdWinMap = new Map<number, boolean>()

  if (memberIds.length >= 2) {
    // Query each member's participations
    const allParts: { match_id: number; team_number: number; superstar_id: number; is_winner: boolean }[] = []

    for (const mid of memberIds) {
      const { data } = await supabase
        .from('match_participants')
        .select('match_id, team_number, superstar_id, is_winner')
        .eq('superstar_id', mid)

      if (data) allParts.push(...data.map(d => ({ ...d, is_winner: !!d.is_winner })))
    }

    // Group by match_id + team_number
    const groups = new Map<string, { matchId: number; count: number; win: boolean }>()
    for (const p of allParts) {
      const key = `${p.match_id}_${p.team_number}`
      const existing = groups.get(key)
      if (existing) { existing.count++ }
      else { groups.set(key, { matchId: p.match_id, count: 1, win: p.is_winner }) }
    }

    // Need 2+ stable members on same team
    for (const [, g] of groups) {
      if (g.count >= 2 && !matchIdWinMap.has(g.matchId)) {
        matchIdWinMap.set(g.matchId, g.win)
      }
    }

    // Filter out singles (need 3+ total participants in the match)
    if (matchIdWinMap.size > 0) {
      const allIds = Array.from(matchIdWinMap.keys())
      const toRemove = new Set<number>()
      const batchSize = 300

      for (let i = 0; i < allIds.length; i += batchSize) {
        const batch = allIds.slice(i, i + batchSize)
        const { data: counts } = await supabase
          .from('match_participants')
          .select('match_id')
          .in('match_id', batch)

        if (counts) {
          const countMap = new Map<number, number>()
          for (const c of counts) {
            countMap.set(c.match_id, (countMap.get(c.match_id) || 0) + 1)
          }
          for (const [mid, cnt] of countMap) {
            if (cnt <= 2) toRemove.add(mid)
          }
        }
      }

      for (const id of toRemove) matchIdWinMap.delete(id)
    }

    // Filter by stable active dates
    if ((stable.formed_date || stable.split_date) && matchIdWinMap.size > 0) {
      const allIds = Array.from(matchIdWinMap.keys())
      const batchSize = 300
      let allDates: { id: number; date: string | null }[] = []

      for (let i = 0; i < allIds.length; i += batchSize) {
        const batch = allIds.slice(i, i + batchSize)
        const { data } = await supabase.from('matches').select('id, date').in('id', batch)
        if (data) allDates.push(...data)
      }

      for (const m of allDates) {
        if (!m.date) continue
        if (stable.formed_date && m.date < stable.formed_date) matchIdWinMap.delete(m.id)
        if (stable.split_date && m.date > stable.split_date) matchIdWinMap.delete(m.id)
      }
    }
  }

  const qualifiedIds = Array.from(matchIdWinMap.keys())
  const matchCount = qualifiedIds.length

  // ================================================================
  // FETCH MATCHES WITH PARTICIPANTS (separate queries)
  // ================================================================
  let matches: any[] = []

  if (qualifiedIds.length > 0) {
    const batchSize = 300
    let allWithDates: { id: number; date: string | null }[] = []
    for (let i = 0; i < qualifiedIds.length; i += batchSize) {
      const batch = qualifiedIds.slice(i, i + batchSize)
      const { data } = await supabase.from('matches').select('id, date').in('id', batch)
      if (data) allWithDates.push(...data)
    }

    allWithDates.sort((a, b) => (b.date || '0000').localeCompare(a.date || '0000'))
    const pageIds = allWithDates.slice(offset, offset + limit).map(m => m.id)

    if (pageIds.length > 0) {
      // Matches base
      const { data: matchData } = await supabase
        .from('matches')
        .select(`
          id, slug, date, rating, duration_seconds, is_title_change,
          match_type:match_type_id ( name ),
          championship:championship_id ( name, slug, image_url ),
          show:show_id ( id, name, slug, date )
        `)
        .in('id', pageIds)

      // Participants SEPARATE
      const { data: partsData } = await supabase
        .from('match_participants')
        .select(`
          id, match_id, team_number, result, is_winner,
          superstar:superstar_id ( id, name, slug, photo_url )
        `)
        .in('match_id', pageIds)

      const partsMap = new Map<number, any[]>()
      for (const p of (partsData || [])) {
        if (!partsMap.has(p.match_id)) partsMap.set(p.match_id, [])
        partsMap.get(p.match_id)!.push(p)
      }

      const matchMap = new Map<number, any>()
      for (const m of (matchData || [])) {
        matchMap.set(m.id, { ...m, participants: partsMap.get(m.id) || [] })
      }

      matches = pageIds.map(id => matchMap.get(id)).filter(Boolean)
    }
  }

  // Stats
  let wins = 0, losses = 0
  for (const [, isWin] of matchIdWinMap) {
    if (isWin) wins++; else losses++
  }
  const stats = {
    totalMatches: matchCount, wins, losses,
    draws: Math.max(0, matchCount - wins - losses),
    winRate: matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0,
  }

  const { data: prev } = await supabase.from('stables').select('slug, name').lt('name', stable.name).order('name', { ascending: false }).limit(1).single()
  const { data: next } = await supabase.from('stables').select('slug, name').gt('name', stable.name).order('name', { ascending: true }).limit(1).single()

  return NextResponse.json({
    stable, members: members || [], matches, matchCount,
    matchPage: page, matchTotalPages: Math.ceil(matchCount / limit),
    stats, prev: prev || null, next: next || null,
  })
}
