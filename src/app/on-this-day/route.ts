// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/on-this-day
 * Returns up to 10 notable WWE events that happened on this day (month + day).
 * Ordered by importance DESC, then year DESC.
 */
export async function GET() {
  try {
    const now = new Date()
    const month = now.getMonth() + 1 // 1-12
    const day = now.getDate()         // 1-31

    const { data, error } = await supabase
      .from('on_this_day')
      .select('id, month, day, year, title, description, image_url, importance')
      .eq('month', month)
      .eq('day', day)
      .order('importance', { ascending: false })
      .order('year', { ascending: false })
      .limit(10)

    if (error) {
      console.error('[on-this-day]', error)
      return NextResponse.json({ events: [] })
    }

    return NextResponse.json({ events: data || [] })
  } catch (err) {
    console.error('[on-this-day]', err)
    return NextResponse.json({ events: [] })
  }
}
