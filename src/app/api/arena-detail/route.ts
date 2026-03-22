// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    // ★ Compute display_name server-side from arena_names
    const currentNameEntry = (arenaNames || []).find(n => n.is_current === true)
    const displayName = currentNameEntry ? currentNameEntry.name : arena.name

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

    // Prev/Next arena
    const { data: allArenas } = await supabase
      .from('arenas')
      .select('id, name, slug')
      .order('name', { ascending: true })

    let prevArena = null
    let nextArena = null
    if (allArenas && allArenas.length > 1) {
      const idx = allArenas.findIndex(a => a.id === arena.id)
      if (idx > 0) prevArena = { slug: allArenas[idx - 1].slug, name: allArenas[idx - 1].name }
      if (idx >= 0 && idx < allArenas.length - 1) nextArena = { slug: allArenas[idx + 1].slug, name: allArenas[idx + 1].name }
    }

    return NextResponse.json({
      arena: { ...arena, display_name: displayName },
      arenaNames: arenaNames || [],
      shows: shows || [],
      total,
      page,
      limit,
      totalPages,
      prevArena,
      nextArena,
    })
  } catch (err: any) {
    console.error('[arena-detail] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
