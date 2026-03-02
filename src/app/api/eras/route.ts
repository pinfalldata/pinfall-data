// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ISR: Revalidate every hour (eras rarely change)
export const revalidate = 3600

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('eras')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      console.error('[eras]', error)
      return NextResponse.json({ eras: [] })
    }

    return NextResponse.json({ eras: data || [] })
  } catch {
    return NextResponse.json({ eras: [] })
  }
}
