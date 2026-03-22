// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

/**
 * GET /api/superstar-entrance?superstarId=123
 * Returns entrance themes, ring attires, and outside ring activities
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('superstarId')
  if (!id) return NextResponse.json({ error: 'superstarId required' }, { status: 400 })

  const sid = parseInt(id)

  try {
    // Fetch all three datasets in parallel
    const [
      { data: themes },
      { data: attires },
      { data: outsideRing },
    ] = await Promise.all([
      supabase
        .from('entrance_themes')
        .select('id, song_name, artist, start_date, end_date, video_url, is_current')
        .eq('superstar_id', sid)
        .order('is_current', { ascending: false })
        .order('start_date', { ascending: false, nullsFirst: true }),

      supabase
        .from('superstar_attires')
        .select('id, image_url, name, date, match_id, description')
        .eq('superstar_id', sid)
        .order('date', { ascending: false, nullsFirst: true }),

      supabase
        .from('superstar_outside_ring')
        .select('id, type, title, year, role, description, image_url, external_url')
        .eq('superstar_id', sid)
        .order('year', { ascending: false, nullsFirst: true }),
    ])

    // For attires that have a match_id, fetch match info separately (no nested joins)
    const matchIds = (attires || []).filter(a => a.match_id).map(a => a.match_id)
    let matchMap: Record<number, any> = {}
    if (matchIds.length > 0) {
      const { data: matches } = await supabase
        .from('matches')
        .select('id, show_id')
        .in('id', matchIds)

      if (matches && matches.length > 0) {
        const showIds = [...new Set(matches.map(m => m.show_id).filter(Boolean))]
        const { data: shows } = await supabase
          .from('shows')
          .select('id, name, slug, date')
          .in('id', showIds)

        const showMap: Record<number, any> = {}
        ;(shows || []).forEach(s => { showMap[s.id] = s })

        matches.forEach(m => {
          matchMap[m.id] = {
            id: m.id,
            show: m.show_id ? showMap[m.show_id] || null : null,
          }
        })
      }
    }

    // Enrich attires with match/show info
    const enrichedAttires = (attires || []).map(a => ({
      ...a,
      match: a.match_id ? matchMap[a.match_id] || null : null,
    }))

    return NextResponse.json({
      themes: themes || [],
      attires: enrichedAttires,
      outsideRing: outsideRing || [],
    })
  } catch (err) {
    console.error('[superstar-entrance]', err)
    return NextResponse.json({ themes: [], attires: [], outsideRing: [] })
  }
}
