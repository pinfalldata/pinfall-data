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
        id, year, title, summary, cover_image_url, color_accent
      `)
      .order('year', { ascending: true })

    return NextResponse.json({
      years: years || [],
    })
  } catch (err) {
    console.error('[history-timeline]', err)
    return NextResponse.json({ years: [], eras: [] })
  }
}
