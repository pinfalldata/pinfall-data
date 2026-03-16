import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BASE = 'https://pinfalldata.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString()

  // ===== STATIC PAGES =====
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
    { url: `${BASE}/history`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/hall-of-fame`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${BASE}/tag-teams`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/records`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/rivalries`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
  ]

  // ===== DYNAMIC: SUPERSTARS =====
  const { data: superstars } = await supabase
    .from('superstars')
    .select('slug, updated_at')
    .order('slug')

  const superstarPages: MetadataRoute.Sitemap = (superstars || []).map(s => ({
    url: `${BASE}/superstars/${s.slug}`,
    lastModified: s.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // ===== DYNAMIC: CHAMPIONSHIPS =====
  const { data: championships } = await supabase
    .from('championships')
    .select('slug, updated_at')
    .order('slug')

  const champPages: MetadataRoute.Sitemap = (championships || []).map(c => ({
    url: `${BASE}/champions/${c.slug}`,
    lastModified: c.updated_at || now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // ===== DYNAMIC: SHOWS =====
  const { data: shows } = await supabase
    .from('shows')
    .select('slug, updated_at')
    .order('date', { ascending: false })
    .limit(5000)

  const showPages: MetadataRoute.Sitemap = (shows || []).map(s => ({
    url: `${BASE}/shows/${s.slug}`,
    lastModified: s.updated_at || now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  // ===== DYNAMIC: SHOW SERIES =====
  const { data: showSeries } = await supabase
    .from('show_series')
    .select('slug')
    .order('slug')

  const seriesPages: MetadataRoute.Sitemap = (showSeries || []).map(s => ({
    url: `${BASE}/matches/shows/${s.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // ===== DYNAMIC: MATCH TYPES / STIPULATIONS =====
  const { data: matchTypes } = await supabase
    .from('match_types')
    .select('slug')
    .order('slug')

  const stipPages: MetadataRoute.Sitemap = (matchTypes || []).map(mt => ({
    url: `${BASE}/matches/stipulations/${mt.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  // ===== DYNAMIC: ARENAS =====
  const { data: arenas } = await supabase
    .from('arenas')
    .select('slug')
    .order('name')

  const arenaPages: MetadataRoute.Sitemap = (arenas || []).filter(a => a.slug).map(a => ({
    url: `${BASE}/arenas/${a.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [
    ...staticPages,
    ...superstarPages,
    ...champPages,
    ...showPages,
    ...seriesPages,
    ...stipPages,
    ...arenaPages,
  ]
}
