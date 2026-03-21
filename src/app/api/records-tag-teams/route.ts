// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  try {
    // All tag teams with members
    const { data: teams } = await supabase.from('tag_teams')
      .select('id, name, slug, photo_url, formed_date, split_date, is_active')
      .order('name')

    const { data: teamMembers } = await supabase.from('tag_team_members')
      .select('tag_team_id, superstar:superstars(id, name, slug, photo_url)')

    const tmMap = new Map<number, any[]>()
    for (const m of (teamMembers || [])) {
      if (!tmMap.has(m.tag_team_id)) tmMap.set(m.tag_team_id, [])
      if (m.superstar) tmMap.get(m.tag_team_id)!.push(m.superstar)
    }

    // Count shared matches per tag team (2+ members on same team_number)
    const teamStats = new Map<number, { matches: number; wins: number }>()
    for (const t of (teams || [])) {
      const members = tmMap.get(t.id) || []
      if (members.length < 2) continue
      const id0 = members[0]?.id; const id1 = members[1]?.id
      if (!id0 || !id1) continue

      const { data: p0 } = await supabase.from('match_participants').select('match_id, team_number, is_winner').eq('superstar_id', id0)
      const { data: p1 } = await supabase.from('match_participants').select('match_id, team_number').eq('superstar_id', id1)

      if (!p0 || !p1) continue
      const map0 = new Map(p0.map(r => [r.match_id, r]))
      let matches = 0; let wins = 0
      for (const r of p1) {
        const r0 = map0.get(r.match_id)
        if (r0 && r0.team_number === r.team_number) { matches++; if (r0.is_winner) wins++ }
      }
      teamStats.set(t.id, { matches, wins })
    }

    const enrichedTeams = (teams || []).map(t => {
      const stats = teamStats.get(t.id) || { matches: 0, wins: 0 }
      const members = tmMap.get(t.id) || []
      const durationYears = t.formed_date ? Math.round((new Date(t.split_date || new Date()).getTime() - new Date(t.formed_date).getTime()) / (365.25 * 24 * 3600 * 1000) * 10) / 10 : null
      return {
        id: t.id, name: t.name, slug: t.slug, photo_url: t.photo_url,
        formed_date: t.formed_date, split_date: t.split_date, is_active: t.is_active,
        members: members.slice(0, 3).map(m => ({ id: m.id, name: m.name, slug: m.slug, photo_url: m.photo_url })),
        matches: stats.matches, wins: stats.wins,
        win_rate: stats.matches > 0 ? Math.round((stats.wins / stats.matches) * 1000) / 10 : 0,
        duration_years: durationYears,
      }
    }).filter(t => t.matches > 0)

    const mostMatchesTogether = [...enrichedTeams].sort((a, b) => b.matches - a.matches).slice(0, 30)
    const bestWinRate = enrichedTeams.filter(t => t.matches >= 10).sort((a, b) => b.win_rate - a.win_rate).slice(0, 30)
    const longestPartnership = enrichedTeams.filter(t => t.duration_years).sort((a, b) => (b.duration_years || 0) - (a.duration_years || 0)).slice(0, 30)

    // Stables
    const { data: stables } = await supabase.from('stables').select('id, name, slug, photo_url, formed_date, split_date, is_active')
    const { data: stableMembers } = await supabase.from('stable_members').select('stable_id, superstar:superstars(id, name, slug, photo_url)')

    const smMap = new Map<number, any[]>()
    for (const m of (stableMembers || [])) {
      if (!smMap.has(m.stable_id)) smMap.set(m.stable_id, [])
      if (m.superstar) smMap.get(m.stable_id)!.push(m.superstar)
    }

    const largestStables = (stables || []).map(s => ({
      id: s.id, name: s.name, slug: s.slug, photo_url: s.photo_url,
      member_count: (smMap.get(s.id) || []).length,
      members: (smMap.get(s.id) || []).slice(0, 6).map(m => ({ id: m.id, name: m.name, slug: m.slug, photo_url: m.photo_url })),
      is_active: s.is_active,
    })).sort((a, b) => b.member_count - a.member_count).slice(0, 30)

    return NextResponse.json({ mostMatchesTogether, bestWinRate, longestPartnership, largestStables })
  } catch (err) {
    console.error('[records-tag-teams]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
