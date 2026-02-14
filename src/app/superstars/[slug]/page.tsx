import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // TODO: Fetch superstar from Supabase and generate dynamic meta
  const name = params.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return {
    title: `${name} — WWE Stats & Career History`,
    description: `Complete WWE profile for ${name}. Career stats, championship history, rivalries, matches, and more.`,
  }
}

export default function SuperstarProfilePage({ params }: Props) {
  const name = params.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Banner area (like NBA profile) */}
      <div className="relative h-48 sm:h-64 lg:h-80 bg-gradient-to-r from-bg-secondary via-bg-primary to-bg-secondary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-6 flex items-end gap-6">
          {/* Photo placeholder */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-xl bg-bg-tertiary border-2 border-neon-blue/30 shrink-0 skeleton" />

          {/* Name + status */}
          <div className="pb-2">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-text-white">
              {name}
            </h1>
            <p className="text-neon-blue text-sm sm:text-base mt-1">Wrestler</p>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-border-subtle bg-bg-secondary/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Total Matches', 'Wins', 'Losses', 'Win Rate', 'Championships', 'Days as Champion'].map((stat) => (
            <div key={stat} className="text-center">
              <p className="text-text-secondary text-xs uppercase tracking-wider">{stat}</p>
              <p className="font-mono text-lg text-text-white">—</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 py-12">
        <div className="glass rounded-2xl p-12 border border-border-subtle text-center">
          <p className="text-text-secondary text-lg mb-4">
            Superstar profile page under construction.
          </p>
          <p className="text-text-secondary text-sm">
            This page will display the complete profile once data is imported.
          </p>
        </div>
      </div>
    </div>
  )
}
