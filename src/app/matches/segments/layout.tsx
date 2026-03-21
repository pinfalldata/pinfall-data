import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Segment Search — Find Any WWE Segment Ever | Pinfall Data',
  description: 'Search every WWE segment in history — promos, backstage confrontations, ceremonies, interviews, and more. Filter by superstar, category, show, year, OMG moment, and location.',
  keywords: [
    'WWE segments', 'WWE promos', 'WWE backstage', 'WWE interviews',
    'WWE segment search', 'WWE promo database', 'wrestling segments',
    'WWE ceremony', 'WWE segment history', 'Pinfall Data segments',
  ],
  openGraph: {
    title: 'Segment Search — Find Any WWE Segment Ever',
    description: 'Search every WWE segment — promos, backstage, ceremonies, interviews. The most complete wrestling segment database.',
    type: 'website',
    images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/ston.png'],
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://pinfalldata.com/matches/segments' },
}

export default function SegmentSearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
