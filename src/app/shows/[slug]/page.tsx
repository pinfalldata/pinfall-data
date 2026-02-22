import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getShowBySlug } from '@/lib/queries'
import { ShowHero } from '@/components/show/ShowHero'
import { ShowInfoBar } from '@/components/show/ShowInfoBar'
import { ShowCard } from '@/components/show/ShowCard'

// CORRECTION : On type params comme une Promise
type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  // CORRECTION : On attend (await) les params
  const params = await props.params
  const show = await getShowBySlug(params.slug)
  
  if (!show) return { title: 'Show not found — Pinfall Data' }

  const dateStr = new Date(show.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const seriesName = show.show_series?.name || ''

  // Collect all wrestler names + aliases for SEO
  const wrestlerNames: string[] = []
  for (const m of (show.matches || [])) {
    for (const p of (m.participants || [])) {
      if (p.superstar?.name) wrestlerNames.push(p.superstar.name)
    }
  }
  const uniqueNames = Array.from(new Set(wrestlerNames))
  const featuredStr = uniqueNames.length > 0 ? ` Featuring ${uniqueNames.slice(0, 6).join(', ')}${uniqueNames.length > 6 ? ' and more' : ''}.` : ''
  const matchCount = show.matches?.length || 0
  const locationStr = show.city ? `Live from ${[show.venue, show.city].filter(Boolean).join(', ')}.` : ''

  return {
    title: `${show.name} | Pinfall Data`,
    description: `${show.name} results, full match card, and statistics. ${locationStr}${featuredStr}`,
    keywords: [show.name, seriesName, 'WWE', 'results', 'matches', 'stats', ...uniqueNames].filter(Boolean) as string[],
    openGraph: {
      title: `${show.name} — Full Results & Stats`,
      description: `Complete match card, results, and statistics for ${show.name}.`,
      type: 'article',
      images: show.banner_url || show.logo_url ? [show.banner_url || show.logo_url] : [],
    },
    twitter: { card: 'summary_large_image' },
    alternates: {
      canonical: `/shows/${params.slug}`,
    },
  }
}

function generateJsonLd(show: any) {
  const wrestlers = []
  for (const m of (show.matches || [])) {
    for (const p of (m.participants || [])) {
      if (p.superstar?.name) wrestlers.push({ '@type': 'Person', name: p.superstar.name })
    }
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: show.name,
    startDate: show.date,
    ...(show.start_time ? { doorTime: show.start_time } : {}),
    location: show.venue ? {
      '@type': 'Place',
      name: show.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: show.city,
        addressRegion: show.state_province,
        addressCountry: show.country,
      },
    } : undefined,
    organizer: { '@type': 'Organization', name: 'WWE', url: 'https://www.wwe.com' },
    ...(show.attendance ? { maximumAttendeeCapacity: show.attendance } : {}),
    competitor: wrestlers.slice(0, 20),
    sport: 'Professional Wrestling',
    url: `https://pinfall-data.vercel.app/shows/${show.slug}`,
  }
}

export default async function ShowPage(props: Props) {
  // CORRECTION : On attend (await) les params ici aussi
  const params = await props.params
  const show = await getShowBySlug(params.slug)
  
  if (!show) notFound()

  const jsonLd = generateJsonLd(show)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen bg-bg-primary pb-20">
        <ShowHero show={show} />
        <ShowInfoBar show={show} />
        <ShowCard show={show} />
      </main>
    </>
  )
}