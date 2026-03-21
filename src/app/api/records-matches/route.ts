// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  try {
    // Highest rated matches
    const { data: topRated } = await supabase.from('matches')
      .select('id, slug, date, rating, duration_seconds, is_title_change, match_type:match_types(name, slug), championship:championships(name, slug, image_url), show:shows(name, slug)')
      .not('rating', 'is', null).order('rating', { ascending: false }).limit(100)

    // Enrich top rated with participant names
    const topIds = (topRated || []).map(m => m.id)
    let topPartMap: Record<number, string[]> = {}
    if (topIds.length > 0) {
      const { data: parts } = await supabase.from('match_participants')
        .select('match_id, superstar:superstars(name)').in('match_id', topIds)
      for (const p of (parts || [])) {
        if (!topPartMap[p.match_id]) topPartMap[p.match_id] = []
        if (p.superstar?.name) topPartMap[p.match_id].push(p.superstar.name)
      }
    }

    const highestRated = (topRated || []).map(m => ({
      id: m.id, slug: m.slug, date: m.date, rating: m.rating,
      duration_seconds: m.duration_seconds, is_title_change: m.is_title_change,
      match_type: m.match_type?.name, show: m.show?.name, show_slug: m.show?.slug,
      championship: m.championship?.name, participants: (topPartMap[m.id] || []).slice(0, 6),
    }))

    // Longest matches
    const { data: longestData } = await supabase.from('matches')
      .select('id, slug, date, duration_seconds, rating, match_type:match_types(name), show:shows(name, slug)')
      .not('duration_seconds', 'is', null).order('duration_seconds', { ascending: false }).limit(50)

    const longIds = (longestData || []).map(m => m.id)
    let longPartMap: Record<number, string[]> = {}
    if (longIds.length > 0) {
      const { data } = await supabase.from('match_participants').select('match_id, superstar:superstars(name)').in('match_id', longIds)
      for (const p of (data || [])) { if (!longPartMap[p.match_id]) longPartMap[p.match_id] = []; if (p.superstar?.name) longPartMap[p.match_id].push(p.superstar.name) }
    }
    const longestMatches = (longestData || []).map(m => ({
      id: m.id, slug: m.slug, date: m.date, duration_seconds: m.duration_seconds,
      rating: m.rating, match_type: m.match_type?.name, show: m.show?.name, show_slug: m.show?.slug,
      participants: (longPartMap[m.id] || []).slice(0, 6),
    }))

    // Shortest matches
    const { data: shortestData } = await supabase.from('matches')
      .select('id, slug, date, duration_seconds, rating, match_type:match_types(name), show:shows(name, slug)')
      .not('duration_seconds', 'is', null).gt('duration_seconds', 0).order('duration_seconds', { ascending: true }).limit(50)

    const shortIds = (shortestData || []).map(m => m.id)
    let shortPartMap: Record<number, string[]> = {}
    if (shortIds.length > 0) {
      const { data } = await supabase.from('match_participants').select('match_id, superstar:superstars(name)').in('match_id', shortIds)
      for (const p of (data || [])) { if (!shortPartMap[p.match_id]) shortPartMap[p.match_id] = []; if (p.superstar?.name) shortPartMap[p.match_id].push(p.superstar.name) }
    }
    const shortestMatches = (shortestData || []).map(m => ({
      id: m.id, slug: m.slug, date: m.date, duration_seconds: m.duration_seconds,
      rating: m.rating, match_type: m.match_type?.name, show: m.show?.name, show_slug: m.show?.slug,
      participants: (shortPartMap[m.id] || []).slice(0, 6),
    }))

    // Most participants in a single match
    const { data: partCounts } = await supabase.from('match_participants').select('match_id')
    const matchPartCount = new Map<number, number>()
    for (const p of (partCounts || [])) matchPartCount.set(p.match_id, (matchPartCount.get(p.match_id) || 0) + 1)
    const topPartMatchIds = [...matchPartCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(e => e[0])

    let mostParticipants: any[] = []
    if (topPartMatchIds.length > 0) {
      const { data: mpMatches } = await supabase.from('matches')
        .select('id, slug, date, match_type:match_types(name), show:shows(name, slug)')
        .in('id', topPartMatchIds)
      const mpMap = new Map((mpMatches || []).map(m => [m.id, m]))
      mostParticipants = topPartMatchIds.map(id => {
        const m = mpMap.get(id)
        return m ? { id: m.id, slug: m.slug, date: m.date, match_type: m.match_type?.name, show: m.show?.name, show_slug: m.show?.slug, participant_count: matchPartCount.get(id) || 0 } : null
      }).filter(Boolean)
    }

    // Youngest & oldest to compete
    const { data: ageData } = await supabase.from('match_participants')
      .select('match_id, superstar:superstars(id, name, slug, photo_url, birth_date), match:matches(date)')
      .not('superstar.birth_date', 'is', null)

    let youngest: any[] = []
    let oldest: any[] = []
    const ageEntries = (ageData || []).filter(p => p.superstar?.birth_date && p.match?.date).map(p => {
      const age = (new Date(p.match.date).getTime() - new Date(p.superstar.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000)
      return { id: p.superstar.id, name: p.superstar.name, slug: p.superstar.slug, photo_url: p.superstar.photo_url, age: Math.round(age * 10) / 10, date: p.match.date }
    })

    // Deduplicate — keep only the youngest/oldest appearance per superstar
    const youngestMap = new Map<number, any>()
    const oldestMap = new Map<number, any>()
    for (const e of ageEntries) {
      const ey = youngestMap.get(e.id)
      if (!ey || e.age < ey.age) youngestMap.set(e.id, e)
      const eo = oldestMap.get(e.id)
      if (!eo || e.age > eo.age) oldestMap.set(e.id, e)
    }
    youngest = [...youngestMap.values()].sort((a, b) => a.age - b.age).slice(0, 30)
    oldest = [...oldestMap.values()].sort((a, b) => b.age - a.age).slice(0, 30)

    return NextResponse.json({ highestRated, longestMatches, shortestMatches, mostParticipants, youngest, oldest })
  } catch (err) {
    console.error('[records-matches]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
