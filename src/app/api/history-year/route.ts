// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/history-year?year=1985
 * Returns all content blocks for a specific year
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const year = searchParams.get('year')
  if (!year) return NextResponse.json({ error: 'year is required' }, { status: 400 })

  try {
    const { data: historyYear } = await supabase
      .from('history_years')
      .select(`
        id, year, title, summary, cover_image_url, color_accent
      `)
      .eq('year', parseInt(year))
      .single()

    if (!historyYear) {
      return NextResponse.json({ year: null, blocks: [] })
    }

    const { data: blocks } = await supabase
      .from('history_year_blocks')
      .select('*')
      .eq('history_year_id', historyYear.id)
      .order('sort_order', { ascending: true })

    // Also get any wwe_history_events for this year as supplementary data
    const { data: events } = await supabase
      .from('wwe_history_events')
      .select('id, year, date, title, description_md, image_url, video_url, importance')
      .eq('year', parseInt(year))
      .order('sort_order', { ascending: true })

    // Get key stats for this year
    const y = parseInt(year)
    const { count: matchCount } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('date', `${y}-01-01`)
      .lte('date', `${y}-12-31`)

    const { count: showCount } = await supabase
      .from('shows')
      .select('*', { count: 'exact', head: true })
      .gte('date', `${y}-01-01`)
      .lte('date', `${y}-12-31`)

    const { count: titleChanges } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .gte('date', `${y}-01-01`)
      .lte('date', `${y}-12-31`)
      .eq('is_title_change', true)

    return NextResponse.json({
      year: historyYear,
      blocks: blocks || [],
      events: events || [],
      stats: {
        matches: matchCount || 0,
        shows: showCount || 0,
        titleChanges: titleChanges || 0,
      }
    })
  } catch (err) {
    console.error('[history-year]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
