import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMatchBySlug, getHeadToHead, getWinMethods } from '@/lib/queries'
import { MatchHero } from '@/components/match/MatchHero'
import { MatchStatsSection } from '@/components/match/MatchStatsSection'

// 1. CORRECTION : Typage de params sous forme de Promise pour Next.js
type Props = {
  params: Promise<{ slug: string; matchSlug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  // 2. CORRECTION : On attend (await) les params avant de les utiliser
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
      ...(match.image_url ? { images: [match.image_url] } : show.banner_url ? { images: [show.banner_url] } : {}),
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

  // Build performers with URLs
  const performers = participants
    .filter((p: any) => p.superstar?.name)
    .map((p: any) => ({
      '@type': 'Person',
      name: p.superstar.name,
      ...(p.superstar.slug ? { url: `https://pinfalldata.com/superstars/${p.superstar.slug}` } : {}),
    }))

  // Location — ALWAYS provide one (Google requires it for SportsEvent)
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

  // Description
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
    ...(match.image_url ? { image: [match.image_url] } : show.banner_url ? { image: [show.banner_url] } : {}),
    ...(match.duration_seconds ? { duration: `PT${Math.floor(match.duration_seconds / 60)}M${match.duration_seconds % 60}S` } : {}),
    offers: {
      '@type': 'Offer',
      url: `https://pinfalldata.com/shows/${show.slug}/matches/${match.slug}`,
      availability: 'https://schema.org/Discontinued',
      description: 'This match has already taken place. View full results on Pinfall Data.',
    },
    url: `https://pinfalldata.com/shows/${show.slug}/matches/${match.slug}`,
  }
}

export default async function MatchPage(props: Props) {
  // 3. CORRECTION : On attend (await) les params ici aussi
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
