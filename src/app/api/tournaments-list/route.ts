// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        id, name, slug, year, date, description_md, image_url,
        winner:winner_id ( id, name, slug, photo_url ),
        show:show_id ( id, name, slug, date, venue, city, country )
      `)
      .order('date', { ascending: false })
      .order('year', { ascending: false })

    if (error) {
      console.error('[tournaments-list]', error)
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }

    return NextResponse.json({ tournaments: data || [] })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
