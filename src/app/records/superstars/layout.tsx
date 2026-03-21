import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Superstar Records — All-Time WWE Career Records | Pinfall Data',
  description: 'The all-time WWE superstar records. Most matches, most wins, best win rates, most championship reigns, longest careers, most 5-star matches, and every individual milestone.',
  keywords: ['WWE superstar records', 'most WWE matches', 'most WWE wins', 'best win rate WWE', 'longest WWE career', 'most 5 star matches WWE', 'WWE career stats'],
  openGraph: { title: 'Superstar Records — All-Time WWE Career Records', description: 'Every individual WWE career record and milestone.', type: 'website', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/cena-ezremove_2026-03-21_16_54_30.216953.png.png'] },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://pinfalldata.com/records/superstars' },
}
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</> }
