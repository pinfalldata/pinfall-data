// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/show-series-detail?slug=raw&page=1&limit=50
 * Returns show series info + paginated list of episodes
 * Now includes prev/next series for navigation
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')))
  const offset = (page - 1) * limit

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  try {
    // Fetch series info
    const { data: series, error: seriesError } = await supabase
      .from('show_series')
      .select('*')
      .eq('slug', slug)
      .single()

    if (seriesError || !series) {
      console.error('[show-series-detail] series error:', seriesError)
      return NextResponse.json({ error: 'Show series not found', details: seriesError?.message }, { status: 404 })
    }

    // Fetch paginated episodes
    const { data: episodes, error: epError, count } = await supabase
      .from('shows')
      .select(`
        id, name, slug, date, venue, city, state_province, country,
        attendance, tv_audience, show_type, episode_number, logo_url,
        arena:arena_id ( id, name )
      `, { count: 'exact' })
      .eq('show_series_id', series.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (epError) {
      console.error('[show-series-detail] episodes error:', epError)
      return NextResponse.json({ error: 'Failed to fetch episodes', details: epError?.message }, { status: 500 })
    }

    // Get first and last episode dates
    let firstDate = series.first_episode_date
    let lastDate = null

    const [firstEpRes, lastEpRes] = await Promise.all([
      !firstDate ? supabase
        .from('shows')
        .select('date')
        .eq('show_series_id', series.id)
        .order('date', { ascending: true })
        .limit(1)
        .single() : Promise.resolve({ data: null }),
      supabase
        .from('shows')
        .select('date')
        .eq('show_series_id', series.id)
        .order('date', { ascending: false })
        .limit(1)
        .single(),
    ])

    if (!firstDate && firstEpRes.data) firstDate = firstEpRes.data.date
    lastDate = lastEpRes.data?.date || null

    // ===== PREV/NEXT SERIES NAVIGATION =====
    // Get all series sorted by sort_order then name
    const { data: allSeries } = await supabase
      .from('show_series')
      .select('id, name, slug, short_name, logo_url, sort_order')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    let prevSeries = null
    let nextSeries = null
    if (allSeries && allSeries.length > 1) {
      const idx = allSeries.findIndex(s => s.id === series.id)
      if (idx > 0) {
        prevSeries = { slug: allSeries[idx - 1].slug, name: allSeries[idx - 1].name, short_name: allSeries[idx - 1].short_name, logo_url: allSeries[idx - 1].logo_url }
      }
      if (idx >= 0 && idx < allSeries.length - 1) {
        nextSeries = { slug: allSeries[idx + 1].slug, name: allSeries[idx + 1].name, short_name: allSeries[idx + 1].short_name, logo_url: allSeries[idx + 1].logo_url }
      }
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      series: {
        ...series,
        first_episode_date: firstDate,
      },
      episodes: episodes || [],
      total,
      page,
      limit,
      totalPages,
      firstDate,
      lastDate,
      prevSeries,
      nextSeries,
    })
  } catch (err: any) {
    console.error('[show-series-detail] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 })
  }
}
