import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Show Series — Complete Episode Guide | Pinfall Data',
  description: 'Browse every episode of this WWE show series. Full match cards, results, venues, and ratings for every event.',
  openGraph: {
    title: 'Show Series — Complete Episode Guide | Pinfall Data',
    description: 'Browse every episode of this WWE show series with full match cards and results.',
    type: 'website',
  },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
