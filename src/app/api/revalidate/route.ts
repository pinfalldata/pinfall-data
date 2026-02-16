import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const table = body.table as string | undefined
    const record = body.record as any
    const slug = record?.slug

    const revalidated: string[] = []

    // Revalidate based on which table was modified
    if (slug) {
      // Superstar modified
      if (!table || table === 'superstars') {
        revalidatePath(`/superstars/${slug}`)
        revalidatePath('/superstars')
        revalidated.push(`/superstars/${slug}`)
      }

      // Show modified
      if (table === 'shows') {
        revalidatePath(`/shows/${slug}`)
        revalidatePath('/matches') // Shows list is on matches page
        revalidated.push(`/shows/${slug}`)
      }
    }

    // Match or segment modified — need to revalidate parent show
    if (table === 'matches' || table === 'show_segments') {
      const showId = record?.show_id
      if (showId) {
        // We can't easily get the show slug here, so revalidate broadly
        revalidatePath('/matches')
        revalidated.push('/matches')
      }
    }

    // Match participants changed — revalidate related superstar pages
    if (table === 'match_participants') {
      revalidatePath('/superstars')
      revalidatePath('/matches')
      revalidated.push('/superstars', '/matches')
    }

    if (revalidated.length > 0) {
      console.log(`Cache refreshed: ${revalidated.join(', ')}`)
      return NextResponse.json({ revalidated: true, paths: revalidated, now: Date.now() })
    }

    return NextResponse.json({ message: 'No paths to revalidate', now: Date.now() })
  } catch (err) {
    return NextResponse.json({ message: 'Revalidation error' }, { status: 500 })
  }
}
