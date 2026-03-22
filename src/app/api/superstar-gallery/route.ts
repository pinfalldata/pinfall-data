// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
const PER = 24

/**
 * GET /api/superstar-gallery?superstarId=123&page=1&year=2024&mediaType=video&showSeriesId=5&section=all|matches|segments|superstar
 */
export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams
  const sid = parseInt(sp.get('superstarId') || '0')
  const page = Math.max(1, parseInt(sp.get('page') || '1'))
  const year = sp.get('year') || ''
  const mediaType = sp.get('mediaType') || ''
  const showSeriesId = sp.get('showSeriesId') || ''
  const section = sp.get('section') || 'all' // all | matches | segments | superstar

  if (!sid) return NextResponse.json({ items: [], superstarMedia: [], total: 0, page, totalPages: 0, filters: {} })

  try {
    // ═══ Step 1: Get match/segment IDs ═══
    const [{ data: matchParts }, { data: segParts }] = await Promise.all([
      supabase.from('match_participants').select('match_id').eq('superstar_id', sid),
      supabase.from('show_segment_participants').select('segment_id').eq('superstar_id', sid),
    ])

    const matchIds = [...new Set((matchParts || []).map(p => p.match_id))]
    const segIds = [...new Set((segParts || []).map(p => p.segment_id))]

    // ═══ Step 2: Fetch all media ═══
    let matchMedia: any[] = []
    let segmentMedia: any[] = []
    let superstarMedia: any[] = []

    // Match media
    if (matchIds.length > 0 && (section === 'all' || section === 'matches')) {
      const batchSize = 500
      for (let i = 0; i < matchIds.length; i += batchSize) {
        const batch = matchIds.slice(i, i + batchSize)
        let q = supabase.from('match_media').select('*').in('match_id', batch)
        if (mediaType) q = q.eq('media_type', mediaType)
        const { data } = await q
        if (data) matchMedia.push(...data)
      }
    }

    // Segment media
    if (segIds.length > 0 && (section === 'all' || section === 'segments')) {
      const batchSize = 500
      for (let i = 0; i < segIds.length; i += batchSize) {
        const batch = segIds.slice(i, i + batchSize)
        let q = supabase.from('segment_media').select('*').in('segment_id', batch)
        if (mediaType) q = q.eq('media_type', mediaType)
        const { data } = await q
        if (data) segmentMedia.push(...data)
      }
    }

    // ★ NEW: Superstar direct media
    if (section === 'all' || section === 'superstar') {
      let smQ = supabase.from('superstar_media').select('*').eq('superstar_id', sid)
      if (mediaType) smQ = smQ.eq('media_type', mediaType)
      smQ = smQ.order('date', { ascending: false, nullsFirst: false })
      const { data: smData } = await smQ
      superstarMedia = smData || []
    }

    // ═══ Step 3: Get show info ═══
    const usedMatchIds = [...new Set(matchMedia.map(m => m.match_id))]
    const usedSegIds = [...new Set(segmentMedia.map(m => m.segment_id))]

    let matchShowMap: Record<number, any> = {}
    let segShowMap: Record<number, any> = {}

    if (usedMatchIds.length > 0) {
      const { data: matches } = await supabase
        .from('matches')
        .select('id, date, show_id')
        .in('id', usedMatchIds.slice(0, 1000))

      if (matches) {
        const showIds = [...new Set(matches.map(m => m.show_id).filter(Boolean))]
        const { data: shows } = showIds.length > 0
          ? await supabase.from('shows').select('id, name, slug, date, show_series_id').in('id', showIds)
          : { data: [] }
        const showMap: Record<number, any> = {}
        ;(shows || []).forEach(s => { showMap[s.id] = s })
        matches.forEach(m => { matchShowMap[m.id] = { date: m.date, show: m.show_id ? showMap[m.show_id] || null : null } })
      }
    }

    if (usedSegIds.length > 0) {
      const { data: segs } = await supabase
        .from('show_segments')
        .select('id, show_id, title, slug')
        .in('id', usedSegIds.slice(0, 1000))

      if (segs) {
        const showIds = [...new Set(segs.map(s => s.show_id).filter(Boolean))]
        const { data: shows } = showIds.length > 0
          ? await supabase.from('shows').select('id, name, slug, date, show_series_id').in('id', showIds)
          : { data: [] }
        const showMap: Record<number, any> = {}
        ;(shows || []).forEach(s => { showMap[s.id] = s })
        segs.forEach(s => { segShowMap[s.id] = { title: s.title, slug: s.slug, show: s.show_id ? showMap[s.show_id] || null : null } })
      }
    }

    // ═══ Step 4: Combine and enrich ═══
    const allItems: any[] = []

    for (const mm of matchMedia) {
      const info = matchShowMap[mm.match_id] || {}
      const show = info.show
      const date = info.date || show?.date || null
      allItems.push({
        id: `m-${mm.id}`, source: 'match',
        media_type: mm.media_type, title: mm.title,
        url: mm.url, thumbnail_url: mm.thumbnail_url,
        date, show: show ? { id: show.id, name: show.name, slug: show.slug, show_series_id: show.show_series_id } : null,
        match_id: mm.match_id, segment_id: null,
      })
    }

    for (const sm of segmentMedia) {
      const info = segShowMap[sm.segment_id] || {}
      const show = info.show
      allItems.push({
        id: `s-${sm.id}`, source: 'segment',
        media_type: sm.media_type, title: sm.title || info.title,
        url: sm.url, thumbnail_url: sm.thumbnail_url,
        date: show?.date || null,
        show: show ? { id: show.id, name: show.name, slug: show.slug, show_series_id: show.show_series_id } : null,
        match_id: null, segment_id: sm.segment_id,
      })
    }

    // ═══ Step 5: Apply filters ═══
    let filtered = allItems
    if (year) filtered = filtered.filter(i => i.date && i.date.startsWith(year))
    if (showSeriesId) {
      const ssid = parseInt(showSeriesId)
      filtered = filtered.filter(i => i.show?.show_series_id === ssid)
    }

    // Sort by date desc
    filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''))

    // Paginate match/segment items
    const total = filtered.length
    const totalPages = Math.ceil(total / PER)
    const offset = (page - 1) * PER
    const paged = filtered.slice(offset, offset + PER)

    // ★ Format superstar_media separately (always return all, small set)
    const formattedSuperstarMedia = superstarMedia.map((sm: any) => ({
      id: `sm-${sm.id}`, source: 'superstar',
      media_type: sm.media_type, title: sm.title,
      url: sm.url, thumbnail_url: sm.thumbnail_url,
      description: sm.description, date: sm.date,
      show: null, match_id: null, segment_id: null,
    }))

    return NextResponse.json({
      items: paged,
      superstarMedia: formattedSuperstarMedia,
      total,
      page,
      totalPages,
      filters: await getFilters(sid),
    })
  } catch (err) {
    console.error('[superstar-gallery]', err)
    return NextResponse.json({ items: [], superstarMedia: [], total: 0, page, totalPages: 0, filters: {} })
  }
}

async function getFilters(sid: number) {
  try {
    const { data: parts } = await supabase
      .from('match_participants')
      .select('match_id')
      .eq('superstar_id', sid)
      .limit(5000)

    const matchIds = (parts || []).map(p => p.match_id)
    if (matchIds.length === 0) return { years: [], showSeries: [] }

    const { data: matches } = await supabase
      .from('matches')
      .select('date, show:shows!matches_show_id_fkey(show_series:show_series_id(id, name, short_name))')
      .in('id', matchIds.slice(0, 2000))

    const years = [...new Set((matches || []).map(m => m.date?.slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a))

    const ssMap = new Map()
    for (const m of (matches || [])) {
      const ss = m.show?.show_series
      if (ss && !ssMap.has(ss.id)) ssMap.set(ss.id, { id: ss.id, name: ss.short_name || ss.name })
    }

    return { years, showSeries: [...ssMap.values()].sort((a, b) => a.name.localeCompare(b.name)) }
  } catch {
    return { years: [], showSeries: [] }
  }
}
