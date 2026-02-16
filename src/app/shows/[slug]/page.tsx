import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getShowBySlug } from '@/lib/queries'
import { ShowHero } from '@/components/show/ShowHero'
import { ShowInfoBar } from '@/components/show/ShowInfoBar'
import { ShowCard } from '@/components/show/ShowCard'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const show = await getShowBySlug(params.slug)
  if (!show) return { title: 'Show not found — Pinfall Data' }

  const seriesName = (show as any).show_series?.name || show.name
  const dateStr = new Date(show.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return {
    title: `${show.name} — ${dateStr} | Full Card & Results | Pinfall Data`,
    description: `Complete card and results for ${show.name} (${dateStr}). ${show.city ? `Live from ${show.city}${show.country ? `, ${show.country}` : ''}. ` : ''}Every match, every segment, every result.`,
    openGraph: {
      title: `${show.name} — ${dateStr} | Pinfall Data`,
      description: `Full card and results for ${show.name}`,
      images: show.logo_url ? [show.logo_url] : show.banner_url ? [show.banner_url] : [],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${show.name} | Pinfall Data`,
    },
    alternates: {
      canonical: `/shows/${params.slug}`,
    },
  }
}

// JSON-LD structured data for SEO
function generateJsonLd(show: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: show.name,
    startDate: show.date,
    location: show.venue ? {
      '@type': 'Place',
      name: show.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: show.city,
        addressRegion: show.state_province,
        addressCountry: show.country,
      }
    } : undefined,
    organizer: {
      '@type': 'Organization',
      name: 'WWE',
    },
    ...(show.attendance ? { attendee: { '@type': 'QuantitativeValue', value: show.attendance } } : {}),
  }
}

export default async function ShowPage({ params }: Props) {
  const show = await getShowBySlug(params.slug)
  if (!show) notFound()

  const jsonLd = generateJsonLd(show)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen">
        <ShowHero show={show} />
        <ShowInfoBar show={show} />
        <ShowCard show={show} />
      </main>
    </>
  )
}
