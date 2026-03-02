// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ISR: Revalidate every 6 hours (social links rarely change)
export const revalidate = 21600

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
