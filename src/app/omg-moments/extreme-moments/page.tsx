import type { Metadata } from 'next'
import OMGCategoryClient from '../OMGCategoryClient'

export const metadata: Metadata = {
  title: 'Extreme Moments — WWE OMG Moments | Pinfall Data',
  description: 'Death-defying stunts, insane bumps, and the most brutal spots in WWE history.',
  keywords: ['WWE extreme moments', 'most extreme WWE', 'brutal wrestling spots', 'dangerous wrestling', 'Pinfall Data'],
  openGraph: { title: 'Extreme Moments — WWE OMG Moments | Pinfall Data', description: 'Death-defying stunts, insane bumps, and the most brutal spots in WWE history.', type: 'website' },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/omg-moments/extreme-moments' },
}

export default function ExtremeMomentsPage() {
  return <OMGCategoryClient category="extreme" title="Extreme Moments" subtitle="Death-defying stunts, insane bumps, and the most brutal spots in WWE history." heroImage="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/23_KOTR_06281998_0100_2026-03-18_19_03_23.525476.jpg.png" icon="🔥" />
}
