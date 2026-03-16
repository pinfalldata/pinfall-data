// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // All championships
    const { data: allChamps } = await supabase.from('championships').select('id, name, slug, status, image_url, is_tag_team')
    const activeCount = (allChamps || []).filter(c => c.status === 'active').length
    const retiredCount = (allChamps || []).filter(c => c.status === 'retired').length

    // All reigns with superstar info
    const { data: allReigns } = await supabase
      .from('championship_reigns')
      .select('id, championship_id, superstar_id, won_date, lost_date, days_held, reign_group_id, superstar:superstar_id ( id, name, slug, photo_url, gender )')
      .order('won_date', { ascending: true })

    const reigns = allReigns || []
    const totalReigns = reigns.length
    const totalTitleChanges = totalReigns > 0 ? totalReigns - (allChamps || []).length : 0

    // Days stats
    const daysArr = reigns.filter(r => r.days_held != null && r.days_held >= 0).map(r => r.days_held!)
    const avgDays = daysArr.length > 0 ? Math.round(daysArr.reduce((a, b) => a + b, 0) / daysArr.length) : 0
    const totalDays = daysArr.reduce((a, b) => a + b, 0)

    // Unique superstars who held any title
    const uniqueHolders = new Map()
    for (const r of reigns) {
      const s = r.superstar
      if (!s) continue
      if (!uniqueHolders.has(s.id)) uniqueHolders.set(s.id, { ...s, totalReigns: 0, totalDays: 0, uniqueTitles: new Set(), championships: [] })
      const h = uniqueHolders.get(s.id)
      h.totalReigns++
      h.totalDays += r.days_held || 0
      h.uniqueTitles.add(r.championship_id)
    }

    // Most decorated (most different titles)
    const mostDecorated = Array.from(uniqueHolders.values())
      .map(h => ({ superstar: { id: h.id, name: h.name, slug: h.slug, photo_url: h.photo_url }, uniqueTitles: h.uniqueTitles.size, totalReigns: h.totalReigns, totalDays: h.totalDays }))
      .sort((a, b) => b.uniqueTitles - a.uniqueTitles || b.totalReigns - a.totalReigns)
      .slice(0, 10)

    // Most total reigns across all titles
    const mostTotalReigns = Array.from(uniqueHolders.values())
      .map(h => ({ superstar: { id: h.id, name: h.name, slug: h.slug, photo_url: h.photo_url }, totalReigns: h.totalReigns, totalDays: h.totalDays }))
      .sort((a, b) => b.totalReigns - a.totalReigns)
      .slice(0, 10)

    // Most combined days as any champion
    const mostCombinedDays = Array.from(uniqueHolders.values())
      .map(h => ({ superstar: { id: h.id, name: h.name, slug: h.slug, photo_url: h.photo_url }, days: h.totalDays, reigns: h.totalReigns }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 10)

    // Longest single reign ever
    const longestReign = reigns.reduce((max, r) => (r.days_held || 0) > (max?.days_held || 0) ? r : max, reigns[0])
    const longestChampName = (allChamps || []).find(c => c.id === longestReign?.championship_id)

    // Shortest single reign ever
    const completed = reigns.filter(r => r.days_held != null && r.days_held >= 0 && r.lost_date)
    const shortestReign = completed.length > 0 ? completed.reduce((min, r) => (r.days_held ?? 999999) < (min?.days_held ?? 999999) ? r : min, completed[0]) : null
    const shortestChampName = shortestReign ? (allChamps || []).find(c => c.id === shortestReign.championship_id) : null

    // Reigns breakdown
    const reignsOver365 = daysArr.filter(d => d >= 365).length
    const reignsOver1000 = daysArr.filter(d => d >= 1000).length
    const reignsUnder1 = daysArr.filter(d => d < 1).length
    const reignsUnder30 = daysArr.filter(d => d < 30).length

    // Gender breakdown - male
    const maleReigns = reigns.filter(r => r.superstar?.gender === 'male')
    const femaleReigns = reigns.filter(r => r.superstar?.gender === 'female')
    const maleUnique = new Set(maleReigns.map(r => r.superstar?.id)).size
    const femaleUnique = new Set(femaleReigns.map(r => r.superstar?.id)).size
    const maleDays = maleReigns.filter(r => r.days_held).map(r => r.days_held!).reduce((a, b) => a + b, 0)
    const femaleDays = femaleReigns.filter(r => r.days_held).map(r => r.days_held!).reduce((a, b) => a + b, 0)
    const maleAvgDays = maleReigns.length > 0 ? Math.round(maleDays / maleReigns.filter(r => r.days_held).length) : 0
    const femaleAvgDays = femaleReigns.length > 0 ? Math.round(femaleDays / femaleReigns.filter(r => r.days_held).length) : 0

    // Most decorated female
    const femaleHolders = Array.from(uniqueHolders.values()).filter(h => h.gender === 'female')
    const mostDecoratedFemale = femaleHolders.sort((a, b) => b.totalReigns - a.totalReigns).slice(0, 5).map(h => ({ superstar: { id: h.id, name: h.name, slug: h.slug, photo_url: h.photo_url }, totalReigns: h.totalReigns, uniqueTitles: h.uniqueTitles.size, totalDays: h.totalDays }))

    // Longest female reign
    const longestFemaleReign = femaleReigns.reduce((max, r) => (r.days_held || 0) > (max?.days_held || 0) ? r : max, femaleReigns[0] || null)
    const longestFemaleChamp = longestFemaleReign ? (allChamps || []).find(c => c.id === longestFemaleReign.championship_id) : null

    // Championship with most title changes
    const champChangeMap = new Map()
    for (const r of reigns) { champChangeMap.set(r.championship_id, (champChangeMap.get(r.championship_id) || 0) + 1) }
    const mostChangesChampId = [...champChangeMap.entries()].sort((a, b) => b[1] - a[1])[0]
    const mostChangesChamp = mostChangesChampId ? (allChamps || []).find(c => c.id === mostChangesChampId[0]) : null

    // Title changes by decade
    const decadeMap = new Map()
    for (const r of reigns) { const y = parseInt(r.won_date?.substring(0, 4) || '0'); const d = `${Math.floor(y / 10) * 10}s`; decadeMap.set(d, (decadeMap.get(d) || 0) + 1) }
    const byDecade = Array.from(decadeMap.entries()).map(([decade, count]) => ({ decade, count })).sort((a, b) => a.decade.localeCompare(b.decade))

    // Total title matches
    const { count: totalTitleMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true }).not('championship_id', 'is', null)
    const { count: totalTCMatches } = await supabase.from('matches').select('*', { count: 'exact', head: true }).eq('is_title_change', true)

    // ===== TAG TEAM STATISTICS =====
    const tagChampIds = (allChamps || []).filter(c => c.is_tag_team).map(c => c.id)
    const tagReigns = reigns.filter(r => tagChampIds.includes(r.championship_id))

    // Group tag reigns by reign_group_id to get team reigns
    const tagGroupMap = new Map()
    for (const r of tagReigns) {
      const gid = r.reign_group_id || `solo_${r.id}`
      if (!tagGroupMap.has(gid)) {
        tagGroupMap.set(gid, {
          won_date: r.won_date,
          lost_date: r.lost_date,
          days_held: r.days_held,
          championship_id: r.championship_id,
          superstars: [r.superstar],
        })
      } else {
        const existing = tagGroupMap.get(gid)
        if (r.superstar && !existing.superstars.find((s: any) => s?.id === r.superstar?.id)) {
          existing.superstars.push(r.superstar)
        }
      }
    }
    const tagTeamReigns = Array.from(tagGroupMap.values())
    const tagTeamReignCount = tagTeamReigns.length
    const tagTeamChampionships = (allChamps || []).filter(c => c.is_tag_team).length
    const tagTeamDays = tagTeamReigns.filter(r => r.days_held).map(r => r.days_held!).reduce((a, b) => a + b, 0)
    const tagTeamAvgDays = tagTeamReigns.length > 0
      ? Math.round(tagTeamDays / tagTeamReigns.filter(r => r.days_held).length)
      : 0

    // Unique tag teams
    const tagTeamKeys = new Set(tagTeamReigns.map(r =>
      r.superstars.map((s: any) => s?.id).sort().join('-')
    ))
    const uniqueTagTeams = tagTeamKeys.size

    // Most tag team reigns (by team combo)
    const tagReignCount = new Map()
    for (const r of tagTeamReigns) {
      const key = r.superstars.map((s: any) => s?.id).sort().join('-')
      const teamName = r.superstars.map((s: any) => s?.name).join(' & ')
      const firstStar = r.superstars[0]
      if (!tagReignCount.has(key)) tagReignCount.set(key, { count: 0, days: 0, teamName, superstar: firstStar, superstars: r.superstars })
      const entry = tagReignCount.get(key)
      entry.count++
      entry.days += r.days_held || 0
    }
    const topTagTeamsByReigns = Array.from(tagReignCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(t => ({
        superstar: { id: t.superstars.map((s: any) => s?.id).join('-'), name: t.teamName, slug: t.superstar?.slug, photo_url: t.superstar?.photo_url },
        superstars: t.superstars,
        totalReigns: t.count,
        totalDays: t.days,
      }))

    const topTagTeamsByDays = Array.from(tagReignCount.values())
      .sort((a, b) => b.days - a.days)
      .slice(0, 5)
      .map(t => ({
        superstar: { id: t.superstars.map((s: any) => s?.id).join('-'), name: t.teamName, slug: t.superstar?.slug, photo_url: t.superstar?.photo_url },
        superstars: t.superstars,
        days: t.days,
        reigns: t.count,
      }))

    // Longest tag team reign
    const longestTagReign = tagTeamReigns.reduce((max, r) => (r.days_held || 0) > (max?.days_held || 0) ? r : max, tagTeamReigns[0] || null)
    const longestTagChamp = longestTagReign ? (allChamps || []).find(c => c.id === longestTagReign.championship_id) : null

    return NextResponse.json({
      stats: {
        overview: {
          totalChampionships: (allChamps || []).length,
          activeChampionships: activeCount,
          retiredChampionships: retiredCount,
          totalReigns, totalDays, avgReignDays: avgDays,
          uniqueChampions: uniqueHolders.size,
          totalTitleMatches: totalTitleMatches || 0,
          totalTitleChanges: totalTCMatches || 0,
        },
        male: { reigns: maleReigns.length, uniqueChampions: maleUnique, totalDays: maleDays, avgDays: maleAvgDays },
        female: { reigns: femaleReigns.length, uniqueChampions: femaleUnique, totalDays: femaleDays, avgDays: femaleAvgDays },
        tagTeam: {
          championships: tagTeamChampionships,
          reigns: tagTeamReignCount,
          uniqueTeams: uniqueTagTeams,
          totalDays: tagTeamDays,
          avgDays: tagTeamAvgDays,
          topByReigns: topTagTeamsByReigns,
          topByDays: topTagTeamsByDays,
          longestReign: longestTagReign ? {
            superstars: longestTagReign.superstars,
            teamName: longestTagReign.superstars.map((s: any) => s?.name).join(' & '),
            days: longestTagReign.days_held,
            championship: longestTagChamp?.name,
            championshipSlug: longestTagChamp?.slug,
          } : null,
        },
        records: {
          longestReign: longestReign ? { superstar: longestReign.superstar, days: longestReign.days_held, championship: longestChampName?.name, championshipSlug: longestChampName?.slug, won_date: longestReign.won_date, lost_date: longestReign.lost_date } : null,
          shortestReign: shortestReign ? { superstar: shortestReign.superstar, days: shortestReign.days_held, championship: shortestChampName?.name, championshipSlug: shortestChampName?.slug, won_date: shortestReign.won_date, lost_date: shortestReign.lost_date } : null,
          longestFemaleReign: longestFemaleReign ? { superstar: longestFemaleReign.superstar, days: longestFemaleReign.days_held, championship: longestFemaleChamp?.name, championshipSlug: longestFemaleChamp?.slug } : null,
          mostChangesChampionship: mostChangesChamp ? { name: mostChangesChamp.name, slug: mostChangesChamp.slug, image_url: mostChangesChamp.image_url, changes: mostChangesChampId?.[1] } : null,
          reignsOver365, reignsOver1000, reignsUnder30, reignsUnder1,
        },
        rankings: { mostDecorated, mostTotalReigns, mostCombinedDays, mostDecoratedFemale },
        byDecade,
      }
    })
  } catch (err: any) {
    console.error('[champions-global-stats]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
