// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams
  const sid = parseInt(sp.get('superstarId') || '0')
  const year = sp.get('year') || ''
  if (!sid) return NextResponse.json({ error: 'superstarId required' }, { status: 400 })

  try {
    // Get all match participations
    const { data: parts } = await supabase.from('match_participants')
      .select('match_id, team_number, is_winner, entry_number')
      .eq('superstar_id', sid)
    if (!parts || parts.length === 0) return NextResponse.json({ stats: null, years: [] })

    const matchIds = [...new Set(parts.map(p => p.match_id))]

    // Batch fetch matches
    const batchSize = 500
    let allMatches: any[] = []
    for (let i = 0; i < matchIds.length; i += batchSize) {
      const batch = matchIds.slice(i, i + batchSize)
      const { data } = await supabase.from('matches')
        .select('id, date, duration_seconds, rating, result_type, winner_team, is_title_change, match_type_id, championship_id, show_id, card_position, is_dark_match')
        .in('id', batch)
      if (data) allMatches.push(...data)
    }

    // Build participation map
    const partMap = new Map<number, any>()
    for (const p of parts) partMap.set(p.match_id, p)

    // Get available years
    const allYears = [...new Set(allMatches.map(m => m.date?.slice(0, 4)).filter(Boolean))].sort((a, b) => b.localeCompare(a))

    // Filter by year if specified
    let matches = allMatches
    if (year) matches = matches.filter(m => m.date?.startsWith(year))

    if (matches.length === 0) return NextResponse.json({ stats: null, years: allYears })

    // === Compute stats ===
    let wins = 0, losses = 0, draws = 0, totalDuration = 0, durationCount = 0
    let titleMatches = 0, titleChanges = 0, darkMatches = 0
    const ratingList: number[] = []
    const resultTypeCounts: Record<string, number> = {}
    const winMethodCounts: Record<string, number> = {}
    const cardPositionCounts: Record<string, number> = {}
    const yearlyRecord: Record<string, { w: number; l: number; d: number }> = {}
    const matchTypeIds: number[] = []
    const showIds: number[] = []
    // Streaks
    let currentStreak = 0, currentType = '', longestWinStreak = 0, longestLossStreak = 0

    // Sort by date for streak calc
    const sorted = [...matches].sort((a, b) => (a.date || '').localeCompare(b.date || ''))

    for (const m of sorted) {
      const p = partMap.get(m.id)
      if (!p) continue

      const isDraw = m.result_type === 'no_contest' || m.result_type === 'time_limit_draw'
      const isWin = p.is_winner === true
      const result = isDraw ? 'draw' : isWin ? 'win' : 'loss'

      if (result === 'win') wins++
      else if (result === 'loss') losses++
      else draws++

      // Yearly
      const yr = m.date?.slice(0, 4)
      if (yr) {
        if (!yearlyRecord[yr]) yearlyRecord[yr] = { w: 0, l: 0, d: 0 }
        if (result === 'win') yearlyRecord[yr].w++
        else if (result === 'loss') yearlyRecord[yr].l++
        else yearlyRecord[yr].d++
      }

      // Duration
      if (m.duration_seconds && m.duration_seconds > 0) {
        totalDuration += m.duration_seconds
        durationCount++
      }

      // Rating
      if (m.rating) ratingList.push(parseFloat(m.rating))

      // Result type
      if (m.result_type) resultTypeCounts[m.result_type] = (resultTypeCounts[m.result_type] || 0) + 1

      // Win methods (only for wins)
      if (isWin && m.result_type) winMethodCounts[m.result_type] = (winMethodCounts[m.result_type] || 0) + 1

      // Card position
      if (m.card_position) cardPositionCounts[m.card_position] = (cardPositionCounts[m.card_position] || 0) + 1

      // Title
      if (m.championship_id) titleMatches++
      if (m.is_title_change) titleChanges++
      if (m.is_dark_match) darkMatches++

      if (m.match_type_id) matchTypeIds.push(m.match_type_id)
      if (m.show_id) showIds.push(m.show_id)

      // Streak
      if (result === 'win' || result === 'loss') {
        if (result === currentType) { currentStreak++ }
        else { currentStreak = 1; currentType = result }
        if (result === 'win' && currentStreak > longestWinStreak) longestWinStreak = currentStreak
        if (result === 'loss' && currentStreak > longestLossStreak) longestLossStreak = currentStreak
      }
    }

    const totalMatches = wins + losses + draws
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 1000) / 10 : 0
    const avgDuration = durationCount > 0 ? Math.round(totalDuration / durationCount) : 0
    const avgRating = ratingList.length > 0 ? Math.round((ratingList.reduce((a, b) => a + b, 0) / ratingList.length) * 100) / 100 : null
    const maxRating = ratingList.length > 0 ? Math.max(...ratingList) : null

    // Match types
    const typeCountMap: Record<number, number> = {}
    for (const id of matchTypeIds) typeCountMap[id] = (typeCountMap[id] || 0) + 1
    const topTypeIds = Object.entries(typeCountMap).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => parseInt(e[0]))
    let matchTypes: any[] = []
    if (topTypeIds.length > 0) {
      const { data: mt } = await supabase.from('match_types').select('id, name, slug').in('id', topTypeIds)
      matchTypes = topTypeIds.map(id => {
        const t = (mt || []).find(x => x.id === id)
        return t ? { ...t, count: typeCountMap[id] } : null
      }).filter(Boolean)
    }

    // Show series breakdown
    const showIdSet = [...new Set(showIds)]
    let showSeriesBreakdown: any[] = []
    if (showIdSet.length > 0) {
      const { data: shows } = await supabase.from('shows')
        .select('show_series_id, show_series:show_series_id(id, name, short_name, logo_url)')
        .in('id', showIdSet.slice(0, 1000))
      if (shows) {
        const ssCount: Record<number, { count: number; ss: any }> = {}
        for (const s of shows) {
          if (s.show_series) {
            const id = s.show_series.id
            if (!ssCount[id]) ssCount[id] = { count: 0, ss: s.show_series }
            ssCount[id].count++
          }
        }
        showSeriesBreakdown = Object.values(ssCount).sort((a, b) => b.count - a.count).slice(0, 8)
      }
    }

    // Win methods sorted
    const winMethods = Object.entries(winMethodCounts).sort((a, b) => b[1] - a[1]).map(([method, count]) => ({ method, count, pct: wins > 0 ? Math.round(count / wins * 1000) / 10 : 0 }))

    // Card positions
    const cardPositions = Object.entries(cardPositionCounts).sort((a, b) => b[1] - a[1]).map(([pos, count]) => ({ position: pos, count }))

    // Yearly chart data
    const yearlyChart = Object.entries(yearlyRecord).sort((a, b) => a[0].localeCompare(b[0])).map(([yr, r]) => ({
      year: yr, wins: r.w, losses: r.l, draws: r.d, total: r.w + r.l + r.d,
      winRate: (r.w + r.l + r.d) > 0 ? Math.round(r.w / (r.w + r.l + r.d) * 1000) / 10 : 0,
    }))

    return NextResponse.json({
      stats: {
        totalMatches, wins, losses, draws, winRate,
        avgDuration, avgRating, maxRating,
        titleMatches, titleChanges, darkMatches,
        longestWinStreak, longestLossStreak,
        winMethods, matchTypes, showSeriesBreakdown,
        cardPositions, yearlyChart,
      },
      years: allYears,
    })
  } catch (err) {
    console.error('[superstar-stats]', err)
    return NextResponse.json({ stats: null, years: [] })
  }
}
