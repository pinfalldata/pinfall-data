// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ★ FIX: Force dynamic to prevent Vercel from caching stale arena names
export const dynamic = 'force-dynamic'

/**
 * GET /api/arena-detail?slug=madison-square-garden&page=1&limit=50
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '50')))
  const offset = (page - 1) * limit

  if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 })

  try {
    const { data: arena, error: arenaErr } = await supabase
      .from('arenas')
      .select('*')
      .eq('slug', slug)
      .single()

    if (arenaErr || !arena) {
      return NextResponse.json({ error: 'Arena not found' }, { status: 404 })
    }

    // Arena name history
    const { data: arenaNames } = await supabase
      .from('arena_names')
      .select('*')
      .eq('arena_id', arena.id)
      .order('start_date', { ascending: true, nullsFirst: true })

    // ★ FIX: Override arena.name with the current entry from arena_names
    // Use truthy check (not strict ===) because Supabase may return the value differently
    const names = arenaNames || []
    const currentEntry = names.find((n: any) => !!n.is_current)
    if (currentEntry) {
      arena.name = currentEntry.name
    }

    // Paginated shows at this arena
    const { data: shows, error: showErr, count } = await supabase
      .from('shows')
      .select(`
        id, name, slug, date, venue, city, state_province, country,
        attendance, show_type, episode_number, logo_url,
        show_series:show_series_id ( id, name, short_name, logo_url, is_ple )
      `, { count: 'exact' })
      .eq('arena_id', arena.id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1)

    if (showErr) {
      console.error('[arena-detail] shows error:', showErr)
    }

    const total = count || 0
    const totalPages = Math.ceil(total / limit)

    // Prev/Next arena — also override names with current arena_names
    const { data: allArenas } = await supabase
      .from('arenas')
      .select('id, name, slug')
      .order('name', { ascending: true })

    // ★ FIX: Also fetch arena_names for prev/next so their display names are correct
    let prevArena = null
    let nextArena = null
    if (allArenas && allArenas.length > 1) {
      // Fetch all arena_names for the current name overrides
      const { data: allNames } = await supabase
        .from('arena_names')
        .select('arena_id, name, is_current')
        .eq('is_current', true)

      const currentNameMap = new Map<number, string>()
      for (const n of (allNames || [])) {
        if (n.is_current) currentNameMap.set(n.arena_id, n.name)
      }

      // Override arena names in the list
      for (const a of allArenas) {
        const cn = currentNameMap.get(a.id)
        if (cn) a.name = cn
      }

      const idx = allArenas.findIndex(a => a.id === arena.id)
      if (idx > 0) prevArena = { slug: allArenas[idx - 1].slug, name: allArenas[idx - 1].name }
      if (idx >= 0 && idx < allArenas.length - 1) nextArena = { slug: allArenas[idx + 1].slug, name: allArenas[idx + 1].name }
    }

    // ★ FIX: Add no-cache headers to prevent stale responses
    const response = NextResponse.json({
      arena,
      arenaNames: names,
      shows: shows || [],
      total,
      page,
      limit,
      totalPages,
      prevArena,
      nextArena,
    })
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (err: any) {
    console.error('[arena-detail] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
