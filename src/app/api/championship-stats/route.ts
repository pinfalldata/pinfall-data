// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 })

  try {
    const { data: championship } = await supabase
      .from('championships')
      .select('id, name, is_tag_team')
      .eq('slug', slug)
      .single()
    if (!championship) return NextResponse.json({ error: 'Championship not found' }, { status: 404 })

    const { data: reigns } = await supabase
      .from('championship_reigns')
      .select(`id, won_date, lost_date, days_held, reign_number, reign_group_id,
        superstar:superstar_id ( id, name, slug, photo_url )`)
      .eq('championship_id', championship.id)
      .order('won_date', { ascending: true })

    const allReigns = reigns || []
    const isTag = championship.is_tag_team

    // Group by reign_group_id for tag teams
    let teamReigns: any[] = []
    if (isTag) {
      const groupMap = new Map()
      for (const r of allReigns) {
        const gid = r.reign_group_id || `solo_${r.id}`
        if (!groupMap.has(gid)) {
          groupMap.set(gid, { id: r.id, won_date: r.won_date, lost_date: r.lost_date, days_held: r.days_held, reign_number: r.reign_number, reign_group_id: r.reign_group_id, superstars: [r.superstar] })
        } else {
          const existing = groupMap.get(gid)
          if (r.superstar && !existing.superstars.find((s: any) => s?.id === r.superstar?.id)) {
            existing.superstars.push(r.superstar)
          }
        }
      }
      teamReigns = Array.from(groupMap.values())
    } else {
      teamReigns = allReigns.map(r => ({ ...r, superstars: [r.superstar] }))
    }

    const totalReigns = teamReigns.length
    const titleChanges = totalReigns > 0 ? totalReigns - 1 : 0

    // Unique champions
    let uniqueChamps: number
    if (isTag) {
      uniqueChamps = new Set(teamReigns.map(r => r.superstars.map((s: any) => s?.id).sort().join('-'))).size
    } else {
      uniqueChamps = new Set(allReigns.map(r => r.superstar?.id)).size
    }

    const daysArray = teamReigns.filter(r => r.days_held != null).map(r => r.days_held!)
    const avgDays = daysArray.length > 0 ? Math.round(daysArray.reduce((a, b) => a + b, 0) / daysArray.length) : 0
    const sortedDays = [...daysArray].sort((a, b) => a - b)
    const medianReignDays = sortedDays.length > 0 ? (sortedDays.length % 2 === 0 ? Math.round((sortedDays[sortedDays.length / 2 - 1] + sortedDays[sortedDays.length / 2]) / 2) : sortedDays[Math.floor(sortedDays.length / 2)]) : 0
    const totalDaysDefended = daysArray.reduce((a, b) => a + b, 0)

    // Helper: build superstar display for tag teams
    const buildDisplay = (r: any) => ({
      superstar: { id: r.superstars.map((s: any) => s?.id).join('-'), name: r.superstars.map((s: any) => s?.name).join(' & '), slug: r.superstars[0]?.slug, photo_url: r.superstars[0]?.photo_url },
      superstars: r.superstars, // Full array with all photos
    })

    const longestReign = teamReigns.reduce((max, r) => (r.days_held || 0) > (max?.days_held || 0) ? r : max, teamReigns[0])
    const shortestReign = teamReigns.filter(r => r.days_held != null && r.days_held > 0).reduce((min, r) => (r.days_held || 999999) < (min?.days_held || 999999) ? r : min, teamReigns[0])

    // Most reigns & most days
    const reignCountMap = new Map()
    const daysMap = new Map()
    for (const r of teamReigns) {
      const key = isTag ? r.superstars.map((s: any) => s?.id).sort().join('-') : String(r.superstars[0]?.id)
      const display = isTag ? buildDisplay(r) : { superstar: r.superstars[0], superstars: r.superstars }
      if (!reignCountMap.has(key)) reignCountMap.set(key, { count: 0, ...display })
      reignCountMap.get(key).count++
      if (!daysMap.has(key)) daysMap.set(key, { days: 0, ...display })
      daysMap.get(key).days += r.days_held || 0
    }
    const mostReigns = Array.from(reignCountMap.values()).sort((a, b) => b.count - a.count).slice(0, 5)
    const mostDays = Array.from(daysMap.values()).sort((a, b) => b.days - a.days).slice(0, 5)

    // By decade
    const decadeMap = new Map()
    for (const r of teamReigns) { const y = parseInt(r.won_date?.substring(0, 4) || '0'); const d = `${Math.floor(y / 10) * 10}s`; decadeMap.set(d, (decadeMap.get(d) || 0) + 1) }
    const byDecade = Array.from(decadeMap.entries()).map(([decade, count]) => ({ decade, count })).sort((a, b) => a.decade.localeCompare(b.decade))

    // Distribution
    const reignsOver365 = daysArray.filter(d => d >= 365).length
    const reignsOver100 = daysArray.filter(d => d >= 100).length
    const reignsUnder30 = daysArray.filter(d => d < 30).length
    const reignsUnder1 = daysArray.filter(d => d < 1).length

    const { count: totalMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('championship_id', championship.id)
    const { count: titleChangeMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('championship_id', championship.id).eq('is_title_change', true)

    const { data: ratedMatches } = await supabase.from('matches').select('rating').eq('championship_id', championship.id).not('rating', 'is', null)
    const avgRating = ratedMatches?.length ? (ratedMatches.reduce((s, m) => s + (m.rating || 0), 0) / ratedMatches.length).toFixed(1) : null

    // Top match types
    const { data: titleMatches } = await supabase.from('matches').select('match_type_id, match_type:match_types(id, name, slug)').eq('championship_id', championship.id)
    const mtMap = new Map()
    for (const m of (titleMatches || [])) { const mt = m.match_type; if (!mt) continue; if (!mtMap.has(mt.id)) mtMap.set(mt.id, { ...mt, count: 0 }); mtMap.get(mt.id).count++ }
    const topMatchTypes = Array.from(mtMap.values()).sort((a, b) => b.count - a.count).slice(0, 8)

    // By country
    const { data: tcShows } = await supabase.from('matches').select('show:shows!matches_show_id_fkey(country)').eq('championship_id', championship.id).eq('is_title_change', true)
    const countryMap = new Map()
    for (const m of (tcShows || [])) { const c = m.show?.country || 'Unknown'; countryMap.set(c, (countryMap.get(c) || 0) + 1) }
    const byCountry = Array.from(countryMap.entries()).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 10)

    // Top venues
    const { data: tcVenues } = await supabase.from('matches').select('show:shows!matches_show_id_fkey(name)').eq('championship_id', championship.id).eq('is_title_change', true)
    const venueMap = new Map()
    for (const m of (tcVenues || [])) { const v = m.show?.name || 'Unknown'; venueMap.set(v, (venueMap.get(v) || 0) + 1) }
    const topVenues = Array.from(venueMap.entries()).map(([venue, count]) => ({ venue, count })).sort((a, b) => b.count - a.count).slice(0, 10)

    // First / current champion
    const firstR = teamReigns[0]
    const firstChamp = firstR ? { ...buildDisplay(firstR), won_date: firstR.won_date } : null
    const currentR = teamReigns.find(r => !r.lost_date)
    const currentChamp = currentR ? { ...buildDisplay(currentR), won_date: currentR.won_date, days: currentR.days_held || Math.floor((Date.now() - new Date(currentR.won_date + 'T00:00:00').getTime()) / 86400000) } : null

    return NextResponse.json({
      stats: {
        totalReigns, titleChanges, uniqueChampions: uniqueChamps, avgReignDays: avgDays,
        medianReignDays, totalDaysDefended, totalTitleMatches: totalMatches || 0,
        titleChangeMatches: titleChangeMatches || 0,
        titleChangePercentage: totalMatches ? Math.round(((titleChangeMatches || 0) / totalMatches) * 100) : 0,
        avgRating, vacatedCount: 0,
        reignsOver365, reignsOver100, reignsUnder30, reignsUnder1,
        longestReign: longestReign ? { ...buildDisplay(longestReign), days: longestReign.days_held, won_date: longestReign.won_date, lost_date: longestReign.lost_date } : null,
        shortestReign: shortestReign ? { ...buildDisplay(shortestReign), days: shortestReign.days_held, won_date: shortestReign.won_date, lost_date: shortestReign.lost_date } : null,
        firstChamp, currentChamp, mostReigns, mostCombinedDays: mostDays, byDecade, topMatchTypes, byCountry, topVenues,
      }
    })
  } catch (err: any) {
    console.error('[championship-stats] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
