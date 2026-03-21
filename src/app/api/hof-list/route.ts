// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 40
  const offset = (page - 1) * limit
  const year = searchParams.get('year')
  const search = searchParams.get('search')
  const classFilter = searchParams.get('class')
  const sort = searchParams.get('sort') || 'newest'

  try {
    let query = supabase.from('hall_of_fame')
      .select('*, superstar:superstar_id(id, name, slug, photo_url)', { count: 'exact' })

    if (year) query = query.eq('induction_year', parseInt(year))
    if (classFilter) query = query.eq('class', classFilter)
    if (search) query = query.ilike('inductee_name', `%${search}%`)

    if (sort === 'oldest') query = query.order('induction_year', { ascending: true })
    else if (sort === 'alpha') query = query.order('inductee_name', { ascending: true })
    else query = query.order('induction_year', { ascending: false })

    query = query.range(offset, offset + limit - 1)

    const { data, count, error } = await query
    if (error) { console.error('[hof-list]', error); return NextResponse.json({ items: [], total: 0, page, totalPages: 0 }) }

    // Get filter options
    const { data: allYears } = await supabase.from('hall_of_fame').select('induction_year').order('induction_year', { ascending: false })
    const { data: allClasses } = await supabase.from('hall_of_fame').select('class').not('class', 'is', null)

    const years = [...new Set((allYears || []).map(h => h.induction_year))].sort((a, b) => b - a)
    const classes = [...new Set((allClasses || []).map(h => h.class).filter(Boolean))].sort()

    return NextResponse.json({
      items: data || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
      filterOptions: { years, classes },
    })
  } catch (err) {
    console.error('[hof-list]', err)
    return NextResponse.json({ items: [], total: 0 })
  }
}
