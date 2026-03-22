// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ★ Prevent Vercel from caching this route
export const dynamic = 'force-dynamic'
export const revalidate = 0

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
    const { data: arenaRaw, error: arenaErr } = await supabase
      .from('arenas')
      .select('*')
      .eq('slug', slug)
      .single()

    if (arenaErr || !arenaRaw) {
      return NextResponse.json({ error: 'Arena not found' }, { status: 404 })
    }

    // Arena name history
    const { data: arenaNames } = await supabase
      .from('arena_names')
      .select('*')
      .eq('arena_id', arenaRaw.id)
      .order('start_date', { ascending: true, nullsFirst: true })

    const names = arenaNames || []

    // ★ FIX: Create a NEW object instead of mutating the Supabase result.
    // Supabase objects may be frozen/sealed, so mutation silently fails.
    const currentEntry = names.find((n: any) => n.is_current === true || n.is_current === 'true')
    const arena = {
      ...arenaRaw,
      name: currentEntry ? currentEntry.name : arenaRaw.name,
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

    // Prev/Next arena — also with current names
    const { data: allArenas } = await supabase
      .from('arenas')
      .select('id, name, slug')
      .order('name', { ascending: true })

    let prevArena = null
    let nextArena = null
    if (allArenas && allArenas.length > 1) {
      // Fetch all current arena_names for display name override
      const { data: allCurrentNames } = await supabase
        .from('arena_names')
        .select('arena_id, name')
        .eq('is_current', true)

      const currentNameMap = new Map<number, string>()
      for (const n of (allCurrentNames || [])) {
        currentNameMap.set(n.arena_id, n.name)
      }

      // Build list with overridden names
      const enrichedList = allArenas.map(a => ({
        ...a,
        name: currentNameMap.get(a.id) || a.name,
      }))

      const idx = enrichedList.findIndex(a => a.id === arena.id)
      if (idx > 0) prevArena = { slug: enrichedList[idx - 1].slug, name: enrichedList[idx - 1].name }
      if (idx >= 0 && idx < enrichedList.length - 1) nextArena = { slug: enrichedList[idx + 1].slug, name: enrichedList[idx + 1].name }
    }

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

    // ★ Prevent all caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    return response
  } catch (err: any) {
    console.error('[arena-detail] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
