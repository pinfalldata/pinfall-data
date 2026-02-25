// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      console.error('[social-links]', error)
      return NextResponse.json({ links: [] })
    }
    return NextResponse.json({ links: data || [] })
  } catch {
    return NextResponse.json({ links: [] })
  }
}
