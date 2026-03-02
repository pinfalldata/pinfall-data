// @ts-nocheck
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { data: matchType } = await supabase
    .from('match_types')
    .select('name, description, image_url, category')
    .eq('slug', params.slug)
    .single()

  if (!matchType) {
    return {
      title: 'Match Stipulation — Every Match in WWE History | Pinfall Data',
      description: 'Complete history of this WWE match stipulation with every match, results, ratings, and participants.',
    }
  }

  const title = `${matchType.name} — Every ${matchType.name} in WWE History | Pinfall Data`
  const description = matchType.description 
    ? `${matchType.description.substring(0, 150)}... Full list of every ${matchType.name} with results, ratings, championships.`
    : `Complete history of every ${matchType.name} in WWE. Browse all matches with results, participants, championship info, and Meltzer ratings on Pinfall Data.`

  return {
    title,
    description,
    keywords: [
      matchType.name, 'WWE', matchType.category || 'match type', 
      'wrestling match history', 'match results', 'Pinfall Data',
      `${matchType.name} results`, `${matchType.name} history`,
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'website',
      ...(matchType.image_url && { images: [{ url: matchType.image_url, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `/matches/stipulations/${params.slug}`,
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
