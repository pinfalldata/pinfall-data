// @ts-nocheck
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { VersusPageClient } from './VersusPageClient'

const FALLBACK_IMAGE = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/show_series/logo-CWC.png'

type Props = { params: Promise<{ slug: string; slug2: string }> }

async function getSuperstars(slug1: string, slug2: string) {
  const { data } = await supabase
    .from('superstars')
    .select('id, name, slug, photo_url, birth_date, status, height_cm, weight_kg, total_matches, wins, losses, draws')
    .in('slug', [slug1, slug2])
  return data || []
}

// Supabase server limits to 1000 rows per query — pagination needed
async function fetchAllMatchIds(superstarId: number): Promise<number[]> {
  const allIds: number[] = []
  let from = 0
  const batch = 1000
  while (true) {
    const { data } = await supabase
      .from('match_participants')
      .select('match_id')
      .eq('superstar_id', superstarId)
      .range(from, from + batch - 1)
    if (!data || data.length === 0) break
    allIds.push(...data.map(p => p.match_id))
    if (data.length < batch) break
    from += batch
  }
  return allIds
}

async function getMatchCount(id1: number, id2: number) {
  const [ids1, ids2] = await Promise.all([
    fetchAllMatchIds(id1),
    fetchAllMatchIds(id2),
  ])
  const set1 = new Set(ids1)
  return ids2.filter(id => set1.has(id)).length
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { slug, slug2 } = params

  // Normalize order: alphabetical
  if (slug > slug2) {
    return {
      alternates: { canonical: `/superstars/${slug2}/vs/${slug}` },
    }
  }

  const stars = await getSuperstars(slug, slug2)
  if (stars.length < 2) return { title: 'Matchup Not Found' }

  const s1 = stars.find(s => s.slug === slug)!
  const s2 = stars.find(s => s.slug === slug2)!
  const matchCount = await getMatchCount(s1.id, s2.id)

  const title = `${s1.name} vs ${s2.name} — All ${matchCount} Match${matchCount !== 1 ? 'es' : ''} | Pinfall Data`
  const description = `Complete match history between ${s1.name} and ${s2.name}. ${matchCount} match${matchCount !== 1 ? 'es' : ''} analyzed with results, ratings, championships, and detailed statistics. The most comprehensive head-to-head breakdown.`

  return {
    title,
    description,
    keywords: [
      `${s1.name} vs ${s2.name}`, `${s2.name} vs ${s1.name}`,
      `${s1.name} ${s2.name} matches`, `${s1.name} ${s2.name} rivalry`,
      `${s1.name} ${s2.name} head to head`, `${s1.name} match history`,
      `${s2.name} match history`, 'WWE match history', 'wrestling rivalry',
      'Pinfall Data', 'WWE statistics',
    ],
    openGraph: {
      title: `${s1.name} vs ${s2.name} — Head-to-Head Record`,
      description,
      type: 'website',
      images: [s1.photo_url || s2.photo_url || FALLBACK_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${s1.name} vs ${s2.name} — ${matchCount} Matches`,
      description,
    },
    alternates: {
      canonical: `/superstars/${slug}/vs/${slug2}`,
    },
  }
}

function generateJsonLd(s1: any, s2: any, matchCount: number) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Superstars', item: 'https://pinfalldata.com/superstars' },
        { '@type': 'ListItem', position: 2, name: s1.name, item: `https://pinfalldata.com/superstars/${s1.slug}` },
        { '@type': 'ListItem', position: 3, name: `vs ${s2.name}`, item: `https://pinfalldata.com/superstars/${s1.slug}/vs/${s2.slug}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${s1.name} vs ${s2.name} — Complete Match History`,
      description: `Full head-to-head record: ${matchCount} matches between ${s1.name} and ${s2.name}.`,
      url: `https://pinfalldata.com/superstars/${s1.slug}/vs/${s2.slug}`,
      mainEntity: {
        '@type': 'ItemList',
        name: `${s1.name} vs ${s2.name} Matches`,
        numberOfItems: matchCount,
        itemListElement: [
          { '@type': 'Person', name: s1.name, url: `https://pinfalldata.com/superstars/${s1.slug}` },
          { '@type': 'Person', name: s2.name, url: `https://pinfalldata.com/superstars/${s2.slug}` },
        ],
      },
      isPartOf: {
        '@type': 'WebSite',
        name: 'Pinfall Data',
        url: 'https://pinfalldata.com',
      },
    },
  ]
}

export default async function VersusPage(props: Props) {
  const params = await props.params
  const { slug, slug2 } = params

  // Normalize: always alphabetical order
  if (slug > slug2) {
    redirect(`/superstars/${slug2}/vs/${slug}`)
  }

  const stars = await getSuperstars(slug, slug2)
  if (stars.length < 2) notFound()

  const s1 = stars.find(s => s.slug === slug)!
  const s2 = stars.find(s => s.slug === slug2)!
  const matchCount = await getMatchCount(s1.id, s2.id)

  if (matchCount === 0) notFound()

  const jsonLd = generateJsonLd(s1, s2, matchCount)

  return (
    <>
      {jsonLd.map((ld, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      ))}
      <VersusPageClient
        superstar1={JSON.parse(JSON.stringify(s1))}
        superstar2={JSON.parse(JSON.stringify(s2))}
        initialMatchCount={matchCount}
      />
    </>
  )
}
