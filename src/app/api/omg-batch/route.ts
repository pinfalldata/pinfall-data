// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

/**
 * GET /api/omg-batch?showId=123
 * Returns ALL OMG moments for a show (matches + segments + show-level)
 * Grouped by match_id and segment_id for easy lookup
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const showId = searchParams.get('showId')

  if (!showId) {
    return NextResponse.json({ moments: [], byMatch: {}, bySegment: {}, byShow: [] })
  }

  try {
    const { data, error } = await supabase
      .from('omg_moments')
      .select('id, title, slug, category, match_id, segment_id, show_id')
      .eq('show_id', parseInt(showId))

    if (error) {
      console.error('[omg-batch]', error)
      return NextResponse.json({ moments: [], byMatch: {}, bySegment: {}, byShow: [] })
    }

    const moments = data || []

    // Group by match_id
    const byMatch: Record<number, any[]> = {}
    // Group by segment_id
    const bySegment: Record<number, any[]> = {}
    // Show-level (no match or segment)
    const byShow: any[] = []

    for (const m of moments) {
      if (m.match_id) {
        if (!byMatch[m.match_id]) byMatch[m.match_id] = []
        byMatch[m.match_id].push(m)
      }
      if (m.segment_id) {
        if (!bySegment[m.segment_id]) bySegment[m.segment_id] = []
        bySegment[m.segment_id].push(m)
      }
      if (!m.match_id && !m.segment_id) {
        byShow.push(m)
      }
    }

    return NextResponse.json({ moments, byMatch, bySegment, byShow })
  } catch {
    return NextResponse.json({ moments: [], byMatch: {}, bySegment: {}, byShow: [] })
  }
}
