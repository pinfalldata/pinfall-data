// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/random-superstars?count=24
 * Returns random superstars with photo_url for the homepage grid.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = Math.min(60, parseInt(searchParams.get('count') || '24'))

  try {
    // Get total count of superstars with photos
    const { count: total } = await supabase
      .from('superstars')
      .select('*', { count: 'exact', head: true })
      .not('photo_url', 'is', null)

    if (!total || total === 0) {
      return NextResponse.json({ superstars: [] })
    }

    // Pick random offsets
    const offsets = new Set<number>()
    while (offsets.size < Math.min(count, total)) {
      offsets.add(Math.floor(Math.random() * total))
    }

    // Fetch each
    const promises = Array.from(offsets).map(offset =>
      supabase
        .from('superstars')
        .select('id, name, slug, photo_url')
        .not('photo_url', 'is', null)
        .range(offset, offset)
        .single()
    )

    const results = await Promise.all(promises)
    const superstars = results
      .filter(r => r.data)
      .map(r => r.data)

    return NextResponse.json({ superstars })
  } catch (err) {
    console.error('[random-superstars]', err)
    return NextResponse.json({ superstars: [] })
  }
}
