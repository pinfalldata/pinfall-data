import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Records & Statistics — All-Time WWE Records | Pinfall Data',
  description: 'The ultimate WWE records and statistics compendium. Superstar records, championship milestones, match records, tag team stats, arena history, and 70+ years of historical data.',
  keywords: [
    'WWE records', 'WWE statistics', 'WWE all-time records', 'WWE championship records',
    'WWE match records', 'most WWE title reigns', 'longest WWE championship reign',
    'WWE attendance records', 'WWE career stats', 'wrestling records', 'Pinfall Data records',
  ],
  openGraph: {
    title: 'Records & Statistics — All-Time WWE Records',
    description: 'Every WWE record and statistic. 70+ years of data, one definitive source.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://pinfalldata.com/records' },
}

const SECTIONS = [
  {
    title: 'Superstar Records',
    description: 'Most wins, longest careers, best win rates, most 5★ matches, and every individual milestone.',
    href: '/records/superstars',
    icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>),
    accent: 'neon-blue',
  },
  {
    title: 'Championship Records',
    description: 'Most reigns, longest title holds, Grand Slam champions, and every belt in history.',
    href: '/records/championships',
    icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>),
    accent: 'neon-pink',
  },
  {
    title: 'Match Records',
    description: 'Highest rated, longest, shortest, youngest & oldest competitors, and more.',
    href: '/records/matches',
    icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>),
    accent: 'neon-blue',
  },
  {
    title: 'Tag Team & Stable Records',
    description: 'Most successful teams, most matches together, longest partnerships, and faction dominance.',
    href: '/records/tag-teams',
    icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>),
    accent: 'neon-pink',
  },
  {
    title: 'Show & Event Records',
    description: 'Highest attendance, most matches per card, longest events, and globe-spanning shows.',
    href: '/records/shows',
    icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>),
    accent: 'neon-blue',
  },
  {
    title: 'Arena Records',
    description: 'Most events hosted, biggest crowds, longest-running venues, and WWE homes worldwide.',
    href: '/records/arenas',
    icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>),
    accent: 'neon-pink',
  },
  {
    title: 'Historical Milestones',
    description: 'Decade-by-decade evolution — matches, title changes, attendance, and the growth of WWE.',
    href: '/records/milestones',
    icon: (<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
    accent: 'neon-blue',
  },
]

export default function RecordsPage() {
  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[240px] sm:h-[320px] lg:h-[400px] xl:h-[440px] overflow-hidden">
        <Image
          src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/Edge-20_2026-03-21_18_11_57.238674.jpg.png"
          alt="WWE Records & Statistics" fill priority sizes="100vw" quality={100} unoptimized
          className="object-cover object-center lg:object-[50%_20%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-10 lg:pb-12 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-text-white text-center tracking-tight mb-3">
            <span className="text-neon-blue">Records</span> & Statistics
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-3xl">
            70+ years of WWE history distilled into the definitive record book. Every milestone. Every record. Every stat.
          </p>
        </div>
      </section>

      {/* ===== SECTION BLOCKS — button style like /matches ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {SECTIONS.map((section, idx) => (
            <Link
              key={section.href}
              href={section.href}
              className={`group relative rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden hover:border-neon-blue/25 hover:bg-bg-secondary/40 transition-all duration-300 ${
                idx === SECTIONS.length - 1 ? 'sm:col-start-1 lg:col-start-2' : ''
              }`}
            >
              <div className="p-5 sm:p-6 lg:p-7 flex items-start gap-4">
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300
                  ${section.accent === 'neon-blue'
                    ? 'bg-neon-blue/8 border-neon-blue/15 text-neon-blue group-hover:bg-neon-blue/15 group-hover:border-neon-blue/30'
                    : 'bg-neon-pink/8 border-neon-pink/15 text-neon-pink group-hover:bg-neon-pink/15 group-hover:border-neon-pink/30'
                  }`}
                >
                  {section.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-text-white group-hover:text-neon-blue transition-colors mb-1.5">
                    {section.title}
                  </h2>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {section.description}
                  </p>
                </div>
                <svg className="w-5 h-5 text-text-secondary/30 group-hover:text-neon-blue/60 transition-all duration-300 group-hover:translate-x-1 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div className={`h-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
                section.accent === 'neon-blue'
                  ? 'bg-gradient-to-r from-transparent via-neon-blue to-transparent'
                  : 'bg-gradient-to-r from-transparent via-neon-pink to-transparent'
              }`} />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            The <span className="text-neon-blue">Definitive WWE Record Book</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            Pinfall Data&apos;s Records & Statistics section is the most comprehensive WWE record compendium
            ever assembled. Drawing from over 70 years of match data, championship histories, and event records,
            every statistic is computed directly from our database of 100,000+ matches.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            From John Cena&apos;s record-setting championship reigns to the longest matches in WrestleMania history,
            from the busiest arenas to the most dominant tag teams — every record is here, updated in real time.
          </p>
        </div>
      </section>
    </div>
  )
}
