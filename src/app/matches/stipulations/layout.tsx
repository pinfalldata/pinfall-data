import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Match Stipulations — Every WWE Match Type Ever | Pinfall Data',
  description: 'Explore every WWE match stipulation. Steel Cage, Hell in a Cell, TLC, Royal Rumble, Iron Man, Ladder Match, Elimination Chamber, and 200+ more match types with history, rules, and statistics.',
  keywords: [
    'WWE match types', 'WWE stipulations', 'WWE match stipulations', 'Steel Cage match',
    'Hell in a Cell', 'TLC match', 'Royal Rumble match', 'Ladder match', 'Iron Man match',
    'WWE match rules', 'Elimination Chamber', 'I Quit match', 'WWE match type history',
    'Last Man Standing', 'Street Fight', 'Extreme Rules match',
  ],
  openGraph: {
    title: 'Match Stipulations — Every WWE Match Type',
    description: 'Steel Cage, Hell in a Cell, TLC, Royal Rumble, and 200+ more. Explore every match type in WWE history.',
    type: 'website',
    images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/matchtypes.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Match Stipulations — Pinfall Data',
    description: 'Explore 200+ WWE match types with stats and history.',
  },
  alternates: {
    canonical: 'https://pinfall-data.vercel.app/matches/stipulations',
  },
}

export default function StipulationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
