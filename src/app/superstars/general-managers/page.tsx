import type { Metadata } from 'next'
import RolePageClient from '@/components/superstar/RolePageClient'

export const metadata: Metadata = {
  title: 'WWE General Managers — Every Authority Figure in History | Pinfall Data',
  description: 'Browse every WWE General Manager in history. From Mick Foley to Kurt Angle, explore the authority figures who ran Raw, SmackDown, and every brand.',
  keywords: ['WWE general managers', 'Raw GM', 'SmackDown GM', 'WWE authority', 'WWE commissioner', 'Teddy Long', 'Vickie Guerrero'],
  openGraph: { title: 'WWE General Managers — Complete Directory | Pinfall Data', description: 'Every WWE General Manager with tenure details.', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/001_SD_10112011cm_0003--80905300aa008c0520ef7777f22d1dbd.jpg'], type: 'website' },
  alternates: { canonical: '/superstars/general-managers' },
}

const config = {
  roleKey: 'general_manager',
  title: 'General Managers',
  heroImage: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/001_SD_10112011cm_0003--80905300aa008c0520ef7777f22d1dbd.jpg',
  heroDescription: 'The authority figures who ran the show. General Managers who booked main events, sparked rivalries, and wielded power across Raw, SmackDown, and beyond.',
  statLabel: 'tenure(s)',
  statSortLabel: '👔 Most Tenures',
  hasGuests: false,
  guestLabel: '',
  guestBtnLabel: '',
  extraInfoKey: null,
  seoDescription: 'The complete database of WWE General Managers and on-screen authority figures. Every GM who ran Raw, SmackDown, NXT, and other brands. Full career profiles, tenure details, and more on Pinfall Data.',
}

export default function GeneralManagersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'WWE General Managers', url: 'https://pinfall-data.vercel.app/superstars/general-managers' }) }} />
      <RolePageClient config={config} />
    </>
  )
}
