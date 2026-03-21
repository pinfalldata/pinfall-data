// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  try {
    const { data: allStars } = await supabase
      .from('superstars')
      .select('id, name, slug, photo_url, total_matches, win_count, loss_count, draw_count, total_reigns, total_championship_days, debut_date, retirement_date, birth_date, status')
      .gt('total_matches', 0)
      .order('total_matches', { ascending: false })

    const stars = allStars || []

    const mostMatches = stars.slice(0, 50).map(s => ({ ...pick(s), total_matches: s.total_matches }))

    const mostWins = [...stars].sort((a, b) => (b.win_count || 0) - (a.win_count || 0)).slice(0, 50).map(s => ({ ...pick(s), wins: s.win_count }))

    const bestWinRate = stars
      .filter(s => (s.total_matches || 0) >= 100)
      .map(s => ({ ...pick(s), win_rate: Math.round(((s.win_count || 0) / (s.total_matches || 1)) * 1000) / 10, total_matches: s.total_matches, wins: s.win_count }))
      .sort((a, b) => b.win_rate - a.win_rate).slice(0, 50)

    const mostReigns = [...stars].sort((a, b) => (b.total_reigns || 0) - (a.total_reigns || 0)).filter(s => (s.total_reigns || 0) > 0).slice(0, 50).map(s => ({ ...pick(s), reigns: s.total_reigns }))

    const mostChampionshipDays = [...stars].sort((a, b) => (b.total_championship_days || 0) - (a.total_championship_days || 0)).filter(s => (s.total_championship_days || 0) > 0).slice(0, 50).map(s => ({ ...pick(s), days: s.total_championship_days }))

    // Most 5-star matches (rating >= 5)
    const { data: fiveStarData } = await supabase
      .from('match_participants')
      .select('superstar_id, match:matches!match_participants_match_id_fkey(rating)')
      .gte('match.rating', 5)

    const fiveStarMap = new Map<number, number>()
    for (const p of (fiveStarData || [])) {
      if (p.match?.rating >= 5) fiveStarMap.set(p.superstar_id, (fiveStarMap.get(p.superstar_id) || 0) + 1)
    }
    const starMap = new Map(stars.map(s => [s.id, s]))
    const mostFiveStar = [...fiveStarMap.entries()]
      .sort((a, b) => b[1] - a[1]).slice(0, 30)
      .map(([id, count]) => { const s = starMap.get(id); return s ? { ...pick(s), five_star_matches: count } : null })
      .filter(Boolean)

    // Longest career — uses debut_date & retirement_date (or now if still active)
    const longestCareer = stars
      .filter(s => s.debut_date)
      .map(s => {
        const debut = new Date(s.debut_date)
        const end = s.retirement_date ? new Date(s.retirement_date) : new Date()
        const years = Math.round((end.getTime() - debut.getTime()) / (365.25 * 24 * 3600 * 1000) * 10) / 10
        return { ...pick(s), debut_date: s.debut_date, retirement_date: s.retirement_date, career_years: years, status: s.status }
      })
      .sort((a, b) => b.career_years - a.career_years).slice(0, 50)

    return NextResponse.json({ mostMatches, mostWins, bestWinRate, mostReigns, mostChampionshipDays, mostFiveStar, longestCareer })
  } catch (err) {
    console.error('[records-superstars]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function pick(s: any) { return { id: s.id, name: s.name, slug: s.slug, photo_url: s.photo_url } }
