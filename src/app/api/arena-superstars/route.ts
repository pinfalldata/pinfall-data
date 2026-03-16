// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/arena-superstars?arenaId=1&page=1&limit=60
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const arenaId = searchParams.get('arenaId')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(120, Math.max(10, parseInt(searchParams.get('limit') || '60')))
  const offset = (page - 1) * limit

  if (!arenaId) return NextResponse.json({ error: 'arenaId is required' }, { status: 400 })

  try {
    // Get all show IDs at this arena
    const { data: shows } = await supabase
      .from('shows')
      .select('id')
      .eq('arena_id', parseInt(arenaId))

    if (!shows || shows.length === 0) {
      return NextResponse.json({ superstars: [], total: 0, page, totalPages: 0 })
    }

    const showIds = shows.map(s => s.id)

    // Get all match IDs from those shows
    const { data: matches } = await supabase
      .from('matches')
      .select('id')
      .in('show_id', showIds.slice(0, 2000))

    if (!matches || matches.length === 0) {
      return NextResponse.json({ superstars: [], total: 0, page, totalPages: 0 })
    }

    const matchIds = matches.map(m => m.id)

    // Get all participants from those matches, count appearances
    const { data: participants } = await supabase
      .from('match_participants')
      .select('superstar_id, is_winner')
      .in('match_id', matchIds.slice(0, 2000))

    if (!participants) {
      return NextResponse.json({ superstars: [], total: 0, page, totalPages: 0 })
    }

    // Aggregate per superstar
    const starMap = new Map<number, { appearances: number; wins: number }>()
    for (const p of participants) {
      if (!p.superstar_id) continue
      if (!starMap.has(p.superstar_id)) starMap.set(p.superstar_id, { appearances: 0, wins: 0 })
      const entry = starMap.get(p.superstar_id)!
      entry.appearances++
      if (p.is_winner) entry.wins++
    }

    // Sort by appearances descending
    const sorted = Array.from(starMap.entries())
      .sort((a, b) => b[1].appearances - a[1].appearances)

    const total = sorted.length
    const totalPages = Math.ceil(total / limit)
    const paged = sorted.slice(offset, offset + limit)

    if (paged.length === 0) {
      return NextResponse.json({ superstars: [], total, page, totalPages })
    }

    // Fetch superstar details
    const ids = paged.map(([id]) => id)
    const { data: stars } = await supabase
      .from('superstars')
      .select('id, name, slug, photo_url, role')
      .in('id', ids)

    const starLookup = new Map((stars || []).map(s => [s.id, s]))

    const superstars = paged.map(([id, stats]) => {
      const s = starLookup.get(id)
      return {
        id,
        name: s?.name || 'Unknown',
        slug: s?.slug || '',
        photo_url: s?.photo_url || null,
        role: s?.role || null,
        appearances: stats.appearances,
        wins: stats.wins,
      }
    })

    return NextResponse.json({ superstars, total, page, totalPages })
  } catch (err: any) {
    console.error('[arena-superstars] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
