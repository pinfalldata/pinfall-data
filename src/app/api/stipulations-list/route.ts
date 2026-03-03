// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/stipulations-list?category=environmental (optional)
 * Returns all match types sorted by popularity (match count), with optional category filter
 * 
 * FIX: Uses paginated fetching to get ALL match_type_ids (Supabase default limit is 1000)
 */

// Client-side category mapping
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

/**
 * Fetch ALL match_type_ids by paginating through results
 * Supabase defaults to 1000 rows max per request
 */
async function fetchAllMatchTypeCounts(): Promise<Map<number, number>> {
  const countMap = new Map<number, number>()
  const PAGE_SIZE = 1000
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data, error } = await supabase
      .from('matches')
      .select('match_type_id')
      .not('match_type_id', 'is', null)
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      console.error('[stipulations-list] fetch batch error at offset', offset, error)
      break
    }

    if (!data || data.length === 0) {
      hasMore = false
      break
    }

    for (const m of data) {
      if (m.match_type_id) {
        countMap.set(m.match_type_id, (countMap.get(m.match_type_id) || 0) + 1)
      }
    }

    // If we got fewer than PAGE_SIZE, we've reached the end
    if (data.length < PAGE_SIZE) {
      hasMore = false
    } else {
      offset += PAGE_SIZE
    }
  }

  return countMap
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const categoryFilter = searchParams.get('category')

  try {
    // Fetch all match types
    const { data: types, error } = await supabase
      .from('match_types')
      .select('id, name, slug, description, image_url, category')
      .order('name', { ascending: true })

    if (error) {
      console.error('[stipulations-list] error:', error)
      return NextResponse.json({ error: 'Failed to fetch stipulations' }, { status: 500 })
    }

    // Get accurate match counts by paginating through all matches
    const countMap = await fetchAllMatchTypeCounts()

    let enriched = (types || []).map(t => ({
      ...t,
      match_count: countMap.get(t.id) || 0,
      category: t.category || getCategoryForType(t.name),
    }))

    // Sort by match count descending (most used first)
    enriched.sort((a, b) => b.match_count - a.match_count)

    // Build category list BEFORE filtering
    const allForCategories = [...enriched]
    const categoryList = [...new Set(allForCategories.map(t => t.category))]
      .map(cat => ({
        name: cat,
        count: allForCategories.filter(t => t.category === cat).length,
      }))
      .sort((a, b) => {
        if (a.name === 'Standard') return 1
        if (b.name === 'Standard') return -1
        return b.count - a.count
      })

    // Apply category filter
    if (categoryFilter && categoryFilter !== 'all') {
      enriched = enriched.filter(t => t.category === categoryFilter)
    }

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
