// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit
  const year = searchParams.get('year')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sort = searchParams.get('sort') || 'newest'
  const superstarId = searchParams.get('superstarId')

  try {
    let query = supabase.from('year_end_awards')
      .select('*, winner:winner_id(id, name, slug, photo_url)', { count: 'exact' })

    if (year) query = query.eq('year', parseInt(year))
    if (category) query = query.eq('category', category)
    if (search) query = query.or(`winner_name.ilike.%${search}%,category.ilike.%${search}%`)
    if (superstarId) query = query.eq('winner_id', parseInt(superstarId))

    if (sort === 'oldest') query = query.order('year', { ascending: true })
    else if (sort === 'alpha') query = query.order('winner_name', { ascending: true })
    else query = query.order('year', { ascending: false })

    query = query.range(offset, offset + limit - 1)

    const { data, count } = await query

    const { data: allYears } = await supabase.from('year_end_awards').select('year').order('year', { ascending: false })
    const { data: allCats } = await supabase.from('year_end_awards').select('category')

    const years = [...new Set((allYears || []).map(s => s.year))].sort((a, b) => b - a)
    const categories = [...new Set((allCats || []).map(s => s.category).filter(Boolean))].sort()

    return NextResponse.json({
      items: data || [], total: count || 0, page,
      totalPages: Math.ceil((count || 0) / limit),
      filterOptions: { years, categories },
    })
  } catch (err) {
    console.error('[year-end-list]', err)
    return NextResponse.json({ items: [], total: 0 })
  }
}
