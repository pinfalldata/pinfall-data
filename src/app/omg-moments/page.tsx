import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'OMG Moments — Most Shocking WWE Moments in History | Pinfall Data',
  description: 'Relive the most extreme, shocking, emotional, and unforgettable moments in WWE history. From death-defying stunts to legendary returns, greatest betrayals, and tear-jerking farewells.',
  keywords: ['WWE OMG moments', 'WWE extreme moments', 'WWE shocking moments', 'WWE greatest returns', 'WWE betrayals', 'WWE emotional moments', 'WWE WTF moments', 'wrestling best moments', 'Pinfall Data'],
  openGraph: {
    title: 'OMG Moments — The Most Unforgettable WWE Moments | Pinfall Data',
    description: 'Extreme stunts, shocking returns, devastating betrayals — every jaw-dropping moment in WWE history.',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/omg-moments' },
}

const CATEGORIES = [
  {
    key: 'extreme',
    label: 'Extreme Moments',
    href: '/omg-moments/extreme-moments',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/makind.webp',
    description: 'Death-defying stunts, insane bumps, and the most brutal spots ever.',
    icon: '🔥',
  },
  {
    key: 'wtf',
    label: 'WTF Moments',
    href: '/omg-moments/wtf-moments',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/bliss.webp',
    description: 'The most bizarre, unexplainable, and jaw-dropping WTF moments.',
    icon: '🤯',
  },
  {
    key: 'sexy',
    label: 'Sexy Moments',
    href: '/omg-moments/sexy-moments',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/cargil.webp',
    description: 'The hottest, most provocative moments that set the screen on fire.',
    icon: '💋',
  },
  {
    key: 'return',
    label: 'Greatest Returns',
    href: '/omg-moments/greatest-returns',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/punk.webp',
    description: 'When legends come back and the arena erupts — the greatest returns ever.',
    icon: '🔙',
  },
  {
    key: 'betrayal',
    label: 'Greatest Betrayals',
    href: '/omg-moments/greatest-betrayals',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/randy.webp',
    description: 'Backstabs, heel turns, and the most devastating betrayals in history.',
    icon: '🗡️',
  },
  {
    key: 'emotional',
    label: 'Most Emotional Moments',
    href: '/omg-moments/most-emotional-moments',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/bianca.webp',
    description: 'Tears, ovations, retirements, and tributes that moved the world.',
    icon: '😢',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'WWE OMG Moments',
  description: 'The most extreme, shocking, emotional, and unforgettable moments in WWE history.',
  url: 'https://pinfalldata.com/omg-moments',
  isPartOf: { '@type': 'WebSite', name: 'Pinfall Data', url: 'https://pinfalldata.com' },
}

export default function OMGMomentsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-bg-primary">

        {/* ===== HERO ===== */}
        <section className="relative w-full h-[240px] sm:h-[320px] lg:h-[400px] xl:h-[440px] overflow-hidden">
          <Image
            src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20OMG%20Moments/hardy-boyz_2026-03-18_19_07_17.478080.jpg.png"
            alt="WWE OMG Moments"
            fill priority sizes="100vw" quality={100}
            className="object-cover object-[center_30%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />

          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-10 lg:pb-12 px-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
              <span className="text-neon-blue">OMG</span> Moments
            </h1>
            <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
              The most extreme, shocking, and unforgettable moments in 70+ years of WWE history.
            </p>
          </div>
        </section>

        {/* ===== CATEGORY BUTTONS — same style as /superstars ===== */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.key}
                href={cat.href}
                className="group relative overflow-hidden rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm transition-all duration-300 hover:border-neon-blue/25 hover:bg-bg-secondary/40"
              >
                {/* Gold accent line top */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/0 to-transparent group-hover:via-neon-blue/60 transition-all duration-500 z-10" />

                <div className="flex items-center gap-4 p-4 sm:p-5">
                  {/* Avatar image */}
                  <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 border-border-subtle/30 group-hover:border-neon-blue/40 transition-all shrink-0 bg-bg-tertiary">
                    <Image
                      src={cat.image}
                      alt={cat.label}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                      sizes="80px"
                     
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <h3 className="font-display text-base sm:text-lg font-bold text-text-white group-hover:text-neon-blue transition-colors truncate">
                        {cat.label}
                      </h3>
                    </div>
                    <p className="text-[11px] sm:text-xs text-text-secondary leading-snug line-clamp-2 mt-0.5">
                      {cat.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-tertiary/50 group-hover:bg-neon-blue/10 border border-border-subtle/20 group-hover:border-neon-blue/30 transition-all shrink-0">
                    <svg className="w-4 h-4 text-text-secondary group-hover:text-neon-blue transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ===== SEO ===== */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-text-white mb-3">
              The Most <span className="text-neon-blue">Unforgettable WWE Moments</span> Database
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              From Mankind being thrown off the Hell in a Cell to CM Punk&apos;s historic return at the 2023 Royal Rumble,
              from devastating betrayals to tear-jerking farewell speeches — explore every OMG moment categorized
              and documented on Pinfall Data. Filter by superstar, browse by year, and relive the moments that defined WWE.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
