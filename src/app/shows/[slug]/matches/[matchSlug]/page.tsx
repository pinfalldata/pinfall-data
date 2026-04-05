import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMatchBySlug, getHeadToHead, getWinMethods } from '@/lib/queries'
import { MatchHero } from '@/components/match/MatchHero'
import { MatchStatsSection } from '@/components/match/MatchStatsSection'

// Fallback image for structured data (Google requires image for SportsEvent)
const FALLBACK_IMAGE = 'https://pinfalldata.com/logo.png'

type Props = {
  params: Promise<{ slug: string; matchSlug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const match = await getMatchBySlug(params.slug, params.matchSlug)
  
  if (!match) return { title: 'Match not found — Pinfall Data' }

  const participants = (match as any).participants || []
  const names = participants.map((p: any) => p.superstar?.name).filter(Boolean)
  const vsStr = names.join(' vs ')
  const showName = (match as any).show?.name || ''
  const dateStr = match.date ? new Date(match.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const matchType = (match as any).match_type?.name || 'Match'
  const championship = (match as any).championship?.name || ''
  const duration = match.duration_seconds ? `${Math.floor(match.duration_seconds / 60)} minutes` : ''

  const titleParts = [championship ? `${championship} — ` : '', matchType, ': ', vsStr].join('')
  const descParts = [
    `${vsStr} in a ${matchType} at ${showName}${dateStr ? ` on ${dateStr}` : ''}.`,
    championship ? ` ${championship} on the line.` : '',
    duration ? ` Match lasted ${duration}.` : '',
    match.rating ? ` Rated ${match.rating}/10.` : '',
  ].join('')

  const show = (match as any).show || {}

  // ★ FIX: Always provide an image for OG (fallback to logo)
  const ogImage = match.image_url || show.banner_url || FALLBACK_IMAGE

  return {
    title: `${titleParts} — ${showName} | Pinfall Data`,
    description: descParts,
    keywords: [
      ...names, matchType, showName, championship, 'WWE', 'match', 'results', 'stats',
    ].filter(Boolean) as string[],
    openGraph: {
      title: `${vsStr} — ${matchType}${championship ? ` for ${championship}` : ''} | ${showName}`,
      description: descParts,
      type: 'article',
      images: [ogImage],
      url: `https://pinfalldata.com/shows/${show.slug}/matches/${match.slug}`,
    },
    twitter: { card: 'summary_large_image' },
    alternates: {
      canonical: `/shows/${params.slug}/matches/${params.matchSlug}`,
    },
  }
}

function generateJsonLd(match: any) {
  const participants = match.participants || []
  const names = participants.map((p: any) => p.superstar?.name).filter(Boolean)
  const show = match.show || {}

  const performers = participants
    .filter((p: any) => p.superstar?.name)
    .map((p: any) => ({
      '@type': 'Person',
      name: p.superstar.name,
      ...(p.superstar.slug ? { url: `https://pinfalldata.com/superstars/${p.superstar.slug}` } : {}),
    }))

  const location = {
    '@type': 'Place' as const,
    name: show.venue || show.city || 'Venue TBD',
    address: {
      '@type': 'PostalAddress' as const,
      addressLocality: show.city || '',
      ...(show.state_province ? { addressRegion: show.state_province } : {}),
      addressCountry: show.country || 'US',
    },
  }

  const matchType = match.match_type?.name || 'Match'
  const championship = match.championship?.name || ''
  const description = match.summary_md
    || `${names.join(' vs ')} in a ${matchType}${championship ? ` for the ${championship}` : ''} at ${show.name || 'WWE Event'}.`

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${names.join(' vs ')} — ${matchType}`,
    description: description.slice(0, 300),
    startDate: match.date || show.date,
    endDate: match.date || show.date,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location,
    organizer: {
      '@type': 'Organization',
      name: show.show_series?.name || 'WWE',
      url: 'https://www.wwe.com',
    },
    performer: performers.slice(0, 20),
    sport: 'Professional Wrestling',
    // ★ FIX: ALWAYS provide image (Google requires it for SportsEvent)
    image: [match.image_url || show.banner_url || show.logo_url || FALLBACK_IMAGE],
    ...(match.duration_seconds ? { duration: `PT${Math.floor(match.duration_seconds / 60)}M${match.duration_seconds % 60}S` } : {}),
    offers: {
      '@type': 'Offer',
      url: `https://pinfalldata.com/shows/${show.slug}/matches/${match.slug}`,
      availability: 'https://schema.org/Discontinued',
      price: '0',
      priceCurrency: 'USD',
      validFrom: match.date || show.date,
      description: 'This match has already taken place. View full results on Pinfall Data.',
    },
    url: `https://pinfalldata.com/shows/${show.slug}/matches/${match.slug}`,
  }
}

export default async function MatchPage(props: Props) {
  const params = await props.params
  const match = await getMatchBySlug(params.slug, params.matchSlug)
  
  if (!match) notFound()

  const participants = (match as any).participants || []
  const uniqueSuperstars = Array.from(
    new Set(participants.map((p: any) => p.superstar?.id).filter(Boolean))
  ) as number[]

  let h2hData = null
  if (uniqueSuperstars.length === 2) {
    h2hData = await getHeadToHead(uniqueSuperstars[0], uniqueSuperstars[1])
  }

  const winMethodsMap: Record<number, any[]> = {}
  await Promise.all(
    uniqueSuperstars.slice(0, 6).map(async (id) => {
      winMethodsMap[id] = await getWinMethods(id)
    })
  )

  const jsonLd = generateJsonLd(match)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen">
        <MatchHero match={match} />
        <MatchStatsSection match={match} h2hData={h2hData} winMethodsMap={winMethodsMap} />
      </main>
    </>
  )
}
