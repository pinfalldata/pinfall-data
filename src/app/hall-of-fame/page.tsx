import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hall of Fame & Awards',
  description: 'Celebrating the legends of the ring',
}

export default function halloffamePage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 lg:py-20">
      {/* Page header */}
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white mb-4">
          Hall of Fame & Awards
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Celebrating the legends of the ring
        </p>
        <div className="neon-line mt-8 max-w-md mx-auto" />
      </div>

      {/* Placeholder content */}
      <div className="glass rounded-2xl p-12 border border-border-subtle text-center">
        <p className="text-text-secondary text-lg mb-4">
          This page is under construction.
        </p>
        <p className="text-text-secondary text-sm">
          Content will be added in Phase 1-3 of development.
        </p>
      </div>
    </div>
  )
}
