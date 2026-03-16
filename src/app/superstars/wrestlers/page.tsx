import type { Metadata } from 'next'
import WrestlersPageClient from '@/components/superstar/WrestlersPageClient'

export const metadata: Metadata = {
  title: 'WWE Wrestlers — Complete Roster of Every In-Ring Competitor | Pinfall Data',
  description:
    'Browse every WWE wrestler in history. Search by name, alias, or nickname. Filter by era, weight class, gender, championship, Hall of Fame status, and nationality. Full career profiles with stats, match history, and title reigns.',
  keywords: [
    'WWE wrestlers', 'WWE roster', 'professional wrestlers', 'WWE superstars list',
    'WWE active roster', 'WWE legends', 'WWE alumni', 'cruiserweight wrestlers',
    'heavyweight wrestlers', 'WWE women wrestlers', 'wrestling database',
    'WWE Hall of Fame', 'WWE champions', 'wrestler search',
  ],
  openGraph: {
    title: 'WWE Wrestlers — Complete In-Ring Competitor Database | Pinfall Data',
    description:
      'Search and filter every WWE wrestler ever. Full career stats, match histories, and championship reigns across all eras.',
    images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/64216f678940c1.72076216.webp'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/superstars/wrestlers' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'WWE Wrestlers — Complete Roster',
  description: 'Browse every WWE wrestler in history with advanced search and filters.',
  url: 'https://pinfalldata.com/superstars/wrestlers',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Pinfall Data',
    url: 'https://pinfalldata.com',
  },
}

export default function WrestlersPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <WrestlersPageClient />
    </>
  )
}
