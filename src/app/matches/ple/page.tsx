'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

interface PLEEvent {
  id: number; name: string; slug: string; date: string; year: number | null
  logo_url: string | null; banner_url: string | null
  city: string | null; country: string | null; venue: string | null
  attendance: number | null; rating: number | null
}

interface PLESeries {
  name: string; events: PLEEvent[]; count: number
  latest_year: number; earliest_year: number
}

export default function AllPLEsPage() {
  const t = useTranslations()
  const [series, setSeries] = useState<PLESeries[]>([])
  const [allNames, setAllNames] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set())
  const [totalPLEs, setTotalPLEs] = useState(0)

  useEffect(() => {
    fetch('/api/ple-list')
      .then(r => r.json())
      .then(d => {
        setSeries(d.series || [])
        setAllNames(d.allSeriesNames || [])
        setTotalPLEs(d.totalPLEs || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleFilter = (name: string) => {
    setActiveFilters(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const clearFilters = () => setActiveFilters(new Set())

  const displayed = activeFilters.size === 0
    ? series
    : series.filter(s => activeFilters.has(s.name))

  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/plepage.webp"
          alt="All WWE PLEs" fill priority sizes="100vw" quality={100}
          className="object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            {t('matches.ple.heroPrefix')} <span className="text-neon-blue">{t('matches.ple.heroHighlight')}</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            {t('matches.ple.heroSubtitle')}
          </p>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Filter chips */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-text-secondary uppercase tracking-wider font-medium">{t('matches.ple.filterBy')}</span>
            {activeFilters.size > 0 && (
              <button onClick={clearFilters} className="text-xs text-neon-pink hover:text-neon-pink/80 transition-colors">
                Clear ({activeFilters.size})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {series.map(s => (
              <button key={s.name} onClick={() => toggleFilter(s.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  activeFilters.has(s.name)
                    ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue'
                    : activeFilters.size > 0
                      ? 'bg-bg-secondary/20 border-border-subtle/15 text-text-secondary/50 hover:text-text-secondary hover:border-border-subtle/30'
                      : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'
                }`}>
                {s.name} <span className="text-[10px] opacity-60">({s.count})</span>
              </button>
            ))}
          </div>
        </div>

        {/* PLE Series Rows */}
        {loading ? (
          <div className="space-y-10">
            {Array.from({length:5}).map((_,i) => (
              <div key={i}>
                <div className="h-6 w-48 bg-bg-secondary/30 rounded animate-pulse mb-4" />
                <div className="flex gap-4 overflow-hidden">
                  {Array.from({length:6}).map((_,j) => (
                    <div key={j} className="w-36 sm:w-44 h-48 sm:h-56 rounded-2xl bg-bg-secondary/30 animate-pulse shrink-0" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg">{t('matches.ple.noPLEs')}</p>
          </div>
        ) : (
          <div className="space-y-10">
            {displayed.map(s => (
              <PLESeriesRow key={s.name} series={s} />
            ))}
          </div>
        )}
      </section>

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            Complete <span className="text-neon-blue">WWE PLE Archive</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            Premium Live Events (formerly Pay-Per-Views) are the cornerstone of WWE storytelling.
            From the first WrestleMania in 1985 to today&apos;s global spectacles, every major event
            is documented here with full match cards, results, ratings, and historical context.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Browse by series — WrestleMania, Royal Rumble, SummerSlam, Survivor Series, Money in the Bank,
            and dozens more — or filter to find exactly the event you&apos;re looking for.
          </p>
        </div>
      </section>
    </div>
  )
}

/* ============================================================
   PLE SERIES ROW — horizontal scrollable
   ============================================================ */
function PLESeriesRow({ series }: { series: PLESeries }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => { checkScroll() }, [series])

  const scroll = (dir: 'left'|'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.7
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
    setTimeout(checkScroll, 400)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg sm:text-xl font-bold text-text-white">
            {series.name}
          </h3>
          <span className="text-xs text-text-secondary font-mono">
            {series.earliest_year}–{series.latest_year} · {series.count} event{series.count !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => scroll('left')} disabled={!canLeft}
            className="w-8 h-8 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue hover:border-neon-blue/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button onClick={() => scroll('right')} disabled={!canRight}
            className="w-8 h-8 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue hover:border-neon-blue/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div ref={scrollRef} onScroll={checkScroll}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
        {series.events.map(event => (
          <Link key={event.id} href={`/shows/${event.slug}`}
            className="group shrink-0 w-[140px] sm:w-[170px] md:w-[180px] snap-start">
            <div className="relative rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden hover:border-neon-blue/25 hover:bg-bg-secondary/35 transition-all duration-300">
              {/* Logo / Banner */}
              <div className="aspect-[3/4] relative flex items-center justify-center p-3 sm:p-4">
                {event.logo_url ? (
                  <Image src={event.logo_url} alt={event.name} width={160} height={200}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
                ) : event.banner_url ? (
                  <Image src={event.banner_url} alt={event.name} fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <span className="font-display text-sm text-text-secondary text-center leading-tight">{event.name}</span>
                )}
                {/* Year overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2.5">
                  <span className="text-neon-blue font-mono text-sm font-bold">{event.year}</span>
                </div>
              </div>

              {/* Info */}
              <div className="px-2.5 pb-2.5">
                <h4 className="font-display text-xs font-bold text-text-white group-hover:text-neon-blue transition-colors leading-tight truncate">
                  {event.name}
                </h4>
                {event.city && (
                  <p className="text-[10px] text-text-secondary truncate mt-0.5">
                    {event.city}{event.country ? `, ${event.country}` : ''}
                  </p>
                )}
              </div>

              {/* Accent line */}
              <div className="h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
