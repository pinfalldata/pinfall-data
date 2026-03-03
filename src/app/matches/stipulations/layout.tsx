import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Match Stipulations — Every Match Type in WWE History | Pinfall Data',
  description:
    'Browse every WWE match stipulation: Steel Cage, Hell in a Cell, Ladder Match, Royal Rumble, TLC, and more. Complete match histories with results, ratings, and statistics.',
  keywords: [
    'WWE match types', 'stipulations', 'Steel Cage', 'Hell in a Cell',
    'Ladder Match', 'Royal Rumble', 'TLC', 'Iron Man',
    'wrestling match types', 'Pinfall Data',
  ],
  openGraph: {
    title: 'Match Stipulations — Every Match Type in WWE History | Pinfall Data',
    description: 'Complete history of every WWE match stipulation with full results and ratings.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Match Stipulations — Every WWE Match Type | Pinfall Data',
    description: 'Every WWE match stipulation with complete match histories.',
  },
  alternates: {
    canonical: '/matches/stipulations',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
