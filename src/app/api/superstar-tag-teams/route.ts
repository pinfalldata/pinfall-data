// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

/**
 * GET /api/superstar-tag-teams?superstarId=123&type=tag_team|stable
 * Returns tag teams or stables where this superstar is a member
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const superstarId = searchParams.get('superstarId')
  const type = searchParams.get('type') || 'tag_team' // tag_team or stable

  if (!superstarId) return NextResponse.json({ error: 'superstarId required' }, { status: 400 })

  const sid = parseInt(superstarId)

  try {
    if (type === 'tag_team') {
      // Get tag team memberships
      const { data: memberships } = await supabase
        .from('tag_team_members')
        .select('tag_team_id, joined_date, left_date')
        .eq('superstar_id', sid)

      if (!memberships || memberships.length === 0) {
        return NextResponse.json({ items: [] })
      }

      const teamIds = [...new Set(memberships.map(m => m.tag_team_id))]

      // Get tag team details
      const { data: teams } = await supabase
        .from('tag_teams')
        .select('id, name, slug, photo_url, formed_date, split_date, is_active')
        .in('id', teamIds)
        .order('name', { ascending: true })

      // Get all members for each team
      const { data: allMembers } = await supabase
        .from('tag_team_members')
        .select('tag_team_id, superstar:superstar_id ( id, name, slug, photo_url )')
        .in('tag_team_id', teamIds)

      const memberMap: Record<number, any[]> = {}
      for (const m of (allMembers || [])) {
        if (!memberMap[m.tag_team_id]) memberMap[m.tag_team_id] = []
        if (m.superstar) memberMap[m.tag_team_id].push(m.superstar)
      }

      // Get shared match counts per team (where both members on same team_number)
      const items = (teams || []).map(t => {
        const members = memberMap[t.id] || []
        const membership = memberships.find(m => m.tag_team_id === t.id)
        return {
          ...t,
          members,
          joined_date: membership?.joined_date,
          left_date: membership?.left_date,
        }
      })

      return NextResponse.json({ items })

    } else {
      // Stables
      const { data: memberships } = await supabase
        .from('stable_members')
        .select('stable_id, joined_date, left_date, role')
        .eq('superstar_id', sid)

      if (!memberships || memberships.length === 0) {
        return NextResponse.json({ items: [] })
      }

      const stableIds = [...new Set(memberships.map(m => m.stable_id))]

      // Get stable details
      const { data: stables } = await supabase
        .from('stables')
        .select('id, name, slug, photo_url, formed_date, split_date, is_active')
        .in('id', stableIds)
        .order('name', { ascending: true })

      // Get all members for each stable
      const { data: allMembers } = await supabase
        .from('stable_members')
        .select('stable_id, role, superstar:superstar_id ( id, name, slug, photo_url )')
        .in('stable_id', stableIds)

      const memberMap: Record<number, any[]> = {}
      for (const m of (allMembers || [])) {
        if (!memberMap[m.stable_id]) memberMap[m.stable_id] = []
        if (m.superstar) memberMap[m.stable_id].push({ ...m.superstar, role: m.role })
      }

      const items = (stables || []).map(s => {
        const members = memberMap[s.id] || []
        const membership = memberships.find(m => m.stable_id === s.id)
        return {
          ...s,
          members,
          joined_date: membership?.joined_date,
          left_date: membership?.left_date,
          role: membership?.role,
        }
      })

      return NextResponse.json({ items })
    }
  } catch (err) {
    console.error('[superstar-tag-teams]', err)
    return NextResponse.json({ items: [] })
  }
}
