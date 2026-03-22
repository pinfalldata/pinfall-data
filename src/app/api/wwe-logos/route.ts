// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  const { data, error } = await supabase
    .from('wwe_logos')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) console.error('[wwe-logos]', error)
  return NextResponse.json({ logos: data || [] })
}
