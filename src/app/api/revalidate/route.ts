import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// --- 1. CETTE PARTIE GÈRE LE CRON JOB (MINUIT) ---
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  // Vérification du secret
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  try {
    // On rafraîchit les pages globales pour être sûr que tout est à jour le matin
    revalidatePath('/')
    revalidatePath('/superstars')
    revalidatePath('/matches')
    revalidatePath('/champions')
    revalidatePath('/eras')
    
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now(), 
      message: "Rafraîchissement quotidien réussi" 
    })
  } catch (err) {
    return NextResponse.json({ message: 'Erreur Cron' }, { status: 500 })
  }
}

// --- 2. TA PARTIE ACTUELLE (POST) RESTE LA MÊME ---
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

    const refresh = (path: string) => {
      revalidatePath(path)
      if (!revalidated.includes(path)) revalidated.push(path)
    }

    switch (table) {
      case 'superstars':
        if (slug) refresh(`/superstars/${slug}`)
        refresh('/superstars')
        break;
      case 'shows':
        if (slug) refresh(`/shows/${slug}`)
        refresh('/matches')
        refresh('/shows')
        break;
      case 'championships':
        if (slug) refresh(`/champions/${slug}`)
        refresh('/champions')
        break;
      case 'eras':
        if (slug) refresh(`/eras/${slug}`)
        refresh('/eras')
        break;
      case 'arenas':
        if (slug) refresh(`/arenas/${slug}`)
        refresh('/arenas')
        break;
      case 'rivalries':
        if (slug) refresh(`/rivalries/${slug}`)
        refresh('/rivalries')
        break;
      case 'match_types':
        if (slug) refresh(`/match-types/${slug}`)
        break;
      case 'matches':
      case 'show_segments':
        refresh('/matches')
        break;
      case 'match_participants':
        refresh('/superstars')
        refresh('/matches')
        break;
      case 'championship_reigns':
        refresh('/champions')
        refresh('/superstars')
        break;
      case 'hall_of_fame':
      case 'finishers':
      case 'entrance_themes':
      case 'books':
      case 'films':
        refresh('/superstars')
        break;
      default:
        console.log(`Aucune règle définie pour la table : ${table}`)
    }

    if (revalidated.length > 0) {
      return NextResponse.json({ revalidated: true, table, paths: revalidated, now: Date.now() })
    }

    return NextResponse.json({ message: 'Rien à rafraîchir', table, now: Date.now() })
    
  } catch (err) {
    return NextResponse.json({ message: 'Erreur interne' }, { status: 500 })
  }
}