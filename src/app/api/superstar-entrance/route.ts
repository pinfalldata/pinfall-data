// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

/**
 * GET /api/superstar-entrance?superstarId=123&category=ring&page=1
 * Returns entrance themes + attires (paginated by category)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('superstarId')
  const category = searchParams.get('category') || '' // ring | entrance | backstage
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 12

  if (!id) return NextResponse.json({ error: 'superstarId required' }, { status: 400 })
  const sid = parseInt(id)

  try {
    // Always fetch themes (no pagination — usually few entries)
    const { data: themes } = await supabase
      .from('entrance_themes')
      .select('id, song_name, artist, start_date, end_date, video_url, is_current')
      .eq('superstar_id', sid)
      .order('is_current', { ascending: false })
      .order('start_date', { ascending: false, nullsFirst: true })

    // Fetch attire counts per category
    const [
      { count: ringCount },
      { count: entranceCount },
      { count: backstageCount },
    ] = await Promise.all([
      supabase.from('superstar_attires').select('*', { count: 'exact', head: true }).eq('superstar_id', sid).eq('category', 'ring'),
      supabase.from('superstar_attires').select('*', { count: 'exact', head: true }).eq('superstar_id', sid).eq('category', 'entrance'),
      supabase.from('superstar_attires').select('*', { count: 'exact', head: true }).eq('superstar_id', sid).eq('category', 'backstage'),
    ])

    // If a category is requested, fetch paginated attires
    let attires: any[] = []
    let attireTotal = 0
    let attireTotalPages = 0

    if (category) {
      const offset = (page - 1) * limit
      const { data: attiresData, count } = await supabase
        .from('superstar_attires')
        .select('id, image_url, video_url, name, date, match_id, segment_id, description, category', { count: 'exact' })
        .eq('superstar_id', sid)
        .eq('category', category)
        .order('date', { ascending: false, nullsFirst: true })
        .range(offset, offset + limit - 1)

      attireTotal = count || 0
      attireTotalPages = Math.ceil(attireTotal / limit)

      // Enrich with match/segment/show info (separate queries — no nested joins)
      const raw = attiresData || []
      const matchIds = [...new Set(raw.filter(a => a.match_id).map(a => a.match_id))]
      const segmentIds = [...new Set(raw.filter(a => a.segment_id).map(a => a.segment_id))]

      let matchMap: Record<number, any> = {}
      let segmentMap: Record<number, any> = {}

      if (matchIds.length > 0) {
        const { data: matches } = await supabase
          .from('matches')
          .select('id, show_id')
          .in('id', matchIds)
        if (matches) {
          const showIds = [...new Set(matches.map(m => m.show_id).filter(Boolean))]
          const { data: shows } = showIds.length > 0
            ? await supabase.from('shows').select('id, name, slug, date').in('id', showIds)
            : { data: [] }
          const showMap: Record<number, any> = {}
          ;(shows || []).forEach(s => { showMap[s.id] = s })
          matches.forEach(m => {
            matchMap[m.id] = { id: m.id, show: m.show_id ? showMap[m.show_id] || null : null }
          })
        }
      }

      if (segmentIds.length > 0) {
        const { data: segments } = await supabase
          .from('show_segments')
          .select('id, slug, title, show_id')
          .in('id', segmentIds)
        if (segments) {
          const showIds = [...new Set(segments.map(s => s.show_id).filter(Boolean))]
          const { data: shows } = showIds.length > 0
            ? await supabase.from('shows').select('id, name, slug, date').in('id', showIds)
            : { data: [] }
          const showMap: Record<number, any> = {}
          ;(shows || []).forEach(s => { showMap[s.id] = s })
          segments.forEach(s => {
            segmentMap[s.id] = { id: s.id, slug: s.slug, title: s.title, show: s.show_id ? showMap[s.show_id] || null : null }
          })
        }
      }

      attires = raw.map(a => ({
        ...a,
        match: a.match_id ? matchMap[a.match_id] || null : null,
        segment: a.segment_id ? segmentMap[a.segment_id] || null : null,
      }))
    }

    return NextResponse.json({
      themes: themes || [],
      attires,
      attireTotal,
      attirePage: page,
      attireTotalPages,
      counts: {
        ring: ringCount || 0,
        entrance: entranceCount || 0,
        backstage: backstageCount || 0,
      },
    })
  } catch (err) {
    console.error('[superstar-entrance]', err)
    return NextResponse.json({ themes: [], attires: [], attireTotal: 0, attirePage: 1, attireTotalPages: 0, counts: { ring: 0, entrance: 0, backstage: 0 } })
  }
}
