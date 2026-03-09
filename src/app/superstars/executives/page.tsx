import type { Metadata } from 'next'
import RolePageClient from '@/components/superstar/RolePageClient'

export const metadata: Metadata = {
  title: 'WWE Executives — The Power Players Behind the Curtain | Pinfall Data',
  description: 'Browse every WWE Executive in history. From Vince McMahon to Triple H, explore the corporate figures who shaped the direction of professional wrestling.',
  keywords: ['WWE executives', 'Vince McMahon', 'Triple H', 'Shane McMahon', 'Stephanie McMahon', 'WWE CEO', 'WWE corporate'],
  openGraph: { title: 'WWE Executives — Complete Directory | Pinfall Data', description: 'Every WWE executive and corporate leader.', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/Vince-McMahon-WrestleMania-37.jpg'], type: 'website' },
  alternates: { canonical: '/superstars/executives' },
}

const config = {
  roleKey: 'executive',
  title: 'WWE Executives',
  heroImage: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/Vince-McMahon-WrestleMania-37.jpg',
  heroDescription: 'The power players behind the curtain. WWE executives who made the business decisions, shaped creative direction, and built the global empire of professional wrestling.',
  statLabel: null,
  statSortLabel: null,
  hasGuests: false,
  guestLabel: '',
  guestBtnLabel: '',
  extraInfoKey: 'executive_role',
  seoDescription: 'The complete database of WWE executives, promoters, and corporate leaders. From the McMahon family dynasty to modern-day leadership, every executive who shaped the business of professional wrestling. Full profiles on Pinfall Data.',
}

export default function ExecutivesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'WWE Executives', url: 'https://pinfall-data.vercel.app/superstars/executives' }) }} />
      <RolePageClient config={config} />
    </>
  )
}
