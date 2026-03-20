// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 0

export async function GET() {
  try {
    const isTagTeam = Math.random() > 0.5
    if (isTagTeam) {
      const result = await pickRandom('tag_teams', 'tag_team_members', 'tag_team_id', 'tag_team')
      if (result) return result
    }
    const result = await pickRandom('stables', 'stable_members', 'stable_id', 'stable')
    if (result) return result
    // Fallback other way
    const result2 = await pickRandom(isTagTeam ? 'stables' : 'tag_teams', isTagTeam ? 'stable_members' : 'tag_team_members', isTagTeam ? 'stable_id' : 'tag_team_id', isTagTeam ? 'stable' : 'tag_team')
    if (result2) return result2
    return NextResponse.json({ type: null, data: null, members: [] })
  } catch { return NextResponse.json({ type: null, data: null, members: [] }) }
}

async function pickRandom(table: string, membersTable: string, fkCol: string, type: string) {
  // Only pick items WITH a photo
  const { count } = await supabase.from(table).select('id', { count: 'exact', head: true }).not('photo_url', 'is', null)
  if (!count || count === 0) return null

  const offset = Math.floor(Math.random() * count)
  const { data } = await supabase
    .from(table)
    .select('id, name, slug, photo_url, formed_date, split_date, is_active, description_md')
    .not('photo_url', 'is', null)
    .range(offset, offset)
    .single()

  if (!data) return null

  const { data: members } = await supabase
    .from(membersTable)
    .select('superstar:superstar_id ( id, name, slug, photo_url )')
    .eq(fkCol, data.id)

  return NextResponse.json({ type, data, members: members || [] })
}
