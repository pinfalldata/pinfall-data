// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/random-superstar-detail
 * Returns one random superstar with photo, bio, stats, and role info.
 */
export async function GET(request: NextRequest) {
  try {
    // Count superstars with valid photos
    const { count: total } = await supabase
      .from('superstars')
      .select('*', { count: 'exact', head: true })
      .not('photo_url', 'is', null)
      .neq('photo_url', '')

    if (!total || total === 0) {
      return NextResponse.json({ superstar: null })
    }

    // Pick a random offset
    const offset = Math.floor(Math.random() * total)

    const { data, error } = await supabase
      .from('superstars')
      .select(`
        id, name, slug, photo_url, bio_md, role, status, gender,
        billed_from, debut_date, retirement_date,
        win_count, loss_count, draw_count, total_matches,
        total_reigns, total_championship_days, height_cm, weight_kg,
        birth_date, death_date, real_name, current_brand
      `)
      .not('photo_url', 'is', null)
      .neq('photo_url', '')
      .range(offset, offset)
      .limit(1)

    if (error || !data || data.length === 0) {
      return NextResponse.json({ superstar: null })
    }

    const s = data[0]

    // Build a short description
    let description = ''
    if (s.role) {
      const roleLabel = s.role.charAt(0).toUpperCase() + s.role.slice(1).replace(/_/g, ' ')
      description += roleLabel
    }
    if (s.billed_from) {
      description += description ? ` from ${s.billed_from}` : `From ${s.billed_from}`
    }
    if (s.total_matches && s.total_matches > 0) {
      description += `. ${s.total_matches} career matches`
      if (s.win_count) description += `, ${s.win_count} wins`
    }
    if (s.total_reigns && s.total_reigns > 0) {
      description += `. ${s.total_reigns}x champion`
    }
    if (s.status === 'retired') {
      description += '. Retired'
    } else if (s.status === 'deceased') {
      description += '. Legend'
    }

    return NextResponse.json({
      superstar: {
        id: s.id,
        name: s.name,
        slug: s.slug,
        photo_url: s.photo_url,
        role: s.role,
        status: s.status,
        billed_from: s.billed_from,
        current_brand: s.current_brand,
        total_matches: s.total_matches,
        win_count: s.win_count,
        loss_count: s.loss_count,
        total_reigns: s.total_reigns,
        description,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[random-superstar-detail]', err)
    return NextResponse.json({ superstar: null })
  }
}
