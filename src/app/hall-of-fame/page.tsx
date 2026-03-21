'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HERO = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Hall%20Of%20Fame/001_HOF_04182025BR_39974--583760acde344767169ba5177e7d6106.jpg'

const SECTIONS = [
  { title: 'Hall of Fame', description: 'The immortals of professional wrestling — every inductee in WWE Hall of Fame history.', href: '/hall-of-fame/inductees', icon: '🏛️', accent: 'neon-blue' },
  { title: 'Slammy Awards', description: 'The prestigious Slammy Awards — honoring the best performers, moments, and matches of each year.', href: '/hall-of-fame/slammy-awards', icon: '🏆', accent: 'neon-pink' },
  { title: 'Year-End Awards', description: 'Annual year-end honors recognizing the top superstars, matches, and storylines.', href: '/hall-of-fame/year-end-awards', icon: '🎖️', accent: 'neon-blue' },
]

export default function HallOfFameMainPage() {
  const [data, setData] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => { fetch('/api/hof-spotlight').then(r => r.json()).then(d => setData(d)).catch(() => {}) }, [])

  const scroll = (dir: number) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[240px] sm:h-[320px] lg:h-[400px] xl:h-[440px] overflow-hidden">
        <Image src={HERO} alt="WWE Hall of Fame & Awards" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-10 lg:pb-12 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-text-white text-center tracking-tight mb-3">
            Hall of Fame <span className="text-neon-blue">& Awards</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-3xl">
            The legends, the honors, and the immortals — celebrating the greatest in WWE history.
          </p>
        </div>
      </section>

      {/* ===== 3 SECTION BUTTONS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
          {SECTIONS.map(s => (
            <Link key={s.href} href={s.href}
              className="group relative rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden hover:border-neon-blue/25 hover:bg-bg-secondary/40 transition-all duration-300">
              <div className="p-5 sm:p-6 lg:p-7 flex items-start gap-4">
                <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl border transition-all ${s.accent === 'neon-blue' ? 'bg-neon-blue/8 border-neon-blue/15 group-hover:bg-neon-blue/15' : 'bg-neon-pink/8 border-neon-pink/15 group-hover:bg-neon-pink/15'}`}>
                  {s.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-text-white group-hover:text-neon-blue transition-colors mb-1.5">{s.title}</h2>
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-2">{s.description}</p>
                </div>
                <svg className="w-5 h-5 text-text-secondary/30 group-hover:text-neon-blue/60 transition-all group-hover:translate-x-1 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
              <div className={`h-[2px] transition-opacity opacity-0 group-hover:opacity-100 ${s.accent === 'neon-blue' ? 'bg-gradient-to-r from-transparent via-neon-blue to-transparent' : 'bg-gradient-to-r from-transparent via-neon-pink to-transparent'}`} />
            </Link>
          ))}
        </div>

        {/* Stats */}
        {data?.counts && (
          <div className="flex items-center justify-center gap-8 mt-8">
            <div className="text-center"><span className="text-2xl font-display font-bold text-neon-blue">{data.counts.hof}</span><p className="text-[10px] text-text-secondary uppercase tracking-wider">Inductees</p></div>
            <div className="text-center"><span className="text-2xl font-display font-bold text-neon-blue">{data.counts.slammy}</span><p className="text-[10px] text-text-secondary uppercase tracking-wider">Slammy Awards</p></div>
            <div className="text-center"><span className="text-2xl font-display font-bold text-neon-blue">{data.counts.yearEnd}</span><p className="text-[10px] text-text-secondary uppercase tracking-wider">Year-End Awards</p></div>
          </div>
        )}
      </section>

      {/* ===== SPOTLIGHT CAROUSEL ===== */}
      {data?.spotlight && data.spotlight.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-xl font-bold text-text-white">Honored <span className="text-neon-blue">Superstars</span></h2>
            <div className="flex items-center gap-2">
              <button onClick={() => scroll(-1)} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => scroll(1)} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
            {data.spotlight.map((s: any) => (
              <Link key={s.id} href={`/superstars/${s.slug}`}
                className="group shrink-0 w-32 sm:w-36 snap-start">
                <div className="relative aspect-square rounded-xl overflow-hidden border border-border-subtle/20 bg-bg-tertiary/30 group-hover:border-neon-blue/30 transition-all">
                  {s.photo_url && <Image src={s.photo_url} alt={s.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="144px" unoptimized />}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5">
                    <p className="text-[10px] text-text-white font-bold truncate">{s.name}</p>
                    <p className="text-[8px] text-neon-blue uppercase">{s.source === 'hof' ? 'Hall of Fame' : s.source === 'slammy' ? 'Slammy' : 'Year-End'} · {s.year}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SEO */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">About <span className="text-neon-blue">Hall of Fame & Awards</span></h2>
          <p className="text-text-secondary text-sm leading-relaxed">The complete history of WWE&apos;s most prestigious honors. Browse every Hall of Fame inductee, Slammy Award winner, and year-end honoree — with photos, categories, and induction details.</p>
        </div>
      </section>
    </div>
  )
}
