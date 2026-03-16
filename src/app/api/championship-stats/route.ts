// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/championship-stats?slug=wwe-championship
 * Returns statistics for a championship.
 * For tag team championships, stats are grouped by team (reign_group_id).
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
      .select('id, name, is_tag_team')
      .eq('slug', slug)
      .single()

    if (!championship) {
      return NextResponse.json({ error: 'Championship not found' }, { status: 404 })
    }

    // Get all reigns
    const { data: reigns } = await supabase
      .from('championship_reigns')
      .select(`
        id, won_date, lost_date, days_held, reign_number, reign_group_id,
        superstar:superstar_id ( id, name, slug, photo_url )
      `)
      .eq('championship_id', championship.id)
      .order('won_date', { ascending: true })

    const allReigns = reigns || []
    const isTag = championship.is_tag_team

    // For tag teams: group by reign_group_id to count team reigns, not individual
    let teamReigns: any[] = []
    if (isTag) {
      const groupMap = new Map<string, any>()
      for (const r of allReigns) {
        const gid = r.reign_group_id || `solo_${r.id}`
        if (!groupMap.has(gid)) {
          groupMap.set(gid, {
            id: r.id,
            won_date: r.won_date,
            lost_date: r.lost_date,
            days_held: r.days_held,
            reign_number: r.reign_number,
            reign_group_id: r.reign_group_id,
            superstars: [r.superstar],
          })
        } else {
          // Add partner to existing group
          const existing = groupMap.get(gid)
          if (r.superstar && !existing.superstars.find((s: any) => s?.id === r.superstar?.id)) {
            existing.superstars.push(r.superstar)
          }
        }
      }
      teamReigns = Array.from(groupMap.values())
    } else {
      teamReigns = allReigns.map(r => ({
        ...r,
        superstars: [r.superstar],
      }))
    }

    const totalReigns = teamReigns.length
    const titleChanges = totalReigns > 0 ? totalReigns - 1 : 0

    // Unique champions — for tag teams, count unique team combos
    let uniqueChamps: number
    if (isTag) {
      const teamKeys = new Set(teamReigns.map(r =>
        r.superstars.map((s: any) => s?.id).sort().join('-')
      ))
      uniqueChamps = teamKeys.size
    } else {
      uniqueChamps = new Set(allReigns.map(r => r.superstar?.id)).size
    }

    // Average reign length
    const daysArray = teamReigns.filter(r => r.days_held != null).map(r => r.days_held!)
    const avgDays = daysArray.length > 0 ? Math.round(daysArray.reduce((a, b) => a + b, 0) / daysArray.length) : 0

    // Median reign
    const sortedDays = [...daysArray].sort((a, b) => a - b)
    const medianReignDays = sortedDays.length > 0
      ? sortedDays.length % 2 === 0
        ? Math.round((sortedDays[sortedDays.length / 2 - 1] + sortedDays[sortedDays.length / 2]) / 2)
        : sortedDays[Math.floor(sortedDays.length / 2)]
      : 0

    // Total days defended
    const totalDaysDefended = daysArray.reduce((a, b) => a + b, 0)

    // Longest reign
    const longestReign = teamReigns.reduce((max, r) => (r.days_held || 0) > (max?.days_held || 0) ? r : max, teamReigns[0])

    // Shortest reign
    const shortestReign = teamReigns.filter(r => r.days_held != null && r.days_held > 0).reduce((min, r) => (r.days_held || 999999) < (min?.days_held || 999999) ? r : min, teamReigns[0])

    // Most reigns — for tag teams, group by team key
    const reignCountMap = new Map<string, { count: number; superstar: any }>()
    for (const r of teamReigns) {
      let key: string
      let displaySuperstar: any
      if (isTag) {
        key = r.superstars.map((s: any) => s?.id).sort().join('-')
        displaySuperstar = {
          id: key,
          name: r.superstars.map((s: any) => s?.name).join(' & '),
          slug: r.superstars[0]?.slug,
          photo_url: r.superstars[0]?.photo_url,
        }
      } else {
        key = String(r.superstars[0]?.id)
        displaySuperstar = r.superstars[0]
      }
      if (!reignCountMap.has(key)) reignCountMap.set(key, { count: 0, superstar: displaySuperstar })
      reignCountMap.get(key)!.count++
    }
    const mostReigns = Array.from(reignCountMap.values()).sort((a, b) => b.count - a.count).slice(0, 5)

    // Most combined days
    const daysMap = new Map<string, { days: number; superstar: any }>()
    for (const r of teamReigns) {
      let key: string
      let displaySuperstar: any
      if (isTag) {
        key = r.superstars.map((s: any) => s?.id).sort().join('-')
        displaySuperstar = {
          id: key,
          name: r.superstars.map((s: any) => s?.name).join(' & '),
          slug: r.superstars[0]?.slug,
          photo_url: r.superstars[0]?.photo_url,
        }
      } else {
        key = String(r.superstars[0]?.id)
        displaySuperstar = r.superstars[0]
      }
      if (!daysMap.has(key)) daysMap.set(key, { days: 0, superstar: displaySuperstar })
      daysMap.get(key)!.days += r.days_held || 0
    }
    const mostDays = Array.from(daysMap.values()).sort((a, b) => b.days - a.days).slice(0, 5)

    // Title changes per decade
    const decadeMap = new Map<string, number>()
    for (const r of teamReigns) {
      const year = parseInt(r.won_date?.substring(0, 4) || '0')
      const decade = `${Math.floor(year / 10) * 10}s`
      decadeMap.set(decade, (decadeMap.get(decade) || 0) + 1)
    }
    const byDecade = Array.from(decadeMap.entries()).map(([decade, count]) => ({ decade, count })).sort((a, b) => a.decade.localeCompare(b.decade))

    // Reign distribution
    const reignsOver365 = daysArray.filter(d => d >= 365).length
    const reignsOver100 = daysArray.filter(d => d >= 100).length
    const reignsUnder30 = daysArray.filter(d => d < 30).length
    const reignsUnder1 = daysArray.filter(d => d < 1).length

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

    // Avg rating of title matches
    const { data: ratedMatches } = await supabase
      .from('matches')
      .select('rating')
      .eq('championship_id', championship.id)
      .not('rating', 'is', null)
    const avgRating = ratedMatches && ratedMatches.length > 0
      ? (ratedMatches.reduce((s, m) => s + (m.rating || 0), 0) / ratedMatches.length).toFixed(1)
      : null

    // Top match types
    const { data: titleMatches } = await supabase
      .from('matches')
      .select('match_type_id, match_type:match_types(id, name, slug)')
      .eq('championship_id', championship.id)
    const mtMap = new Map()
    for (const m of (titleMatches || [])) {
      const mt = m.match_type
      if (!mt) continue
      if (!mtMap.has(mt.id)) mtMap.set(mt.id, { ...mt, count: 0 })
      mtMap.get(mt.id).count++
    }
    const topMatchTypes = Array.from(mtMap.values()).sort((a, b) => b.count - a.count).slice(0, 8)

    // By country (from show location)
    const { data: tcShows } = await supabase
      .from('matches')
      .select('show:shows!matches_show_id_fkey(country)')
      .eq('championship_id', championship.id)
      .eq('is_title_change', true)
    const countryMap = new Map()
    for (const m of (tcShows || [])) {
      const c = m.show?.country || 'Unknown'
      countryMap.set(c, (countryMap.get(c) || 0) + 1)
    }
    const byCountry = Array.from(countryMap.entries()).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 10)

    // Top venues
    const { data: tcVenues } = await supabase
      .from('matches')
      .select('show:shows!matches_show_id_fkey(name)')
      .eq('championship_id', championship.id)
      .eq('is_title_change', true)
    const venueMap = new Map()
    for (const m of (tcVenues || [])) {
      const v = m.show?.name || 'Unknown'
      venueMap.set(v, (venueMap.get(v) || 0) + 1)
    }
    const topVenues = Array.from(venueMap.entries()).map(([venue, count]) => ({ venue, count })).sort((a, b) => b.count - a.count).slice(0, 10)

    // First champion
    const firstChamp = teamReigns.length > 0 ? {
      superstar: isTag
        ? { id: 'first', name: teamReigns[0].superstars.map((s: any) => s?.name).join(' & '), slug: teamReigns[0].superstars[0]?.slug, photo_url: teamReigns[0].superstars[0]?.photo_url }
        : teamReigns[0].superstars[0],
      won_date: teamReigns[0].won_date,
    } : null

    // Current champion
    const currentReign = teamReigns.find(r => !r.lost_date)
    const currentChamp = currentReign ? {
      superstar: isTag
        ? { id: 'current', name: currentReign.superstars.map((s: any) => s?.name).join(' & '), slug: currentReign.superstars[0]?.slug, photo_url: currentReign.superstars[0]?.photo_url }
        : currentReign.superstars[0],
      won_date: currentReign.won_date,
      days: currentReign.days_held || Math.floor((Date.now() - new Date(currentReign.won_date + 'T00:00:00').getTime()) / 86400000),
    } : null

    // Vacated count
    const vacatedCount = 0 // Would need notes field analysis

    return NextResponse.json({
      stats: {
        totalReigns,
        titleChanges,
        uniqueChampions: uniqueChamps,
        avgReignDays: avgDays,
        medianReignDays,
        totalDaysDefended,
        totalTitleMatches: totalMatches || 0,
        titleChangeMatches: titleChangeMatches || 0,
        titleChangePercentage: totalMatches ? Math.round(((titleChangeMatches || 0) / totalMatches) * 100) : 0,
        avgRating,
        vacatedCount,
        reignsOver365,
        reignsOver100,
        reignsUnder30,
        reignsUnder1,
        longestReign: longestReign ? {
          superstar: isTag
            ? { id: 'longest', name: longestReign.superstars.map((s: any) => s?.name).join(' & '), slug: longestReign.superstars[0]?.slug, photo_url: longestReign.superstars[0]?.photo_url }
            : longestReign.superstars[0],
          days: longestReign.days_held,
          won_date: longestReign.won_date,
          lost_date: longestReign.lost_date,
        } : null,
        shortestReign: shortestReign ? {
          superstar: isTag
            ? { id: 'shortest', name: shortestReign.superstars.map((s: any) => s?.name).join(' & '), slug: shortestReign.superstars[0]?.slug, photo_url: shortestReign.superstars[0]?.photo_url }
            : shortestReign.superstars[0],
          days: shortestReign.days_held,
          won_date: shortestReign.won_date,
          lost_date: shortestReign.lost_date,
        } : null,
        firstChamp,
        currentChamp,
        mostReigns,
        mostCombinedDays: mostDays,
        byDecade,
        topMatchTypes,
        byCountry,
        topVenues,
      }
    })
  } catch (err: any) {
    console.error('[championship-stats] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
