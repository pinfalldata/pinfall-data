// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const superstarName = searchParams.get('superstar')

  try {
    const { data: championships, error } = await supabase
      .from('championships')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

    // If superstar filter — find which championships this superstar held
    let filteredIds: number[] | null = null
    if (superstarName) {
      // Find superstar(s) matching the name
      const { data: superstars } = await supabase
        .from('superstars')
        .select('id')
        .ilike('name', `%${superstarName}%`)
        .limit(20)

      if (superstars && superstars.length > 0) {
        const ssIds = superstars.map(s => s.id)
        const { data: reigns } = await supabase
          .from('championship_reigns')
          .select('championship_id')
          .in('superstar_id', ssIds)

        if (reigns) {
          filteredIds = [...new Set(reigns.map(r => r.championship_id))]
        } else {
          filteredIds = []
        }
      } else {
        filteredIds = []
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
        return {
          ...c,
          current_holder: reign?.superstar || null,
          current_reign_start: reign?.won_date || null,
        }
      })
    )

    return NextResponse.json({ championships: enriched, filteredIds })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
