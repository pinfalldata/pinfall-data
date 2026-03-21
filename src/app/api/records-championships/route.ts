// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  try {
    const { data: reigns } = await supabase.from('championship_reigns')
      .select('id, superstar_id, championship_id, won_date, lost_date, days_held, reign_number, superstar:superstars(id, name, slug, photo_url, birth_date), championship:championships(id, name, slug, image_url, is_tag_team)')
      .order('days_held', { ascending: false, nullsFirst: false })

    const all = reigns || []

    // Longest single reign
    const longestReign = all.filter(r => r.days_held).slice(0, 50).map(r => ({
      superstar: pick(r.superstar), championship: pickC(r.championship),
      days: r.days_held, won_date: r.won_date, lost_date: r.lost_date,
    }))

    // Shortest single reign
    const shortestReign = [...all].filter(r => r.days_held != null && r.lost_date).sort((a, b) => (a.days_held || 999) - (b.days_held || 999)).slice(0, 50).map(r => ({
      superstar: pick(r.superstar), championship: pickC(r.championship),
      days: r.days_held, won_date: r.won_date, lost_date: r.lost_date,
    }))

    // Most reigns per superstar (all titles combined)
    const reignCountMap = new Map<number, { count: number; s: any }>()
    for (const r of all) {
      if (!r.superstar) continue
      const e = reignCountMap.get(r.superstar_id)
      if (e) e.count++
      else reignCountMap.set(r.superstar_id, { count: 1, s: r.superstar })
    }
    const mostReignsOverall = [...reignCountMap.values()].sort((a, b) => b.count - a.count).slice(0, 50).map(e => ({
      superstar: pick(e.s), reigns: e.count,
    }))

    // Most combined championship days
    const daysMap = new Map<number, { days: number; s: any }>()
    for (const r of all) {
      if (!r.superstar || !r.days_held) continue
      const e = daysMap.get(r.superstar_id)
      if (e) e.days += r.days_held
      else daysMap.set(r.superstar_id, { days: r.days_held, s: r.superstar })
    }
    const mostCombinedDays = [...daysMap.values()].sort((a, b) => b.days - a.days).slice(0, 50).map(e => ({
      superstar: pick(e.s), total_days: e.days,
    }))

    // Most different titles held
    const titleSetMap = new Map<number, { titles: Set<number>; s: any }>()
    for (const r of all) {
      if (!r.superstar || !r.championship) continue
      const e = titleSetMap.get(r.superstar_id)
      if (e) e.titles.add(r.championship_id)
      else titleSetMap.set(r.superstar_id, { titles: new Set([r.championship_id]), s: r.superstar })
    }
    const mostDifferentTitles = [...titleSetMap.values()].sort((a, b) => b.titles.size - a.titles.size).slice(0, 50).map(e => ({
      superstar: pick(e.s), unique_titles: e.titles.size,
    }))

    // Current longest reigning
    const currentReigns = all.filter(r => !r.lost_date && r.days_held).slice(0, 20).map(r => ({
      superstar: pick(r.superstar), championship: pickC(r.championship), days: r.days_held, won_date: r.won_date,
    }))

    // Youngest champion
    const withAge = all.filter(r => r.superstar?.birth_date && r.won_date).map(r => {
      const age = (new Date(r.won_date).getTime() - new Date(r.superstar.birth_date).getTime()) / (365.25 * 24 * 3600 * 1000)
      return { superstar: pick(r.superstar), championship: pickC(r.championship), age_years: Math.round(age * 10) / 10, won_date: r.won_date }
    })
    const youngestChampion = [...withAge].sort((a, b) => a.age_years - b.age_years).slice(0, 20)
    const oldestChampion = [...withAge].sort((a, b) => b.age_years - a.age_years).slice(0, 20)

    return NextResponse.json({
      longestReign, shortestReign, mostReignsOverall, mostCombinedDays,
      mostDifferentTitles, currentReigns, youngestChampion, oldestChampion,
    })
  } catch (err) {
    console.error('[records-championships]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

function pick(s: any) { return s ? { id: s.id, name: s.name, slug: s.slug, photo_url: s.photo_url } : null }
function pickC(c: any) { return c ? { id: c.id, name: c.name, slug: c.slug, image_url: c.image_url } : null }
