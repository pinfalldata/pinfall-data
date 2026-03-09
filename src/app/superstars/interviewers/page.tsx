import type { Metadata } from 'next'
import RolePageClient from '@/components/superstar/RolePageClient'

export const metadata: Metadata = {
  title: 'WWE Interviewers — Every Backstage Story Teller | Pinfall Data',
  description: 'Browse every WWE interviewer in history. From Mean Gene Okerlund to Renee Paquette, explore the personalities who captured the stories. Interview count stats and full profiles.',
  keywords: ['WWE interviewers', 'Mean Gene Okerlund', 'Renee Young', 'Kayla Braxton', 'backstage interview', 'WWE reporter'],
  openGraph: { title: 'WWE Interviewers — Complete Directory | Pinfall Data', description: 'Every WWE interviewer with interview segment stats.', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/Image-from-iOS-3-scaled-e1748965495874.webp'], type: 'website' },
  alternates: { canonical: '/superstars/interviewers' },
}

const config = {
  roleKey: 'interviewer',
  title: 'Interviewers',
  heroImage: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/Image-from-iOS-3-scaled-e1748965495874.webp',
  heroDescription: 'The personalities who captured the emotion, the drama, and the stories behind every rivalry. WWE interviewers who brought backstage to life.',
  statLabel: 'interviews',
  statSortLabel: '🎤 Most Interviews',
  hasGuests: false,
  guestLabel: '',
  guestBtnLabel: '',
  extraInfoKey: null,
  seoDescription: 'The complete database of WWE interviewers and backstage reporters. Every interviewer with the number of interview segments they conducted. Full career profiles on Pinfall Data.',
}

export default function InterviewersPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'WWE Interviewers', url: 'https://pinfall-data.vercel.app/superstars/interviewers' }) }} />
      <RolePageClient config={config} />
    </>
  )
}
