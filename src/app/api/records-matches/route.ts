// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  try {
    // ===== HIGHEST RATED =====
    const { data: topRated } = await supabase.from('matches')
      .select('id, slug, date, rating, duration_seconds, is_title_change, match_type:match_types(name, slug), championship:championships(name, slug, image_url), show:shows(name, slug)')
      .not('rating', 'is', null).order('rating', { ascending: false }).limit(100)

    // ===== LONGEST MATCHES =====
    const { data: longestData } = await supabase.from('matches')
      .select('id, slug, date, duration_seconds, rating, match_type:match_types(name), show:shows(name, slug)')
      .not('duration_seconds', 'is', null).order('duration_seconds', { ascending: false }).limit(50)

    // ===== SHORTEST MATCHES =====
    const { data: shortestData } = await supabase.from('matches')
      .select('id, slug, date, duration_seconds, rating, match_type:match_types(name), show:shows(name, slug)')
      .not('duration_seconds', 'is', null).gt('duration_seconds', 0).order('duration_seconds', { ascending: true }).limit(50)

    // Batch enrich all these with participants
    const allMatchIds = [
      ...(topRated || []).map(m => m.id),
      ...(longestData || []).map(m => m.id),
      ...(shortestData || []).map(m => m.id),
    ]
    const uniqueIds = [...new Set(allMatchIds)]

    let partMap: Record<number, any[]> = {}
    if (uniqueIds.length > 0) {
      const batchSize = 300
      for (let i = 0; i < uniqueIds.length; i += batchSize) {
        const batch = uniqueIds.slice(i, i + batchSize)
        const { data: parts } = await supabase.from('match_participants')
          .select('match_id, is_winner, team_number, superstar:superstars(id, name, slug, photo_url)')
          .in('match_id', batch)
        for (const p of (parts || [])) {
          if (!partMap[p.match_id]) partMap[p.match_id] = []
          if (p.superstar) partMap[p.match_id].push({ ...p.superstar, is_winner: p.is_winner, team_number: p.team_number })
        }
      }
    }

    function enrichMatch(m: any) {
      const participants = partMap[m.id] || []
      return {
        id: m.id, slug: m.slug, date: m.date, rating: m.rating,
        duration_seconds: m.duration_seconds, is_title_change: m.is_title_change,
        match_type: m.match_type?.name, show_name: m.show?.name, show_slug: m.show?.slug,
        championship: m.championship?.name,
        participants: participants.slice(0, 8).map(p => ({ id: p.id, name: p.name, slug: p.slug, photo_url: p.photo_url, is_winner: p.is_winner })),
        participant_count: participants.length,
      }
    }

    const highestRated = (topRated || []).map(enrichMatch)
    const longestMatches = (longestData || []).map(enrichMatch)
    const shortestMatches = (shortestData || []).map(enrichMatch)

    // ===== MOST PARTICIPANTS =====
    const { data: allParts } = await supabase.from('match_participants').select('match_id')
    const matchPartCount = new Map<number, number>()
    for (const p of (allParts || [])) matchPartCount.set(p.match_id, (matchPartCount.get(p.match_id) || 0) + 1)

    const topPartMatchIds = [...matchPartCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(e => e[0])
    let mostParticipants: any[] = []
    if (topPartMatchIds.length > 0) {
      const { data: mpMatches } = await supabase.from('matches')
        .select('id, slug, date, match_type:match_types(name), show:shows(name, slug)')
        .in('id', topPartMatchIds)
      const mpMap = new Map((mpMatches || []).map(m => [m.id, m]))

      // Enrich with participants
      for (let i = 0; i < topPartMatchIds.length; i += 300) {
        const batch = topPartMatchIds.slice(i, i + 300)
        const { data: parts } = await supabase.from('match_participants')
          .select('match_id, superstar:superstars(id, name, slug, photo_url)')
          .in('match_id', batch)
        for (const p of (parts || [])) {
          if (!partMap[p.match_id]) partMap[p.match_id] = []
          // avoid duplicates
          if (p.superstar && !partMap[p.match_id].find((x: any) => x.id === p.superstar.id)) {
            partMap[p.match_id].push(p.superstar)
          }
        }
      }

      mostParticipants = topPartMatchIds.map(id => {
        const m = mpMap.get(id)
        if (!m) return null
        const parts = partMap[m.id] || []
        return {
          id: m.id, slug: m.slug, date: m.date, match_type: m.match_type?.name,
          show_name: m.show?.name, show_slug: m.show?.slug,
          participant_count: matchPartCount.get(id) || 0,
          participants: parts.slice(0, 10).map((p: any) => ({ id: p.id, name: p.name, slug: p.slug, photo_url: p.photo_url })),
        }
      }).filter(Boolean)
    }

    // ===== YOUNGEST & OLDEST COMPETITORS =====
    // Separate queries to avoid join issues
    const { data: starsWithBirth } = await supabase.from('superstars')
      .select('id, name, slug, photo_url, birth_date')
      .not('birth_date', 'is', null)

    const birthMap = new Map<number, { name: string; slug: string; photo_url: string | null; birth_date: string }>()
    for (const s of (starsWithBirth || [])) birthMap.set(s.id, s)

    // Get all participations with match dates
    const { data: partWithDates } = await supabase.from('match_participants')
      .select('superstar_id, match_id')

    // Get all match dates
    const { data: matchDates } = await supabase.from('matches').select('id, date').not('date', 'is', null)
    const dateMap = new Map<number, string>()
    for (const m of (matchDates || [])) dateMap.set(m.id, m.date)

    // Compute ages
    const youngestMap = new Map<number, { age: number; date: string }>()
    const oldestMap = new Map<number, { age: number; date: string }>()

    for (const p of (partWithDates || [])) {
      const star = birthMap.get(p.superstar_id)
      const matchDate = dateMap.get(p.match_id)
      if (!star || !matchDate) continue

      const age = (new Date(matchDate).getTime() - new Date(star.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000)
      if (age <= 0 || age > 100) continue // sanity check

      const ey = youngestMap.get(p.superstar_id)
      if (!ey || age < ey.age) youngestMap.set(p.superstar_id, { age, date: matchDate })

      const eo = oldestMap.get(p.superstar_id)
      if (!eo || age > eo.age) oldestMap.set(p.superstar_id, { age, date: matchDate })
    }

    const youngest = [...youngestMap.entries()]
      .sort((a, b) => a[1].age - b[1].age)
      .slice(0, 30)
      .map(([id, data]) => {
        const s = birthMap.get(id)
        return s ? { id, name: s.name, slug: s.slug, photo_url: s.photo_url, age: Math.round(data.age * 10) / 10, date: data.date } : null
      })
      .filter(Boolean)

    const oldest = [...oldestMap.entries()]
      .sort((a, b) => b[1].age - a[1].age)
      .slice(0, 30)
      .map(([id, data]) => {
        const s = birthMap.get(id)
        return s ? { id, name: s.name, slug: s.slug, photo_url: s.photo_url, age: Math.round(data.age * 10) / 10, date: data.date } : null
      })
      .filter(Boolean)

    return NextResponse.json({ highestRated, longestMatches, shortestMatches, mostParticipants, youngest, oldest })
  } catch (err) {
    console.error('[records-matches]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
