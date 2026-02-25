// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/random-superstars?count=24
 * Returns random superstars with valid photo_url.
 * Filters out NULL and empty string photo_url.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = Math.min(60, parseInt(searchParams.get('count') || '24'))

  try {
    // Get total count of superstars with valid photos
    const { count: total } = await supabase
      .from('superstars')
      .select('*', { count: 'exact', head: true })
      .not('photo_url', 'is', null)
      .neq('photo_url', '')

    if (!total || total === 0) {
      return NextResponse.json({ superstars: [] })
    }

    // Fetch a larger batch from a random offset, then shuffle
    const batchSize = Math.min(count * 3, total)
    const maxOffset = Math.max(0, total - batchSize)
    const offset = Math.floor(Math.random() * (maxOffset + 1))

    const { data, error } = await supabase
      .from('superstars')
      .select('id, name, slug, photo_url')
      .not('photo_url', 'is', null)
      .neq('photo_url', '')
      .range(offset, offset + batchSize - 1)

    if (error || !data) {
      console.error('[random-superstars]', error)
      return NextResponse.json({ superstars: [] })
    }

    // Shuffle using Fisher-Yates
    const shuffled = [...data]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    return NextResponse.json({ superstars: shuffled.slice(0, count) })
  } catch (err) {
    console.error('[random-superstars]', err)
    return NextResponse.json({ superstars: [] })
  }
}
