// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const superstarId = searchParams.get('superstarId')
  const gender = searchParams.get('gender')

  try {
    const { data: championships, error } = await supabase
      .from('championships')
      .select('*, is_tag_team')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })

    let filteredIds: number[] | null = null
    if (superstarId) {
      const { data: reigns } = await supabase.from('championship_reigns').select('championship_id').eq('superstar_id', parseInt(superstarId))
      filteredIds = reigns ? [...new Set(reigns.map(r => r.championship_id))] : []
    }

    let genderFilteredIds: number[] | null = null
    if (gender) {
      const { data: reigns } = await supabase.from('championship_reigns').select('championship_id, superstar:superstar_id ( gender )').limit(5000)
      if (reigns) {
        const ids = new Set<number>()
        for (const r of reigns) { if (r.superstar?.gender === gender) ids.add(r.championship_id) }
        genderFilteredIds = [...ids]
      }
    }

    const enriched = await Promise.all(
      (championships || []).map(async (c) => {
        if (c.status !== 'active') return { ...c, current_holder: null, current_holders: [], current_reign_start: null }
        // For tag team: get ALL current holders (multiple rows with same reign_group_id and no lost_date)
        const { data: currentReigns } = await supabase
          .from('championship_reigns')
          .select('id, won_date, days_held, reign_group_id, superstar:superstar_id ( id, name, slug, photo_url )')
          .eq('championship_id', c.id)
          .is('lost_date', null)
          .order('won_date', { ascending: false })
        
        const holders = (currentReigns || []).map(r => r.superstar).filter(Boolean)
        return {
          ...c,
          current_holder: holders[0] || null,
          current_holders: holders,
          current_reign_start: currentReigns?.[0]?.won_date || null,
        }
      })
    )

    return NextResponse.json({ championships: enriched, filteredIds, genderFilteredIds })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
