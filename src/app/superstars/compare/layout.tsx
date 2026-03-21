import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Superstar Comparator — Compare WWE Wrestlers | Pinfall Data',
  description: 'Compare WWE superstars side by side. Wins, losses, win rate, championship reigns, career length, height, weight, and 20+ stats in one view.',
  keywords: ['WWE compare superstars', 'WWE wrestler comparison', 'compare WWE stats', 'WWE head to head', 'best WWE wrestler'],
  openGraph: { title: 'Superstar Comparator — Pinfall Data', type: 'website' },
  alternates: { canonical: 'https://pinfalldata.com/superstars/compare' },
}
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</> }
