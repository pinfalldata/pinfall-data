import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Arenas — Every WWE Venue in History | Pinfall Data',
  description: 'Browse every arena and venue that has hosted a WWE event. Filter by year, country, state, city. Sort by most used or highest attendance. Full venue history with name changes.',
  keywords: [
    'WWE arenas', 'WWE venues', 'Madison Square Garden WWE', 'WWE arena history',
    'WWE venue database', 'wrestling arenas', 'WWE arena list',
    'WWE event venues', 'Pinfall Data arenas',
  ],
  openGraph: {
    title: 'All Arenas — Every WWE Venue in History',
    description: 'Browse every arena and venue that has hosted a WWE event with full history and statistics.',
    type: 'website',
    images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/irak.png'],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://pinfalldata.com/matches/arenas' },
}

export default function ArenasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
