import Link from 'next/link'

export default function SegmentNotFound() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-20 text-center">
      <h1 className="font-display text-4xl font-bold text-text-white mb-4">Segment Not Found</h1>
      <p className="text-text-secondary mb-8">This segment doesn&apos;t exist in our database yet.</p>
      <Link href="/matches" className="px-6 py-3 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-xl hover:bg-neon-blue/30 transition-colors">
        Browse All Shows
      </Link>
    </div>
  )
}
