// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/championship-detail?slug=wwe-championship&page=1
 * Returns championship info + paginated reign history + title defense matches
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 })
  }

  try {
    // Fetch championship
    const { data: championship, error: chErr } = await supabase
      .from('championships')
      .select('*')
      .eq('slug', slug)
      .single()

    if (chErr || !championship) {
      return NextResponse.json({ error: 'Championship not found' }, { status: 404 })
    }

    // Fetch all reigns with superstar info
    const { data: reigns, error: rErr, count } = await supabase
      .from('championship_reigns')
      .select(`
        id, won_date, lost_date, days_held, reign_number, notes,
        won_match_id, lost_match_id,
        superstar:superstar_id ( id, name, slug, photo_url ),
        won_at_show:won_at_show_id ( id, name, slug, date ),
        lost_at_show:lost_at_show_id ( id, name, slug, date )
      `, { count: 'exact' })
      .eq('championship_id', championship.id)
      .order('won_date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (rErr) {
      console.error('[championship-detail] reigns error:', rErr)
    }

    // Get unique holders grouped
    const { data: allReigns } = await supabase
      .from('championship_reigns')
      .select(`
        id, superstar_id, won_date, lost_date, days_held,
        superstar:superstar_id ( id, name, slug, photo_url )
      `)
      .eq('championship_id', championship.id)
      .order('won_date', { ascending: false })

    // Group by superstar
    const holderMap = new Map<number, any>()
    for (const r of (allReigns || [])) {
      const sid = r.superstar?.id
      if (!sid) continue
      if (!holderMap.has(sid)) {
        holderMap.set(sid, {
          ...r.superstar,
          reign_count: 0,
          total_days: 0,
          reigns: [],
        })
      }
      const h = holderMap.get(sid)!
      h.reign_count++
      h.total_days += r.days_held || 0
      h.reigns.push({
        id: r.id,
        won_date: r.won_date,
        lost_date: r.lost_date,
        days_held: r.days_held,
      })
    }

    const holders = Array.from(holderMap.values()).sort((a, b) => {
      // Sort by first won_date descending
      const aDate = a.reigns[a.reigns.length - 1]?.won_date || ''
      const bDate = b.reigns[b.reigns.length - 1]?.won_date || ''
      return bDate.localeCompare(aDate)
    })

    // For each reign on current page, get title defense matches
    const reignsWithDefenses = await Promise.all(
      (reigns || []).map(async (r) => {
        // Get matches where this championship was on the line during this reign
        const matchQuery = supabase
          .from('matches')
          .select(`
            id, slug, date, duration_seconds, rating, result_type, is_title_change,
            match_type:match_type_id ( id, name, slug ),
            show:show_id ( id, name, slug )
          `)
          .eq('championship_id', championship.id)
          .gte('date', r.won_date)

        if (r.lost_date) {
          matchQuery.lte('date', r.lost_date)
        }

        const { data: matches } = await matchQuery
          .order('date', { ascending: true })
          .limit(20)

        // Get participants for each match
        const matchesWithParticipants = await Promise.all(
          (matches || []).map(async (m) => {
            const { data: participants } = await supabase
              .from('match_participants')
              .select(`
                team_number, is_winner,
                superstar:superstar_id ( id, name, slug, photo_url )
              `)
              .eq('match_id', m.id)
              .order('team_number', { ascending: true })

            // Group by team
            const teams: any[] = []
            for (const p of (participants || [])) {
              const tn = p.team_number || 1
              if (!teams[tn - 1]) teams[tn - 1] = { members: [], is_winner: false }
              teams[tn - 1].members.push(p.superstar)
              if (p.is_winner) teams[tn - 1].is_winner = true
            }

            return { ...m, teams: teams.filter(Boolean) }
          })
        )

        return {
          ...r,
          defenses: matchesWithParticipants,
        }
      })
    )

    // Prev/next championships
    const { data: allChamps } = await supabase
      .from('championships')
      .select('id, name, slug, sort_order')
      .order('sort_order', { ascending: true })

    let prevChamp = null, nextChamp = null
    if (allChamps && allChamps.length > 1) {
      const idx = allChamps.findIndex(c => c.id === championship.id)
      if (idx > 0) prevChamp = { slug: allChamps[idx-1].slug, name: allChamps[idx-1].name }
      if (idx >= 0 && idx < allChamps.length - 1) nextChamp = { slug: allChamps[idx+1].slug, name: allChamps[idx+1].name }
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      championship,
      reigns: reignsWithDefenses,
      holders,
      total,
      page,
      totalPages,
      prevChamp,
      nextChamp,
    })
  } catch (err: any) {
    console.error('[championship-detail] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
