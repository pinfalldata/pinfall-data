// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

/**
 * GET /api/shows-map
 * Returns show counts grouped by country
 */
export async function GET() {
  try {
    const { data: shows } = await supabase
      .from('shows')
      .select('country')
      .not('country', 'is', null)

    if (!shows) return NextResponse.json({ countries: [] })

    const countMap = new Map<string, number>()
    for (const s of shows) {
      const c = (s.country || '').trim()
      if (!c) continue
      countMap.set(c, (countMap.get(c) || 0) + 1)
    }

    const countries = Array.from(countMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ countries })
  } catch (err) {
    console.error('[shows-map]', err)
    return NextResponse.json({ countries: [] })
  }
}
