// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = 50
  const offset = (page - 1) * limit

  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 })

  try {
    const { data: championship, error: chErr } = await supabase
      .from('championships')
      .select('*, is_tag_team')
      .eq('slug', slug)
      .single()

    if (chErr || !championship) return NextResponse.json({ error: 'Championship not found' }, { status: 404 })

    // Fetch all reigns with superstar info
    const { data: rawReigns, error: rErr, count } = await supabase
      .from('championship_reigns')
      .select(`
        id, won_date, lost_date, days_held, reign_number, reign_group_id, notes,
        won_match_id, lost_match_id,
        superstar:superstar_id ( id, name, slug, photo_url ),
        won_at_show:won_at_show_id ( id, name, slug, date ),
        lost_at_show:lost_at_show_id ( id, name, slug, date )
      `, { count: 'exact' })
      .eq('championship_id', championship.id)
      .order('won_date', { ascending: false })
      .order('reign_order', { ascending: true })

    // Group tag team reigns by reign_group_id
    let reigns = []
    if (championship.is_tag_team) {
      const groupMap = new Map()
      const ungrouped = []
      for (const r of (rawReigns || [])) {
        if (r.reign_group_id) {
          if (!groupMap.has(r.reign_group_id)) {
            groupMap.set(r.reign_group_id, {
              ...r,
              superstars: [r.superstar],
              isTagTeam: true,
            })
          } else {
            groupMap.get(r.reign_group_id).superstars.push(r.superstar)
          }
        } else {
          ungrouped.push({ ...r, superstars: [r.superstar], isTagTeam: false })
        }
      }
      const grouped = Array.from(groupMap.values())
      reigns = [...grouped, ...ungrouped].sort((a, b) => {
        if (a.won_date && b.won_date) return b.won_date.localeCompare(a.won_date)
        return 0
      })
    } else {
      reigns = (rawReigns || []).map(r => ({ ...r, superstars: [r.superstar], isTagTeam: false }))
    }

    // Paginate grouped reigns
    const totalGrouped = reigns.length
    const totalPages = Math.ceil(totalGrouped / limit)
    const pagedReigns = reigns.slice(offset, offset + limit)

    // For each reign, get title defense matches
    const reignsWithDefenses = await Promise.all(
      pagedReigns.map(async (r) => {
        const matchQuery = supabase
          .from('matches')
          .select(`
            id, slug, date, duration_seconds, rating, result_type, is_title_change,
            match_type:match_type_id ( id, name, slug ),
            show:show_id ( id, name, slug )
          `)
          .eq('championship_id', championship.id)
          .gte('date', r.won_date)

        if (r.lost_date) matchQuery.lte('date', r.lost_date)

        const { data: matches } = await matchQuery.order('date', { ascending: true }).limit(20)

        const matchesWithParticipants = await Promise.all(
          (matches || []).map(async (m) => {
            const { data: participants } = await supabase
              .from('match_participants')
              .select('team_number, is_winner, superstar:superstar_id ( id, name, slug, photo_url )')
              .eq('match_id', m.id)
              .order('team_number', { ascending: true })

            const teams = []
            for (const p of (participants || [])) {
              const tn = (p.team_number || 1) - 1
              if (!teams[tn]) teams[tn] = { members: [], is_winner: false }
              teams[tn].members.push(p.superstar)
              if (p.is_winner) teams[tn].is_winner = true
            }
            return { ...m, teams: teams.filter(Boolean) }
          })
        )

        return { ...r, defenses: matchesWithParticipants }
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

    return NextResponse.json({
      championship,
      reigns: reignsWithDefenses,
      total: totalGrouped,
      page,
      totalPages,
      prevChamp,
      nextChamp,
    })
  } catch (err) {
    console.error('[championship-detail] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
