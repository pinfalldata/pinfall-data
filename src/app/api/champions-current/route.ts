// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/champions-current
 * Returns all active championships with their current holders
 */
export async function GET() {
  try {
    // Get all active championships
    const { data: championships, error } = await supabase
      .from('championships')
      .select('*')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[champions-current] error:', error)
      return NextResponse.json({ error: 'Failed to fetch championships' }, { status: 500 })
    }

    // For each championship, get the current holder (reign with no lost_date)
    const enriched = await Promise.all(
      (championships || []).map(async (c) => {
        const { data: reign } = await supabase
          .from('championship_reigns')
          .select(`
            id, won_date, days_held, reign_number,
            superstar:superstar_id ( id, name, slug, photo_url )
          `)
          .eq('championship_id', c.id)
          .is('lost_date', null)
          .order('won_date', { ascending: false })
          .limit(1)
          .maybeSingle()

        return {
          ...c,
          current_holder: reign?.superstar || null,
          current_reign_start: reign?.won_date || null,
          current_reign_days: reign?.days_held || null,
          current_reign_number: reign?.reign_number || null,
        }
      })
    )

    return NextResponse.json({ championships: enriched })
  } catch (err) {
    console.error('[champions-current] unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
