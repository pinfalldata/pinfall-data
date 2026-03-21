import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Year-End Awards — Annual WWE Honors | Pinfall Data',
  description: 'Every WWE year-end award and annual honor. Browse by year, category, and search winners across the complete history of WWE annual awards.',
  keywords: ['WWE year-end awards', 'WWE annual awards', 'best WWE wrestler of the year', 'WWE awards'],
  openGraph: { title: 'Year-End Awards — Pinfall Data', type: 'website', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Hall%20Of%20Fame/603897907_1297244152432362_2277291451456712149_n%20(1).jpg'] },
  alternates: { canonical: 'https://pinfalldata.com/hall-of-fame/year-end-awards' },
}
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</> }
