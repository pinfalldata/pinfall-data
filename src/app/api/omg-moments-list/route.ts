// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/omg-moments-list?category=extreme&page=1&limit=30&superstarId=5&year=2001
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(60, Math.max(10, parseInt(searchParams.get('limit') || '30')))
  const offset = (page - 1) * limit
  const superstarId = searchParams.get('superstarId')
  const year = searchParams.get('year')
  const search = searchParams.get('search')

  try {
    let query = supabase
      .from('omg_moments')
      .select(`
        id, category, title, slug, date, description_md, image_url, video_url, sort_order,
        show:show_id ( id, name, slug ),
        match:match_id ( id, slug, show:show_id ( slug ) ),
        segment:segment_id ( id, slug, show:show_id ( slug ) ),
        superstar:superstar_id ( id, name, slug, photo_url )
      `, { count: 'exact' })
      .order('sort_order', { ascending: true })
      .order('date', { ascending: false })

    if (category) query = query.eq('category', category)
    if (superstarId) query = query.eq('superstar_id', parseInt(superstarId))
    if (year) query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
    if (search) query = query.ilike('title', `%${search}%`)

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      console.error('[omg-moments-list]', error)
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

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
      moments: data || [],
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
