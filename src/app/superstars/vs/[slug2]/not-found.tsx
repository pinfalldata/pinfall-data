import Link from 'next/link'

export default function VersusNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <p className="text-6xl mb-4 opacity-30">🤼</p>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-white mb-2">
        No matches found
      </h1>
      <p className="text-text-secondary text-sm text-center max-w-md mb-6">
        These two superstars have never competed against each other — or one of them doesn&apos;t exist in our database.
      </p>
      <div className="flex gap-3">
        <Link href="/superstars" className="px-4 py-2 rounded-xl bg-neon-blue/10 border border-neon-blue/25 text-neon-blue text-sm font-medium hover:bg-neon-blue/20 transition-all">
          Browse Superstars
        </Link>
        <Link href="/matches/search" className="px-4 py-2 rounded-xl bg-bg-secondary/30 border border-border-subtle/30 text-text-secondary text-sm hover:text-text-white transition-all">
          Search Matches
        </Link>
      </div>
    </div>
  )
}
