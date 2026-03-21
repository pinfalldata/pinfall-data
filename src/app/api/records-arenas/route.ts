// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  try {
    const { data: arenas } = await supabase.from('arenas').select('id, name, slug, city, state_province, country, capacity, image_url, opened_year')
    const { data: shows } = await supabase.from('shows').select('arena_id, attendance, date, show_series_id')

    const arenaStats = new Map<number, { count: number; maxAtt: number; seriesSet: Set<number>; firstYear: number; lastYear: number }>()
    for (const s of (shows || [])) {
      if (!s.arena_id) continue
      const e = arenaStats.get(s.arena_id)
      const yr = s.date ? parseInt(s.date.slice(0, 4)) : 0
      if (e) {
        e.count++
        if (s.attendance && s.attendance > e.maxAtt) e.maxAtt = s.attendance
        if (s.show_series_id) e.seriesSet.add(s.show_series_id)
        if (yr && yr < e.firstYear) e.firstYear = yr
        if (yr && yr > e.lastYear) e.lastYear = yr
      } else {
        arenaStats.set(s.arena_id, { count: 1, maxAtt: s.attendance || 0, seriesSet: new Set(s.show_series_id ? [s.show_series_id] : []), firstYear: yr || 9999, lastYear: yr || 0 })
      }
    }

    const enriched = (arenas || []).map(a => {
      const st = arenaStats.get(a.id)
      return {
        id: a.id, name: a.name, slug: a.slug, city: a.city, country: a.country, image_url: a.image_url, capacity: a.capacity,
        show_count: st?.count || 0, max_attendance: st?.maxAtt || 0,
        series_count: st?.seriesSet.size || 0,
        years_active: st && st.firstYear < 9999 ? st.lastYear - st.firstYear + 1 : 0,
        first_year: st?.firstYear !== 9999 ? st?.firstYear : null,
        last_year: st?.lastYear || null,
      }
    }).filter(a => a.show_count > 0)

    const mostEvents = [...enriched].sort((a, b) => b.show_count - a.show_count).slice(0, 50)
    const highestAttendance = [...enriched].filter(a => a.max_attendance > 0).sort((a, b) => b.max_attendance - a.max_attendance).slice(0, 50)
    const mostSeries = [...enriched].sort((a, b) => b.series_count - a.series_count).slice(0, 30)
    const longestHistory = [...enriched].filter(a => a.years_active > 0).sort((a, b) => b.years_active - a.years_active).slice(0, 30)

    // Top arenas by country
    const byCountry = new Map<string, typeof enriched>()
    for (const a of enriched) {
      if (!a.country) continue
      if (!byCountry.has(a.country)) byCountry.set(a.country, [])
      byCountry.get(a.country)!.push(a)
    }
    const topByCountry = [...byCountry.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 20).map(([country, arenas]) => ({
      country, arena_count: arenas.length, top_arena: arenas.sort((a, b) => b.show_count - a.show_count)[0],
    }))

    return NextResponse.json({ mostEvents, highestAttendance, mostSeries, longestHistory, topByCountry })
  } catch (err) {
    console.error('[records-arenas]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
