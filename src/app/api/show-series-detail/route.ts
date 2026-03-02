// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/show-series-detail?slug=raw&page=1&limit=50
 * Returns show series info + paginated list of episodes
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
      .select('id, name, slug, short_name, logo_url, banner_url, description, first_episode_date, is_active, is_ple')
      .eq('slug', slug)
      .single()

    if (seriesError || !series) {
      return NextResponse.json({ error: 'Show series not found' }, { status: 404 })
    }

    // Fetch paginated episodes
    const { data: episodes, error: epError, count } = await supabase
      .from('shows')
      .select(`
        id, name, slug, date, venue, city, state_province, country,
        attendance, tv_rating, show_type, episode_number
      `, { count: 'exact' })
      .eq('show_series_id', series.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (epError) {
      console.error('[show-series-detail] episodes error:', epError)
      return NextResponse.json({ error: 'Failed to fetch episodes' }, { status: 500 })
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      series,
      episodes: episodes || [],
      total,
      page,
      limit,
      totalPages,
    })
  } catch (err) {
    console.error('[show-series-detail] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
