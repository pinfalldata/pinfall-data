import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Records & Statistics — All-Time WWE Records | Pinfall Data',
  description: 'The ultimate WWE records and statistics compendium. Superstar records, championship milestones, match records, tag team stats, arena history, and 70+ years of historical data — all in one place.',
  keywords: [
    'WWE records', 'WWE statistics', 'WWE all-time records', 'WWE championship records',
    'WWE match records', 'most WWE title reigns', 'longest WWE championship reign',
    'WWE attendance records', 'WWE WrestleMania records', 'WWE career stats',
    'WWE win-loss records', 'WWE tag team records', 'WWE arena history',
    'wrestling records', 'Pinfall Data records',
  ],
  openGraph: {
    title: 'Records & Statistics — All-Time WWE Records',
    description: 'Every WWE record and statistic. 70+ years of data, one definitive source.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: 'https://pinfalldata.com/records' },
}

const HERO_IMG = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/cena-ezremove_2026-03-21_16_54_30.216953.png.png'

const SECTIONS = [
  {
    title: 'Superstar Records',
    description: 'Most wins, longest careers, best win rates, most 5★ matches, and every individual milestone.',
    href: '/records/superstars',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/cena-ezremove_2026-03-21_16_54_30.216953.png.png',
    icon: '🏆',
    accent: 'neon-blue',
  },
  {
    title: 'Championship Records',
    description: 'Most reigns, longest title holds, Grand Slam champions, and every belt in history.',
    href: '/records/championships',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/GkFq_JhWIAAesrf__1__2026-03-21_16_54_31.720281.jpg.png',
    icon: '🎖️',
    accent: 'neon-pink',
  },
  {
    title: 'Match Records',
    description: 'Highest rated, longest, shortest, youngest & oldest competitors, and more.',
    href: '/records/matches',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/EZxXlPqXYAESmVQ_2026-03-21_16_54_31.604686.jpg.png',
    icon: '💥',
    accent: 'neon-blue',
  },
  {
    title: 'Tag Team & Stable Records',
    description: 'Most successful teams, most matches together, longest partnerships, and faction dominance.',
    href: '/records/tag-teams',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/Jeri-Show_2026-03-21_16_54_31.480723.jpg.png',
    icon: '👥',
    accent: 'neon-pink',
  },
  {
    title: 'Show & Event Records',
    description: 'Highest attendance, most matches per card, longest events, and globe-spanning shows.',
    href: '/records/shows',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/20190405_WM35_show_hosts--86e5ca0f3c9f636c79cfceb29ae5b165_2026-03-21_16_54_31.187272.jpg.png',
    icon: '📺',
    accent: 'neon-blue',
  },
  {
    title: 'Arena Records',
    description: 'Most events hosted, biggest crowds, longest-running venues, and WWE homes worldwide.',
    href: '/records/arenas',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/CR5KOQDYQZBD3A5F7AA7T43EPI_2026-03-21_16_54_31.002354.jpg.png',
    icon: '🏟️',
    accent: 'neon-pink',
  },
  {
    title: 'Historical Milestones',
    description: 'Decade-by-decade evolution — matches, title changes, attendance, and the growth of WWE.',
    href: '/records/milestones',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/wwesiege_2026-03-21_16_54_30.597250.png.png',
    icon: '📊',
    accent: 'neon-blue',
  },
]

export default function RecordsPage() {
  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[240px] sm:h-[320px] lg:h-[400px] xl:h-[440px] overflow-hidden">
        <Image src={HERO_IMG} alt="WWE Records & Statistics" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-[50%_20%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />

        {/* Grid bg */}
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"
          style={{ maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)' }} />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-10 lg:pb-12 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-text-white text-center tracking-tight mb-3">
            <span className="text-neon-blue">Records</span> & Statistics
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-3xl">
            70+ years of WWE history distilled into the definitive record book. Every milestone. Every record. Every stat.
          </p>
        </div>
      </section>

      {/* ===== 7 CATEGORY CARDS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href}
              className="group relative flex flex-col rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all duration-300 hover:border-neon-blue/30 hover:translate-y-[-3px] card-glow">
              {/* Image */}
              <div className="relative h-44 sm:h-48 overflow-hidden bg-bg-tertiary/30">
                <Image src={s.image} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-bg-primary/20 to-transparent" />

                {/* Icon */}
                <div className="absolute top-3 left-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg backdrop-blur-sm border ${
                    s.accent === 'neon-blue'
                      ? 'bg-neon-blue/15 border-neon-blue/25'
                      : 'bg-neon-pink/15 border-neon-pink/25'
                  }`}>
                    {s.icon}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-1 p-5">
                <h2 className="font-display text-lg font-bold text-text-white group-hover:text-neon-blue transition-colors mb-2">
                  {s.title}
                </h2>
                <p className="text-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-2 flex-1">
                  {s.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${s.accent === 'neon-blue' ? 'text-neon-blue' : 'text-neon-pink'}`}>
                    Explore Records
                  </span>
                  <svg className="w-4 h-4 text-text-secondary group-hover:text-neon-blue group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Bottom accent */}
              <div className={`h-[2px] transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
                s.accent === 'neon-blue' ? 'bg-gradient-to-r from-transparent via-neon-blue to-transparent' : 'bg-gradient-to-r from-transparent via-neon-pink to-transparent'
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
