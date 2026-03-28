// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// CRITICAL: Force dynamic rendering — prevents Next.js / Vercel from caching
// a stale date (e.g. yesterday's birthdays served after midnight)
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    // Use client-provided local date to avoid Vercel UTC mismatch
    const now = new Date()
    const m = parseInt(searchParams.get('month') || String(now.getMonth() + 1))
    const d = parseInt(searchParams.get('day') || String(now.getDate()))
    const monthStr = String(m).padStart(2, '0')
    const dayStr = String(d).padStart(2, '0')

    // ═══════════════════════════════════════════
    // SEPARATE QUERIES — no nested joins (rule #1)
    // ═══════════════════════════════════════════

    const [
      { data: allStarsForBday },
      { data: recentMatchesRaw },
      { data: recentSegmentsRaw },
      { data: championships },
    ] = await Promise.all([
      supabase
        .from('superstars')
        .select('id, name, slug, photo_url, birth_date, total_matches')
        .not('birth_date', 'is', null)
        .order('total_matches', { ascending: false, nullsFirst: false }),

      supabase
        .from('matches')
        .select('id, slug, date, rating, duration_seconds, result_type, match_type_id, show_id')
        .order('date', { ascending: false })
        .limit(5),

      supabase
        .from('show_segments')
        .select('id, title, slug, category, show_id')
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('championships')
        .select('id, name, slug, image_url, status')
        .order('sort_order', { ascending: true }),
    ])

    // ═══════════════════════════════════════════
    // BIRTHDAYS — filter month/day in JavaScript
    // ═══════════════════════════════════════════
    const birthdays = (allStarsForBday || [])
      .filter(s => {
        if (!s.birth_date) return false
        return String(s.birth_date).endsWith(`-${monthStr}-${dayStr}`)
      })
      .slice(0, 20)
      .map(s => ({
        ...s,
        birth_year: s.birth_date ? parseInt(String(s.birth_date).slice(0, 4)) : null,
      }))

    // ═══════════════════════════════════════════
    // MERGE: Recent Matches + related data
    // ═══════════════════════════════════════════
    let recentMatches = []
    if (recentMatchesRaw && recentMatchesRaw.length > 0) {
      const matchIds = recentMatchesRaw.map(m => m.id)
      const showIds = [...new Set(recentMatchesRaw.map(m => m.show_id).filter(Boolean))]
      const matchTypeIds = [...new Set(recentMatchesRaw.map(m => m.match_type_id).filter(Boolean))]

      const [
        { data: shows },
        { data: matchTypes },
        { data: participants },
      ] = await Promise.all([
        showIds.length > 0
          ? supabase.from('shows').select('id, name, slug, date, show_series_id').in('id', showIds)
          : { data: [] },
        matchTypeIds.length > 0
          ? supabase.from('match_types').select('id, name').in('id', matchTypeIds)
          : { data: [] },
        supabase.from('match_participants').select('id, match_id, team_number, is_winner, superstar_id').in('match_id', matchIds),
      ])

      const seriesIds = [...new Set((shows || []).map(s => s.show_series_id).filter(Boolean))]
      let showSeriesMap = {}
      if (seriesIds.length > 0) {
        const { data: series } = await supabase.from('show_series').select('id, name, short_name, logo_url').in('id', seriesIds)
        for (const s of (series || [])) showSeriesMap[s.id] = s
      }

      const starIds = [...new Set((participants || []).map(p => p.superstar_id).filter(Boolean))]
      let starsMap = {}
      if (starIds.length > 0) {
        const { data: starsList } = await supabase.from('superstars').select('id, name, slug, photo_url').in('id', starIds)
        for (const s of (starsList || [])) starsMap[s.id] = s
      }

      const showsMap = {}
      for (const s of (shows || [])) showsMap[s.id] = { ...s, show_series: showSeriesMap[s.show_series_id] || null }
      const typesMap = {}
      for (const t of (matchTypes || [])) typesMap[t.id] = t

      recentMatches = recentMatchesRaw.map(m => ({
        ...m,
        show: showsMap[m.show_id] || null,
        match_type: typesMap[m.match_type_id] || null,
        participants: (participants || [])
          .filter(p => p.match_id === m.id)
          .map(p => ({ ...p, superstar: starsMap[p.superstar_id] || null })),
      }))
    }

    // ═══════════════════════════════════════════
    // MERGE: Recent Segments + related data
    // ═══════════════════════════════════════════
    let recentSegments = []
    if (recentSegmentsRaw && recentSegmentsRaw.length > 0) {
      const segIds = recentSegmentsRaw.map(s => s.id)
      const segShowIds = [...new Set(recentSegmentsRaw.map(s => s.show_id).filter(Boolean))]

      const [
        { data: segShows },
        { data: segParts },
      ] = await Promise.all([
        segShowIds.length > 0
          ? supabase.from('shows').select('id, name, slug, date, show_series_id').in('id', segShowIds)
          : { data: [] },
        supabase.from('show_segment_participants').select('id, show_segment_id, superstar_id').in('show_segment_id', segIds),
      ])

      const segSeriesIds = [...new Set((segShows || []).map(s => s.show_series_id).filter(Boolean))]
      let segSeriesMap = {}
      if (segSeriesIds.length > 0) {
        const { data: series } = await supabase.from('show_series').select('id, name, short_name, logo_url').in('id', segSeriesIds)
        for (const s of (series || [])) segSeriesMap[s.id] = s
      }

      const segStarIds = [...new Set((segParts || []).map(p => p.superstar_id).filter(Boolean))]
      let segStarsMap = {}
      if (segStarIds.length > 0) {
        const { data: segStarsList } = await supabase.from('superstars').select('id, name, slug, photo_url').in('id', segStarIds)
        for (const s of (segStarsList || [])) segStarsMap[s.id] = s
      }

      const segShowsMap = {}
      for (const s of (segShows || [])) segShowsMap[s.id] = { ...s, show_series: segSeriesMap[s.show_series_id] || null }

      recentSegments = recentSegmentsRaw.map(s => ({
        ...s,
        show: segShowsMap[s.show_id] || null,
        participants: (segParts || [])
          .filter(p => p.show_segment_id === s.id)
          .map(p => ({ ...p, superstar: segStarsMap[p.superstar_id] || null })),
      }))
    }

    return NextResponse.json({
      birthdays,
      recentMatches,
      recentSegments,
      championships: championships || [],
    })
  } catch (err) {
    console.error('[homepage-data]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
