// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/calendar-shows?year=2024&month=3&showSeriesIds=1,2,3
 * Returns shows for a given month, optionally filtered by show series.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1))
  const showSeriesFilter = searchParams.get('showSeriesIds')

  const m = String(month).padStart(2, '0')
  const lastDay = new Date(year, month, 0).getDate()
  const startDate = `${year}-${m}-01`
  const endDate = `${year}-${m}-${lastDay}`

  try {
    let query = supabase
      .from('shows')
      .select('id, name, slug, date, show_series:show_series_id(id, name, short_name, logo_url)')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true })

    if (showSeriesFilter) {
      const ids = showSeriesFilter.split(',').map(Number).filter(n => !isNaN(n))
      if (ids.length > 0) {
        query = query.in('show_series_id', ids)
      }
    }

    const { data, error } = await query
    if (error) {
      console.error('[calendar-shows]', error)
      return NextResponse.json({ shows: [] })
    }

    // Also fetch available show series for filter
    const { data: allSeries } = await supabase
      .from('show_series')
      .select('id, name, short_name, logo_url')
      .order('name', { ascending: true })

    return NextResponse.json({
      shows: data || [],
      showSeries: allSeries || [],
    })
  } catch (err) {
    console.error('[calendar-shows]', err)
    return NextResponse.json({ shows: [], showSeries: [] })
  }
}
