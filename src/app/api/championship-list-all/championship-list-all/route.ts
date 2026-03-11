// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: championships, error } = await supabase
      .from('championships')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
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

    return NextResponse.json({ championships: enriched })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
