import type { Metadata } from 'next'
import RolePageClient from '@/components/superstar/RolePageClient'

export const metadata: Metadata = {
  title: 'WWE Ring Announcers — Every Voice of the Arena | Pinfall Data',
  description: 'Browse every WWE ring announcer in history. From Howard Finkel to Lilian Garcia, explore the voices that introduced every superstar. Shows announced stats and full profiles.',
  keywords: ['WWE ring announcers', 'Howard Finkel', 'Lilian Garcia', 'Tony Chimel', 'Justin Roberts', 'Samantha Irvin', 'ring introducing'],
  openGraph: { title: 'WWE Ring Announcers — Complete Directory | Pinfall Data', description: 'Every WWE ring announcer with shows-announced stats.', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/garcia.jpeg'], type: 'website' },
  alternates: { canonical: '/superstars/ring-announcers' },
}

const config = {
  roleKey: 'ring_announcer',
  title: 'Ring Announcers',
  heroImage: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/garcia.jpeg',
  heroDescription: 'The voices that set the stage for every match — ring announcers who introduced superstars with gravitas and became iconic figures in their own right.',
  statLabel: 'shows announced',
  statSortLabel: '📢 Most Shows',
  hasGuests: false,
  guestLabel: '',
  guestBtnLabel: '',
  extraInfoKey: null,
  seoDescription: 'The complete database of WWE ring announcers. From The Fink to modern-day voices, every ring announcer is listed with the number of shows they announced. Full career profiles and statistics on Pinfall Data.',
}

export default function RingAnnouncersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'WWE Ring Announcers', url: 'https://pinfall-data.vercel.app/superstars/ring-announcers' }) }} />
      <RolePageClient config={config} />
    </>
  )
}
