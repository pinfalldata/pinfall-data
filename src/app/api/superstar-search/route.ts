// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

  if (q.length < 2) return NextResponse.json({ results: [] })

  try {
    const { data } = await supabase.from('superstars')
      .select('id, name, slug, photo_url')
      .ilike('name', `%${q}%`)
      .order('total_matches', { ascending: false, nullsFirst: false })
      .limit(limit)

    return NextResponse.json({ results: data || [] })
  } catch (err) {
    console.error('[superstar-search]', err)
    return NextResponse.json({ results: [] })
  }
}
