// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 0 // no cache — random each time

export async function GET() {
  try {
    // Randomly pick tag team or stable
    const isTagTeam = Math.random() > 0.5

    if (isTagTeam) {
      const { count } = await supabase.from('tag_teams').select('id', { count: 'exact', head: true })
      if (!count || count === 0) return tryStable()

      const randomOffset = Math.floor(Math.random() * count)
      const { data } = await supabase
        .from('tag_teams')
        .select('id, name, slug, photo_url, formed_date, split_date, is_active, description_md')
        .range(randomOffset, randomOffset)
        .single()

      if (!data) return tryStable()

      const { data: members } = await supabase
        .from('tag_team_members')
        .select('superstar:superstar_id ( id, name, slug, photo_url )')
        .eq('tag_team_id', data.id)

      return NextResponse.json({ type: 'tag_team', data, members: members || [] })
    } else {
      return tryStable()
    }
  } catch { return NextResponse.json({ type: null, data: null, members: [] }) }
}

async function tryStable() {
  const { count } = await supabase.from('stables').select('id', { count: 'exact', head: true })
  if (!count || count === 0) {
    // Fallback to tag team
    const { count: ttCount } = await supabase.from('tag_teams').select('id', { count: 'exact', head: true })
    if (!ttCount) return NextResponse.json({ type: null, data: null, members: [] })
    const ro = Math.floor(Math.random() * ttCount)
    const { data } = await supabase.from('tag_teams').select('id, name, slug, photo_url, formed_date, split_date, is_active, description_md').range(ro, ro).single()
    if (!data) return NextResponse.json({ type: null, data: null, members: [] })
    const { data: members } = await supabase.from('tag_team_members').select('superstar:superstar_id ( id, name, slug, photo_url )').eq('tag_team_id', data.id)
    return NextResponse.json({ type: 'tag_team', data, members: members || [] })
  }

  const randomOffset = Math.floor(Math.random() * count)
  const { data } = await supabase
    .from('stables')
    .select('id, name, slug, photo_url, formed_date, split_date, is_active, description_md')
    .range(randomOffset, randomOffset)
    .single()

  if (!data) return NextResponse.json({ type: null, data: null, members: [] })

  const { data: members } = await supabase
    .from('stable_members')
    .select('superstar:superstar_id ( id, name, slug, photo_url )')
    .eq('stable_id', data.id)

  return NextResponse.json({ type: 'stable', data, members: members || [] })
}
