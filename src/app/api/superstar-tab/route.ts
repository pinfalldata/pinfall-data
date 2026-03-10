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
  if (!sid || !tab) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

  try {
    const h: Record<string, Function> = {
      segments: () => handleSegments(sid, page, year, month, showSeriesId, category),
      managed: () => handleManaged(sid, page, year, month, showSeriesId, superstar2Id, result),
      commentated: () => handleShowBased(sid, page, year, month, showSeriesId, 'show_commentators'),
      matchCommentated: () => handleMatchCommentated(sid, page, year, month, showSeriesId),
      ringAnnounced: () => handleShowBased(sid, page, year, month, showSeriesId, 'show_ring_announcers'),
      refereed: () => handleRefereed(sid, page, year, month, showSeriesId, false),
      guestRefereed: () => handleRefereed(sid, page, year, month, showSeriesId, true),
      interviewed: () => handleInterviewed(sid, page, year, month, showSeriesId, superstar2Id),
      gmTenures: () => handleGMTenures(sid),
      execTenures: () => handleExecTenures(sid),
    }
    return (h[tab] || (() => NextResponse.json({ items: [], total: 0, page, totalPages: 0 })))()
  } catch (err) { console.error('[superstar-tab]', err); return NextResponse.json({ error: 'Internal error' }, { status: 500 }) }
}

function df(y: string, m: string) {
  if (!y) return null
  const mm = m ? m.padStart(2, '0') : null
  return { start: mm ? `${y}-${mm}-01` : `${y}-01-01`, end: mm ? `${y}-${mm}-${new Date(parseInt(y), parseInt(m), 0).getDate()}` : `${y}-12-31` }
}

/* ============= SEGMENTS ============= */
async function handleSegments(sid: number, page: number, year: string, month: string, ssId: string, cat: string) {
  const { data: pr } = await supabase.from('show_segment_participants').select('segment_id').eq('superstar_id', sid)
  const segIds = [...new Set((pr || []).map(r => r.segment_id))]
  if (!segIds.length) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

  let q = supabase.from('show_segments').select(`id, slug, title, category, show:shows!show_segments_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)), participants:show_segment_participants(superstar_id, role, superstars!show_segment_participants_superstar_id_fkey(id, name, slug, photo_url))`, { count: 'exact' })
    .in('id', segIds.slice(0, 2000)).order('id', { ascending: false })
  if (cat) q = q.eq('category', cat)
  const o = (page - 1) * PER; q = q.range(o, o + PER - 1)
  const { data, count } = await q
  let items = data || []
  const d = df(year, month); if (d) items = items.filter((s: any) => s.show?.date >= d.start && s.show?.date <= d.end)
  if (ssId) items = items.filter((s: any) => s.show?.show_series?.id === parseInt(ssId))
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
async function handleManaged(sid: number, page: number, year: string, month: string, ssId: string, mfId: string, result: string) {
  const { data: mmR } = await supabase.from('match_managers').select('match_id, team_number, managing_for_superstar_id').eq('superstar_id', sid)
  let mIds = (mmR || []).map(r => r.match_id)
  if (mfId) mIds = (mmR || []).filter(r => r.managing_for_superstar_id === parseInt(mfId)).map(r => r.match_id)
  if (!mIds.length) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })
  let q = supabase.from('matches').select(`id, slug, date, rating, result_type, is_title_change, winner_team, match_type:match_types(id, name, slug), championship:championships(id, name, slug, image_url), show:shows!matches_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)), participants:match_participants(team_number, is_winner, superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url))`, { count: 'exact' })
    .in('id', mIds.slice(0, 2000)).order('date', { ascending: false })
  const dd = df(year, month); if (dd) q = q.gte('date', dd.start).lte('date', dd.end)
  const o = (page - 1) * PER; q = q.range(o, o + PER - 1)
  const { data, count } = await q
  let items = data || []
  if (ssId) items = items.filter((m: any) => m.show?.show_series?.id === parseInt(ssId))
  const mmL = new Map((mmR || []).map(r => [r.match_id, r]))
  const enriched = items.map((m: any) => {
    const mm = mmL.get(m.id); const ps = m.participants || []; const t = mm?.team_number
    const w = ps.some((p: any) => p.team_number === t && p.is_winner)
    const dr = m.result_type === 'no_contest' || m.result_type === 'time_limit_draw'
    return { id: m.id, slug: m.slug, date: m.date, rating: m.rating, result_type: m.result_type, is_title_change: m.is_title_change,
      match_type: m.match_type, championship: m.championship, show_name: m.show?.name, show_slug: m.show?.slug, show_logo: m.show?.show_series?.logo_url,
      managed_for: ps.filter((p: any) => p.team_number === t).map((p: any) => ({ id: p.superstar?.id, name: p.superstar?.name, slug: p.superstar?.slug, photo_url: p.superstar?.photo_url })),
      opponents: ps.filter((p: any) => p.team_number !== t).map((p: any) => ({ id: p.superstar?.id, name: p.superstar?.name, slug: p.superstar?.slug, photo_url: p.superstar?.photo_url })),
      matchResult: dr ? 'draw' : w ? 'win' : 'loss',
    }
  })
  let filtered = result ? enriched.filter(m => m.matchResult === result) : enriched
  return NextResponse.json({ items: filtered, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER) })
}

/* ============= SHOW-BASED (commentated, ring_announced) ============= */
async function handleShowBased(sid: number, page: number, year: string, month: string, ssId: string, table: string) {
  const { data: rows } = await supabase.from(table).select('show_id').eq('superstar_id', sid)
  const sIds = [...new Set((rows || []).map(r => r.show_id))]
  if (!sIds.length) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })
  const isComm = table === 'show_commentators'
  const join = isComm ? `, commentators:show_commentators(superstar_id, superstars!show_commentators_superstar_id_fkey(id, name, slug, photo_url))` : ''
  let q = supabase.from('shows').select(`id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)${join}`, { count: 'exact' })
    .in('id', sIds.slice(0, 2000)).order('date', { ascending: false })
  const dd = df(year, month); if (dd) q = q.gte('date', dd.start).lte('date', dd.end)
  const o = (page - 1) * PER; q = q.range(o, o + PER - 1)
  const { data, count } = await q
  let items = data || []
  if (ssId) items = items.filter((s: any) => s.show_series?.id === parseInt(ssId))
  const enriched = items.map((s: any) => ({
    id: s.id, show_name: s.name, show_slug: s.slug, show_date: s.date, show_logo: s.show_series?.logo_url,
    co_commentators: isComm ? (s.commentators || []).filter((c: any) => c.superstar_id !== sid).map((c: any) => ({
      id: c.superstars?.id, name: c.superstars?.name, slug: c.superstars?.slug, photo_url: c.superstars?.photo_url,
    })) : undefined,
  }))
  return NextResponse.json({ items: enriched, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER) })
}

/* ============= MATCH COMMENTATED — dedicated with match data ============= */
async function handleMatchCommentated(sid: number, page: number, year: string, month: string, ssId: string) {
  // Get match_commentators entries for this superstar
  const { data: mcRows } = await supabase.from('match_commentators').select('show_id, match_id').eq('superstar_id', sid)
  if (!mcRows?.length) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })

  // Get shows
  const showIds = [...new Set(mcRows.map(r => r.show_id))]
  let q = supabase.from('shows').select(`id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url),
    official_commentators:show_commentators(superstar_id, superstars!show_commentators_superstar_id_fkey(id, name, slug, photo_url))`, { count: 'exact' })
    .in('id', showIds.slice(0, 2000)).order('date', { ascending: false })
  const dd = df(year, month); if (dd) q = q.gte('date', dd.start).lte('date', dd.end)
  const o = (page - 1) * PER; q = q.range(o, o + PER - 1)
  const { data, count } = await q
  let items = data || []
  if (ssId) items = items.filter((s: any) => s.show_series?.id === parseInt(ssId))

  // Get match details for each show
  const matchIds = mcRows.filter(r => r.match_id).map(r => r.match_id)
  let matchMap = new Map()
  if (matchIds.length) {
    const { data: matches } = await supabase.from('matches').select(`id, slug, date, match_type:match_types(name),
      participants:match_participants(team_number, is_winner, superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url))`)
      .in('id', matchIds)
    for (const m of (matches || [])) matchMap.set(m.id, m)
  }

  // Build show→match lookup
  const showMatchMap = new Map()
  for (const r of mcRows) { if (!showMatchMap.has(r.show_id)) showMatchMap.set(r.show_id, []); if (r.match_id) showMatchMap.get(r.show_id).push(r.match_id) }

  const enriched = items.map((s: any) => {
    const mIds = showMatchMap.get(s.id) || []
    const matchDetails = mIds.map(id => {
      const m = matchMap.get(id)
      if (!m) return null
      const teams = new Map()
      for (const p of (m.participants || [])) { const t = p.team_number ?? 0; if (!teams.has(t)) teams.set(t, []); teams.get(t).push(p) }
      return {
        id: m.id, slug: m.slug, match_type: m.match_type?.name,
        teams: [...teams.entries()].sort((a, b) => a[0] - b[0]).map(([, members]) => ({
          is_winner: members.some(p => p.is_winner),
          members: members.map(p => ({ id: p.superstar?.id, name: p.superstar?.name, slug: p.superstar?.slug, photo_url: p.superstar?.photo_url })),
        })),
      }
    }).filter(Boolean)

    return {
      id: s.id, show_name: s.name, show_slug: s.slug, show_date: s.date, show_logo: s.show_series?.logo_url,
      official_commentators: (s.official_commentators || []).map((c: any) => ({
        id: c.superstars?.id, name: c.superstars?.name, slug: c.superstars?.slug, photo_url: c.superstars?.photo_url,
      })),
      match: matchDetails[0] || null,
    }
  })
  return NextResponse.json({ items: enriched, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER) })
}

/* ============= REFEREED ============= */
async function handleRefereed(sid: number, page: number, year: string, month: string, ssId: string, isGuest: boolean) {
  let rq = supabase.from('match_referees').select('match_id').eq('superstar_id', sid)
  if (isGuest) rq = rq.eq('is_special_referee', true); else rq = rq.or('is_special_referee.is.null,is_special_referee.eq.false')
  const { data: rr } = await rq; const mIds = (rr || []).map(r => r.match_id)
  if (!mIds.length) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })
  let q = supabase.from('matches').select(`id, slug, date, rating, result_type, is_title_change, match_type:match_types(id, name, slug), championship:championships(id, name, slug, image_url), show:shows!matches_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)), participants:match_participants(team_number, is_winner, superstar:superstars!match_participants_superstar_id_fkey(id, name, slug, photo_url))`, { count: 'exact' })
    .in('id', mIds.slice(0, 2000)).order('date', { ascending: false })
  const dd = df(year, month); if (dd) q = q.gte('date', dd.start).lte('date', dd.end)
  const o = (page - 1) * PER; q = q.range(o, o + PER - 1)
  const { data, count } = await q
  let items = data || []
  if (ssId) items = items.filter((m: any) => m.show?.show_series?.id === parseInt(ssId))
  const enriched = items.map((m: any) => {
    const teams = new Map()
    for (const p of (m.participants || [])) { const t = p.team_number ?? 0; if (!teams.has(t)) teams.set(t, []); teams.get(t).push(p) }
    return { id: m.id, slug: m.slug, date: m.date, rating: m.rating, result_type: m.result_type, is_title_change: m.is_title_change, match_type: m.match_type, championship: m.championship,
      show_name: m.show?.name, show_slug: m.show?.slug, show_logo: m.show?.show_series?.logo_url,
      teams: [...teams.entries()].sort((a, b) => a[0] - b[0]).map(([, members]) => ({
        is_winner: members.some((p: any) => p.is_winner), members: members.map((p: any) => ({ id: p.superstar?.id, name: p.superstar?.name, slug: p.superstar?.slug, photo_url: p.superstar?.photo_url })),
      })),
    }
  })
  return NextResponse.json({ items: enriched, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER) })
}

/* ============= INTERVIEWED — with all participants ============= */
async function handleInterviewed(sid: number, page: number, year: string, month: string, ssId: string, s2Id: string) {
  const { data: pr } = await supabase.from('show_segment_participants').select('segment_id').eq('superstar_id', sid).eq('role', 'interviewer')
  const segIds = [...new Set((pr || []).map(r => r.segment_id))]
  if (!segIds.length) return NextResponse.json({ items: [], total: 0, page, totalPages: 0 })
  let q = supabase.from('show_segments').select(`id, slug, title, category, show:shows!show_segments_show_id_fkey(id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)), participants:show_segment_participants(superstar_id, role, superstars!show_segment_participants_superstar_id_fkey(id, name, slug, photo_url))`, { count: 'exact' })
    .in('id', segIds.slice(0, 2000)).order('id', { ascending: false })
  const o = (page - 1) * PER; q = q.range(o, o + PER - 1)
  const { data, count } = await q
  let items = data || []
  const dd = df(year, month); if (dd) items = items.filter((s: any) => s.show?.date >= dd.start && s.show?.date <= dd.end)
  if (ssId) items = items.filter((s: any) => s.show?.show_series?.id === parseInt(ssId))
  if (s2Id) items = items.filter((s: any) => (s.participants || []).some((p: any) => p.superstar_id === parseInt(s2Id)))

  const enriched = items.map((s: any) => ({
    id: s.id, slug: s.slug, title: s.title,
    show_name: s.show?.name, show_slug: s.show?.slug, show_date: s.show?.date, show_logo: s.show?.show_series?.logo_url,
    participants: (s.participants || []).filter((p: any) => p.superstar_id !== sid).map((p: any) => ({
      id: p.superstars?.id, name: p.superstars?.name, slug: p.superstars?.slug, photo_url: p.superstars?.photo_url, role: p.role,
    })),
  }))
  return NextResponse.json({ items: enriched, total: count || 0, page, totalPages: Math.ceil((count || 0) / PER) })
}

/* ============= TENURES ============= */
async function handleGMTenures(sid: number) {
  const { data } = await supabase.from('general_manager_tenures').select('*, show_series:show_series_id(id, name, short_name, logo_url)').eq('superstar_id', sid).order('start_date', { ascending: false })
  return NextResponse.json({ items: data || [], total: (data || []).length, page: 1, totalPages: 1 })
}
async function handleExecTenures(sid: number) {
  const { data } = await supabase.from('executive_tenures').select('*').eq('superstar_id', sid).order('start_date', { ascending: false })
  return NextResponse.json({ items: data || [], total: (data || []).length, page: 1, totalPages: 1 })
}
