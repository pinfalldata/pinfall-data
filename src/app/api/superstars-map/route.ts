// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600 // Cache 1 hour

/**
 * GET /api/superstars-map
 * Returns count of superstars by birth_country for the world map.
 */
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('superstars')
      .select('birth_country')
      .not('birth_country', 'is', null)
      .neq('birth_country', '')

    if (error) {
      console.error('[superstars-map]', error)
      return NextResponse.json({ countries: [] })
    }

    // Count by country
    const counts = new Map<string, number>()
    for (const row of (data || [])) {
      const c = row.birth_country
      if (c) counts.set(c, (counts.get(c) || 0) + 1)
    }

    // Convert to sorted array
    const countries = [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json({ countries })
  } catch (err) {
    console.error('[superstars-map]', err)
    return NextResponse.json({ countries: [] })
  }
}
