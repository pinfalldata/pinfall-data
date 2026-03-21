// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

/**
 * GET /api/superstar-awards?superstarId=123
 * Returns slammy and year-end award counts for a superstar
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sid = searchParams.get('superstarId')
  if (!sid) return NextResponse.json({ slammy: 0, yearEnd: 0 })

  try {
    const [{ count: slammy }, { count: yearEnd }] = await Promise.all([
      supabase.from('slammy_awards').select('*', { count: 'exact', head: true }).eq('winner_id', parseInt(sid)),
      supabase.from('year_end_awards').select('*', { count: 'exact', head: true }).eq('winner_id', parseInt(sid)),
    ])

    return NextResponse.json({ slammy: slammy || 0, yearEnd: yearEnd || 0 })
  } catch {
    return NextResponse.json({ slammy: 0, yearEnd: 0 })
  }
}
