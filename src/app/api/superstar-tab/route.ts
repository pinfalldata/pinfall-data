// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
const PER = 50

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams
  const sid = parseInt(sp.get('superstarId') || '0')
  const tab = sp.get('tab') || ''
  const page = Math.max(1, parseInt(sp.get('page') || '1'))
  const year = sp.get('year') || ''
  const month = sp.get('month') || ''
  const showSeriesId = sp.get('showSeriesId') || ''
  const category = sp.get('category') || ''
  const superstar2Id = sp.get('superstar2Id') || ''
  const result = sp.get('result') || ''

  if (!sid || !tab) return NextResponse.json({ items: [], total: 0, page, totalPages: 0, filterOpts: {} })

  try {
    const handlers: Record<string, Function> = {
      segments: () => handleSegments(sid, page, year, month, showSeriesId, category),
      managed: () => handleManaged(sid, page, year, month, showSeriesId, superstar2Id, result),
      commentated: () => handleShowBased(sid, page, year, month, showSeriesId, 'show_commentators'),
      matchCommentated: () => handleShowBased(sid, page, year, month, showSeriesId, 'match_commentators'),
      ringAnnounced: () => handleShowBased(sid, page, year, month, showSeriesId, 'show_ring_announcers'),
      refereed: () => handleRefereed(sid, page, year, month, showSeriesId, false),
      guestRefereed: () => handleRefereed(sid, page, year, month, showSeriesId, true),
      interviewed: () => handleInterviewed(sid, page, year, month, showSeriesId, superstar2Id),
      gmTenures: () => handleGMTenures(sid),
      execTenures: () => handleExecTenures(sid),
    }
    const fn = handlers[tab]
    if (!fn) return NextResponse.json({ items: [], total: 0, page, totalPages: 0, filterOpts: {} })
    return fn()
  } catch (err) {
    console.error('[superstar-tab]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function dateFilter(year: string, month: string) {
  if (!year) return null
  const m = month ? month.padStart(2, '0') : null
  const start = m ? `${year}-${m}-01` : `${year}-01-01`
  const end = m ? `${year}-${m}-${new Date(parseInt(year), parseInt(month), 0).getDate()}` : `${year}-12-31`
  return { start, end }
}

/* ============= SEGMENTS ============= */
async function handleSegments(sid: number, page: number, year: string, month: string, showSeriesId: string, category: string) {
  const { data: partRows } = await supabase.from('show_segment_participants').select('segment_id').eq('superstar_id', sid)
  const segIds = [...new Set((partRows || []).map(r => r.segment_id))]
  if (segIds.length === 0) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

  let query = supabase.from('show_segments')
    .select(`id, slug, title, category, show_id,
      show:shows!show_segments_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)),
      participants:show_segment_participants(superstar_id, role, superstars!show_segment_participants_superstar_id_fkey(id, name, slug, photo_url))`, { count: 'exact' })
    .in('id', segIds.slice(0, 2000))
    .order('id', { ascending: false })

  if (category) query = query.eq('category', category)
  const offset = (page - 1) * PER
  query = query.range(offset, offset + PER - 1)
  const { data, count } = await query

  let items = data || []
  const df = dateFilter(year, month)
  if (df) items = items.filter((s: any) => s.show?.date >= df.start && s.show?.date <= df.end)
  if (showSeriesId) items = items.filter((s: any) => s.show?.show_series?.id === parseInt(showSeriesId))

  const enriched = items.map((s: any) => ({
    id: s.id, slug: s.slug, title: s.title, category: s.category,
    show_name: s.show?.name, show_slug: s.show?.slug, show_date: s.show?.date, show_logo: s.show?.show_series?.logo_url,
    participants: (s.participants || []).filter((p: any) => p.superstar_id !== sid).map((p: any) => ({
      id: p.superstars?.id, name: p.superstars?.name, slug: p.superstars?.slug, photo_url: p.superstars?.photo_url, role: p.role,
    })),
  }))

  return NextResponse.json({ items: enriched, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER) })
}

/* ============= MANAGED ============= */
async function handleManaged(sid: number, page: number, year: string, month: string, showSeriesId: string, managedForId: string, result: string) {
  const { data: mmRows } = await supabase.from('match_managers').select('match_id, team_number, managing_for_superstar_id').eq('superstar_id', sid)
  let matchIds = (mmRows || []).map(r => r.match_id)
  if (managedForId) matchIds = (mmRows || []).filter(r => r.managing_for_superstar_id === parseInt(managedForId)).map(r => r.match_id)
  if (matchIds.length === 0) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

  let query = supabase.from('matches')
    .select(`id, slug, date, rating, result_type, is_title_change, winner_team,
      match_type:match_types(id, name, slug),
      championship:championships(id, name, slug, image_url),
      show:shows!matches_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)),
      participants:match_participants(team_number, is_winner, superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url))`, { count: 'exact' })
    .in('id', matchIds.slice(0, 2000))
    .order('date', { ascending: false })

  const df = dateFilter(year, month)
  if (df) query = query.gte('date', df.start).lte('date', df.end)
  const offset = (page - 1) * PER
  query = query.range(offset, offset + PER - 1)
  const { data, count } = await query

  let items = data || []
  if (showSeriesId) items = items.filter((m: any) => m.show?.show_series?.id === parseInt(showSeriesId))

  const mmLookup = new Map((mmRows || []).map(r => [r.match_id, r]))
  const enriched = items.map((m: any) => {
    const mm = mmLookup.get(m.id)
    const parts = m.participants || []
    const myTeam = mm?.team_number
    const isWin = parts.some((p: any) => p.team_number === myTeam && p.is_winner)
    const isDraw = m.result_type === 'no_contest' || m.result_type === 'time_limit_draw'
    return {
      id: m.id, slug: m.slug, date: m.date, rating: m.rating, result_type: m.result_type, is_title_change: m.is_title_change,
      match_type: m.match_type, championship: m.championship,
      show_name: m.show?.name, show_slug: m.show?.slug, show_logo: m.show?.show_series?.logo_url,
      managed_for: parts.filter((p: any) => p.team_number === myTeam).map((p: any) => ({ id: p.superstar?.id, name: p.superstar?.name, slug: p.superstar?.slug, photo_url: p.superstar?.photo_url })),
      opponents: parts.filter((p: any) => p.team_number !== myTeam).map((p: any) => ({ id: p.superstar?.id, name: p.superstar?.name, slug: p.superstar?.slug, photo_url: p.superstar?.photo_url })),
      matchResult: isDraw ? 'draw' : isWin ? 'win' : 'loss',
    }
  })

  let filtered = enriched
  if (result) filtered = enriched.filter(m => m.matchResult === result)

  return NextResponse.json({ items: filtered, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER) })
}

/* ============= SHOW-BASED (commentated, match_commentated, ring_announced) ============= */
async function handleShowBased(sid: number, page: number, year: string, month: string, showSeriesId: string, table: string) {
  const { data: rows } = await supabase.from(table).select('show_id').eq('superstar_id', sid)
  const showIds = [...new Set((rows || []).map(r => r.show_id))]
  if (showIds.length === 0) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

  // For show_commentators, also fetch co-commentators
  const isComm = table === 'show_commentators' || table === 'match_commentators'
  const commJoin = isComm ? `, commentators:${table}(superstar_id, superstars!${table}_superstar_id_fkey(id, name, slug, photo_url))` : ''

  let query = supabase.from('shows')
    .select(`id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)${commJoin}`, { count: 'exact' })
    .in('id', showIds.slice(0, 2000))
    .order('date', { ascending: false })

  const df = dateFilter(year, month)
  if (df) query = query.gte('date', df.start).lte('date', df.end)
  const offset = (page - 1) * PER
  query = query.range(offset, offset + PER - 1)
  const { data, count } = await query

  let items = data || []
  if (showSeriesId) items = items.filter((s: any) => s.show_series?.id === parseInt(showSeriesId))

  const enriched = items.map((s: any) => ({
    id: s.id, show_name: s.name, show_slug: s.slug, show_date: s.date, show_logo: s.show_series?.logo_url,
    co_commentators: isComm ? (s.commentators || []).filter((c: any) => c.superstar_id !== sid).map((c: any) => ({
      id: c.superstars?.id, name: c.superstars?.name, slug: c.superstars?.slug, photo_url: c.superstars?.photo_url,
    })) : undefined,
  }))

  return NextResponse.json({ items: enriched, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER) })
}

/* ============= REFEREED ============= */
async function handleRefereed(sid: number, page: number, year: string, month: string, showSeriesId: string, isGuest: boolean) {
  let refQuery = supabase.from('match_referees').select('match_id').eq('superstar_id', sid)
  if (isGuest) refQuery = refQuery.eq('is_special_referee', true)
  else refQuery = refQuery.or('is_special_referee.is.null,is_special_referee.eq.false')

  const { data: refRows } = await refQuery
  const matchIds = (refRows || []).map(r => r.match_id)
  if (matchIds.length === 0) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

  let query = supabase.from('matches')
    .select(`id, slug, date, rating, result_type, is_title_change,
      match_type:match_types(id, name, slug),
      championship:championships(id, name, slug, image_url),
      show:shows!matches_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)),
      participants:match_participants(team_number, is_winner, superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url))`, { count: 'exact' })
    .in('id', matchIds.slice(0, 2000))
    .order('date', { ascending: false })

  const df = dateFilter(year, month)
  if (df) query = query.gte('date', df.start).lte('date', df.end)
  const offset = (page - 1) * PER
  query = query.range(offset, offset + PER - 1)
  const { data, count } = await query

  let items = data || []
  if (showSeriesId) items = items.filter((m: any) => m.show?.show_series?.id === parseInt(showSeriesId))

  const enriched = items.map((m: any) => {
    const teams = new Map()
    for (const p of (m.participants || [])) {
      const t = p.team_number ?? 0
      if (!teams.has(t)) teams.set(t, [])
      teams.get(t).push(p)
    }
    return {
      id: m.id, slug: m.slug, date: m.date, rating: m.rating, result_type: m.result_type, is_title_change: m.is_title_change,
      match_type: m.match_type, championship: m.championship,
      show_name: m.show?.name, show_slug: m.show?.slug, show_logo: m.show?.show_series?.logo_url,
      teams: [...teams.entries()].sort((a, b) => a[0] - b[0]).map(([tn, members]) => ({
        team_number: tn, is_winner: members.some((p: any) => p.is_winner),
        members: members.map((p: any) => ({ id: p.superstar?.id, name: p.superstar?.name, slug: p.superstar?.slug, photo_url: p.superstar?.photo_url })),
      })),
    }
  })

  return NextResponse.json({ items: enriched, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER) })
}

/* ============= INTERVIEWED ============= */
async function handleInterviewed(sid: number, page: number, year: string, month: string, showSeriesId: string, intervieweeId: string) {
  const { data: partRows } = await supabase.from('show_segment_participants').select('segment_id').eq('superstar_id', sid).eq('role', 'interviewer')
  const segIds = [...new Set((partRows || []).map(r => r.segment_id))]
  if (segIds.length === 0) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

  let query = supabase.from('show_segments')
    .select(`id, slug, title, category, show_id,
      show:shows!show_segments_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)),
      participants:show_segment_participants(superstar_id, role, superstars!show_segment_participants_superstar_id_fkey(id, name, slug, photo_url))`, { count: 'exact' })
    .in('id', segIds.slice(0, 2000))
    .order('id', { ascending: false })

  const offset = (page - 1) * PER
  query = query.range(offset, offset + PER - 1)
  const { data, count } = await query

  let items = data || []
  const df = dateFilter(year, month)
  if (df) items = items.filter((s: any) => s.show?.date >= df.start && s.show?.date <= df.end)
  if (showSeriesId) items = items.filter((s: any) => s.show?.show_series?.id === parseInt(showSeriesId))

  const enriched = items.map((s: any) => ({
    id: s.id, slug: s.slug, title: s.title,
    show_name: s.show?.name, show_slug: s.show?.slug, show_date: s.show?.date, show_logo: s.show?.show_series?.logo_url,
    interviewees: (s.participants || []).filter((p: any) => p.superstar_id !== sid && p.role !== 'interviewer').map((p: any) => ({
      id: p.superstars?.id, name: p.superstars?.name, slug: p.superstars?.slug, photo_url: p.superstars?.photo_url,
    })),
  }))

  return NextResponse.json({ items: enriched, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER) })
}

/* ============= GM TENURES ============= */
async function handleGMTenures(sid: number) {
  const { data } = await supabase.from('general_manager_tenures')
    .select('*, show_series:show_series_id(id, name, short_name, logo_url)')
    .eq('superstar_id', sid)
    .order('start_date', { ascending: false })
  return NextResponse.json({ items: data || [], total: (data || []).length, page: 1, totalPages: 1 })
}

/* ============= EXEC TENURES ============= */
async function handleExecTenures(sid: number) {
  const { data } = await supabase.from('executive_tenures')
    .select('*')
    .eq('superstar_id', sid)
    .order('start_date', { ascending: false })
  return NextResponse.json({ items: data || [], total: (data || []).length, page: 1, totalPages: 1 })
}
