// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sid = searchParams.get('superstarId')
  if (!sid) return NextResponse.json({ objects: [] })

  try {
    // Get all usages by this superstar
    const { data: usages } = await supabase.from('match_object_usage')
      .select('id, notes, match_id, segment_id, object_id')
      .eq('used_by_superstar_id', parseInt(sid))

    if (!usages || usages.length === 0) return NextResponse.json({ objects: [] })

    // Get unique object IDs
    const objectIds = [...new Set(usages.map(u => u.object_id))]
    const { data: objects } = await supabase.from('match_objects')
      .select('id, name, slug, image_url')
      .in('id', objectIds)

    const objMap = new Map((objects || []).map(o => [o.id, o]))

    // Get match details
    const matchIds = [...new Set(usages.map(u => u.match_id).filter(Boolean))]
    let matchMap = new Map()
    if (matchIds.length > 0) {
      const { data: matches } = await supabase.from('matches')
        .select('id, slug, date, match_type:match_types(name), show:shows(name, slug)')
        .in('id', matchIds.slice(0, 300))
      for (const m of (matches || [])) matchMap.set(m.id, m)

      // Get participants for these matches
      const { data: parts } = await supabase.from('match_participants')
        .select('match_id, superstar:superstars(id, name, slug, photo_url)')
        .in('match_id', matchIds.slice(0, 300))
      const partMap = new Map()
      for (const p of (parts || [])) {
        if (!partMap.has(p.match_id)) partMap.set(p.match_id, [])
        if (p.superstar) partMap.get(p.match_id).push(p.superstar)
      }
      for (const [mid, m] of matchMap) m._participants = partMap.get(mid) || []
    }

    // Get segment details
    const segIds = [...new Set(usages.map(u => u.segment_id).filter(Boolean))]
    let segMap = new Map()
    if (segIds.length > 0) {
      const { data: segs } = await supabase.from('show_segments')
        .select('id, slug, title, category, show:shows(name, slug)')
        .in('id', segIds.slice(0, 300))
      for (const s of (segs || [])) segMap.set(s.id, s)
    }

    // Group by object
    const groupMap = new Map()
    for (const u of usages) {
      if (!groupMap.has(u.object_id)) groupMap.set(u.object_id, [])
      const match = matchMap.get(u.match_id)
      const seg = segMap.get(u.segment_id)
      groupMap.get(u.object_id).push({
        id: u.id, notes: u.notes,
        match: match ? {
          id: match.id, slug: match.slug, date: match.date,
          match_type: match.match_type?.name, show_name: match.show?.name, show_slug: match.show?.slug,
          participants: (match._participants || []).slice(0, 6).map((p: any) => ({ id: p.id, name: p.name, slug: p.slug, photo_url: p.photo_url })),
        } : null,
        segment: seg ? {
          id: seg.id, slug: seg.slug, title: seg.title, category: seg.category,
          show_name: seg.show?.name, show_slug: seg.show?.slug,
        } : null,
      })
    }

    const result = objectIds.map(oid => {
      const obj = objMap.get(oid)
      const uses = groupMap.get(oid) || []
      return obj ? {
        ...obj,
        usage_count: uses.length,
        usages: uses.sort((a: any, b: any) => (b.match?.date || '').localeCompare(a.match?.date || '')),
      } : null
    }).filter(Boolean).sort((a: any, b: any) => b.usage_count - a.usage_count)

    return NextResponse.json({ objects: result })
  } catch (err) {
    console.error('[superstar-objects]', err)
    return NextResponse.json({ objects: [] })
  }
}
