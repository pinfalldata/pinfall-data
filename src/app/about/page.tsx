import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'About Pinfall Data — the story behind the ultimate WWE statistics database.',
}

const STATS = [
  { value: '70+', label: 'Years of history' },
  { value: '68', label: 'Database tables' },
  { value: '10+', label: 'Languages' },
  { value: '1', label: 'Passionate creator' },
]

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-16">

      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-white mb-4">
          About <span className="text-neon-blue">Pinfall Data</span>
        </h1>
        <div className="h-[2px] bg-gradient-to-r from-neon-blue via-neon-blue/30 to-transparent" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-xl border border-border-subtle/30 bg-bg-secondary/20 p-4 text-center">
            <p className="font-display text-2xl font-bold text-neon-blue">{s.value}</p>
            <p className="text-text-secondary text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-8 text-text-secondary text-sm leading-relaxed">

        {/* The project */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">The project</h2>
          <p>
            Pinfall Data was born from a simple frustration: there was no single place on the internet that brought
            together all the data about WWE — every match, every championship reign, every superstar, every show —
            presented in a clean and searchable way.
          </p>
          <p className="mt-3">
            So I built it. From scratch. Every superstar. Every match. Every era. From 1953 to today.
          </p>
        </section>

        {/* Who */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">Who's behind it</h2>
          <p>
            Pinfall Data is an independent passion project created by{' '}
            <strong className="text-text-white">Alexis</strong>, a lifelong WWE fan based in{' '}
            <strong className="text-text-white">Marseille, France</strong>. This is not an official WWE product
            and has no affiliation with World Wrestling Entertainment, Inc.
          </p>
          <p className="mt-3">
            The site is built with <span className="text-text-white">Next.js</span>,{' '}
            <span className="text-text-white">Supabase</span>, and deployed on{' '}
            <span className="text-text-white">Vercel</span> — a fully modern stack built and maintained solo.
          </p>
        </section>

        {/* Mission */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">Mission</h2>
          <p>
            To be the most comprehensive, accurate, and well-designed WWE statistics database on the internet —
            free for every fan, in every language.
          </p>
        </section>

        {/* What makes it different */}
        <section>
          <h2 className="font-display text-lg font-bold text-text-white mb-3">What makes it different</h2>
          <ul className="space-y-2">
            {[
              'Every match result logged since 1953, not just Pay-Per-Views',
              'Championship reign durations, defences, and statistics',
              'Superstar profiles with full career timelines',
              'Arena stats, rivalry breakdowns, and OMG moments',
              'Available in 10+ languages including Arabic, Japanese, and Hindi',
              'No login required — everything is free and open',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-neon-blue shrink-0">›</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Contact */}
        <section className="rounded-xl border border-neon-blue/20 bg-neon-blue/5 p-5">
          <h2 className="font-display text-lg font-bold text-text-white mb-2">Get in touch</h2>
          <p>
            Found a data error? Have a suggestion? Just want to say hello? I'd love to hear from you.
          </p>
          <a
            href="mailto:pinfalldata@gmail.com"
            className="inline-flex items-center gap-2 mt-3 text-neon-blue hover:underline font-medium"
          >
            pinfalldata@gmail.com →
          </a>
        </section>

        {/* Back */}
        <div className="pt-4 border-t border-border-subtle/30">
          <Link href="/" className="text-neon-blue hover:underline text-sm">
            ← Back to Pinfall Data
          </Link>
        </div>

      </div>
    </div>
  )
}
