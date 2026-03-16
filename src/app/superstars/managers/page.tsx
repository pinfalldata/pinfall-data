import type { Metadata } from 'next'
import ManagersPageClient from '@/components/superstar/ManagersPageClient'

export const metadata: Metadata = {
  title: 'WWE Managers — Every Ringside Mastermind in History | Pinfall Data',
  description:
    'Browse every WWE manager in history. Search by name, alias, or nickname. Filter by era, status, gender, nationality, and Hall of Fame. View ringside records: matches managed, wins and losses as a manager.',
  keywords: [
    'WWE managers', 'wrestling managers', 'Paul Heyman', 'Bobby Heenan', 'Jimmy Hart',
    'Sensational Sherri', 'WWE ringside managers', 'manager stats', 'manager wins losses',
    'wrestling history', 'WWE Hall of Fame managers',
  ],
  openGraph: {
    title: 'WWE Managers — Complete Directory | Pinfall Data',
    description: 'Every WWE manager with ringside records. Matches managed, wins and losses as a manager across all eras.',
    images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/WM2-Ex1.jpg'],
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/superstars/managers' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'WWE Managers',
  description: 'Browse every WWE manager in history with ringside statistics.',
  url: 'https://pinfalldata.com/superstars/managers',
  isPartOf: { '@type': 'WebSite', name: 'Pinfall Data', url: 'https://pinfalldata.com' },
}

export default function ManagersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ManagersPageClient />
    </>
  )
}
