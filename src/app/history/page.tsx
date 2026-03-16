import type { Metadata } from 'next'
import HistoryPageClient from './HistoryPageClient'

export const metadata: Metadata = {
  title: 'WWE History — Complete Timeline From 1953 to Today | Pinfall Data',
  description:
    'Explore the complete history of WWE from the Capitol Wrestling Corporation in 1953 to today. Every era, every pivotal moment, every championship change — an interactive timeline of professional wrestling history.',
  keywords: [
    'WWE history',
    'WWE timeline',
    'wrestling history',
    'WWE eras',
    'Attitude Era',
    'WrestleMania history',
    'WWE evolution',
    'professional wrestling history',
    'WWF history',
    'WWWF history',
    'Monday Night Wars',
    'WWE golden era',
    'Pinfall Data history',
  ],
  openGraph: {
    title: 'WWE History — Complete Interactive Timeline | Pinfall Data',
    description:
      'From 1953 to today — the most comprehensive interactive WWE history timeline. Every era. Every revolution. Every moment.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WWE History — Pinfall Data',
    description: 'The complete interactive timeline of 70+ years of WWE history.',
  },
  alternates: {
    canonical: 'https://pinfalldata.com/history',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'WWE History Timeline',
  description: 'Complete interactive timeline of WWE history from 1953 to present day.',
  url: 'https://pinfalldata.com/history',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Pinfall Data',
    url: 'https://pinfalldata.com',
  },
}

export default function HistoryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HistoryPageClient />
    </>
  )
}
