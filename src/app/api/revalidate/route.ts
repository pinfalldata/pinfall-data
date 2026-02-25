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

    // Petite fonction utilitaire pour rafraîchir et mémoriser le chemin
    const refresh = (path: string) => {
      revalidatePath(path)
      if (!revalidated.includes(path)) revalidated.push(path)
    }

    // 🚀 L'AIGUILLAGE GÉANT SELON LA TABLE MODIFIÉE
    switch (table) {
      
      // --- 1. LES PAGES PRINCIPALES (Tables avec un slug) ---
      case 'superstars':
        if (slug) refresh(`/superstars/${slug}`)
        refresh('/superstars')
        break;

      case 'shows':
        if (slug) refresh(`/shows/${slug}`)
        refresh('/matches') // Ton ancienne logique : la liste des shows est sur /matches
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

      // --- 2. LES TABLES LIÉES AUX MATCHS ---
      case 'matches':
      case 'show_segments':
        refresh('/matches')
        break;

      // --- 3. LES TABLES DE LIAISON (Impactent plusieurs endroits) ---
      case 'match_participants':
        refresh('/superstars')
        refresh('/matches')
        break;

      case 'championship_reigns':
        refresh('/champions')
        refresh('/superstars')
        break;

      // --- 4. LES DONNÉES SECONDAIRES DES SUPERSTARS ---
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

    // --- FIN DE L'AIGUILLAGE ---

    if (revalidated.length > 0) {
      console.log(`Cache rafraîchi (${table}): ${revalidated.join(', ')}`)
      return NextResponse.json({ revalidated: true, table, paths: revalidated, now: Date.now() })
    }

    return NextResponse.json({ message: 'Rien à rafraîchir pour cette action', table, now: Date.now() })
    
  } catch (err) {
    console.error('Erreur Webhook:', err)
    return NextResponse.json({ message: 'Erreur interne de revalidation' }, { status: 500 })
  }
}