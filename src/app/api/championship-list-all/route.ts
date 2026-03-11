// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const superstarId = searchParams.get('superstarId')
  const gender = searchParams.get('gender') // 'male' or 'female'

  try {
    const { data: championships, error } = await supabase
      .from('championships')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

    // If superstar filter by ID
    let filteredIds: number[] | null = null
    if (superstarId) {
      const { data: reigns } = await supabase
        .from('championship_reigns')
        .select('championship_id')
        .eq('superstar_id', parseInt(superstarId))
      filteredIds = reigns ? [...new Set(reigns.map(r => r.championship_id))] : []
    }

    // If gender filter — find championships held by at least one person of that gender
    let genderFilteredIds: number[] | null = null
    if (gender) {
      const { data: reigns } = await supabase
        .from('championship_reigns')
        .select('championship_id, superstar:superstar_id ( gender )')
      if (reigns) {
        const ids = new Set<number>()
        for (const r of reigns) {
          if (r.superstar?.gender === gender) ids.add(r.championship_id)
        }
        genderFilteredIds = [...ids]
      }
    }

    // Enrich with current holder for active ones
    const enriched = await Promise.all(
      (championships || []).map(async (c) => {
        if (c.status !== 'active') return { ...c, current_holder: null, current_reign_start: null }
        const { data: reign } = await supabase
          .from('championship_reigns')
          .select('id, won_date, days_held, superstar:superstar_id ( id, name, slug, photo_url )')
          .eq('championship_id', c.id)
          .is('lost_date', null)
          .limit(1)
          .maybeSingle()
        return { ...c, current_holder: reign?.superstar || null, current_reign_start: reign?.won_date || null }
      })
    )

    return NextResponse.json({ championships: enriched, filteredIds, genderFilteredIds })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
