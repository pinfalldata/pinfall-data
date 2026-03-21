// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  try {
    const { data: obj } = await supabase.from('match_objects').select('*').eq('slug', slug).single()
    if (!obj) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: usages } = await supabase.from('match_object_usage')
      .select('id, notes, match_id, segment_id, used_by_superstar_id')
      .eq('object_id', obj.id)

    const matchIds = [...new Set((usages || []).map(u => u.match_id).filter(Boolean))]
    const segIds = [...new Set((usages || []).map(u => u.segment_id).filter(Boolean))]
    const starIds = [...new Set((usages || []).map(u => u.used_by_superstar_id).filter(Boolean))]

    // Fetch matches + participants
    let matchMap = new Map()
    if (matchIds.length > 0) {
      const { data: matches } = await supabase.from('matches')
        .select('id, slug, date, match_type:match_types(name), show:shows(name, slug)')
        .in('id', matchIds.slice(0, 300))
      for (const m of (matches || [])) matchMap.set(m.id, m)

      const { data: parts } = await supabase.from('match_participants')
        .select('match_id, is_winner, superstar:superstars(id, name, slug, photo_url)')
        .in('match_id', matchIds.slice(0, 300))
      const partMap = new Map()
      for (const p of (parts || [])) {
        if (!partMap.has(p.match_id)) partMap.set(p.match_id, [])
        if (p.superstar) partMap.get(p.match_id).push({ ...p.superstar, is_winner: p.is_winner })
      }
      for (const [mid, m] of matchMap) m._participants = partMap.get(mid) || []
    }

    // Fetch segments
    let segMap = new Map()
    if (segIds.length > 0) {
      const { data: segs } = await supabase.from('show_segments')
        .select('id, slug, title, category, show:shows(name, slug)')
        .in('id', segIds.slice(0, 300))
      for (const s of (segs || [])) segMap.set(s.id, s)
    }

    // Fetch superstars
    let starMap = new Map()
    if (starIds.length > 0) {
      const { data: stars } = await supabase.from('superstars')
        .select('id, name, slug, photo_url').in('id', starIds.slice(0, 200))
      for (const s of (stars || [])) starMap.set(s.id, s)
    }

    // Build enriched usage list
    const matchUsages = (usages || []).map(u => {
      const match = matchMap.get(u.match_id)
      const seg = segMap.get(u.segment_id)
      const star = starMap.get(u.used_by_superstar_id)
      return {
        id: u.id, notes: u.notes,
        match: match ? {
          id: match.id, slug: match.slug, date: match.date,
          match_type: match.match_type?.name, show_name: match.show?.name, show_slug: match.show?.slug,
          participants: (match._participants || []).slice(0, 6).map((p: any) => ({ id: p.id, name: p.name, slug: p.slug, photo_url: p.photo_url, is_winner: p.is_winner })),
        } : null,
        segment: seg ? {
          id: seg.id, slug: seg.slug, title: seg.title, category: seg.category,
          show_name: seg.show?.name, show_slug: seg.show?.slug,
        } : null,
        used_by: star ? { id: star.id, name: star.name, slug: star.slug, photo_url: star.photo_url } : null,
      }
    }).sort((a, b) => (b.match?.date || '').localeCompare(a.match?.date || ''))

    // Build superstar usage counts
    const starCountMap = new Map()
    for (const u of (usages || [])) {
      if (u.used_by_superstar_id) starCountMap.set(u.used_by_superstar_id, (starCountMap.get(u.used_by_superstar_id) || 0) + 1)
    }
    const superstarUsages = [...starCountMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => { const s = starMap.get(id); return s ? { ...s, count } : null })
      .filter(Boolean)

    return NextResponse.json({ object: obj, total_uses: (usages || []).length, matches: matchUsages, superstars: superstarUsages })
  } catch (err) {
    console.error('[object-detail]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
