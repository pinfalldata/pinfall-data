// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/segment-search?page=1&limit=50&...filters
 * Segment search: year, month, category, superstarId, superstar2Id,
 * showSeriesId, country, city, omgOnly, omgCategory
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')))
  const offset = (page - 1) * limit

  const year = searchParams.get('year')
  const month = searchParams.get('month')
  const category = searchParams.get('category')
  const superstarId = searchParams.get('superstarId')
  const superstar2Id = searchParams.get('superstar2Id')
  const showSeriesId = searchParams.get('showSeriesId')
  const country = searchParams.get('country')
  const city = searchParams.get('city')
  const omgOnly = searchParams.get('omgOnly') === 'true'
  const omgCategory = searchParams.get('omgCategory')

  try {
    // === Step 1: If superstar filter, get segment IDs ===
    let segmentIdFilter: number[] | null = null

    if (superstarId) {
      const sid = parseInt(superstarId)
      let query1 = supabase
        .from('show_segment_participants')
        .select('segment_id')
        .eq('superstar_id', sid)

      const { data: p1 } = await query1
      if (!p1 || p1.length === 0) {
        return NextResponse.json({ segments: [], total: 0, page, totalPages: 0 })
      }
      segmentIdFilter = p1.map(r => r.segment_id)

      // Superstar 2 — intersect
      if (superstar2Id) {
        const { data: p2 } = await supabase
          .from('show_segment_participants')
          .select('segment_id')
          .eq('superstar_id', parseInt(superstar2Id))
        if (p2) {
          const set2 = new Set(p2.map(r => r.segment_id))
          segmentIdFilter = segmentIdFilter.filter(id => set2.has(id))
        }
        if (segmentIdFilter.length === 0) {
          return NextResponse.json({ segments: [], total: 0, page, totalPages: 0 })
        }
      }
    }

    // === Step 2: If OMG filter, get segment IDs ===
    let omgSegmentIds: Set<number> | null = null
    if (omgOnly || omgCategory) {
      let omgQ = supabase.from('omg_moments').select('segment_id').not('segment_id', 'is', null)
      if (omgCategory) omgQ = omgQ.eq('category', omgCategory)
      const { data: omgData } = await omgQ
      omgSegmentIds = new Set((omgData || []).map(o => o.segment_id).filter(Boolean))

      if (segmentIdFilter) {
        segmentIdFilter = segmentIdFilter.filter(id => omgSegmentIds!.has(id))
      } else {
        segmentIdFilter = [...omgSegmentIds]
      }

      if (segmentIdFilter.length === 0) {
        return NextResponse.json({ segments: [], total: 0, page, totalPages: 0 })
      }
    }

    // === Step 3: Build main query ===
    // We query segments separately then enrich, because nested joins on shows can fail
    let query = supabase
      .from('show_segments')
      .select(`
        id, slug, title, category, image_url, duration_seconds, rating, sort_order,
        display_order, is_spoiler, show_id, created_at
      `, { count: 'exact' })

    // Apply segment ID filter
    if (segmentIdFilter) {
      const MAX_IN = 2000
      query = query.in('id', segmentIdFilter.slice(0, MAX_IN))
    }

    // Category
    if (category) query = query.eq('category', category)

    // Sort
    query = query.order('created_at', { ascending: false })

    // Pagination
    query = query.range(offset, offset + limit - 1)

    const { data: segments, error, count } = await query

    if (error) {
      console.error('[segment-search] query error:', error)
      return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 })
    }

    if (!segments || segments.length === 0) {
      return NextResponse.json({ segments: [], total: count || 0, page, totalPages: Math.ceil((count || 0) / limit) })
    }

    // === Step 4: Enrich with shows ===
    const showIds = [...new Set(segments.map(s => s.show_id).filter(Boolean))]
    let showMap: Record<number, any> = {}
    if (showIds.length > 0) {
      const batchSize = 300
      for (let i = 0; i < showIds.length; i += batchSize) {
        const batch = showIds.slice(i, i + batchSize)
        const { data: shows } = await supabase
          .from('shows')
          .select('id, name, slug, date, city, state_province, country, show_series_id, show_series:show_series_id(id, name, short_name, logo_url)')
          .in('id', batch)
        for (const s of (shows || [])) showMap[s.id] = s
      }
    }

    // === Step 5: Post-filter by show properties (year, month, show series, country, city) ===
    let filtered = segments.map((s: any) => ({
      ...s,
      show: showMap[s.show_id] || null,
    }))

    if (year) {
      if (month) {
        const m = month.padStart(2, '0')
        const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
        const startDate = `${year}-${m}-01`
        const endDate = `${year}-${m}-${lastDay}`
        filtered = filtered.filter(s => s.show?.date && s.show.date >= startDate && s.show.date <= endDate)
      } else {
        filtered = filtered.filter(s => s.show?.date && s.show.date.startsWith(year))
      }
    }

    if (showSeriesId) {
      filtered = filtered.filter(s => s.show?.show_series_id === parseInt(showSeriesId))
    }
    if (country) {
      filtered = filtered.filter(s => s.show?.country?.toLowerCase().includes(country.toLowerCase()))
    }
    if (city) {
      filtered = filtered.filter(s => s.show?.city?.toLowerCase().includes(city.toLowerCase()))
    }

    // === Step 6: Enrich with participants ===
    const segIds = filtered.map(s => s.id)
    let partMap: Record<number, any[]> = {}
    if (segIds.length > 0) {
      const batchSize = 300
      for (let i = 0; i < segIds.length; i += batchSize) {
        const batch = segIds.slice(i, i + batchSize)
        const { data: parts } = await supabase
          .from('show_segment_participants')
          .select('segment_id, role, superstar:superstar_id(id, name, slug, photo_url)')
          .in('segment_id', batch)
          .order('sort_order', { ascending: true })
        for (const p of (parts || [])) {
          if (!partMap[p.segment_id]) partMap[p.segment_id] = []
          if (p.superstar) partMap[p.segment_id].push({ ...p.superstar, role: p.role })
        }
      }
    }

    // === Step 7: Enrich with OMG moments ===
    let omgMap: Record<number, any> = {}
    if (segIds.length > 0) {
      const batchSize = 300
      for (let i = 0; i < segIds.length; i += batchSize) {
        const batch = segIds.slice(i, i + batchSize)
        const { data: omgs } = await supabase
          .from('omg_moments')
          .select('id, title, category, segment_id')
          .in('segment_id', batch)
        for (const o of (omgs || [])) {
          if (o.segment_id) omgMap[o.segment_id] = o
        }
      }
    }

    const enriched = filtered.map(s => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      category: s.category,
      image_url: s.image_url,
      duration_seconds: s.duration_seconds,
      rating: s.rating,
      show: s.show ? {
        id: s.show.id,
        name: s.show.name,
        slug: s.show.slug,
        date: s.show.date,
        city: s.show.city,
        country: s.show.country,
        show_series: s.show.show_series,
      } : null,
      participants: partMap[s.id] || [],
      omg: omgMap[s.id] || null,
    }))

    const total = count || 0

    return NextResponse.json({
      segments: enriched,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('[segment-search] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
