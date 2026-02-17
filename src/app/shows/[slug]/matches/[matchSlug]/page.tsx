import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMatchBySlug, getHeadToHead, getWinMethods } from '@/lib/queries'
import { MatchHero } from '@/components/match/MatchHero'
import { MatchStatsSection } from '@/components/match/MatchStatsSection'

interface Props {
  params: { slug: string; matchSlug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const match = await getMatchBySlug(params.slug, params.matchSlug)
  if (!match) return { title: 'Match not found — Pinfall Data' }

  console.log('MATCH DEBUG fallback?', (match as any).__fallback)

  const participants = (match as any).participants || []
  const names = participants.map((p: any) => p.superstar?.name).filter(Boolean)
  const vsStr = names.join(' vs ')
  const showName = (match as any).show?.name || ''
  const dateStr = match.date ? new Date(match.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const matchType = (match as any).match_type?.name || 'Match'

  return {
    title: `${vsStr} — ${matchType} | ${showName} | Pinfall Data`,
    description: `${matchType}: ${vsStr} at ${showName} (${dateStr}). Full results, stats, head-to-head history, and analysis.`,
    openGraph: {
      title: `${vsStr} — ${showName}`,
      description: `${matchType} — Full results and statistics`,
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
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${names.join(' vs ')} — ${match.match_type?.name || 'Match'}`,
    startDate: match.date,
    location: match.show ? { '@type': 'SportsEvent', name: match.show.name } : undefined,
    competitor: names.map((n: string) => ({ '@type': 'Person', name: n })),
  }
}

export default async function MatchPage({ params }: Props) {
  const match = await getMatchBySlug(params.slug, params.matchSlug)
  if (!match) notFound()

  const participants = (match as any).participants || []
// On utilise Array.from pour éviter l'erreur de spread (...)
  const uniqueSuperstars = Array.from(
    new Set(participants.map((p: any) => p.superstar?.id).filter(Boolean))
  ) as number[]
  
  // Head-to-head for 1v1
  let h2hData = null
  if (uniqueSuperstars.length === 2) {
    h2hData = await getHeadToHead(uniqueSuperstars[0], uniqueSuperstars[1])
  }

  // Win methods per participant (max 6)
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
