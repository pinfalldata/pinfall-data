import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ShowCalendar } from '@/components/home/ShowCalendar'

export const metadata: Metadata = {
  title: 'Matches & Shows — Complete WWE Match Database | Pinfall Data',
  description: 'Explore the most comprehensive WWE match database ever built. Search 100,000+ matches, browse every show from Raw to WrestleMania, discover all PLEs and match stipulations. Every result. Every Superstar. Every moment.',
  keywords: [
    'WWE matches', 'WWE shows', 'WWE match results', 'WWE Raw results',
    'WWE SmackDown results', 'WrestleMania matches', 'WWE match history',
    'WWE match database', 'WWE PLE results', 'WWE stipulation matches',
    'WWE match search', 'wrestling results database', 'Pinfall Data matches',
  ],
  openGraph: {
    title: 'Matches & Shows — Complete WWE Match Database',
    description: 'Search 100,000+ WWE matches. Every show. Every PLE. Every stipulation. The most complete wrestling match database ever built.',
    type: 'website',
    images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/pagematchshow.webp'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Matches & Shows — Pinfall Data',
    description: 'Search 100,000+ WWE matches across 70+ years of history.',
  },
  alternates: {
    canonical: 'https://pinfall-data.vercel.app/matches',
  },
}

const SECTIONS = [
  {
    title: 'Match Search',
    description: 'Search through 100,000+ matches by Superstar, show, date, rating, or championship.',
    href: '/matches/search',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    accent: 'neon-blue',
  },
  {
    title: 'All Shows',
    description: 'Browse every weekly and special show — Raw, SmackDown, NXT, and more.',
    href: '/matches/shows',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    accent: 'neon-pink',
  },
  {
    title: 'All PLEs',
    description: 'WrestleMania, Royal Rumble, SummerSlam — every Premium Live Event in history.',
    href: '/matches/ple',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    accent: 'neon-blue',
  },
  {
    title: 'Match Stipulations',
    description: 'Steel Cage, Hell in a Cell, TLC, Royal Rumble — explore every match type.',
    href: '/matches/stipulations',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    accent: 'neon-pink',
  },
]

export default function MatchesPage() {
  return (
    <div className="relative">
      {/* ===== HERO IMAGE ===== */}
      <section className="relative w-full h-[240px] sm:h-[320px] lg:h-[400px] xl:h-[440px] overflow-hidden">
        <Image
          src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/matchsshows.webp"
          alt="WWE Matches & Shows"
          fill
          priority
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        {/* Gold line bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />

        {/* Title overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-10 lg:pb-12 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            <span className="text-neon-blue">Matches</span> & Shows
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            The complete database of every WWE match ever recorded — from the first championship bout to last night&apos;s main event.
          </p>
        </div>
      </section>

      {/* ===== 4 SECTION BLOCKS (2x2) ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group relative rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden hover:border-neon-blue/25 hover:bg-bg-secondary/40 transition-all duration-300"
            >
              {/* Inner content */}
              <div className="p-5 sm:p-6 lg:p-7 flex items-start gap-4">
                {/* Icon */}
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300
                  ${section.accent === 'neon-blue'
                    ? 'bg-neon-blue/8 border-neon-blue/15 text-neon-blue group-hover:bg-neon-blue/15 group-hover:border-neon-blue/30 group-hover:shadow-neon-blue'
                    : 'bg-neon-pink/8 border-neon-pink/15 text-neon-pink group-hover:bg-neon-pink/15 group-hover:border-neon-pink/30 group-hover:shadow-neon-pink'
                  }`}
                >
                  {section.icon}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-text-white group-hover:text-neon-blue transition-colors mb-1.5">
                    {section.title}
                  </h2>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {section.description}
                  </p>
                </div>

                {/* Arrow */}
                <svg className="w-5 h-5 text-text-secondary/30 group-hover:text-neon-blue/60 transition-all duration-300 group-hover:translate-x-1 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Bottom accent line on hover */}
              <div className={`h-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
                section.accent === 'neon-blue'
                  ? 'bg-gradient-to-r from-transparent via-neon-blue to-transparent'
                  : 'bg-gradient-to-r from-transparent via-neon-pink to-transparent'
              }`} />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== NEON SEPARATOR ===== */}
      <div className="neon-line max-w-5xl mx-auto" />

      {/* ===== SHOW CALENDAR ===== */}
      <ShowCalendar />

      {/* ===== SEO CONTENT (hidden visually but indexable) ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            About the <span className="text-neon-blue">WWE Match Database</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            Pinfall Data&apos;s match database covers over 70 years of World Wrestling Entertainment history, from the earliest
            Capitol Wrestling Corporation events in the 1950s to today&apos;s Monday Night Raw, Friday Night SmackDown, and NXT.
            Every Premium Live Event — WrestleMania, Royal Rumble, SummerSlam, Survivor Series — is documented with
            full match cards, results, and ratings.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Search by Superstar, show name, championship, match type, date range, or rating to find any match in WWE history.
            Whether you&apos;re looking for classic Attitude Era brawls, technical masterpieces from the modern era, or
            legendary WrestleMania main events, it&apos;s all here.
          </p>
        </div>
      </section>
    </div>
  )
}
