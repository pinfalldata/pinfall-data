// @ts-nocheck
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { VersusPageClient } from './VersusPageClient'

const FALLBACK_IMAGE = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/show_series/logo-CWC.png'

interface Props {
  params: { slug: string; slug2: string }
}

async function getSuperstars(slug1: string, slug2: string) {
  const { data, error } = await supabase
    .from('superstars')
    .select('id, name, slug, photo_url, birth_date, status, height_cm, weight_kg, total_matches, wins, losses, draws')
    .in('slug', [slug1, slug2])
  return { stars: data || [], error }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, slug2 } = params

  if (slug > slug2) {
    return { alternates: { canonical: `/superstars/${slug2}/vs/${slug}` } }
  }

  const { stars } = await getSuperstars(slug, slug2)
  if (stars.length < 2) return { title: 'Matchup Not Found | Pinfall Data' }

  const s1 = stars.find(s => s.slug === slug)!
  const s2 = stars.find(s => s.slug === slug2)!

  const title = `${s1.name} vs ${s2.name} — Complete Match History | Pinfall Data`
  const description = `Complete match history between ${s1.name} and ${s2.name}. Every match analyzed with results, ratings, championships, and detailed statistics.`

  return {
    title,
    description,
    keywords: [
      `${s1.name} vs ${s2.name}`, `${s2.name} vs ${s1.name}`,
      `${s1.name} ${s2.name} matches`, `${s1.name} ${s2.name} rivalry`,
      'WWE match history', 'Pinfall Data',
    ],
    openGraph: {
      title: `${s1.name} vs ${s2.name} — Head-to-Head Record`,
      description,
      type: 'website',
      images: [s1.photo_url || s2.photo_url || FALLBACK_IMAGE],
    },
    twitter: { card: 'summary_large_image', title: `${s1.name} vs ${s2.name}`, description },
    alternates: { canonical: `/superstars/${slug}/vs/${slug2}` },
  }
}

function generateJsonLd(s1: any, s2: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${s1.name} vs ${s2.name} — Complete Match History`,
    url: `https://pinfalldata.com/superstars/${s1.slug}/vs/${s2.slug}`,
    isPartOf: { '@type': 'WebSite', name: 'Pinfall Data', url: 'https://pinfalldata.com' },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Superstars', item: 'https://pinfalldata.com/superstars' },
        { '@type': 'ListItem', position: 2, name: s1.name, item: `https://pinfalldata.com/superstars/${s1.slug}` },
        { '@type': 'ListItem', position: 3, name: `vs ${s2.name}` },
      ],
    },
  }
}

export default async function VersusPage({ params }: Props) {
  const { slug, slug2 } = params

  // Normalize: always alphabetical order
  if (slug > slug2) {
    redirect(`/superstars/${slug2}/vs/${slug}`)
  }

  const { stars, error } = await getSuperstars(slug, slug2)

  // If superstars not found, show helpful error instead of generic 404
  if (stars.length < 2) {
    const found = stars.map(s => s.slug)
    const missing = [slug, slug2].filter(s => !found.includes(s))

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-20">
        <p className="text-6xl mb-4 opacity-30">🔍</p>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-white mb-3">
          Superstar not found
        </h1>
        <div className="text-text-secondary text-sm text-center max-w-md mb-2 space-y-1">
          {missing.map(m => (
            <p key={m}>No superstar found with slug: <code className="text-neon-blue bg-bg-secondary/50 px-2 py-0.5 rounded">{m}</code></p>
          ))}
          {found.length > 0 && (
            <p className="text-status-success mt-2">Found: {found.map(f => (
              <code key={f} className="bg-bg-secondary/50 px-2 py-0.5 rounded ml-1">{f}</code>
            ))}</p>
          )}
        </div>
        <p className="text-text-secondary/60 text-xs mb-6">
          Check the superstar profile URL to find the correct slug.
        </p>
        <div className="flex gap-3">
          <Link href="/superstars" className="px-4 py-2 rounded-xl bg-neon-blue/10 border border-neon-blue/25 text-neon-blue text-sm font-medium hover:bg-neon-blue/20 transition-all">
            Browse Superstars
          </Link>
          <Link href="/matches/search" className="px-4 py-2 rounded-xl bg-bg-secondary/30 border border-border-subtle/30 text-text-secondary text-sm hover:text-text-white transition-all">
            Search Matches
          </Link>
        </div>
      </div>
    )
  }

  const s1 = stars.find(s => s.slug === slug)!
  const s2 = stars.find(s => s.slug === slug2)!

  const jsonLd = generateJsonLd(s1, s2)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <VersusPageClient
        superstar1={JSON.parse(JSON.stringify(s1))}
        superstar2={JSON.parse(JSON.stringify(s2))}
        initialMatchCount={0}
      />
    </>
  )
}
