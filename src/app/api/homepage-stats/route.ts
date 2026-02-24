// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * GET /api/homepage-stats
 * Fetches real counts from Supabase for the homepage stats section.
 * Uses count queries for performance.
 */
export async function GET() {
  try {
    const [
      { count: superstarsCount },
      { count: matchesCount },
      { count: showsCount },
      { count: matchTypesCount },
      { count: arenasCount },
      { count: hofCount },
      { count: omgCount },
      { count: titleChangesCount },
    ] = await Promise.all([
      supabase.from('superstars').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }),
      supabase.from('shows').select('*', { count: 'exact', head: true }),
      supabase.from('match_types').select('*', { count: 'exact', head: true }),
      supabase.from('arenas').select('*', { count: 'exact', head: true }),
      supabase.from('hall_of_fame').select('*', { count: 'exact', head: true }),
      supabase.from('omg_moments').select('*', { count: 'exact', head: true }),
      supabase.from('matches').select('*', { count: 'exact', head: true }).eq('is_title_change', true),
    ])

    const currentYear = new Date().getFullYear()
    const yearsOfHistory = currentYear - 1953

    return NextResponse.json({
      superstars: superstarsCount || 0,
      matches: matchesCount || 0,
      shows: showsCount || 0,
      matchTypes: matchTypesCount || 0,
      arenas: arenasCount || 0,
      hallOfFamers: hofCount || 0,
      omgMoments: omgCount || 0,
      titleChanges: titleChangesCount || 0,
      yearsOfHistory,
    })
  } catch (err) {
    console.error('[homepage-stats]', err)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
