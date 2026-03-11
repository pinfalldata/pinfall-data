// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 })

  try {
    const { data: championship } = await supabase.from('championships').select('id, name').eq('slug', slug).single()
    if (!championship) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: reigns } = await supabase
      .from('championship_reigns')
      .select('id, won_date, lost_date, days_held, reign_number, superstar:superstar_id ( id, name, slug, photo_url, gender, birth_country )')
      .eq('championship_id', championship.id)
      .order('won_date', { ascending: true })

    const allReigns = reigns || []
    const totalReigns = allReigns.length
    const titleChanges = totalReigns > 0 ? totalReigns - 1 : 0

    // Unique champions
    const uniqueMap = new Map()
    for (const r of allReigns) {
      const s = r.superstar
      if (!s) continue
      if (!uniqueMap.has(s.id)) uniqueMap.set(s.id, { ...s, reignCount: 0, totalDays: 0, reigns: [] })
      const h = uniqueMap.get(s.id)
      h.reignCount++
      h.totalDays += r.days_held || 0
      h.reigns.push(r)
    }
    const uniqueChamps = uniqueMap.size

    // Days stats
    const daysArr = allReigns.filter(r => r.days_held != null).map(r => r.days_held!)
    const avgDays = daysArr.length > 0 ? Math.round(daysArr.reduce((a, b) => a + b, 0) / daysArr.length) : 0
    const medianDays = daysArr.length > 0 ? daysArr.sort((a, b) => a - b)[Math.floor(daysArr.length / 2)] : 0
    const totalDaysDefended = daysArr.reduce((a, b) => a + b, 0)

    // Longest & shortest reign
    const longestReign = allReigns.reduce((max, r) => (r.days_held || 0) > (max?.days_held || 0) ? r : max, allReigns[0])
    const completedReigns = allReigns.filter(r => r.days_held != null && r.days_held >= 0 && r.lost_date)
    const shortestReign = completedReigns.length > 0 ? completedReigns.reduce((min, r) => (r.days_held ?? 999999) < (min?.days_held ?? 999999) ? r : min, completedReigns[0]) : null

    // Most reigns
    const mostReigns = Array.from(uniqueMap.values()).sort((a, b) => b.reignCount - a.reignCount).slice(0, 10).map(h => ({ superstar: { id: h.id, name: h.name, slug: h.slug, photo_url: h.photo_url }, count: h.reignCount }))

    // Most combined days
    const mostDays = Array.from(uniqueMap.values()).sort((a, b) => b.totalDays - a.totalDays).slice(0, 10).map(h => ({ superstar: { id: h.id, name: h.name, slug: h.slug, photo_url: h.photo_url }, days: h.totalDays }))

    // By decade
    const decadeMap = new Map()
    for (const r of allReigns) { const y = parseInt(r.won_date?.substring(0, 4) || '0'); const d = `${Math.floor(y / 10) * 10}s`; decadeMap.set(d, (decadeMap.get(d) || 0) + 1) }
    const byDecade = Array.from(decadeMap.entries()).map(([decade, count]) => ({ decade, count })).sort((a, b) => a.decade.localeCompare(b.decade))

    // By year
    const yearMap = new Map()
    for (const r of allReigns) { const y = r.won_date?.substring(0, 4) || '?'; yearMap.set(y, (yearMap.get(y) || 0) + 1) }
    const byYear = Array.from(yearMap.entries()).map(([year, count]) => ({ year, count })).sort((a, b) => a.year.localeCompare(b.year))
    const mostActiveYear = byYear.length > 0 ? byYear.reduce((max, y) => y.count > max.count ? y : max, byYear[0]) : null

    // By country
    const countryMap = new Map()
    for (const h of uniqueMap.values()) { const c = h.birth_country || 'Unknown'; countryMap.set(c, (countryMap.get(c) || 0) + h.reignCount) }
    const byCountry = Array.from(countryMap.entries()).map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count).slice(0, 10)

    // By gender
    const genderMap = new Map()
    for (const r of allReigns) { const g = r.superstar?.gender || 'unknown'; genderMap.set(g, (genderMap.get(g) || 0) + 1) }
    const byGender = Array.from(genderMap.entries()).map(([gender, count]) => ({ gender, count }))

    // First & last champion
    const firstChamp = allReigns[0] || null
    const lastChamp = allReigns[allReigns.length - 1] || null
    const currentChamp = allReigns.find(r => !r.lost_date) || null

    // Vacated count (gaps between reigns)
    let vacatedCount = 0
    for (let i = 1; i < allReigns.length; i++) {
      const prevLost = allReigns[i - 1].lost_date
      const nextWon = allReigns[i].won_date
      if (prevLost && nextWon && prevLost !== nextWon) {
        const gap = (new Date(nextWon).getTime() - new Date(prevLost).getTime()) / 86400000
        if (gap > 1) vacatedCount++
      }
    }

    // Reigns over 1 year
    const reignsOver365 = daysArr.filter(d => d >= 365).length
    const reignsOver100 = daysArr.filter(d => d >= 100).length
    const reignsUnder30 = daysArr.filter(d => d < 30).length
    const reignsUnder1 = daysArr.filter(d => d < 1).length

    // Title match stats
    const { count: totalMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('championship_id', championship.id)
    const { count: titleChangeMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('championship_id', championship.id).eq('is_title_change', true)

    // Average match rating for this championship
    const { data: ratedMatches } = await supabase.from('matches').select('rating').eq('championship_id', championship.id).not('rating', 'is', null)
    const ratings = (ratedMatches || []).map(m => parseFloat(m.rating)).filter(r => !isNaN(r))
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2) : null
    const highestRated = ratings.length > 0 ? Math.max(...ratings).toFixed(2) : null

    // Top match types for this championship
    const { data: matchTypes } = await supabase.from('matches').select('match_type:match_type_id ( id, name, slug )').eq('championship_id', championship.id)
    const mtMap = new Map()
    for (const m of (matchTypes || [])) {
      const mt = m.match_type
      if (!mt) continue
      if (!mtMap.has(mt.id)) mtMap.set(mt.id, { ...mt, count: 0 })
      mtMap.get(mt.id).count++
    }
    const topMatchTypes = Array.from(mtMap.values()).sort((a, b) => b.count - a.count).slice(0, 8)

    // Top venues for title changes
    const { data: tcShows } = await supabase
      .from('matches')
      .select('show:show_id ( name, venue, city, country )')
      .eq('championship_id', championship.id)
      .eq('is_title_change', true)
    const venueMap = new Map()
    for (const m of (tcShows || [])) {
      const v = m.show?.venue || m.show?.name || 'Unknown'
      venueMap.set(v, (venueMap.get(v) || 0) + 1)
    }
    const topVenues = Array.from(venueMap.entries()).map(([venue, count]) => ({ venue, count })).sort((a, b) => b.count - a.count).slice(0, 5)

    return NextResponse.json({
      stats: {
        totalReigns, titleChanges, uniqueChampions: uniqueChamps,
        avgReignDays: avgDays, medianReignDays: medianDays, totalDaysDefended,
        totalTitleMatches: totalMatches || 0,
        titleChangeMatches: titleChangeMatches || 0,
        titleChangePercentage: totalMatches ? Math.round(((titleChangeMatches || 0) / totalMatches) * 100) : 0,
        avgRating, highestRated,
        longestReign: longestReign ? { superstar: longestReign.superstar, days: longestReign.days_held, won_date: longestReign.won_date, lost_date: longestReign.lost_date } : null,
        shortestReign: shortestReign ? { superstar: shortestReign.superstar, days: shortestReign.days_held, won_date: shortestReign.won_date, lost_date: shortestReign.lost_date } : null,
        firstChamp: firstChamp ? { superstar: firstChamp.superstar, won_date: firstChamp.won_date } : null,
        currentChamp: currentChamp ? { superstar: currentChamp.superstar, won_date: currentChamp.won_date, days: currentChamp.days_held } : null,
        mostReigns, mostCombinedDays: mostDays,
        byDecade, byCountry, byGender,
        mostActiveYear, vacatedCount,
        reignsOver365, reignsOver100, reignsUnder30, reignsUnder1,
        topMatchTypes, topVenues,
      }
    })
  } catch (err: any) {
    console.error('[championship-stats] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
