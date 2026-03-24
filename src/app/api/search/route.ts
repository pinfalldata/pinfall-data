// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 60

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = (searchParams.get('q') || '').trim()

  if (q.length < 2) return NextResponse.json({ categories: [] })

  try {
    const pattern = `%${q}%`

    // ═══════════════════════════════════════════
    // PARALLEL QUERIES — 8 tables, no nested joins
    // ═══════════════════════════════════════════
    const [
      { data: superstars },
      { data: shows },
      { data: championships },
      { data: arenas },
      { data: matchTypes },
      { data: tagTeams },
      { data: stables },
      { data: objects },
      { data: showSeries },
    ] = await Promise.all([
      // Superstars — search name
      supabase
        .from('superstars')
        .select('id, name, slug, photo_url, role, status, total_matches')
        .ilike('name', pattern)
        .order('total_matches', { ascending: false, nullsFirst: false })
        .limit(8),

      // Shows — search name
      supabase
        .from('shows')
        .select('id, name, slug, date, show_type')
        .ilike('name', pattern)
        .order('date', { ascending: false })
        .limit(6),

      // Championships — search name
      supabase
        .from('championships')
        .select('id, name, slug, image_url, status')
        .ilike('name', pattern)
        .order('sort_order', { ascending: true })
        .limit(6),

      // Arenas — search name and city
      supabase
        .from('arenas')
        .select('id, name, slug, city, country, image_url')
        .or(`name.ilike.${pattern},city.ilike.${pattern}`)
        .limit(6),

      // Match Types (Stipulations) — search name
      supabase
        .from('match_types')
        .select('id, name, slug')
        .ilike('name', pattern)
        .limit(6),

      // Tag Teams — search name
      supabase
        .from('tag_teams')
        .select('id, name, slug, photo_url')
        .ilike('name', pattern)
        .limit(6),

      // Stables — search name
      supabase
        .from('stables')
        .select('id, name, slug, photo_url')
        .ilike('name', pattern)
        .limit(6),

      // Objects — search name
      supabase
        .from('match_objects')
        .select('id, name, slug, image_url')
        .ilike('name', pattern)
        .limit(4),

      // Show Series — search name
      supabase
        .from('show_series')
        .select('id, name, slug, logo_url')
        .ilike('name', pattern)
        .limit(4),
    ])

    // ═══════════════════════════════════════════
    // BUILD CATEGORIZED RESULTS
    // Each category has: key, label, icon, items[]
    // Each item has: name, slug, href, image?, subtitle?
    // ═══════════════════════════════════════════

    const roleLabels = {
      wrestler: 'Wrestler', manager: 'Manager', commentator: 'Commentator',
      referee: 'Referee', ring_announcer: 'Ring Announcer', interviewer: 'Interviewer',
      general_manager: 'GM', executive: 'Executive',
    }

    const categories = []

    if (superstars?.length > 0) {
      categories.push({
        key: 'superstars',
        label: 'Superstars',
        icon: '💪',
        items: superstars.map(s => ({
          name: s.name,
          slug: s.slug,
          href: `/superstars/${s.slug}`,
          image: s.photo_url,
          subtitle: [roleLabels[s.role] || s.role, s.total_matches ? `${s.total_matches} matches` : ''].filter(Boolean).join(' · '),
        })),
      })
    }

    if (shows?.length > 0) {
      categories.push({
        key: 'shows',
        label: 'Shows & Events',
        icon: '📺',
        items: shows.map(s => ({
          name: s.name,
          slug: s.slug,
          href: `/shows/${s.slug}`,
          subtitle: s.date ? new Date(s.date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
        })),
      })
    }

    if (championships?.length > 0) {
      categories.push({
        key: 'championships',
        label: 'Championships',
        icon: '🏆',
        items: championships.map(c => ({
          name: c.name,
          slug: c.slug,
          href: `/champions/${c.slug}`,
          image: c.image_url,
          subtitle: c.status === 'active' ? 'Active' : c.status === 'retired' ? 'Retired' : '',
        })),
      })
    }

    if (showSeries?.length > 0) {
      categories.push({
        key: 'showSeries',
        label: 'Show Series',
        icon: '📡',
        items: showSeries.map(s => ({
          name: s.name,
          slug: s.slug,
          href: `/matches/shows/${s.slug}`,
          image: s.logo_url,
        })),
      })
    }

    if (arenas?.length > 0) {
      categories.push({
        key: 'arenas',
        label: 'Arenas',
        icon: '🏟️',
        items: arenas.map(a => ({
          name: a.name,
          slug: a.slug,
          href: `/arenas/${a.slug}`,
          image: a.image_url,
          subtitle: [a.city, a.country].filter(Boolean).join(', '),
        })),
      })
    }

    if (matchTypes?.length > 0) {
      categories.push({
        key: 'matchTypes',
        label: 'Match Types',
        icon: '⚔️',
        items: matchTypes.map(mt => ({
          name: mt.name,
          slug: mt.slug,
          href: `/matches/stipulations/${mt.slug}`,
        })),
      })
    }

    if (tagTeams?.length > 0) {
      categories.push({
        key: 'tagTeams',
        label: 'Tag Teams',
        icon: '🤝',
        items: tagTeams.map(t => ({
          name: t.name,
          slug: t.slug,
          href: `/tag-teams/teams/${t.slug}`,
          image: t.photo_url,
        })),
      })
    }

    if (stables?.length > 0) {
      categories.push({
        key: 'stables',
        label: 'Stables',
        icon: '🛡️',
        items: stables.map(s => ({
          name: s.name,
          slug: s.slug,
          href: `/tag-teams/stables/${s.slug}`,
          image: s.photo_url,
        })),
      })
    }

    if (objects?.length > 0) {
      categories.push({
        key: 'objects',
        label: 'Objects',
        icon: '🪑',
        items: objects.map(o => ({
          name: o.name,
          slug: o.slug,
          href: `/matches/objects/${o.slug}`,
          image: o.image_url,
        })),
      })
    }

    // Total count for display
    const totalResults = categories.reduce((sum, c) => sum + c.items.length, 0)

    return NextResponse.json({ categories, totalResults })
  } catch (err) {
    console.error('[search]', err)
    return NextResponse.json({ categories: [], totalResults: 0 })
  }
}
