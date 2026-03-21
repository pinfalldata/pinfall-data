// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/show-series-detail?slug=raw&page=1&limit=50
 * Supports filters: year, month, show_type, arena_id, state, city, country
 * Now includes prev/next series for navigation
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')))
  const offset = (page - 1) * limit

  // Filters
  const filterYear = searchParams.get('year')
  const filterMonth = searchParams.get('month')
  const filterShowType = searchParams.get('show_type')
  const filterArenaId = searchParams.get('arena_id')
  const filterState = searchParams.get('state')
  const filterCity = searchParams.get('city')
  const filterCountry = searchParams.get('country')

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

    // Build filtered query
    let query = supabase
      .from('shows')
      .select(`
        id, name, slug, date, venue, city, state_province, country,
        attendance, tv_audience, show_type, episode_number, logo_url,
        arena:arena_id ( id, name )
      `, { count: 'exact' })
      .eq('show_series_id', series.id)

    // Apply filters
    if (filterYear) {
      query = query.gte('date', `${filterYear}-01-01`).lte('date', `${filterYear}-12-31`)
    }
    if (filterMonth && filterYear) {
      const m = filterMonth.padStart(2, '0')
      const lastDay = new Date(parseInt(filterYear), parseInt(filterMonth), 0).getDate()
      query = query.gte('date', `${filterYear}-${m}-01`).lte('date', `${filterYear}-${m}-${lastDay}`)
    }
    if (filterShowType) {
      query = query.eq('show_type', filterShowType)
    }
    if (filterArenaId) {
      query = query.eq('arena_id', parseInt(filterArenaId))
    }
    if (filterState) {
      query = query.eq('state_province', filterState)
    }
    if (filterCity) {
      query = query.eq('city', filterCity)
    }
    if (filterCountry) {
      query = query.eq('country', filterCountry)
    }

    const { data: episodes, error: epError, count } = await query
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (epError) {
      console.error('[show-series-detail] episodes error:', epError)
      return NextResponse.json({ error: 'Failed to fetch episodes', details: epError?.message }, { status: 500 })
    }

    // Get first and last episode dates (unfiltered for stats bar)
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

    // ===== FILTER OPTIONS — distinct values for dropdowns =====
    // Fetch all distinct values for the series (cached, not filtered)
    const [yearsRes, typesRes, arenasRes, statesRes, citiesRes, countriesRes] = await Promise.all([
      supabase.from('shows').select('date').eq('show_series_id', series.id).order('date', { ascending: false }),
      supabase.from('shows').select('show_type').eq('show_series_id', series.id).not('show_type', 'is', null),
      supabase.from('shows').select('arena_id, arena:arena_id ( id, name )').eq('show_series_id', series.id).not('arena_id', 'is', null),
      supabase.from('shows').select('state_province').eq('show_series_id', series.id).not('state_province', 'is', null),
      supabase.from('shows').select('city').eq('show_series_id', series.id).not('city', 'is', null),
      supabase.from('shows').select('country').eq('show_series_id', series.id).not('country', 'is', null),
    ])

    // Extract unique years
    const years = [...new Set((yearsRes.data || []).map(e => e.date?.slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a))
    const showTypes = [...new Set((typesRes.data || []).map(e => e.show_type).filter(Boolean))].sort()
    const arenas = [...new Map((arenasRes.data || []).filter(e => e.arena).map(e => [e.arena.id, { id: e.arena.id, name: e.arena.name }])).values()].sort((a, b) => a.name.localeCompare(b.name))
    const states = [...new Set((statesRes.data || []).map(e => e.state_province).filter(Boolean))].sort()
    const cities = [...new Set((citiesRes.data || []).map(e => e.city).filter(Boolean))].sort()
    const countries = [...new Set((countriesRes.data || []).map(e => e.country).filter(Boolean))].sort()

    // ===== PREV/NEXT SERIES NAVIGATION =====
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
      filterOptions: { years, showTypes, arenas, states, cities, countries },
    })
  } catch (err: any) {
    console.error('[show-series-detail] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 })
  }
}
