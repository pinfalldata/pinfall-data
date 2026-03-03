import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'WWE Shows — Browse All Show Series & Episodes | Pinfall Data',
  description:
    'Browse every WWE show series: Raw, SmackDown, NXT, Premium Live Events, and more. Complete episode guides with match cards, results, venues, and attendance figures.',
  keywords: [
    'WWE shows', 'Raw', 'SmackDown', 'NXT', 'Premium Live Events',
    'WWE episode guide', 'wrestling shows', 'Pinfall Data',
    'WWE show history', 'WWE events',
  ],
  openGraph: {
    title: 'WWE Shows — Browse All Show Series & Episodes | Pinfall Data',
    description: 'Complete guide to every WWE show series with full episode histories and match cards.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'WWE Shows — Browse All Show Series | Pinfall Data',
    description: 'Every WWE show series with full episode histories.',
  },
  alternates: {
    canonical: '/matches/shows',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
