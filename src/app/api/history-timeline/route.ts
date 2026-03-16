// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

/**
 * GET /api/history-timeline
 * Returns all history years with era info for the timeline view
 */
export async function GET() {
  try {
    const { data: years } = await supabase
      .from('history_years')
      .select(`
        id, year, title, summary, cover_image_url, color_accent,
        era:era_id ( id, name, slug, start_year, end_year, image_url )
      `)
      .order('year', { ascending: true })

    const { data: eras } = await supabase
      .from('eras')
      .select('id, name, slug, start_year, end_year, image_url')
      .order('sort_order', { ascending: true })

    return NextResponse.json({
      years: years || [],
      eras: eras || [],
    })
  } catch (err) {
    console.error('[history-timeline]', err)
    return NextResponse.json({ years: [], eras: [] })
  }
}
