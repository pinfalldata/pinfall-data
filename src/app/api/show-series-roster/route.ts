// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/show-series-roster?slug=raw&tab=superstars&page=1&limit=60
 * 
 * Tabs: superstars, referees, commentators, announcers, interviewers, stats
 * 
 * Returns roster members for a show series with appearance counts and W/L/D stats
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const tab = searchParams.get('tab') || 'superstars'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(120, Math.max(20, parseInt(searchParams.get('limit') || '60')))
  const offset = (page - 1) * limit

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  try {
    // Get series
    const { data: series, error: seriesError } = await supabase
      .from('show_series')
      .select('id, name, slug')
      .eq('slug', slug)
      .single()

    if (seriesError || !series) {
      return NextResponse.json({ error: 'Show series not found' }, { status: 404 })
    }

    // Get all show IDs in this series
    const { data: showIds, error: showErr } = await supabase
      .from('shows')
      .select('id')
      .eq('show_series_id', series.id)

    if (showErr || !showIds) {
      return NextResponse.json({ error: 'Failed to fetch shows' }, { status: 500 })
    }

    const ids = showIds.map(s => s.id)

    if (ids.length === 0) {
      return NextResponse.json({ roster: [], total: 0, page, totalPages: 0, availableTabs: [] })
    }

    // ===== CHECK WHICH TABS HAVE DATA =====
    if (tab === 'check') {
      const [
        { count: superstarsCount },
        { count: refereesCount },
        { count: commentatorsCount },
        { count: announcersCount },
      ] = await Promise.all([
        supabase.from('match_participants').select('id', { count: 'exact', head: true }).in('match_id', 
          // Need match_ids from these shows
          await supabase.from('matches').select('id').in('show_id', ids).then(r => (r.data || []).map(m => m.id))
        ),
        supabase.from('match_referees').select('id', { count: 'exact', head: true }).in('match_id',
          await supabase.from('matches').select('id').in('show_id', ids).then(r => (r.data || []).map(m => m.id))
        ),
        supabase.from('show_commentators').select('id', { count: 'exact', head: true }).in('show_id', ids),
        supabase.from('show_ring_announcers').select('id', { count: 'exact', head: true }).in('show_id', ids),
      ])

      // Check interviewers from show_segment_participants with role='interviewer'
      const { data: segIds } = await supabase.from('show_segments').select('id').in('show_id', ids)
      let interviewerCount = 0
      if (segIds && segIds.length > 0) {
        const { count: ic } = await supabase.from('show_segment_participants').select('id', { count: 'exact', head: true })
          .in('segment_id', segIds.map(s => s.id))
          .eq('role', 'interviewer')
        interviewerCount = ic || 0
      }

      const tabs = []
      if ((superstarsCount || 0) > 0) tabs.push('superstars')
      if ((refereesCount || 0) > 0) tabs.push('referees')
      if ((commentatorsCount || 0) > 0) tabs.push('commentators')
      if ((announcersCount || 0) > 0) tabs.push('announcers')
      if (interviewerCount > 0) tabs.push('interviewers')
      tabs.push('stats') // Always available if there are matches

      return NextResponse.json({ availableTabs: tabs })
    }

    // ===== FETCH MATCH IDS for this series =====
    const { data: matchRows } = await supabase
      .from('matches')
      .select('id')
      .in('show_id', ids)
    const matchIds = (matchRows || []).map(m => m.id)

    // ===== SUPERSTARS TAB =====
    if (tab === 'superstars') {
      if (matchIds.length === 0) {
        return NextResponse.json({ roster: [], total: 0, page, totalPages: 0 })
      }

      // Get all participants with win/loss data — paginate through
      const participantMap = new Map<number, { wins: number; losses: number; draws: number; total: number }>()
      const BATCH = 1000
      let batchOffset = 0
      let hasMore = true

      while (hasMore) {
        const { data: batch } = await supabase
          .from('match_participants')
          .select('superstar_id, is_winner, match_id')
          .in('match_id', matchIds)
          .range(batchOffset, batchOffset + BATCH - 1)

        if (!batch || batch.length === 0) { hasMore = false; break }

        // We need result_type for draws — fetch corresponding matches
        const batchMatchIds = [...new Set(batch.map(b => b.match_id))]
        const { data: matchResults } = await supabase
          .from('matches')
          .select('id, result_type')
          .in('id', batchMatchIds)
        const resultMap = new Map((matchResults || []).map(m => [m.id, m.result_type]))

        for (const p of batch) {
          if (!p.superstar_id) continue
          if (!participantMap.has(p.superstar_id)) {
            participantMap.set(p.superstar_id, { wins: 0, losses: 0, draws: 0, total: 0 })
          }
          const entry = participantMap.get(p.superstar_id)!
          entry.total++
          const rt = resultMap.get(p.match_id)
          const isDraw = rt === 'no_contest' || rt === 'time_limit_draw'
          if (isDraw) entry.draws++
          else if (p.is_winner) entry.wins++
          else entry.losses++
        }

        if (batch.length < BATCH) hasMore = false
        else batchOffset += BATCH
      }

      // Sort by total appearances desc
      const sorted = [...participantMap.entries()]
        .sort((a, b) => b[1].total - a[1].total)

      const total = sorted.length
      const totalPages = Math.ceil(total / limit)
      const paged = sorted.slice(offset, offset + limit)

      // Fetch superstar details
      const superstarIds = paged.map(([id]) => id)
      const { data: superstars } = await supabase
        .from('superstars')
        .select('id, name, slug, photo_url')
        .in('id', superstarIds)
      const superstarMap = new Map((superstars || []).map(s => [s.id, s]))

      const roster = paged.map(([id, stats]) => ({
        ...(superstarMap.get(id) || { id, name: 'Unknown', slug: '', photo_url: null }),
        appearances: stats.total,
        wins: stats.wins,
        losses: stats.losses,
        draws: stats.draws,
      }))

      return NextResponse.json({ roster, total, page, totalPages })
    }

    // ===== REFEREES TAB =====
    if (tab === 'referees') {
      if (matchIds.length === 0) {
        return NextResponse.json({ roster: [], total: 0, page, totalPages: 0 })
      }

      const refMap = new Map<number, number>()
      const BATCH = 1000
      let batchOffset = 0
      let hasMore = true

      while (hasMore) {
        const { data: batch } = await supabase
          .from('match_referees')
          .select('superstar_id')
          .in('match_id', matchIds)
          .not('superstar_id', 'is', null)
          .range(batchOffset, batchOffset + BATCH - 1)

        if (!batch || batch.length === 0) { hasMore = false; break }
        for (const r of batch) {
          if (r.superstar_id) refMap.set(r.superstar_id, (refMap.get(r.superstar_id) || 0) + 1)
        }
        if (batch.length < BATCH) hasMore = false
        else batchOffset += BATCH
      }

      const sorted = [...refMap.entries()].sort((a, b) => b[1] - a[1])
      const total = sorted.length
      const totalPages = Math.ceil(total / limit)
      const paged = sorted.slice(offset, offset + limit)

      const superstarIds = paged.map(([id]) => id)
      const { data: superstars } = await supabase.from('superstars').select('id, name, slug, photo_url').in('id', superstarIds)
      const superstarMap = new Map((superstars || []).map(s => [s.id, s]))

      const roster = paged.map(([id, count]) => ({
        ...(superstarMap.get(id) || { id, name: 'Unknown', slug: '', photo_url: null }),
        appearances: count,
      }))

      return NextResponse.json({ roster, total, page, totalPages })
    }

    // ===== COMMENTATORS TAB =====
    if (tab === 'commentators') {
      const commMap = new Map<number, number>()
      const BATCH = 1000
      let batchOffset = 0
      let hasMore = true

      while (hasMore) {
        const { data: batch } = await supabase
          .from('show_commentators')
          .select('superstar_id')
          .in('show_id', ids)
          .not('superstar_id', 'is', null)
          .range(batchOffset, batchOffset + BATCH - 1)

        if (!batch || batch.length === 0) { hasMore = false; break }
        for (const c of batch) {
          if (c.superstar_id) commMap.set(c.superstar_id, (commMap.get(c.superstar_id) || 0) + 1)
        }
        if (batch.length < BATCH) hasMore = false
        else batchOffset += BATCH
      }

      const sorted = [...commMap.entries()].sort((a, b) => b[1] - a[1])
      const total = sorted.length
      const totalPages = Math.ceil(total / limit)
      const paged = sorted.slice(offset, offset + limit)

      const superstarIds = paged.map(([id]) => id)
      const { data: superstars } = await supabase.from('superstars').select('id, name, slug, photo_url').in('id', superstarIds)
      const superstarMap = new Map((superstars || []).map(s => [s.id, s]))

      const roster = paged.map(([id, count]) => ({
        ...(superstarMap.get(id) || { id, name: 'Unknown', slug: '', photo_url: null }),
        appearances: count,
      }))

      return NextResponse.json({ roster, total, page, totalPages })
    }

    // ===== RING ANNOUNCERS TAB =====
    if (tab === 'announcers') {
      const annMap = new Map<number, number>()
      const BATCH = 1000
      let batchOffset = 0
      let hasMore = true

      while (hasMore) {
        const { data: batch } = await supabase
          .from('show_ring_announcers')
          .select('superstar_id')
          .in('show_id', ids)
          .not('superstar_id', 'is', null)
          .range(batchOffset, batchOffset + BATCH - 1)

        if (!batch || batch.length === 0) { hasMore = false; break }
        for (const a of batch) {
          if (a.superstar_id) annMap.set(a.superstar_id, (annMap.get(a.superstar_id) || 0) + 1)
        }
        if (batch.length < BATCH) hasMore = false
        else batchOffset += BATCH
      }

      const sorted = [...annMap.entries()].sort((a, b) => b[1] - a[1])
      const total = sorted.length
      const totalPages = Math.ceil(total / limit)
      const paged = sorted.slice(offset, offset + limit)

      const superstarIds = paged.map(([id]) => id)
      const { data: superstars } = await supabase.from('superstars').select('id, name, slug, photo_url').in('id', superstarIds)
      const superstarMap = new Map((superstars || []).map(s => [s.id, s]))

      const roster = paged.map(([id, count]) => ({
        ...(superstarMap.get(id) || { id, name: 'Unknown', slug: '', photo_url: null }),
        appearances: count,
      }))

      return NextResponse.json({ roster, total, page, totalPages })
    }

    // ===== INTERVIEWERS TAB (from show_segment_participants with role='interviewer') =====
    if (tab === 'interviewers') {
      const { data: segIds } = await supabase.from('show_segments').select('id').in('show_id', ids)
      if (!segIds || segIds.length === 0) {
        return NextResponse.json({ roster: [], total: 0, page, totalPages: 0 })
      }

      const intMap = new Map<number, number>()
      const segIdList = segIds.map(s => s.id)
      const BATCH = 1000
      let batchOffset = 0
      let hasMore = true

      while (hasMore) {
        const { data: batch } = await supabase
          .from('show_segment_participants')
          .select('superstar_id')
          .in('segment_id', segIdList)
          .eq('role', 'interviewer')
          .range(batchOffset, batchOffset + BATCH - 1)

        if (!batch || batch.length === 0) { hasMore = false; break }
        for (const p of batch) {
          if (p.superstar_id) intMap.set(p.superstar_id, (intMap.get(p.superstar_id) || 0) + 1)
        }
        if (batch.length < BATCH) hasMore = false
        else batchOffset += BATCH
      }

      const sorted = [...intMap.entries()].sort((a, b) => b[1] - a[1])
      const total = sorted.length
      const totalPages = Math.ceil(total / limit)
      const paged = sorted.slice(offset, offset + limit)

      const superstarIds = paged.map(([id]) => id)
      const { data: superstars } = await supabase.from('superstars').select('id, name, slug, photo_url').in('id', superstarIds)
      const superstarMap = new Map((superstars || []).map(s => [s.id, s]))

      const roster = paged.map(([id, count]) => ({
        ...(superstarMap.get(id) || { id, name: 'Unknown', slug: '', photo_url: null }),
        appearances: count,
      }))

      return NextResponse.json({ roster, total, page, totalPages })
    }

    // ===== STATS TAB =====
    if (tab === 'stats') {
      if (matchIds.length === 0) {
        return NextResponse.json({ stats: null })
      }

      // Aggregate stats by paginating through matches
      const winMethodStats: Record<string, number> = {}
      let totalMatches = 0
      let totalTitleChanges = 0
      const ratingValues: number[] = []
      const durationValues: number[] = []
      const matchTypeStats: Record<string, number> = {}

      const BATCH = 1000
      let batchOffset = 0
      let hasMore = true

      while (hasMore) {
        const { data: batch } = await supabase
          .from('matches')
          .select('result_type, rating, duration_seconds, is_title_change, match_type_id')
          .in('show_id', ids)
          .range(batchOffset, batchOffset + BATCH - 1)

        if (!batch || batch.length === 0) { hasMore = false; break }

        for (const m of batch) {
          totalMatches++
          if (m.result_type) winMethodStats[m.result_type] = (winMethodStats[m.result_type] || 0) + 1
          if (m.rating) ratingValues.push(Number(m.rating))
          if (m.duration_seconds) durationValues.push(m.duration_seconds)
          if (m.is_title_change) totalTitleChanges++
          if (m.match_type_id) matchTypeStats[m.match_type_id] = (matchTypeStats[m.match_type_id] || 0) + 1
        }

        if (batch.length < BATCH) hasMore = false
        else batchOffset += BATCH
      }

      // Get match type names for top types
      const topTypeIds = Object.entries(matchTypeStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id]) => parseInt(id))

      const { data: typeNames } = await supabase
        .from('match_types')
        .select('id, name, slug')
        .in('id', topTypeIds)
      const typeNameMap = new Map((typeNames || []).map(t => [t.id, t]))

      const sortedWinMethods = Object.entries(winMethodStats)
        .map(([method, count]) => ({ method, count, percentage: totalMatches > 0 ? Math.round((count / totalMatches) * 1000) / 10 : 0 }))
        .sort((a, b) => b.count - a.count)

      const topMatchTypes = Object.entries(matchTypeStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([id, count]) => {
          const t = typeNameMap.get(parseInt(id))
          return { id: parseInt(id), name: t?.name || 'Unknown', slug: t?.slug || '', count }
        })

      const avgRating = ratingValues.length > 0
        ? Math.round((ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length) * 100) / 100
        : null
      const avgDuration = durationValues.length > 0
        ? Math.round(durationValues.reduce((a, b) => a + b, 0) / durationValues.length)
        : null

      return NextResponse.json({
        stats: {
          totalMatches,
          totalShows: ids.length,
          totalTitleChanges,
          titleChangePercentage: totalMatches > 0 ? Math.round((totalTitleChanges / totalMatches) * 1000) / 10 : 0,
          avgRating,
          avgDuration,
          winMethods: sortedWinMethods,
          topMatchTypes,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid tab' }, { status: 400 })
  } catch (err: any) {
    console.error('[show-series-roster] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error', details: err?.message }, { status: 500 })
  }
}
