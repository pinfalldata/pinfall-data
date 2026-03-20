// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/omg-moments-list?category=extreme&page=1&limit=50&superstarId=5&year=2001
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(60, Math.max(10, parseInt(searchParams.get('limit') || '50')))
  const offset = (page - 1) * limit
  const superstarId = searchParams.get('superstarId')
  const year = searchParams.get('year')
  const search = searchParams.get('search')

  try {
    // If filtering by superstar, get moment IDs from participants table first
    let momentIds: number[] | null = null
    if (superstarId) {
      const { data: participantRows } = await supabase
        .from('omg_moment_participants')
        .select('moment_id')
        .eq('superstar_id', parseInt(superstarId))

      if (!participantRows || participantRows.length === 0) {
        return NextResponse.json({ moments: [], total: 0, page, totalPages: 0, years: [] })
      }
      momentIds = participantRows.map(r => r.moment_id)
    }

    let query = supabase
      .from('omg_moments')
      .select(`
        id, category, title, slug, date, image_url, video_url, sort_order,
        show:show_id ( id, name, slug ),
        match:match_id ( id, slug, show:shows!matches_show_id_fkey ( slug ) ),
        segment:segment_id ( id, slug, show:shows!show_segments_show_id_fkey ( slug ) )
      `, { count: 'exact' })
      .order('date', { ascending: false, nullsFirst: false })

    if (category) query = query.eq('category', category)
    if (year) query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
    if (search) query = query.ilike('title', `%${search}%`)
    if (momentIds) query = query.in('id', momentIds)

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('[omg-moments-list]', error)
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

    // Enrich each moment with participants (superstars)
    const moments = data || []
    const momentIdsForParticipants = moments.map(m => m.id)

    let participantsMap = new Map<number, any[]>()
    if (momentIdsForParticipants.length > 0) {
      const { data: allParticipants } = await supabase
        .from('omg_moment_participants')
        .select('moment_id, superstar:superstar_id ( id, name, slug, photo_url )')
        .in('moment_id', momentIdsForParticipants)

      for (const p of (allParticipants || [])) {
        if (!participantsMap.has(p.moment_id)) participantsMap.set(p.moment_id, [])
        if (p.superstar) participantsMap.get(p.moment_id)!.push(p.superstar)
      }
    }

    const enriched = moments.map(m => ({
      ...m,
      superstars: participantsMap.get(m.id) || [],
    }))

    // Get available years for filter
    let yearsQuery = supabase
      .from('omg_moments')
      .select('date')
      .not('date', 'is', null)
    if (category) yearsQuery = yearsQuery.eq('category', category)
    const { data: dates } = await yearsQuery

    const yearSet = new Set<number>()
    for (const d of (dates || [])) {
      if (d.date) yearSet.add(parseInt(d.date.substring(0, 4)))
    }
    const years = Array.from(yearSet).sort((a, b) => b - a)

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      moments: enriched,
      total,
      page,
      totalPages,
      years,
    })
  } catch (err: any) {
    console.error('[omg-moments-list] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
