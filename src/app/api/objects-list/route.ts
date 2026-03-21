// @ts-nocheck
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const revalidate = 3600

export async function GET() {
  try {
    const { data: objects } = await supabase.from('match_objects')
      .select('id, name, slug, description, image_url')
      .order('name')

    const { data: usages } = await supabase.from('match_object_usage').select('object_id')

    const countMap = new Map<number, number>()
    for (const u of (usages || [])) countMap.set(u.object_id, (countMap.get(u.object_id) || 0) + 1)

    const enriched = (objects || []).map(o => ({
      ...o,
      usage_count: countMap.get(o.id) || 0,
    })).sort((a, b) => b.usage_count - a.usage_count)

    return NextResponse.json({ objects: enriched })
  } catch (err) {
    console.error('[objects-list]', err)
    return NextResponse.json({ objects: [] })
  }
}
