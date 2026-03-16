import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Match Search — Find Any WWE Match Ever | Pinfall Data',
  description: 'The most powerful WWE match search engine ever built. Filter through 100,000+ matches by year, superstar, opponent, show, match type, rating, finish, championship, country, and city. Every WWE match from 1953 to today.',
  keywords: [
    'WWE match search', 'WWE match finder', 'WWE match database', 'WWE results search',
    'find WWE match', 'WWE match history search', 'WWE match rating', 'search wrestling matches',
    'WWE match results', 'WWE match filter', 'Pinfall Data match search',
  ],
  openGraph: {
    title: 'Match Search — Find Any WWE Match Ever',
    description: 'Filter through 100,000+ WWE matches. The most powerful wrestling match search engine ever built.',
    type: 'website',
    images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/matchsearch.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Match Search — Pinfall Data',
    description: 'Search 100,000+ WWE matches with powerful filters.',
  },
  alternates: {
    canonical: 'https://pinfalldata.com/matches/search',
  },
}

export default function MatchSearchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
