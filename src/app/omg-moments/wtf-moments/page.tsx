import type { Metadata } from 'next'
import OMGCategoryClient from '../OMGCategoryClient'

export const metadata: Metadata = {
  title: 'WTF Moments — WWE OMG Moments | Pinfall Data',
  description: 'The most bizarre, unexplainable, and jaw-dropping WTF moments in WWE history.',
  keywords: ['WWE WTF moments', 'bizarre wrestling', 'shocking wrestling', 'weirdest WWE', 'Pinfall Data'],
  openGraph: { title: 'WTF Moments — WWE OMG Moments | Pinfall Data', description: 'The most bizarre, unexplainable, and jaw-dropping WTF moments in WWE history.', type: 'website' },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/omg-moments/wtf-moments' },
}

export default function WTFMomentsPage() {
  return <OMGCategoryClient category="wtf" title="WTF Moments" subtitle="The most bizarre, unexplainable, and jaw-dropping WTF moments in WWE history." heroImage="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/nexus_2026-03-20_19_59_13.334172.jpg.png" icon="🤯" />
}
