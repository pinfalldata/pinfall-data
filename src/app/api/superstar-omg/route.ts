// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

/**
 * GET /api/superstar-omg?superstarId=123&page=1&year=2024&category=extreme&otherSuperstarId=456
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const superstarId = searchParams.get('superstarId')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 30
  const offset = (page - 1) * limit
  const filterYear = searchParams.get('year')
  const filterCategory = searchParams.get('category')
  const filterOtherSuperstar = searchParams.get('otherSuperstarId')

  if (!superstarId) return NextResponse.json({ error: 'superstarId required' }, { status: 400 })

  const sid = parseInt(superstarId)

  try {
    // Get moment IDs where this superstar participates
    const { data: participations } = await supabase
      .from('omg_moment_participants')
      .select('moment_id')
      .eq('superstar_id', sid)

    // Also get moments where superstar_id is directly on omg_moments
    const { data: directMoments } = await supabase
      .from('omg_moments')
      .select('id')
      .eq('superstar_id', sid)

    const allMomentIds = new Set<number>()
    for (const p of (participations || [])) allMomentIds.add(p.moment_id)
    for (const m of (directMoments || [])) allMomentIds.add(m.id)

    if (allMomentIds.size === 0) {
      return NextResponse.json({ moments: [], total: 0, page, totalPages: 0 })
    }

    let momentIds = Array.from(allMomentIds)

    // If filtering by other superstar, intersect
    if (filterOtherSuperstar) {
      const otherId = parseInt(filterOtherSuperstar)
      const { data: otherParts } = await supabase
        .from('omg_moment_participants')
        .select('moment_id')
        .eq('superstar_id', otherId)
      const { data: otherDirect } = await supabase
        .from('omg_moments')
        .select('id')
        .eq('superstar_id', otherId)

      const otherSet = new Set<number>()
      for (const p of (otherParts || [])) otherSet.add(p.moment_id)
      for (const m of (otherDirect || [])) otherSet.add(m.id)

      momentIds = momentIds.filter(id => otherSet.has(id))
      if (momentIds.length === 0) {
        return NextResponse.json({ moments: [], total: 0, page, totalPages: 0 })
      }
    }

    // Build query for actual moments
    let query = supabase
      .from('omg_moments')
      .select('id, title, slug, category, date, image_url, description_md, show_id, match_id, segment_id', { count: 'exact' })
      .in('id', momentIds)

    if (filterCategory) {
      query = query.eq('category', filterCategory)
    }
    if (filterYear) {
      query = query.gte('date', `${filterYear}-01-01`).lte('date', `${filterYear}-12-31`)
    }

    const { data: moments, count, error } = await query
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('[superstar-omg]', error)
      return NextResponse.json({ moments: [], total: 0, page, totalPages: 0 })
    }

    // Enrich with show info
    const showIds = [...new Set((moments || []).map(m => m.show_id).filter(Boolean))]
    let showMap: Record<number, any> = {}
    if (showIds.length > 0) {
      const { data: shows } = await supabase
        .from('shows')
        .select('id, name, slug, date')
        .in('id', showIds)
      for (const s of (shows || [])) showMap[s.id] = s
    }

    // Enrich with participants
    const mIds = (moments || []).map(m => m.id)
    let participantMap: Record<number, any[]> = {}
    if (mIds.length > 0) {
      const { data: parts } = await supabase
        .from('omg_moment_participants')
        .select('moment_id, superstar:superstar_id ( id, name, slug, photo_url )')
        .in('moment_id', mIds)
      for (const p of (parts || [])) {
        if (!participantMap[p.moment_id]) participantMap[p.moment_id] = []
        if (p.superstar) participantMap[p.moment_id].push(p.superstar)
      }
    }

    const enriched = (moments || []).map(m => ({
      ...m,
      show: m.show_id ? showMap[m.show_id] || null : null,
      participants: participantMap[m.id] || [],
    }))

    const total = count || 0

    return NextResponse.json({
      moments: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('[superstar-omg]', err)
    return NextResponse.json({ moments: [], total: 0, page, totalPages: 0 })
  }
}
