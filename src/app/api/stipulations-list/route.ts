// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/stipulations-list?category=environmental (optional)
 * Returns all match types sorted by popularity (match count), with optional category filter
 */

// Client-side category mapping until Supabase column is added
const CATEGORY_MAP: Record<string, string[]> = {
  'Environmental': [
    'steel cage', 'hell in a cell', 'elimination chamber', 'tlc', 'punjabi prison',
    'thunderdome', 'casket', 'buried alive', 'inferno', 'ambulance', 'kennel',
    'last man standing', 'lumberjack',
  ],
  'Weapon-Based': [
    'ladder', 'street fight', 'extreme rules', 'chairs', 'table', 'kendo stick',
    'no holds barred', 'falls count anywhere', 'hardcore', 'weapon', 'strap',
    'singapore cane', 'barbed wire', 'dumpster', 'boneyard', 'firefly fun house',
  ],
  'Submission & Technical': [
    'iron man', 'i quit', 'submission', '2-out-of-3', 'two out of three',
    'best of', 'falls', 'technical', 'catch', 'pure',
  ],
  'Multi-Man Elimination': [
    'royal rumble', 'battle royal', 'survivor series', 'war games', 'gauntlet',
    'over the top', 'andre', 'money in the bank',
  ],
  'Life-Changing': [
    'mask vs', 'hair vs', 'career vs', 'loser leaves', 'retirement',
    'title vs', 'fired', 'custody',
  ],
}

function getCategoryForType(typeName: string): string {
  const lower = typeName.toLowerCase()
  for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) return category
  }
  return 'Standard'
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const categoryFilter = searchParams.get('category')

  try {
    // Fetch all match types
    const { data: types, error } = await supabase
      .from('match_types')
      .select('id, name, slug, description, image_url')
      .order('name', { ascending: true })

    if (error) {
      console.error('[stipulations-list] error:', error)
      return NextResponse.json({ error: 'Failed to fetch stipulations' }, { status: 500 })
    }

    // Get match counts per type
    const { data: matchCounts } = await supabase
      .from('matches')
      .select('match_type_id')

    const countMap = new Map<number, number>()
    if (matchCounts) {
      for (const m of matchCounts) {
        if (m.match_type_id) {
          countMap.set(m.match_type_id, (countMap.get(m.match_type_id) || 0) + 1)
        }
      }
    }

    let enriched = (types || []).map(t => ({
      ...t,
      match_count: countMap.get(t.id) || 0,
      category: getCategoryForType(t.name),
    }))

    // Sort by match count descending (most used first)
    enriched.sort((a, b) => b.match_count - a.match_count)

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      enriched = enriched.filter(t => t.category === categoryFilter)
    }

    // Get all categories with counts
    const categories = new Map<string, number>()
    for (const t of enriched) {
      categories.set(t.category, (categories.get(t.category) || 0) + 1)
    }

    const allTypes = (types || []).map(t => ({
      ...t,
      match_count: countMap.get(t.id) || 0,
      category: getCategoryForType(t.name),
    }))

    const categoryList = [...new Set(allTypes.map(t => t.category))]
      .map(cat => ({
        name: cat,
        count: allTypes.filter(t => t.category === cat).length,
      }))
      .sort((a, b) => {
        // Put 'Standard' last
        if (a.name === 'Standard') return 1
        if (b.name === 'Standard') return -1
        return b.count - a.count
      })

    return NextResponse.json({
      stipulations: enriched,
      categories: categoryList,
      total: enriched.length,
    })
  } catch (err) {
    console.error('[stipulations-list] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
