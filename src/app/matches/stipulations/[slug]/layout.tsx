import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Match Stipulation — Every Match in WWE History | Pinfall Data',
  description: 'Complete history of this WWE match stipulation with every match, results, ratings, and participants. Browse by date.',
  openGraph: {
    title: 'Match Stipulation — Complete Match History | Pinfall Data',
    description: 'Every match of this type in WWE history with full results and ratings.',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
