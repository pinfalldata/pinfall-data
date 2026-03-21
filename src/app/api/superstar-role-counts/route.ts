// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

/**
 * GET /api/superstar-role-counts?superstarId=123
 * Returns counts for each role activity to determine which tabs to show.
 * Now includes: omgMoments, tagTeams, stables
 */
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
    ])

    // OMG count = unique moments (participant + direct)
    // This is an approximation — could double-count but it's for tab visibility only
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
    })
  } catch (err) {
    console.error('[superstar-role-counts]', err)
    return NextResponse.json({ segments:0,managed:0,commentated:0,matchCommentated:0,ringAnnounced:0,refereed:0,guestRefereed:0,interviewed:0,gmTenures:0,execTenures:0,championships:0,omgMoments:0,tagTeams:0,stables:0 })
  }
}
