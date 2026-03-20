// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit
  const search = searchParams.get('search')
  const active = searchParams.get('active')

  let query = supabase
    .from('stables')
    .select(`*, members:stable_members ( id, superstar:superstar_id ( id, name, slug, photo_url ), joined_date, left_date )`, { count: 'exact' })
    .order('is_active', { ascending: false })
    .order('formed_date', { ascending: false, nullsFirst: true })

  if (search) query = query.ilike('name', `%${search}%`)
  if (active === 'true') query = query.eq('is_active', true)
  if (active === 'false') query = query.eq('is_active', false)

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('[stables-list]', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }

  return NextResponse.json({
    stables: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  })
}
