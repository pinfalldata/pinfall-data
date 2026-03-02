// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// CRITICAL: Force dynamic rendering — prevents Next.js from caching this route
// Without this, Vercel serves a stale cached response with empty events
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/on-this-day?month=3&day=2
 * Returns up to 10 notable WWE events that happened on this day.
 * Client sends its local month/day to avoid timezone mismatch with Vercel server (UTC).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Use client-provided date, fallback to server UTC
    const now = new Date()
    const month = parseInt(searchParams.get('month') || String(now.getMonth() + 1))
    const day = parseInt(searchParams.get('day') || String(now.getDate()))

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
