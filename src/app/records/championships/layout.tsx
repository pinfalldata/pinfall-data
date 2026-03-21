import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Championship Records — All-Time WWE Title Records | Pinfall Data',
  description: 'Every WWE championship record. Longest reigns, most title holds, youngest & oldest champions, Grand Slam tracking, and the complete history of every belt.',
  keywords: ['WWE championship records', 'longest WWE reign', 'most WWE title reigns', 'youngest WWE champion', 'WWE Grand Slam'],
  openGraph: { title: 'Championship Records — Pinfall Data', description: 'Every WWE championship record and milestone.', type: 'website', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/GkFq_JhWIAAesrf__1__2026-03-21_16_54_31.720281.jpg.png'] },
  alternates: { canonical: 'https://pinfalldata.com/records/championships' },
}
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</> }
