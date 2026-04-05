// @ts-nocheck
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getHeadToHead } from '@/lib/queries'
import { VersusPageClient } from './VersusPageClient'

const FALLBACK_IMAGE = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/show_series/logo-CWC.png'

interface Props {
  params: { slug: string; slug2: string }
}

async function getSuperstars(slug1: string, slug2: string) {
  const { data } = await supabase
    .from('superstars')
    .select('id, name, slug, photo_url, birth_date, status, height_cm, weight_kg, total_matches, wins, losses, draws')
    .in('slug', [slug1, slug2])
  return data || []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, slug2 } = params

  if (slug > slug2) {
    return { alternates: { canonical: `/superstars/${slug2}/vs/${slug}` } }
  }

  const stars = await getSuperstars(slug, slug2)
  if (stars.length < 2) return { title: 'Matchup Not Found' }

  const s1 = stars.find(s => s.slug === slug)!
  const s2 = stars.find(s => s.slug === slug2)!

  // Use existing RPC that works perfectly — no row limit issues
  const h2h = await getHeadToHead(s1.id, s2.id)
  const matchCount = h2h?.total_matches || 0

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

export default async function VersusPage({ params }: Props) {
  const { slug, slug2 } = params

  // Normalize: always alphabetical order
  if (slug > slug2) {
    redirect(`/superstars/${slug2}/vs/${slug}`)
  }

  const stars = await getSuperstars(slug, slug2)
  if (stars.length < 2) notFound()

  const s1 = stars.find(s => s.slug === slug)!
  const s2 = stars.find(s => s.slug === slug2)!

  // Use existing RPC — runs in PostgreSQL, no row limit
  const h2h = await getHeadToHead(s1.id, s2.id)
  const matchCount = h2h?.total_matches || 0

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
