// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/ple-list?series=wrestlemania (optional filter)
 * Returns all PLEs grouped by ppv_series_name, sorted chronologically within each series
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const seriesFilter = searchParams.get('series')

  try {
    let query = supabase
      .from('shows')
      .select('id, name, slug, date, ppv_series_name, logo_url, banner_url, city, state_province, country, venue, attendance, rating')
      .eq('show_type', 'ppv')
      .order('date', { ascending: false })

    if (seriesFilter) {
      query = query.eq('ppv_series_name', seriesFilter)
    }

    const { data: shows, error } = await query

    if (error) {
      console.error('[ple-list] error:', error)
      return NextResponse.json({ error: 'Failed to fetch PLEs' }, { status: 500 })
    }

    // Group by ppv_series_name
    const seriesMap = new Map<string, any[]>()
    const seriesOrder: string[] = []

    for (const show of (shows || [])) {
      const name = show.ppv_series_name || 'Other'
      if (!seriesMap.has(name)) {
        seriesMap.set(name, [])
        seriesOrder.push(name)
      }
      seriesMap.get(name)!.push({
        id: show.id,
        name: show.name,
        slug: show.slug,
        date: show.date,
        year: show.date ? new Date(show.date).getFullYear() : null,
        logo_url: show.logo_url,
        banner_url: show.banner_url,
        city: show.city,
        country: show.country,
        venue: show.venue,
        attendance: show.attendance,
        rating: show.rating,
      })
    }

    // Sort each series chronologically (newest first already from query)
    // Sort series by most events first (WrestleMania, Royal Rumble, etc.)
    const sortedSeries = seriesOrder
      .map(name => ({
        name,
        events: seriesMap.get(name) || [],
        count: seriesMap.get(name)?.length || 0,
        latest_year: seriesMap.get(name)?.[0]?.year || 0,
        earliest_year: seriesMap.get(name)?.[seriesMap.get(name)!.length - 1]?.year || 0,
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({
      series: sortedSeries,
      allSeriesNames: seriesOrder.sort(),
      totalPLEs: shows?.length || 0,
    })
  } catch (err) {
    console.error('[ple-list] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
