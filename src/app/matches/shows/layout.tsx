import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WWE Shows — Complete Show Directory | Pinfall Data',
  description: 'Browse every WWE show series from Raw and SmackDown to WrestleMania and Royal Rumble. Complete episode guides with match cards, results, venues, and ratings.',
  keywords: ['WWE shows', 'Raw', 'SmackDown', 'WrestleMania', 'Royal Rumble', t('matches.ple.title'), 'episode guide', 'Pinfall Data'],
  openGraph: {
    title: 'WWE Shows — Complete Show Directory | Pinfall Data',
    description: 'Every WWE show series with full episode guides, match cards, and results.',
    type: 'website',
  },
  alternates: {
    canonical: '/matches/shows',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
