// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/search-superstars?q=john+cena&limit=10
 * Search superstars by name, aliases, and nicknames.
 * Returns unique results merged from all three sources.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const limit = Math.min(20, parseInt(searchParams.get('limit') || '10'))

  if (q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    // Search in parallel: name, aliases, nicknames
    const [
      { data: byName },
      { data: byAlias },
      { data: byNickname },
    ] = await Promise.all([
      // Direct name match
      supabase
        .from('superstars')
        .select('id, name, slug, photo_url')
        .ilike('name', `%${q}%`)
        .limit(limit),
      // Alias match → returns superstar info
      supabase
        .from('superstar_aliases')
        .select('superstar_id, alias_name, superstars!superstar_aliases_superstar_id_fkey(id, name, slug, photo_url)')
        .ilike('alias_name', `%${q}%`)
        .limit(limit),
      // Nickname match → returns superstar info
      supabase
        .from('superstar_nicknames')
        .select('superstar_id, nickname, superstars!superstar_nicknames_superstar_id_fkey(id, name, slug, photo_url)')
        .ilike('nickname', `%${q}%`)
        .limit(limit),
    ])

    // Merge and deduplicate by superstar id
    const seen = new Set<number>()
    const results: any[] = []

    // Name matches first (highest priority)
    for (const s of (byName || [])) {
      if (!seen.has(s.id)) {
        seen.add(s.id)
        results.push(s)
      }
    }

    // Alias matches — show alias as subtitle
    for (const a of (byAlias || [])) {
      const s = a.superstars
      if (s && !seen.has(s.id)) {
        seen.add(s.id)
        results.push({ ...s, matchedVia: a.alias_name })
      }
    }

    // Nickname matches
    for (const n of (byNickname || [])) {
      const s = n.superstars
      if (s && !seen.has(s.id)) {
        seen.add(s.id)
        results.push({ ...s, matchedVia: n.nickname })
      }
    }

    return NextResponse.json({ results: results.slice(0, limit) })
  } catch (err) {
    console.error('[search-superstars]', err)
    return NextResponse.json({ results: [] })
  }
}
