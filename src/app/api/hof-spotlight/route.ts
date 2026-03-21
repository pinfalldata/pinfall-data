// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  try {
    // Recent HOF inductees with photos
    const { data: hofRecent } = await supabase.from('hall_of_fame')
      .select('id, inductee_name, induction_year, class, image_url, superstar:superstar_id(id, name, slug, photo_url)')
      .order('induction_year', { ascending: false }).limit(20)

    // Recent slammy winners with photos
    const { data: slammyRecent } = await supabase.from('slammy_awards')
      .select('id, year, category, winner_name, winner:winner_id(id, name, slug, photo_url)')
      .order('year', { ascending: false }).limit(10)

    // Recent year-end winners with photos
    const { data: yearEndRecent } = await supabase.from('year_end_awards')
      .select('id, year, category, winner_name, winner:winner_id(id, name, slug, photo_url)')
      .order('year', { ascending: false }).limit(10)

    // Build spotlight entries - unique superstars with photos
    const seen = new Set<number>()
    const spotlight: any[] = []

    for (const h of (hofRecent || [])) {
      const photo = h.superstar?.photo_url || h.image_url
      const sid = h.superstar?.id
      if (photo && sid && !seen.has(sid)) {
        seen.add(sid)
        spotlight.push({ id: sid, name: h.superstar?.name || h.inductee_name, slug: h.superstar?.slug, photo_url: photo, source: 'hof', year: h.induction_year })
      }
    }
    for (const s of (slammyRecent || [])) {
      const sid = s.winner?.id
      if (s.winner?.photo_url && sid && !seen.has(sid)) {
        seen.add(sid)
        spotlight.push({ id: sid, name: s.winner.name, slug: s.winner.slug, photo_url: s.winner.photo_url, source: 'slammy', year: s.year })
      }
    }
    for (const y of (yearEndRecent || [])) {
      const sid = y.winner?.id
      if (y.winner?.photo_url && sid && !seen.has(sid)) {
        seen.add(sid)
        spotlight.push({ id: sid, name: y.winner.name, slug: y.winner.slug, photo_url: y.winner.photo_url, source: 'yearend', year: y.year })
      }
    }

    // Counts
    const [{ count: hofCount }, { count: slammyCount }, { count: yearEndCount }] = await Promise.all([
      supabase.from('hall_of_fame').select('*', { count: 'exact', head: true }),
      supabase.from('slammy_awards').select('*', { count: 'exact', head: true }),
      supabase.from('year_end_awards').select('*', { count: 'exact', head: true }),
    ])

    return NextResponse.json({
      spotlight: spotlight.slice(0, 30),
      counts: { hof: hofCount || 0, slammy: slammyCount || 0, yearEnd: yearEndCount || 0 },
    })
  } catch (err) {
    console.error('[hof-spotlight]', err)
    return NextResponse.json({ spotlight: [], counts: { hof: 0, slammy: 0, yearEnd: 0 } })
  }
}
