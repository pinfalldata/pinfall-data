// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

async function safeCount(query: any): Promise<number> {
  try {
    const result = await query
    return result?.count ?? 0
  } catch { return 0 }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ids = (searchParams.get('ids') || '').split(',').map(Number).filter(n => n > 0)

  if (ids.length === 0 || ids.length > 4) {
    return NextResponse.json({ superstars: [] })
  }

  try {
    const { data: stars, error: starsError } = await supabase.from('superstars')
      .select('id, name, slug, photo_url, birth_date, height_cm, weight_kg, debut_date, retirement_date, status, gender, billed_from, current_brand, total_matches, win_count, loss_count, draw_count, total_reigns, total_championship_days')
      .in('id', ids)

    if (starsError) {
      console.error('[superstar-compare] stars query error:', starsError)
      return NextResponse.json({ superstars: [], debug: { error: starsError.message } })
    }

    if (!stars || stars.length === 0) {
      return NextResponse.json({ superstars: [], debug: { ids, found: 0 } })
    }

    const enriched = await Promise.all(stars.map(async (s) => {
      const [titleReigns, omgMoments, tagTeams, segments, hofCount, slammyCount, yearEndCount] = await Promise.all([
        safeCount(supabase.from('championship_reigns').select('*', { count: 'exact', head: true }).eq('superstar_id', s.id)),
        safeCount(supabase.from('omg_moment_participants').select('*', { count: 'exact', head: true }).eq('superstar_id', s.id)),
        safeCount(supabase.from('tag_team_members').select('*', { count: 'exact', head: true }).eq('superstar_id', s.id)),
        safeCount(supabase.from('show_segment_participants').select('*', { count: 'exact', head: true }).eq('superstar_id', s.id)),
        safeCount(supabase.from('hall_of_fame').select('*', { count: 'exact', head: true }).eq('superstar_id', s.id)),
        safeCount(supabase.from('slammy_awards').select('*', { count: 'exact', head: true }).eq('winner_id', s.id)),
        safeCount(supabase.from('year_end_awards').select('*', { count: 'exact', head: true }).eq('winner_id', s.id)),
      ])

      const winRate = s.total_matches > 0 ? Math.round((s.win_count / s.total_matches) * 1000) / 10 : 0
      const age = s.birth_date ? Math.floor((Date.now() - new Date(s.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000)) : null
      const careerYears = s.debut_date ? Math.round(((s.retirement_date ? new Date(s.retirement_date) : new Date()).getTime() - new Date(s.debut_date).getTime()) / (365.25 * 24 * 3600 * 1000) * 10) / 10 : null

      return {
        id: s.id, name: s.name, slug: s.slug, photo_url: s.photo_url,
        birth_date: s.birth_date, age, height_cm: s.height_cm, weight_kg: s.weight_kg,
        debut_date: s.debut_date, retirement_date: s.retirement_date,
        status: s.status, gender: s.gender, billed_from: s.billed_from, current_brand: s.current_brand,
        total_matches: s.total_matches || 0, wins: s.win_count || 0, losses: s.loss_count || 0,
        draws: s.draw_count || 0, win_rate: winRate, career_years: careerYears,
        title_reigns: titleReigns, championship_days: s.total_championship_days || 0,
        omg_moments: omgMoments, tag_teams: tagTeams, segments: segments,
        hall_of_fame: hofCount, slammy_awards: slammyCount, year_end_awards: yearEndCount,
      }
    }))

    return NextResponse.json({ superstars: enriched })
  } catch (err: any) {
    console.error('[superstar-compare]', err)
    return NextResponse.json({ superstars: [], debug: { error: err?.message } })
  }
}
