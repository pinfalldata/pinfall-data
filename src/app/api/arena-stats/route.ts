// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/arena-stats?arenaId=1
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const arenaId = searchParams.get('arenaId')
  if (!arenaId) return NextResponse.json({ error: 'arenaId is required' }, { status: 400 })

  try {
    const aid = parseInt(arenaId)

    // All shows
    const { data: shows } = await supabase
      .from('shows')
      .select('id, date, attendance, show_type, show_series_id, show_series:show_series_id(id, name, short_name, logo_url, is_ple)')
      .eq('arena_id', aid)
      .order('date', { ascending: true })

    if (!shows || shows.length === 0) {
      return NextResponse.json({ stats: null })
    }

    const totalShows = shows.length
    const showIds = shows.map(s => s.id)

    // Attendance stats
    const attendances = shows.filter(s => s.attendance && s.attendance > 0).map(s => s.attendance!)
    const totalAttendance = attendances.reduce((a, b) => a + b, 0)
    const avgAttendance = attendances.length > 0 ? Math.round(totalAttendance / attendances.length) : 0
    const maxAttendance = attendances.length > 0 ? Math.max(...attendances) : 0
    const maxAttendanceShow = shows.find(s => s.attendance === maxAttendance)

    // Date range
    const firstShow = shows[0]
    const lastShow = shows[shows.length - 1]

    // Shows by type
    const typeMap = new Map<string, number>()
    for (const s of shows) { const t = s.show_type || 'other'; typeMap.set(t, (typeMap.get(t) || 0) + 1) }
    const byType = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count)

    // Shows by series (promotion)
    const seriesMap = new Map<number, { name: string; short_name: string | null; logo_url: string | null; count: number; is_ple: boolean }>()
    for (const s of shows) {
      const ss = s.show_series
      if (!ss) continue
      if (!seriesMap.has(ss.id)) seriesMap.set(ss.id, { name: ss.name, short_name: ss.short_name, logo_url: ss.logo_url, count: 0, is_ple: ss.is_ple || false })
      seriesMap.get(ss.id)!.count++
    }
    const bySeries = Array.from(seriesMap.values()).sort((a, b) => b.count - a.count).slice(0, 15)

    // By decade
    const decadeMap = new Map<string, number>()
    for (const s of shows) { const y = parseInt(s.date?.substring(0, 4) || '0'); const d = `${Math.floor(y / 10) * 10}s`; decadeMap.set(d, (decadeMap.get(d) || 0) + 1) }
    const byDecade = Array.from(decadeMap.entries()).map(([decade, count]) => ({ decade, count })).sort((a, b) => a.decade.localeCompare(b.decade))

    // Match stats
    const { data: matches } = await supabase
      .from('matches')
      .select('id, rating, duration_seconds, result_type, is_title_change, match_type:match_types(id, name, slug)')
      .in('show_id', showIds.slice(0, 2000))

    const allMatches = matches || []
    const totalMatches = allMatches.length

    // Ratings
    const rated = allMatches.filter(m => m.rating != null)
    const avgRating = rated.length > 0 ? parseFloat((rated.reduce((s, m) => s + m.rating!, 0) / rated.length).toFixed(2)) : null
    const highestRated = rated.length > 0 ? rated.reduce((max, m) => (m.rating || 0) > (max.rating || 0) ? m : max, rated[0]) : null

    // Duration
    const withDuration = allMatches.filter(m => m.duration_seconds && m.duration_seconds > 0)
    const avgDuration = withDuration.length > 0 ? Math.round(withDuration.reduce((s, m) => s + m.duration_seconds!, 0) / withDuration.length) : null

    // Title changes
    const titleChanges = allMatches.filter(m => m.is_title_change).length

    // Win methods
    const methodMap = new Map<string, number>()
    for (const m of allMatches) { if (m.result_type) methodMap.set(m.result_type, (methodMap.get(m.result_type) || 0) + 1) }
    const winMethods = Array.from(methodMap.entries())
      .map(([method, count]) => ({ method, count, percentage: Math.round((count / totalMatches) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Top match types
    const mtMap = new Map<number, { id: number; name: string; slug: string; count: number }>()
    for (const m of allMatches) {
      const mt = m.match_type
      if (!mt) continue
      if (!mtMap.has(mt.id)) mtMap.set(mt.id, { ...mt, count: 0 })
      mtMap.get(mt.id)!.count++
    }
    const topMatchTypes = Array.from(mtMap.values()).sort((a, b) => b.count - a.count).slice(0, 10)

    return NextResponse.json({
      stats: {
        totalShows,
        totalMatches,
        totalAttendance,
        avgAttendance,
        maxAttendance,
        maxAttendanceShow: maxAttendanceShow ? { name: maxAttendanceShow.name || '', date: maxAttendanceShow.date } : null,
        firstShowDate: firstShow?.date,
        lastShowDate: lastShow?.date,
        avgRating,
        avgDuration,
        titleChanges,
        titleChangePercentage: totalMatches > 0 ? Math.round((titleChanges / totalMatches) * 100) : 0,
        byType,
        bySeries,
        byDecade,
        winMethods,
        topMatchTypes,
        highestRatedMatch: highestRated ? { id: highestRated.id, rating: highestRated.rating } : null,
      }
    })
  } catch (err: any) {
    console.error('[arena-stats] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
