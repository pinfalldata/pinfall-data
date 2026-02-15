import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  // 1. Sécurité : On vérifie le jeton secret dans l'URL
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Jeton invalide' }, { status: 401 })
  }

  try {
    const body = await request.json()
    // Supabase envoie les données dans 'record' pour un UPDATE ou INSERT
    const slug = body.record?.slug 

    if (slug) {
      // On vide le cache du profil précis ET de la liste
      revalidatePath(`/superstars/${slug}`)
      revalidatePath('/superstars')
      
      console.log(`Cache rafraîchi pour : ${slug}`)
      return NextResponse.json({ revalidated: true, now: Date.now() })
    }

    return NextResponse.json({ message: 'Pas de slug trouvé dans le corps' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ message: 'Erreur lors de la revalidation' }, { status: 500 })
  }
}