// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

/**
 * GET /api/superstar-profile-preview?superstarId=123
 * Returns preview data for the redesigned profile tab
 */
export async function GET(req: NextRequest) {
  const sid = parseInt(new URL(req.url).searchParams.get('superstarId') || '0')
  if (!sid) return NextResponse.json({ error: 'superstarId required' }, { status: 400 })

  try {
    // ═══ Determine primary role activity ═══
    const [
      { count: matchCount },
      { count: managedCount },
      { count: commentatedCount },
      { count: ringAnnouncedCount },
      { count: refereedCount },
      { count: interviewedCount },
    ] = await Promise.all([
      supabase.from('match_participants').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('match_managers').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('show_commentators').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('show_ring_announcers').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('match_referees').select('*', { count: 'exact', head: true }).eq('superstar_id', sid),
      supabase.from('show_segment_participants').select('*', { count: 'exact', head: true }).eq('superstar_id', sid).eq('role', 'interviewer'),
    ])

    // Find primary role by highest count
    const roleCounts = [
      { role: 'wrestler', count: matchCount || 0, label: 'Matches' },
      { role: 'manager', count: managedCount || 0, label: 'Managed' },
      { role: 'commentator', count: commentatedCount || 0, label: 'Commentated' },
      { role: 'ring_announcer', count: ringAnnouncedCount || 0, label: 'Announced' },
      { role: 'referee', count: refereedCount || 0, label: 'Refereed' },
      { role: 'interviewer', count: interviewedCount || 0, label: 'Interviewed' },
    ].sort((a, b) => b.count - a.count)

    const primaryRole = roleCounts[0]

    // ═══ Fetch last 5 "matches" based on primary role ═══
    let recentActivity: any[] = []
    let activityLabel = 'Recent Matches'

    if (primaryRole.role === 'wrestler' && primaryRole.count > 0) {
      activityLabel = 'Recent Matches'
      const { data: parts } = await supabase
        .from('match_participants')
        .select('match_id, is_winner')
        .eq('superstar_id', sid)
        .limit(5000)

      if (parts && parts.length > 0) {
        const matchIds = parts.map(p => p.match_id)
        const winMap = new Map(parts.map(p => [p.match_id, p.is_winner]))

        const { data: matches } = await supabase
          .from('matches')
          .select(`
            id, slug, date, rating, result_type, duration_seconds,
            match_type:match_types(id, name, slug),
            show:shows!matches_show_id_fkey(id, name, slug, show_series:show_series_id(id, name, short_name, logo_url)),
            participants:match_participants(
              superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url),
              team_number, is_winner
            )
          `)
          .in('id', matchIds.slice(0, 2000))
          .order('date', { ascending: false })
          .limit(5)

        recentActivity = (matches || []).map(m => {
          const isWinner = winMap.get(m.id) || false
          const isDraw = m.result_type === 'no_contest' || m.result_type === 'time_limit_draw'
          return {
            ...m,
            matchResult: isDraw ? 'draw' : isWinner ? 'win' : 'loss',
          }
        })
      }
    } else if (primaryRole.role === 'commentator' && primaryRole.count > 0) {
      activityLabel = 'Recent Shows Commentated'
      const { data: comms } = await supabase
        .from('show_commentators')
        .select('show:shows(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url))')
        .eq('superstar_id', sid)
        .order('created_at', { ascending: false })
        .limit(5)
      recentActivity = (comms || []).map(c => ({ ...c.show, type: 'show' }))
    } else if (primaryRole.role === 'manager' && primaryRole.count > 0) {
      activityLabel = 'Recent Matches Managed'
      const { data: mgrs } = await supabase
        .from('match_managers')
        .select(`match_id, managing_for:superstars!match_managers_managing_for_superstar_id_fkey(id, name, slug, photo_url)`)
        .eq('superstar_id', sid)
        .limit(500)

      if (mgrs && mgrs.length > 0) {
        const mIds = mgrs.map(m => m.match_id)
        const { data: matches } = await supabase
          .from('matches')
          .select('id, slug, date, rating, show:shows!matches_show_id_fkey(id, name, slug, show_series:show_series_id(id, name, short_name, logo_url))')
          .in('id', mIds.slice(0, 500))
          .order('date', { ascending: false })
          .limit(5)
        recentActivity = matches || []
      }
    } else if (primaryRole.role === 'referee' && primaryRole.count > 0) {
      activityLabel = 'Recent Matches Refereed'
      const { data: refs } = await supabase
        .from('match_referees')
        .select('match_id')
        .eq('superstar_id', sid)
        .limit(500)

      if (refs && refs.length > 0) {
        const mIds = refs.map(r => r.match_id)
        const { data: matches } = await supabase
          .from('matches')
          .select('id, slug, date, rating, show:shows!matches_show_id_fkey(id, name, slug, show_series:show_series_id(id, name, short_name, logo_url))')
          .in('id', mIds.slice(0, 500))
          .order('date', { ascending: false })
          .limit(5)
        recentActivity = matches || []
      }
    } else if (primaryRole.role === 'ring_announcer' && primaryRole.count > 0) {
      activityLabel = 'Recent Shows Announced'
      const { data: anns } = await supabase
        .from('show_ring_announcers')
        .select('show:shows(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url))')
        .eq('superstar_id', sid)
        .order('created_at', { ascending: false })
        .limit(5)
      recentActivity = (anns || []).map(a => ({ ...a.show, type: 'show' }))
    }

    // ═══ Last 5 segments ═══
    const { data: segParts } = await supabase
      .from('show_segment_participants')
      .select('segment_id')
      .eq('superstar_id', sid)
      .limit(5000)

    let recentSegments: any[] = []
    if (segParts && segParts.length > 0) {
      const segIds = [...new Set(segParts.map(p => p.segment_id))]
      const { data: segs } = await supabase
        .from('show_segments')
        .select('id, title, slug, category, show:shows!show_segments_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url))')
        .in('id', segIds.slice(0, 2000))
        .order('created_at', { ascending: false })
        .limit(5)
      recentSegments = segs || []
    }

    // ═══ Quick stats ═══
    let statsPreview: any = null
    if ((matchCount || 0) > 0) {
      const { data: star } = await supabase
        .from('superstars')
        .select('total_matches, win_count, loss_count, draw_count, total_reigns, total_championship_days')
        .eq('id', sid)
        .single()
      if (star) {
        const winRate = star.total_matches > 0 ? Math.round((star.win_count / star.total_matches) * 100) : 0
        statsPreview = { ...star, winRate }
      }
    }

    // ═══ Random media (1-2) ═══
    let mediaPreview: any[] = []
    if ((matchCount || 0) > 0) {
      const { data: mp } = await supabase.from('match_participants').select('match_id').eq('superstar_id', sid).limit(500)
      if (mp && mp.length > 0) {
        const mIds = mp.map(p => p.match_id)
        const { data: media } = await supabase
          .from('match_media')
          .select('id, media_type, title, url, thumbnail_url, match_id')
          .in('match_id', mIds.slice(0, 500))
          .limit(2)
        mediaPreview = media || []
      }
    }

    // ═══ Latest OMG moment ═══
    let omgPreview: any = null
    const { data: omgParts } = await supabase
      .from('omg_moment_participants')
      .select('omg_moment_id')
      .eq('superstar_id', sid)
      .limit(100)

    if (omgParts && omgParts.length > 0) {
      const omgIds = omgParts.map(p => p.omg_moment_id)
      const { data: omgs } = await supabase
        .from('omg_moments')
        .select('id, title, date, category, video_url, show:shows(id, name, slug)')
        .in('id', omgIds)
        .order('date', { ascending: false })
        .limit(2)
      omgPreview = omgs || []
    }

    // ═══ Tag teams ═══
    let tagTeamPreview: any = null
    const { data: ttMembers } = await supabase
      .from('tag_team_members')
      .select('tag_team:tag_teams(id, name, slug, photo_url)')
      .eq('superstar_id', sid)
      .limit(1)
    if (ttMembers && ttMembers.length > 0) {
      tagTeamPreview = ttMembers[0].tag_team
    }

    // ═══ Stables ═══
    let stablePreview: any = null
    const { data: stMembers } = await supabase
      .from('stable_members')
      .select('stable:stables(id, name, slug, photo_url)')
      .eq('superstar_id', sid)
      .limit(1)
    if (stMembers && stMembers.length > 0) {
      stablePreview = stMembers[0].stable
    }

    // ═══ Finishers ═══
    const { data: finishers } = await supabase
      .from('finishers')
      .select('id, name, move_type')
      .eq('superstar_id', sid)
      .limit(3)

    return NextResponse.json({
      primaryRole: primaryRole.role,
      activityLabel,
      recentActivity,
      recentSegments,
      statsPreview,
      mediaPreview,
      omgPreview: omgPreview || [],
      tagTeamPreview,
      stablePreview,
      finishersPreview: finishers || [],
    })
  } catch (err) {
    console.error('[superstar-profile-preview]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
