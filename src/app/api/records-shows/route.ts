// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  try {
    // Highest attendance
    const { data: topAtt } = await supabase.from('shows')
      .select('id, name, slug, date, attendance, city, country, venue, show_series:show_series_id(name, slug, logo_url)')
      .not('attendance', 'is', null).order('attendance', { ascending: false }).limit(50)

    const highestAttendance = (topAtt || []).map(s => ({
      id: s.id, name: s.name, slug: s.slug, date: s.date, attendance: s.attendance,
      city: s.city, country: s.country, venue: s.venue,
      series: s.show_series?.name, series_logo: s.show_series?.logo_url,
    }))

    // Match count per show
    const { data: matchCounts } = await supabase.from('matches').select('show_id')
    const showMatchCount = new Map<number, number>()
    for (const m of (matchCounts || [])) if (m.show_id) showMatchCount.set(m.show_id, (showMatchCount.get(m.show_id) || 0) + 1)

    const topShowIds = [...showMatchCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(e => e[0])
    let mostMatchesPerCard: any[] = []
    if (topShowIds.length > 0) {
      const { data: shows } = await supabase.from('shows').select('id, name, slug, date, show_series:show_series_id(name, logo_url)').in('id', topShowIds)
      const showMap = new Map((shows || []).map(s => [s.id, s]))
      mostMatchesPerCard = topShowIds.map(id => {
        const s = showMap.get(id)
        return s ? { id: s.id, name: s.name, slug: s.slug, date: s.date, series: s.show_series?.name, series_logo: s.show_series?.logo_url, match_count: showMatchCount.get(id) } : null
      }).filter(Boolean)
    }

    // Title changes per show
    const { data: tcData } = await supabase.from('matches').select('show_id').eq('is_title_change', true)
    const showTCCount = new Map<number, number>()
    for (const m of (tcData || [])) if (m.show_id) showTCCount.set(m.show_id, (showTCCount.get(m.show_id) || 0) + 1)

    const topTCIds = [...showTCCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(e => e[0])
    let mostTitleChanges: any[] = []
    if (topTCIds.length > 0) {
      const { data: shows } = await supabase.from('shows').select('id, name, slug, date, show_series:show_series_id(name, logo_url)').in('id', topTCIds)
      const showMap = new Map((shows || []).map(s => [s.id, s]))
      mostTitleChanges = topTCIds.map(id => {
        const s = showMap.get(id)
        return s ? { id: s.id, name: s.name, slug: s.slug, date: s.date, series: s.show_series?.name, series_logo: s.show_series?.logo_url, title_changes: showTCCount.get(id) } : null
      }).filter(Boolean)
    }

    // Most prolific show series
    const { data: seriesData } = await supabase.from('show_series').select('id, name, slug, logo_url')
    const { data: showsAll } = await supabase.from('shows').select('show_series_id')
    const seriesCount = new Map<number, number>()
    for (const s of (showsAll || [])) if (s.show_series_id) seriesCount.set(s.show_series_id, (seriesCount.get(s.show_series_id) || 0) + 1)

    const mostProlificSeries = (seriesData || []).map(s => ({
      id: s.id, name: s.name, slug: s.slug, logo_url: s.logo_url, episode_count: seriesCount.get(s.id) || 0,
    })).sort((a, b) => b.episode_count - a.episode_count).slice(0, 30)

    // Shows by country
    const { data: showCountries } = await supabase.from('shows').select('country').not('country', 'is', null)
    const countryCount = new Map<string, number>()
    for (const s of (showCountries || [])) if (s.country) countryCount.set(s.country, (countryCount.get(s.country) || 0) + 1)
    const showsByCountry = [...countryCount.entries()].sort((a, b) => b[1] - a[1]).map(([country, count]) => ({ country, count }))

    return NextResponse.json({ highestAttendance, mostMatchesPerCard, mostTitleChanges, mostProlificSeries, showsByCountry })
  } catch (err) {
    console.error('[records-shows]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
