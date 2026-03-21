// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

/**
 * GET /api/omg-check?matchId=123&segmentId=456&showId=789
 * Returns OMG moments linked to this match, segment, or show
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const matchId = searchParams.get('matchId')
  const segmentId = searchParams.get('segmentId')
  const showId = searchParams.get('showId')

  if (!matchId && !segmentId && !showId) {
    return NextResponse.json({ moments: [] })
  }

  try {
    let query = supabase
      .from('omg_moments')
      .select('id, title, slug, category')
      .limit(5)

    if (matchId) {
      query = query.eq('match_id', parseInt(matchId))
    } else if (segmentId) {
      query = query.eq('segment_id', parseInt(segmentId))
    } else if (showId) {
      query = query.eq('show_id', parseInt(showId))
    }

    const { data, error } = await query

    if (error) {
      console.error('[omg-check]', error)
      return NextResponse.json({ moments: [] })
    }

    return NextResponse.json({ moments: data || [] })
  } catch {
    return NextResponse.json({ moments: [] })
  }
}
