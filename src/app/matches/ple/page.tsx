import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All WWE PLEs — WrestleMania, Royal Rumble & More | Pinfall Data',
  description: 'Every WWE Premium Live Event in history. WrestleMania, Royal Rumble, SummerSlam, Survivor Series, and all special events with full match cards and results.',
  alternates: { canonical: 'https://pinfall-data.vercel.app/matches/ple' },
}

export default function AllPLEsPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 lg:py-20">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white mb-4">
          All <span className="text-neon-blue">PLEs</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Every Premium Live Event — from the first WrestleMania to today
        </p>
        <div className="neon-line mt-8 max-w-md mx-auto" />
      </div>
      <div className="glass rounded-2xl p-12 border border-border-subtle text-center">
        <p className="text-text-secondary text-lg mb-2">Coming soon</p>
        <p className="text-text-secondary text-sm">Complete PLE archive with match cards, results, and ratings.</p>
      </div>
    </div>
  )
}
