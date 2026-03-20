import type { Metadata } from 'next'
import OMGCategoryClient from '../OMGCategoryClient'

export const metadata: Metadata = {
  title: 'Most Emotional Moments — WWE OMG Moments | Pinfall Data',
  description: 'Tears, ovations, retirements, and tributes that moved the world.',
  keywords: ['WWE emotional moments', 'wrestling tears', 'WWE retirements', 'tribute moments', 'Pinfall Data'],
  openGraph: { title: 'Most Emotional Moments — WWE OMG Moments | Pinfall Data', description: 'Tears, ovations, retirements, and tributes that moved the world.', type: 'website' },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/omg-moments/most-emotional-moments' },
}

export default function MostEmotionalMomentsPage() {
  return <OMGCategoryClient category="emotional" title="Most Emotional Moments" subtitle="Tears, ovations, retirements, and tributes that moved the world." heroImage="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/ric-flair-hall-of-fame_2026-03-20_20_04_09.125374.jpg.png" icon="😢" />
}
