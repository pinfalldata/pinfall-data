import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Match Search — Find Any WWE Match | Pinfall Data',
  description: 'Search through 100,000+ WWE matches by Superstar, show, date, rating, or championship. The most powerful wrestling match search engine ever built.',
  alternates: { canonical: 'https://pinfall-data.vercel.app/matches/search' },
}

export default function MatchSearchPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 lg:py-20">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white mb-4">
          <span className="text-neon-blue">Match</span> Search
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Search through 100,000+ matches by Superstar, show, date, or rating
        </p>
        <div className="neon-line mt-8 max-w-md mx-auto" />
      </div>
      <div className="glass rounded-2xl p-12 border border-border-subtle text-center">
        <p className="text-text-secondary text-lg mb-2">Coming soon</p>
        <p className="text-text-secondary text-sm">Advanced search with filters, sorting, and instant results.</p>
      </div>
    </div>
  )
}
