import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Match Stipulations — Every WWE Match Type | Pinfall Data',
  description: 'Explore every WWE match stipulation. Steel Cage, Hell in a Cell, TLC, Royal Rumble, Iron Man, Ladder Match, and 200+ more match types with history and statistics.',
  alternates: { canonical: 'https://pinfall-data.vercel.app/matches/stipulations' },
}

export default function StipulationsPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 lg:py-20">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white mb-4">
          Match <span className="text-neon-blue">Stipulations</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Every match type in WWE history — from classic singles to extreme stipulations
        </p>
        <div className="neon-line mt-8 max-w-md mx-auto" />
      </div>
      <div className="glass rounded-2xl p-12 border border-border-subtle text-center">
        <p className="text-text-secondary text-lg mb-2">Coming soon</p>
        <p className="text-text-secondary text-sm">Complete stipulation encyclopedia with stats and iconic moments.</p>
      </div>
    </div>
  )
}
