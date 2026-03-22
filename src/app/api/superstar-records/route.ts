// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600 // cache 1 hour

export async function GET(req: NextRequest) {
  const sid = parseInt(new URL(req.url).searchParams.get('superstarId') || '0')
  if (!sid) return NextResponse.json({ records: [] })

  try {
    const records: any[] = []

    // 1. Most matches
    const { data: topMatches } = await supabase.from('superstars').select('id, name, total_matches').order('total_matches', { ascending: false, nullsFirst: false }).limit(1)
    if (topMatches?.[0]?.id === sid) {
      records.push({ type: 'Most Career Matches', value: topMatches[0].total_matches.toLocaleString(), icon: '🏟️' })
    }

    // 2. Most wins
    const { data: topWins } = await supabase.from('superstars').select('id, name, win_count').order('win_count', { ascending: false, nullsFirst: false }).limit(1)
    if (topWins?.[0]?.id === sid) {
      records.push({ type: 'Most Career Wins', value: topWins[0].win_count.toLocaleString(), icon: '🏆' })
    }

    // 3. Highest win rate (min 100 matches)
    const { data: wrSuperstars } = await supabase.from('superstars').select('id, win_count, total_matches').gte('total_matches', 100)
    if (wrSuperstars) {
      const sorted = wrSuperstars.map(s => ({ ...s, wr: s.total_matches > 0 ? s.win_count / s.total_matches : 0 })).sort((a, b) => b.wr - a.wr)
      if (sorted[0]?.id === sid) {
        records.push({ type: 'Highest Win Rate (100+ matches)', value: `${Math.round(sorted[0].wr * 1000) / 10}%`, icon: '📊' })
      }
    }

    // 4. Most championship reigns
    const { data: topReigns } = await supabase.from('superstars').select('id, total_reigns').order('total_reigns', { ascending: false, nullsFirst: false }).limit(1)
    if (topReigns?.[0]?.id === sid && topReigns[0].total_reigns > 0) {
      records.push({ type: 'Most Championship Reigns', value: `${topReigns[0].total_reigns}x Champion`, icon: '👑' })
    }

    // 5. Most championship days
    const { data: topDays } = await supabase.from('superstars').select('id, total_championship_days').order('total_championship_days', { ascending: false, nullsFirst: false }).limit(1)
    if (topDays?.[0]?.id === sid && topDays[0].total_championship_days > 0) {
      records.push({ type: 'Most Days as Champion', value: `${topDays[0].total_championship_days.toLocaleString()} days`, icon: '⏱️' })
    }

    // 6. Longest single reign
    const { data: topReign } = await supabase.from('championship_reigns').select('superstar_id, days_held, championship:championship_id(name, slug, image_url)').order('days_held', { ascending: false, nullsFirst: false }).limit(1)
    if (topReign?.[0]?.superstar_id === sid) {
      records.push({ type: 'Longest Single Championship Reign', value: `${topReign[0].days_held?.toLocaleString()} days`, subtitle: topReign[0].championship?.name, icon: '🥇', championshipImage: topReign[0].championship?.image_url })
    }

    // 7. Most tag team partnerships
    const { data: topTT } = await supabase.from('tag_team_members').select('superstar_id')
    if (topTT) {
      const ttCount: Record<number, number> = {}
      for (const t of topTT) { ttCount[t.superstar_id] = (ttCount[t.superstar_id] || 0) + 1 }
      const sorted = Object.entries(ttCount).sort((a, b) => b[1] - a[1])
      if (sorted[0] && parseInt(sorted[0][0]) === sid) {
        records.push({ type: 'Most Tag Team Partnerships', value: sorted[0][1].toString(), icon: '🤝' })
      }
    }

    // 8. Most OMG moments
    const { data: topOMG } = await supabase.from('omg_moment_participants').select('superstar_id')
    if (topOMG) {
      const omgCount: Record<number, number> = {}
      for (const o of topOMG) { omgCount[o.superstar_id] = (omgCount[o.superstar_id] || 0) + 1 }
      const sorted = Object.entries(omgCount).sort((a, b) => b[1] - a[1])
      if (sorted[0] && parseInt(sorted[0][0]) === sid) {
        records.push({ type: 'Most OMG Moments', value: sorted[0][1].toString(), icon: '⚡' })
      }
    }

    return NextResponse.json({ records })
  } catch (err) {
    console.error('[superstar-records]', err)
    return NextResponse.json({ records: [] })
  }
}
