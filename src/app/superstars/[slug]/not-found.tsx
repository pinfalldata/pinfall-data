import Link from 'next/link'

export default function SuperstarNotFound() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-24 text-center">
      <h1 className="font-display text-6xl lg:text-8xl font-bold text-text-white mb-4">
        4<span className="text-neon-blue">0</span>4
      </h1>
      <p className="text-text-secondary text-lg mb-8">This superstar wasn&apos;t found in our database.</p>
      <Link href="/superstars" className="inline-flex items-center gap-2 px-6 py-3 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 rounded-xl hover:bg-neon-blue/20 transition-colors">
        ← Back to Superstars
      </Link>
    </div>
  )
}
