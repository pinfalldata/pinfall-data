// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  try {
    // Matches per year
    const { data: allMatches } = await supabase.from('matches').select('date, is_title_change, rating')
    const matchesByYear = new Map<number, { count: number; titleChanges: number; totalRating: number; ratedCount: number }>()
    for (const m of (allMatches || [])) {
      if (!m.date) continue
      const y = parseInt(m.date.slice(0, 4))
      const e = matchesByYear.get(y) || { count: 0, titleChanges: 0, totalRating: 0, ratedCount: 0 }
      e.count++
      if (m.is_title_change) e.titleChanges++
      if (m.rating) { e.totalRating += parseFloat(m.rating); e.ratedCount++ }
      matchesByYear.set(y, e)
    }

    const matchesPerYear = [...matchesByYear.entries()].sort((a, b) => a[0] - b[0]).map(([year, d]) => ({
      year, matches: d.count, title_changes: d.titleChanges, avg_rating: d.ratedCount > 0 ? Math.round((d.totalRating / d.ratedCount) * 100) / 100 : null,
    }))

    // Shows per year with total attendance
    const { data: allShows } = await supabase.from('shows').select('date, attendance')
    const showsByYear = new Map<number, { count: number; totalAtt: number }>()
    for (const s of (allShows || [])) {
      if (!s.date) continue
      const y = parseInt(s.date.slice(0, 4))
      const e = showsByYear.get(y) || { count: 0, totalAtt: 0 }
      e.count++
      if (s.attendance) e.totalAtt += s.attendance
      showsByYear.set(y, e)
    }
    const showsPerYear = [...showsByYear.entries()].sort((a, b) => a[0] - b[0]).map(([year, d]) => ({
      year, shows: d.count, total_attendance: d.totalAtt,
    }))

    // Eras
    const { data: eras } = await supabase.from('eras').select('id, name, slug, start_year, end_year').order('start_year')

    // Era stats
    const eraStats = (eras || []).map(era => {
      let matches = 0; let titleChanges = 0; let totalRating = 0; let ratedCount = 0
      for (const [year, d] of matchesByYear) {
        if (year >= era.start_year && (!era.end_year || year <= era.end_year)) {
          matches += d.count; titleChanges += d.titleChanges
          totalRating += d.totalRating; ratedCount += d.ratedCount
        }
      }
      let shows = 0; let totalAtt = 0
      for (const [year, d] of showsByYear) {
        if (year >= era.start_year && (!era.end_year || year <= era.end_year)) {
          shows += d.count; totalAtt += d.totalAtt
        }
      }
      return {
        id: era.id, name: era.name, slug: era.slug, start_year: era.start_year, end_year: era.end_year,
        total_matches: matches, total_title_changes: titleChanges, total_shows: shows, total_attendance: totalAtt,
        avg_rating: ratedCount > 0 ? Math.round((totalRating / ratedCount) * 100) / 100 : null,
      }
    })

    // Top decade stats
    const decades = [1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]
    const decadeStats = decades.map(d => {
      let matches = 0; let shows = 0; let att = 0
      for (let y = d; y < d + 10; y++) {
        const m = matchesByYear.get(y); if (m) matches += m.count
        const s = showsByYear.get(y); if (s) { shows += s.count; att += s.totalAtt }
      }
      return { decade: `${d}s`, start: d, matches, shows, attendance: att }
    })

    // Year with most matches
    const peakYear = matchesPerYear.reduce((max, c) => c.matches > max.matches ? c : max, { year: 0, matches: 0, title_changes: 0, avg_rating: null })

    return NextResponse.json({ matchesPerYear, showsPerYear, eraStats, decadeStats, peakYear })
  } catch (err) {
    console.error('[records-milestones]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
