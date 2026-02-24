import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSuperstarBySlug } from '@/lib/queries'
import { ProfileHero } from '@/components/superstar/ProfileHero'
import { ProfileInfoBar } from '@/components/superstar/ProfileInfoBar'
import { ProfileTabs } from '@/components/superstar/ProfileTabs'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const superstar = await getSuperstarBySlug(params.slug)
  if (!superstar) return { title: 'Superstar not found — Pinfall Data' }

  const nickname = (superstar as any).nicknames?.find((n: any) => n.is_primary)?.nickname
  const sub = nickname ? `"${nickname}" — ` : ''

  // Build rich SEO description
  const stats: string[] = []
  if (superstar.total_matches) stats.push(`${superstar.total_matches} career matches`)
  if (superstar.win_count) stats.push(`${superstar.win_count} wins`)
  if (superstar.total_reigns) stats.push(`${superstar.total_reigns}x champion`)
  const statsStr = stats.length > 0 ? ` ${stats.join(', ')}.` : ''

  const billedFrom = superstar.billed_from ? ` Billed from ${superstar.billed_from}.` : ''
  const era = (superstar as any).eras?.[0]?.eras?.name ? ` ${(superstar as any).eras[0].eras.name} era.` : ''

  const description = `${sub}Complete career profile for ${superstar.name}.${statsStr}${billedFrom}${era} Full match history, championship reigns, rivalries, stats & more on Pinfall Data.`

  // Build keywords
  const keywords = [
    superstar.name,
    superstar.real_name,
    nickname,
    'WWE',
    'wrestling',
    'stats',
    'career',
    'match history',
    'championships',
    superstar.billed_from,
  ].filter(Boolean) as string[]

  return {
    title: `${superstar.name} — Career Stats, Match History & Championships | Pinfall Data`,
    description,
    keywords,
    openGraph: {
      title: `${superstar.name} | Complete WWE Career Profile — Pinfall Data`,
      description: `${sub}Full career stats, match history, championship reigns, and more for ${superstar.name}.`,
      images: superstar.photo_url ? [superstar.photo_url] : [],
      type: 'profile',
    },
    twitter: { card: 'summary_large_image' },
    alternates: {
      canonical: `/superstars/${params.slug}`,
    },
  }
}

function generateJsonLd(superstar: any) {
  const nickname = superstar.nicknames?.find((n: any) => n.is_primary)?.nickname
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: superstar.name,
    ...(superstar.real_name ? { alternateName: superstar.real_name } : {}),
    ...(nickname ? { additionalName: nickname } : {}),
    ...(superstar.birth_date ? { birthDate: superstar.birth_date } : {}),
    ...(superstar.death_date ? { deathDate: superstar.death_date } : {}),
    ...(superstar.billed_from ? { homeLocation: { '@type': 'Place', name: superstar.billed_from } } : {}),
    ...(superstar.photo_url ? { image: superstar.photo_url } : {}),
    ...(superstar.height_cm ? { height: { '@type': 'QuantitativeValue', value: superstar.height_cm, unitCode: 'CMT' } } : {}),
    ...(superstar.weight_kg ? { weight: { '@type': 'QuantitativeValue', value: superstar.weight_kg, unitCode: 'KGM' } } : {}),
    sport: 'Professional Wrestling',
    url: `https://pinfall-data.vercel.app/superstars/${superstar.slug}`,
  }
}

export default async function SuperstarProfilePage({ params }: Props) {
  const superstar = await getSuperstarBySlug(params.slug)
  if (!superstar) notFound()

  const jsonLd = generateJsonLd(superstar)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <main className="min-h-screen">
        <ProfileHero superstar={superstar} />
        <ProfileInfoBar superstar={superstar} />
        <ProfileTabs superstar={superstar} />
      </main>
    </>
  )
}