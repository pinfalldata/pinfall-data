import type { Metadata } from 'next'
import RolePageClient from '@/components/superstar/RolePageClient'

export const metadata: Metadata = {
  title: 'WWE Executives — The Power Players Behind the Curtain | Pinfall Data',
  description: 'Browse every WWE Executive in history. From Vince McMahon to Triple H, explore the corporate figures who shaped the direction of professional wrestling.',
  keywords: ['WWE executives', 'Vince McMahon', 'Triple H', 'Shane McMahon', 'Stephanie McMahon', 'WWE CEO', 'WWE corporate'],
  openGraph: { title: 'WWE Executives — Complete Directory | Pinfall Data', description: 'Every WWE executive and corporate leader.', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/wwe-ceo-vince-mcmahon-signing-a-check-q4vjshx6iuvk0s17_2026-03-09_12_22_48.088624.jpg%20(1).png'], type: 'website' },
  alternates: { canonical: '/superstars/executives' },
}

const config = {
  roleKey: 'executive',
  title: 'Executives',
  heroImage: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/wwe-ceo-vince-mcmahon-signing-a-check-q4vjshx6iuvk0s17_2026-03-09_12_22_48.088624.jpg%20(1).png',
  heroDescription: 'The power players behind the curtain. Executives who made the business decisions, shaped creative direction, and built the global empire of professional wrestling.',
  statLabel: null,
  statSortLabel: null,
  hasGuests: false,
  guestLabel: '',
  guestBtnLabel: '',
  extraInfoKey: 'executive_role',
  seoDescription: 'The complete database of WWE executives, promoters, and corporate leaders. From the McMahon family dynasty to modern-day leadership, every executive who shaped the business of professional wrestling.',
}

export default function ExecutivesPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Executives', url: 'https://pinfall-data.vercel.app/superstars/executives' }) }} />
      <RolePageClient config={config} />
    </>
  )
}
