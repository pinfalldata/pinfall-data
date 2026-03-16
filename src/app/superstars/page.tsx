import type { Metadata } from 'next'
import SuperstarsPageClient from '@/components/superstar/SuperstarsPageClient'

export const metadata: Metadata = {
  title: 'WWE Superstars — Browse Wrestlers, Managers, Referees & More | Pinfall Data',
  description:
    'Explore the complete roster of WWE Superstars across all eras. Browse wrestlers, managers, commentators, ring announcers, referees, interviewers, general managers, and executives. Full profiles, career stats, and match histories.',
  keywords: [
    'WWE superstars',
    'WWE roster',
    'WWE wrestlers',
    'WWE managers',
    'WWE commentators',
    'WWE referees',
    'WWE ring announcers',
    'WWE interviewers',
    'WWE general managers',
    'WWE executives',
    'professional wrestling',
    'wrestling database',
  ],
  openGraph: {
    title: 'WWE Superstars — Complete Roster Database | Pinfall Data',
    description:
      'Browse the complete roster of WWE Superstars. Wrestlers, managers, commentators, referees, and more across every era of professional wrestling.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/superstars' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'WWE Superstars',
  description: 'Complete roster of WWE Superstars across all eras and roles.',
  url: 'https://pinfalldata.com/superstars',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Pinfall Data',
    url: 'https://pinfalldata.com',
  },
}

export default function SuperstarsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SuperstarsPageClient />
    </>
  )
}
