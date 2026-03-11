// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('superstarId')
  if (!id) return NextResponse.json({ error: 'superstarId required' }, { status: 400 })
  const sid = parseInt(id)

  try {
    // Get all reigns for this superstar
    const { data: reigns } = await supabase
      .from('championship_reigns')
      .select(`
        id, won_date, lost_date, days_held, reign_number, reign_group_id,
        championship:championship_id ( id, name, slug, image_url, is_tag_team ),
        won_at_show:won_at_show_id ( id, name, slug ),
        lost_at_show:lost_at_show_id ( id, name, slug )
      `)
      .eq('superstar_id', sid)
      .order('won_date', { ascending: false })

    if (!reigns) return NextResponse.json({ championships: [] })

    // For tag team reigns, get the partner
    const enriched = await Promise.all(reigns.map(async (r) => {
      let partner = null
      if (r.reign_group_id) {
        const { data: partners } = await supabase
          .from('championship_reigns')
          .select('superstar:superstar_id ( id, name, slug, photo_url )')
          .eq('reign_group_id', r.reign_group_id)
          .neq('superstar_id', sid)
          .limit(1)
        partner = partners?.[0]?.superstar || null
      }

      // Get title defense matches for this reign
      let defenses: any[] = []
      if (r.championship) {
        const q = supabase
          .from('matches')
          .select(`
            id, slug, date, rating, is_title_change, duration_seconds,
            match_type:match_type_id ( id, name, slug ),
            show:show_id ( id, name, slug )
          `)
          .eq('championship_id', r.championship.id)
          .gte('date', r.won_date)
        if (r.lost_date) q.lte('date', r.lost_date)
        const { data: matches } = await q.order('date', { ascending: true }).limit(30)

        defenses = await Promise.all((matches || []).map(async (m) => {
          const { data: parts } = await supabase
            .from('match_participants')
            .select('team_number, is_winner, superstar:superstar_id ( id, name, slug, photo_url )')
            .eq('match_id', m.id)
            .order('team_number')
          const teams: any[] = []
          for (const p of (parts || [])) {
            const tn = (p.team_number || 1) - 1
            if (!teams[tn]) teams[tn] = { members: [], is_winner: false }
            teams[tn].members.push(p.superstar)
            if (p.is_winner) teams[tn].is_winner = true
          }
          return { ...m, teams: teams.filter(Boolean) }
        }))
      }

      return { ...r, partner, defenses }
    }))

    // Group by championship
    const champMap = new Map()
    for (const r of enriched) {
      const cid = r.championship?.id
      if (!cid) continue
      if (!champMap.has(cid)) {
        champMap.set(cid, {
          championship: r.championship,
          reign_count: 0,
          total_days: 0,
          reigns: [],
        })
      }
      const c = champMap.get(cid)
      c.reign_count++
      c.total_days += r.days_held || 0
      c.reigns.push(r)
    }

    const championships = Array.from(champMap.values()).sort((a, b) => {
      // Sort by most recent reign first
      const aDate = a.reigns[0]?.won_date || ''
      const bDate = b.reigns[0]?.won_date || ''
      return bDate.localeCompare(aDate)
    })

    return NextResponse.json({ championships, totalReigns: enriched.length })
  } catch (err) {
    console.error('[superstar-championships]', err)
    return NextResponse.json({ championships: [], totalReigns: 0 })
  }
}
