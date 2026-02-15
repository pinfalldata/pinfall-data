import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

// On désactive le cache pour voir les modifications tout de suite
export const revalidate = 0
export const dynamic = 'force-dynamic'

export default async function SuperstarsPage() {
  // On récupère les données
  const { data, error } = await supabase
    .from('superstars')
    .select('*')
    .order('name')

  // Si erreur ou pas de données, on affiche un message simple
  if (error) {
    console.error("Erreur Supabase:", error)
    return <div className="text-white p-10">Erreur de chargement: {error.message}</div>
  }

  // ON FORCE LE TYPE EN 'ANY' POUR ÉVITER LES ERREURS TYPESCRIPT
  const superstars: any[] = data || []

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-12 text-white">
      <h1 className="text-4xl font-bold mb-8 text-center">Test Affichage Images</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {superstars.map((star: any) => (
          <div key={star.id} className="border border-gray-700 p-4 rounded bg-gray-900 flex flex-col items-center">
            
            <div className="relative w-32 h-32 mb-2 bg-gray-800 rounded-full overflow-hidden">
              {star.photo_url ? (
                <Image 
                  src={star.photo_url} 
                  alt={star.name} 
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-gray-500">Pas d'image</div>
              )}
            </div>

            <p className="font-bold text-center">{star.name}</p>
            <p className="text-xs text-gray-400 break-all">{star.photo_url || "NULL"}</p>
            
            <Link href={`/superstars/${star.slug}`} className="mt-2 text-blue-400 text-sm hover:underline">
              Voir Profil
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}