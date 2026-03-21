import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Objects Used in WWE Matches — Foreign Objects Database | Pinfall Data',
  description: 'Every foreign object used in WWE matches. Chairs, tables, ladders, kendo sticks, sledgehammers — browse the complete database with usage stats and match history.',
  keywords: ['WWE foreign objects', 'WWE weapons', 'WWE chairs', 'WWE tables matches', 'objects used WWE', 'WWE TLC'],
  openGraph: { title: 'Objects Used in WWE Matches — Pinfall Data', type: 'website' },
  alternates: { canonical: 'https://pinfalldata.com/matches/objects' },
}
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</> }
