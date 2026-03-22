// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('superstarId')
  if (!id) return NextResponse.json({ error: 'superstarId required' }, { status: 400 })

  const sid = parseInt(id)

  try {
    const [
      { count: segments },
      { count: managed },
      { count: commentated },
      { count: matchCommentated },
      { count: ringAnnounced },
      { count: refereed },
      { count: guestRefereed },
      { count: interviewed },
      { count: gmTenures },
      { count: execTenures },
      { count: championships },
      { count: omgParticipant },
      { count: omgDirect },
      { count: tagTeams },
      { count: stables },
      { count: hallOfFame },
      { count: slammyAwards },
      { count: yearEndAwards },
      { count: objectsUsed },
      { count: entranceThemes },
      { count: attires },
    ] = await Promise.all([
      supabase.from('show_segment_participants').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('match_managers').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('show_commentators').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('match_commentators').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('show_ring_announcers').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('match_referees').select('*', { count: 'exact', head: true }).eq('superstar_id', sid).or('is_special_referee.is.null,is_special_referee.eq.false'),
      supabase.from('match_referees').select('*', { count: 'exact', head: true }).eq('superstar_id', sid).eq('is_special_referee', true),
      supabase.from('show_segment_participants').select('*', { count: 'exact', head: true }).eq('superstar_id', sid).eq('role', 'interviewer'),
      supabase.from('general_manager_tenures').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('executive_tenures').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('championship_reigns').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('omg_moment_participants').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('omg_moments').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('tag_team_members').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('stable_members').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('hall_of_fame').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('slammy_awards').select('*', { count: 'exact', head: true }).eq('winner_id', sid),
      supabase.from('year_end_awards').select('*', { count: 'exact', head: true }).eq('winner_id', sid),
      supabase.from('match_object_usage').select('*', { count: 'exact', head: true }).eq('used_by_superstar_id', sid),
      supabase.from('entrance_themes').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('superstar_attires').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
    ])

    // Gallery count: count media from superstar's matches + segments
    let gallery = 0
    try {
      const [{ data: mp }, { data: sp }] = await Promise.all([
        supabase.from('match_participants').select('match_id').eq('superstar_id', sid).limit(5000),
        supabase.from('show_segment_participants').select('segment_id').eq('superstar_id', sid).limit(5000),
      ])
      const mIds = [...new Set((mp || []).map(p => p.match_id))]
      const sIds = [...new Set((sp || []).map(p => p.segment_id))]

      let mmCount = 0
      let smCount = 0

      if (mIds.length > 0) {
        const { count: c } = await supabase.from('match_media').select('*', { count: 'exact', head: true }).in('match_id', mIds.slice(0, 1000))
        mmCount = c || 0
      }
      if (sIds.length > 0) {
        const { count: c } = await supabase.from('segment_media').select('*', { count: 'exact', head: true }).in('segment_id', sIds.slice(0, 1000))
        smCount = c || 0
      }
      gallery = mmCount + smCount
    } catch {}

    const omgMoments = Math.max((omgParticipant || 0), (omgDirect || 0))

    return NextResponse.json({
      segments: segments || 0,
      managed: managed || 0,
      commentated: commentated || 0,
      matchCommentated: matchCommentated || 0,
      ringAnnounced: ringAnnounced || 0,
      refereed: refereed || 0,
      guestRefereed: guestRefereed || 0,
      interviewed: interviewed || 0,
      gmTenures: gmTenures || 0,
      execTenures: execTenures || 0,
      championships: championships || 0,
      omgMoments: omgMoments || 0,
      tagTeams: tagTeams || 0,
      stables: stables || 0,
      hallOfFame: hallOfFame || 0,
      slammyAwards: slammyAwards || 0,
      yearEndAwards: yearEndAwards || 0,
      objectsUsed: objectsUsed || 0,
      entranceThemes: entranceThemes || 0,
      attires: attires || 0,
      gallery,
    })
  } catch (err) {
    console.error('[superstar-role-counts]', err)
    return NextResponse.json({ segments:0,managed:0,commentated:0,matchCommentated:0,ringAnnounced:0,refereed:0,guestRefereed:0,interviewed:0,gmTenures:0,execTenures:0,championships:0,omgMoments:0,tagTeams:0,stables:0,hallOfFame:0,slammyAwards:0,yearEndAwards:0,objectsUsed:0,entranceThemes:0,attires:0,gallery:0 })
  }
}
