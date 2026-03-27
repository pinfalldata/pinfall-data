import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TagTeamsHomeClient } from './TagTeamsHomeClient'

export const metadata: Metadata = {
  title: 'Tag Teams & Stables — Every WWE Team in History | Pinfall Data',
  description: 'Explore every tag team and stable in WWE history. From The Hardy Boyz to Evolution, from D-Generation X to The Bloodline — complete rosters, match records, statistics, and timelines.',
  keywords: ['WWE tag teams', 'WWE stables', 'wrestling factions', 'Hardy Boyz', 'Evolution', 'DX', 'NWO', 'Bloodline', 'Pinfall Data'],
  openGraph: { title: 'Tag Teams & Stables — WWE History | Pinfall Data', description: 'Every tag team and stable in 70+ years of WWE history.', type: 'website' },
  alternates: { canonical: '/tag-teams' },
}

const CATEGORIES = [
  {
    label: t('tagTeams.teams'),
    href: '/tag-teams/teams',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Tag%20Teams/edge%20cri.webp',
    description: 'Duos who ruled the tag division — from legendary partnerships to dominant combinations.',
    icon: '👥',
  },
  {
    label: t('tagTeams.stables'),
    href: '/tag-teams/stables',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Tag%20Teams/evolution.webp',
    description: 'The most powerful factions and groups — armies that changed the landscape of wrestling.',
    icon: '⚔️',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'WWE Tag Teams & Stables',
  description: 'Every tag team and stable in WWE history.',
  url: 'https://pinfalldata.com/tag-teams',
  isPartOf: { '@type': 'WebSite', name: 'Pinfall Data', url: 'https://pinfalldata.com' },
}

export default function TagTeamsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-bg-primary">

        {/* HERO */}
        <section className="relative w-full h-[240px] sm:h-[320px] lg:h-[400px] xl:h-[440px] overflow-hidden">
          <Image
            src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Tag%20Teams/bloodline-famille-hart-wwe-bloodline-2023_2026-03-20_21_48_13.392778.jpg.png"
            alt="WWE Tag Teams & Stables" fill priority sizes="100vw" unoptimized quality={100}
            className="object-cover" style={{ objectPosition: 'center 25%' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/20 via-transparent to-bg-primary/20" />
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-10 lg:pb-12 px-4">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
              Tag Teams & <span className="text-neon-blue">{t('tagTeams.stables')}</span>
            </h1>
            <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
              Every partnership and faction that shaped 70+ years of WWE history.
            </p>
          </div>
        </section>

        {/* CATEGORY BUTTONS */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto">
            {CATEGORIES.map(cat => (
              <Link key={cat.label} href={cat.href}
                className="group relative overflow-hidden rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm transition-all duration-300 hover:border-neon-blue/25 hover:bg-bg-secondary/40">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/0 to-transparent group-hover:via-neon-blue/60 transition-all duration-500 z-10" />
                <div className="flex items-center gap-4 p-4 sm:p-5">
                  <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 border-border-subtle/30 group-hover:border-neon-blue/40 transition-all shrink-0 bg-bg-tertiary">
                    <Image src={cat.image} alt={cat.label} fill className="object-cover object-top transition-transform duration-500 group-hover:scale-110" sizes="80px" unoptimized />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <h3 className="font-display text-base sm:text-lg font-bold text-text-white group-hover:text-neon-blue transition-colors">{cat.label}</h3>
                    </div>
                    <p className="text-[11px] sm:text-xs text-text-secondary leading-snug line-clamp-2 mt-0.5">{cat.description}</p>
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-tertiary/50 group-hover:bg-neon-blue/10 border border-border-subtle/20 group-hover:border-neon-blue/30 transition-all shrink-0">
                    <svg className="w-4 h-4 text-text-secondary group-hover:text-neon-blue transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* RANDOM SPOTLIGHT */}
        <TagTeamsHomeClient />

        {/* SEO */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-text-white mb-3">
              The Complete <span className="text-neon-blue">WWE Tag Teams & Stables</span> Database
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed">
              From The Road Warriors to The Usos, from D-Generation X to The Bloodline — Pinfall Data catalogs
              every tag team and faction with complete rosters, match records, win rates, championship histories, and timelines.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
