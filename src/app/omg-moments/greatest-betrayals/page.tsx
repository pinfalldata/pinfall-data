import type { Metadata } from 'next'
import OMGCategoryClient from '../OMGCategoryClient'

export const metadata: Metadata = {
  title: 'Greatest Betrayals — WWE OMG Moments | Pinfall Data',
  description: 'Backstabs, heel turns, and the most devastating betrayals in WWE history.',
  keywords: ['WWE betrayals', 'best heel turns', 'wrestling betrayals', 'shocking turns', 'Pinfall Data'],
  openGraph: { title: 'Greatest Betrayals — WWE OMG Moments | Pinfall Data', description: 'Backstabs, heel turns, and the most devastating betrayals in WWE history.', type: 'website' },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/omg-moments/greatest-betrayals' },
}

export default function GreatestBetrayalsPage() {
  return <OMGCategoryClient category="betrayal" title=t('omg.betrayals') subtitle="Backstabs, heel turns, and the most devastating betrayals in WWE history." heroImage="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/HIAC_10252020EJ_44374_2026-03-20_20_04_09.007052.webp.png" icon="🗡️" />
}
