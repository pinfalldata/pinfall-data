import type { Metadata } from 'next'
import OMGCategoryClient from '../OMGCategoryClient'

export const metadata: Metadata = {
  title: 'Sexy Moments — WWE OMG Moments | Pinfall Data',
  description: 'The hottest, most provocative moments that set the screen on fire.',
  keywords: ['WWE sexy moments', 'hottest WWE', 'provocative wrestling', 'WWE divas', 'Pinfall Data'],
  openGraph: { title: 'Sexy Moments — WWE OMG Moments | Pinfall Data', description: 'The hottest, most provocative moments that set the screen on fire.', type: 'website' },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/omg-moments/sexy-moments' },
}

export default function SexyMomentsPage() {
  return <OMGCategoryClient category="sexy" title=t('omg.sexy') subtitle="The hottest, most provocative moments that set the screen on fire." heroImage="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/liv-morgan-absence-wwe-tournage-film_2026-03-20_19_59_13.493456.jpg.png" icon="💋" />
}
