import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BASE = 'https://pinfalldata.com'

/**
 * Next.js 14 sitemap index: generates /sitemap/0.xml, /sitemap/1.xml, etc.
 * and an automatic index at /sitemap.xml
 *
 * Segments:
 *  0 = Static + Superstars + Championships
 *  1 = Shows + Show Series + Arenas
 *  2 = Matches batch 1 (0-4999)
 *  3 = Matches batch 2 (5000-9999)
 *  4 = Stipulations + Segments + Tag Teams + Stables + Rivalries + Other
 */
export async function generateSitemaps() {
  // Count matches to know how many batches
  const { count } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .not('slug', 'is', null)

  const matchCount = count || 0
  const BATCH = 5000
  const matchBatches = Math.ceil(matchCount / BATCH)

  // IDs: 0=static+superstars, 1=shows+arenas, 2..N=matches, N+1=other, N+2=versus
  const ids = [{ id: 0 }, { id: 1 }]
  for (let i = 0; i < matchBatches; i++) {
    ids.push({ id: 2 + i })
  }
  ids.push({ id: 2 + matchBatches }) // "other" segment
  ids.push({ id: 3 + matchBatches }) // "versus" segment
  return ids
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  // ===== SEGMENT 0: Static + Superstars + Championships =====
  if (id === 0) {
    const staticPages: MetadataRoute.Sitemap = [
      { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
      { url: `${BASE}/superstars`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${BASE}/superstars/wrestlers`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE}/superstars/managers`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE}/superstars/commentators`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE}/superstars/ring-announcers`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
      { url: `${BASE}/superstars/referees`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
      { url: `${BASE}/superstars/interviewers`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
      { url: `${BASE}/superstars/general-managers`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
      { url: `${BASE}/superstars/executives`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
      { url: `${BASE}/matches`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${BASE}/matches/search`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
      { url: `${BASE}/matches/shows`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE}/matches/ple`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE}/matches/stipulations`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE}/champions`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
      { url: `${BASE}/champions/the-title-vault`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE}/champions/major-accolades`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE}/champions/by-the-numbers`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${BASE}/history`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
      { url: `${BASE}/hall-of-fame`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
      { url: `${BASE}/tag-teams`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE}/records`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE}/rivalries`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
      { url: `${BASE}/on-this-day`, lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    ]

    // Superstars
    const { data: superstars } = await supabase.from('superstars').select('slug, updated_at').order('slug')
    const superstarPages: MetadataRoute.Sitemap = (superstars || []).map(s => ({
      url: `${BASE}/superstars/${s.slug}`, lastModified: s.updated_at || now, changeFrequency: 'weekly', priority: 0.7,
    }))

    // Championships
    const { data: championships } = await supabase.from('championships').select('slug, updated_at').order('slug')
    const champPages: MetadataRoute.Sitemap = (championships || []).map(c => ({
      url: `${BASE}/champions/${c.slug}`, lastModified: c.updated_at || now, changeFrequency: 'weekly', priority: 0.7,
    }))

    return [...staticPages, ...superstarPages, ...champPages]
  }

  // ===== SEGMENT 1: Shows + Show Series + Arenas =====
  if (id === 1) {
    const { data: shows } = await supabase.from('shows').select('slug, updated_at').not('slug', 'is', null).order('date', { ascending: false })
    const showPages: MetadataRoute.Sitemap = (shows || []).map(s => ({
      url: `${BASE}/shows/${s.slug}`, lastModified: s.updated_at || now, changeFrequency: 'monthly', priority: 0.5,
    }))

    const { data: series } = await supabase.from('show_series').select('slug').order('slug')
    const seriesPages: MetadataRoute.Sitemap = (series || []).map(s => ({
      url: `${BASE}/matches/shows/${s.slug}`, lastModified: now, changeFrequency: 'weekly', priority: 0.7,
    }))

    const { data: arenas } = await supabase.from('arenas').select('slug').not('slug', 'is', null).order('name')
    const arenaPages: MetadataRoute.Sitemap = (arenas || []).filter(a => a.slug).map(a => ({
      url: `${BASE}/arenas/${a.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.5,
    }))

    return [...showPages, ...seriesPages, ...arenaPages]
  }

  // ===== SEGMENT 2+: Matches (batched by 5000) =====
  const { count: matchCount } = await supabase.from('matches').select('*', { count: 'exact', head: true }).not('slug', 'is', null)
  const BATCH = 5000
  const matchBatches = Math.ceil((matchCount || 0) / BATCH)
  const otherSegmentId = 2 + matchBatches

  if (id >= 2 && id < otherSegmentId) {
    const batchIndex = id - 2
    const offset = batchIndex * BATCH

    // Get matches with their show slug for URL building
    const { data: matches } = await supabase
      .from('matches')
      .select('slug, updated_at, show:shows!matches_show_id_fkey(slug)')
      .not('slug', 'is', null)
      .order('date', { ascending: false })
      .range(offset, offset + BATCH - 1)

    const matchPages: MetadataRoute.Sitemap = (matches || [])
      .filter((m: any) => m.slug && m.show?.slug)
      .map((m: any) => ({
        url: `${BASE}/shows/${m.show.slug}/matches/${m.slug}`,
        lastModified: m.updated_at || now,
        changeFrequency: 'monthly' as const,
        priority: 0.4,
      }))

    return matchPages
  }

  // ===== LAST SEGMENT: Stipulations + Tag Teams + Stables + Rivalries + Other =====
  if (id === otherSegmentId) {
    const { data: matchTypes } = await supabase.from('match_types').select('slug').order('slug')
    const stipPages: MetadataRoute.Sitemap = (matchTypes || []).map(mt => ({
      url: `${BASE}/matches/stipulations/${mt.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.5,
    }))

    const { data: tagTeams } = await supabase.from('tag_teams').select('slug').order('slug')
    const tagPages: MetadataRoute.Sitemap = (tagTeams || []).map(t => ({
      url: `${BASE}/tag-teams/${t.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.4,
    }))

    const { data: stables } = await supabase.from('stables').select('slug').order('slug')
    const stablePages: MetadataRoute.Sitemap = (stables || []).map(s => ({
      url: `${BASE}/stables/${s.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.4,
    }))

    const { data: rivalries } = await supabase.from('rivalries').select('slug').order('slug')
    const rivalryPages: MetadataRoute.Sitemap = (rivalries || []).map(r => ({
      url: `${BASE}/rivalries/${r.slug}`, lastModified: now, changeFrequency: 'monthly', priority: 0.4,
    }))

    // Show segments (url: /shows/{showSlug}/segments/{segmentSlug})
    const { data: segments } = await supabase
      .from('show_segments')
      .select('slug, show:shows!show_segments_show_id_fkey(slug)')
      .order('id', { ascending: false })
      .limit(5000)

    const segPages: MetadataRoute.Sitemap = (segments || [])
      .filter((s: any) => s.slug && s.show?.slug)
      .map((s: any) => ({
        url: `${BASE}/shows/${s.show.slug}/segments/${s.slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.3,
      }))

    return [...stipPages, ...tagPages, ...stablePages, ...rivalryPages, ...segPages]
  }

  // ===== VERSUS SEGMENT: Popular head-to-head matchup pages =====
  const versusSegmentId = otherSegmentId + 1
  if (id === versusSegmentId) {
    // Find popular matchups: pairs of wrestlers who share 2+ matches
    // Step 1: Get all match_participants for wrestlers (role = 'wrestler' or most matches)
    const { data: allParts } = await supabase
      .from('match_participants')
      .select('match_id, superstar_id')
      .order('match_id')

    if (!allParts || allParts.length === 0) return []

    // Step 2: Group by match_id to find pairs
    const matchGroups = new Map<number, number[]>()
    for (const p of allParts) {
      if (!matchGroups.has(p.match_id)) matchGroups.set(p.match_id, [])
      matchGroups.get(p.match_id)!.push(p.superstar_id)
    }

    // Step 3: Count pairwise matchups (only for matches with 2-4 participants to avoid battle royals)
    const pairCount = new Map<string, number>()
    for (const [, ids] of matchGroups) {
      if (ids.length < 2 || ids.length > 4) continue
      const unique = [...new Set(ids)].sort((a, b) => a - b)
      for (let i = 0; i < unique.length; i++) {
        for (let j = i + 1; j < unique.length; j++) {
          const key = `${unique[i]}-${unique[j]}`
          pairCount.set(key, (pairCount.get(key) || 0) + 1)
        }
      }
    }

    // Step 4: Filter pairs with 2+ matches, sort by count desc, cap at 3000
    const topPairs = [...pairCount.entries()]
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3000)

    if (topPairs.length === 0) return []

    // Step 5: Fetch slugs for all involved superstars
    const allStarIds = new Set<number>()
    for (const [key] of topPairs) {
      const [a, b] = key.split('-').map(Number)
      allStarIds.add(a)
      allStarIds.add(b)
    }

    const { data: starSlugs } = await supabase
      .from('superstars')
      .select('id, slug')
      .in('id', [...allStarIds])

    const slugMap = new Map<number, string>()
    for (const s of (starSlugs || [])) slugMap.set(s.id, s.slug)

    // Step 6: Generate URLs (alphabetical slug order = canonical)
    const vsPages: MetadataRoute.Sitemap = topPairs
      .map(([key]) => {
        const [a, b] = key.split('-').map(Number)
        const slugA = slugMap.get(a)
        const slugB = slugMap.get(b)
        if (!slugA || !slugB) return null
        const [first, second] = [slugA, slugB].sort()
        return {
          url: `${BASE}/superstars/${first}/vs/${second}`,
          lastModified: now,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }
      })
      .filter(Boolean) as MetadataRoute.Sitemap

    // Deduplicate
    const seen = new Set<string>()
    return vsPages.filter(p => {
      if (seen.has(p.url)) return false
      seen.add(p.url)
      return true
    })
  }

  return []
}
