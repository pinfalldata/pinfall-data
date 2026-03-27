import type { Metadata } from 'next'
import RolePageClient from '@/components/superstar/RolePageClient'

export const metadata: Metadata = {
  title: 'WWE Commentators — Every Voice Behind the Action | Pinfall Data',
  description: 'Browse every WWE commentator in history. From Jim Ross to Michael Cole, discover the voices of WWE. Shows commented stats, guest commentator appearances, and full profiles.',
  keywords: ['WWE commentators', 'Jim Ross', 'Michael Cole', 'Jerry Lawler', 'wrestling announcers', 'play-by-play', 'color commentary', 'WWE broadcast team'],
  openGraph: { title: 'WWE Commentators — Complete Directory | Pinfall Data', description: 'Every WWE commentator with shows-commented stats.', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/commenta.jpeg'], type: 'website' },
  alternates: { canonical: '/superstars/commentators' },
}

const config = {
  roleKey: 'commentator',
  title: t('nav.dropdown.commentators'),
  heroImage: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/commenta.jpeg',
  heroDescription: 'The voices that brought every match to life — from legendary play-by-play to color commentary across every era of WWE.',
  statLabel: 'shows commented',
  statSortLabel: '🎙️ Most Shows',
  hasGuests: true,
  guestLabel: 'Guest Commentators',
  guestBtnLabel: 'Guest Commentators',
  extraInfoKey: null,
  seoDescription: 'The complete database of WWE commentators. Every play-by-play and color commentator who called the action, with their number of shows commented. Also discover guest commentators — superstars who stepped behind the broadcast table for special occasions (from the match_commentators table).',
}

export default function CommentatorsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'WWE Commentators', url: 'https://pinfalldata.com/superstars/commentators' }) }} />
      <RolePageClient config={config} />
    </>
  )
}
