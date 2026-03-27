import type { Metadata } from 'next'
import OMGCategoryClient from '../OMGCategoryClient'

export const metadata: Metadata = {
  title: 'Greatest Returns — WWE OMG Moments | Pinfall Data',
  description: 'When legends come back and the arena erupts — the greatest returns in WWE history.',
  keywords: ['WWE greatest returns', 'best WWE returns', 'surprise returns', 'wrestling comebacks', 'Pinfall Data'],
  openGraph: { title: 'Greatest Returns — WWE OMG Moments | Pinfall Data', description: 'When legends come back and the arena erupts — the greatest returns in WWE history.', type: 'website' },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/omg-moments/greatest-returns' },
}

export default function GreatestReturnsPage() {
  return <OMGCategoryClient category="return" title=t('omg.returns') subtitle="When legends come back and the arena erupts — the greatest returns in WWE history." heroImage="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/john-cena-royal-rumble-2008-cropped_2026-03-20_19_59_13.116122.jpg.png" icon="🔙" />
}
