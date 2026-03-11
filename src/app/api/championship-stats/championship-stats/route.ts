// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/championship-stats?slug=wwe-championship
 * Returns statistics for a championship
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  try {
    const { data: championship } = await supabase
      .from('championships')
      .select('id, name')
      .eq('slug', slug)
      .single()

    if (!championship) {
      return NextResponse.json({ error: 'Championship not found' }, { status: 404 })
    }

    // Get all reigns
    const { data: reigns } = await supabase
      .from('championship_reigns')
      .select(`
        id, won_date, lost_date, days_held, reign_number,
        superstar:superstar_id ( id, name, slug, photo_url )
      `)
      .eq('championship_id', championship.id)
      .order('won_date', { ascending: true })

    const allReigns = reigns || []
    const totalReigns = allReigns.length

    // Total title changes
    const titleChanges = totalReigns > 0 ? totalReigns - 1 : 0

    // Unique champions
    const uniqueChamps = new Set(allReigns.map(r => r.superstar?.id)).size

    // Average reign length
    const daysArray = allReigns.filter(r => r.days_held != null).map(r => r.days_held!)
    const avgDays = daysArray.length > 0 ? Math.round(daysArray.reduce((a, b) => a + b, 0) / daysArray.length) : 0

    // Longest reign
    const longestReign = allReigns.reduce((max, r) => (r.days_held || 0) > (max?.days_held || 0) ? r : max, allReigns[0])

    // Shortest reign
    const shortestReign = allReigns.filter(r => r.days_held != null && r.days_held > 0).reduce((min, r) => (r.days_held || 999999) < (min?.days_held || 999999) ? r : min, allReigns[0])

    // Most reigns
    const reignCountMap = new Map<number, { count: number; superstar: any }>()
    for (const r of allReigns) {
      const sid = r.superstar?.id
      if (!sid) continue
      if (!reignCountMap.has(sid)) reignCountMap.set(sid, { count: 0, superstar: r.superstar })
      reignCountMap.get(sid)!.count++
    }
    const mostReigns = Array.from(reignCountMap.values()).sort((a, b) => b.count - a.count).slice(0, 5)

    // Most combined days
    const daysMap = new Map<number, { days: number; superstar: any }>()
    for (const r of allReigns) {
      const sid = r.superstar?.id
      if (!sid) continue
      if (!daysMap.has(sid)) daysMap.set(sid, { days: 0, superstar: r.superstar })
      daysMap.get(sid)!.days += r.days_held || 0
    }
    const mostDays = Array.from(daysMap.values()).sort((a, b) => b.days - a.days).slice(0, 5)

    // Title changes per decade
    const decadeMap = new Map<string, number>()
    for (const r of allReigns) {
      const year = parseInt(r.won_date?.substring(0, 4) || '0')
      const decade = `${Math.floor(year / 10) * 10}s`
      decadeMap.set(decade, (decadeMap.get(decade) || 0) + 1)
    }
    const byDecade = Array.from(decadeMap.entries()).map(([decade, count]) => ({ decade, count })).sort((a, b) => a.decade.localeCompare(b.decade))

    // Get total title matches
    const { count: totalMatches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('championship_id', championship.id)

    // Title change matches
    const { count: titleChangeMatches } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('championship_id', championship.id)
      .eq('is_title_change', true)

    return NextResponse.json({
      stats: {
        totalReigns,
        titleChanges,
        uniqueChampions: uniqueChamps,
        avgReignDays: avgDays,
        totalTitleMatches: totalMatches || 0,
        titleChangeMatches: titleChangeMatches || 0,
        titleChangePercentage: totalMatches ? Math.round(((titleChangeMatches || 0) / totalMatches) * 100) : 0,
        longestReign: longestReign ? {
          superstar: longestReign.superstar,
          days: longestReign.days_held,
          won_date: longestReign.won_date,
          lost_date: longestReign.lost_date,
        } : null,
        shortestReign: shortestReign ? {
          superstar: shortestReign.superstar,
          days: shortestReign.days_held,
          won_date: shortestReign.won_date,
          lost_date: shortestReign.lost_date,
        } : null,
        mostReigns,
        mostCombinedDays: mostDays,
        byDecade,
      }
    })
  } catch (err: any) {
    console.error('[championship-stats] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
