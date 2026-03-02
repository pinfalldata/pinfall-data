import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All WWE Shows — Raw, SmackDown, NXT & More | Pinfall Data',
  description: 'Browse every WWE show in history. Monday Night Raw, Friday Night SmackDown, NXT, Saturday Night Main Event, and hundreds more weekly and special programs.',
  alternates: { canonical: 'https://pinfall-data.vercel.app/matches/shows' },
}

export default function AllShowsPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 lg:py-20">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white mb-4">
          All <span className="text-neon-blue">Shows</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Every WWE weekly show and special program ever aired
        </p>
        <div className="neon-line mt-8 max-w-md mx-auto" />
      </div>
      <div className="glass rounded-2xl p-12 border border-border-subtle text-center">
        <p className="text-text-secondary text-lg mb-2">Coming soon</p>
        <p className="text-text-secondary text-sm">Complete show directory with episode guides and match listings.</p>
      </div>
    </div>
  )
}
