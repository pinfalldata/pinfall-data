// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'Missing slug' }, { status: 400 })

  try {
    const { data: obj } = await supabase.from('match_objects')
      .select('*')
      .eq('slug', slug)
      .single()

    if (!obj) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Get all usages with match and superstar info
    const { data: usages } = await supabase.from('match_object_usage')
      .select('id, notes, match_id, used_by_superstar_id')
      .eq('object_id', obj.id)

    // Get unique match IDs and superstar IDs
    const matchIds = [...new Set((usages || []).map(u => u.match_id).filter(Boolean))]
    const starIds = [...new Set((usages || []).map(u => u.used_by_superstar_id).filter(Boolean))]

    // Fetch matches
    let matchMap = new Map()
    if (matchIds.length > 0) {
      const { data: matches } = await supabase.from('matches')
        .select('id, slug, date, match_type:match_types(name), show:shows(name, slug)')
        .in('id', matchIds.slice(0, 200))
      for (const m of (matches || [])) matchMap.set(m.id, m)
    }

    // Fetch superstars
    let starMap = new Map()
    if (starIds.length > 0) {
      const { data: stars } = await supabase.from('superstars')
        .select('id, name, slug, photo_url')
        .in('id', starIds.slice(0, 200))
      for (const s of (stars || [])) starMap.set(s.id, s)
    }

    // Build enriched usage list (matches tab)
    const matchUsages = (usages || []).map(u => {
      const match = matchMap.get(u.match_id)
      const star = starMap.get(u.used_by_superstar_id)
      return {
        id: u.id,
        notes: u.notes,
        match: match ? { id: match.id, slug: match.slug, date: match.date, match_type: match.match_type?.name, show_name: match.show?.name, show_slug: match.show?.slug } : null,
        used_by: star ? { id: star.id, name: star.name, slug: star.slug, photo_url: star.photo_url } : null,
      }
    }).sort((a, b) => (b.match?.date || '').localeCompare(a.match?.date || ''))

    // Build superstar usage counts (superstars tab)
    const starCountMap = new Map<number, number>()
    for (const u of (usages || [])) {
      if (u.used_by_superstar_id) starCountMap.set(u.used_by_superstar_id, (starCountMap.get(u.used_by_superstar_id) || 0) + 1)
    }
    const superstarUsages = [...starCountMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id, count]) => {
        const s = starMap.get(id)
        return s ? { id: s.id, name: s.name, slug: s.slug, photo_url: s.photo_url, count } : null
      })
      .filter(Boolean)

    return NextResponse.json({
      object: obj,
      total_uses: (usages || []).length,
      matches: matchUsages,
      superstars: superstarUsages,
    })
  } catch (err) {
    console.error('[object-detail]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
