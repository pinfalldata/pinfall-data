import type { Metadata } from 'next'
import RolePageClient from '@/components/superstar/RolePageClient'

export const metadata: Metadata = {
  title: 'WWE Referees — Every Official of the Ring | Pinfall Data',
  description: 'Browse every WWE referee in history. From Earl Hebner to Charles Robinson, explore the officials who enforced the rules. Matches refereed stats, special guest referees, and full profiles.',
  keywords: ['WWE referees', 'Earl Hebner', 'Charles Robinson', 'special guest referee', 'WWE officials', 'wrestling referee'],
  openGraph: { title: 'WWE Referees — Complete Directory | Pinfall Data', description: 'Every WWE referee with matches-refereed stats and special guest referees.', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/charles-robinson-great-khali.jpg'], type: 'website' },
  alternates: { canonical: '/superstars/referees' },
}

const config = {
  roleKey: 'referee',
  title: 'Referees',
  heroImage: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/charles-robinson-great-khali.jpg',
  heroDescription: 'The keepers of the rules inside the squared circle. Referees who counted pinfalls, called submissions, and sometimes became part of the biggest storylines.',
  statLabel: 'matches refereed',
  statSortLabel: '🦓 Most Matches',
  hasGuests: true,
  guestLabel: 'Special Guest Referees',
  guestBtnLabel: 'Special Guest Referees',
  extraInfoKey: null,
  seoDescription: 'The complete database of WWE referees and officials. Every referee with their number of matches officiated. Also discover special guest referees — superstars like Stone Cold Steve Austin or The Rock who stepped in as referee for historic matches.',
}

export default function RefereesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'WWE Referees', url: 'https://pinfall-data.vercel.app/superstars/referees' }) }} />
      <RolePageClient config={config} />
    </>
  )
}
