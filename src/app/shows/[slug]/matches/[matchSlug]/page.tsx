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

  // Build rich description
  const titleParts = [championship ? `${championship} — ` : '', matchType, ': ', vsStr].join('')
  const descParts = [
    `${matchType}: ${vsStr} at ${showName}${dateStr ? ` (${dateStr})` : ''}.`,
    championship ? ` ${championship} on the line.` : '',
    duration ? ` Match lasted ${duration}.` : '',
    match.rating ? ` Rated ${match.rating}/10.` : '',
    ' Full results, stats, head-to-head history on Pinfall Data.',
  ].join('')

  return {
    title: `${vsStr} — ${matchType} | ${showName} | Pinfall Data`,
    description: descParts,
    keywords: [
      ...names, matchType, showName, championship, 'WWE', 'match', 'results', 'stats',
    ].filter(Boolean) as string[],
    openGraph: {
      title: titleParts,
      description: `${matchType} at ${showName} — Full results and statistics`,
      type: 'article',
      images: (match as any).image_url ? [(match as any).image_url] : [],
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
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${names.join(' vs ')} — ${match.match_type?.name || 'Match'}`,
    startDate: match.date || show.date,
    description: match.summary_md || `${match.match_type?.name || 'Match'} at ${show.name}`,
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
    competitor: names.map((n: string) => ({ '@type': 'Person', name: n })),
    sport: 'Professional Wrestling',
    ...(match.duration_seconds ? { duration: `PT${Math.floor(match.duration_seconds / 60)}M${match.duration_seconds % 60}S` } : {}),
    url: `https://pinfall-data.vercel.app/shows/${show.slug}/matches/${match.slug}`,
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