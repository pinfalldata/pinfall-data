'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface ShowSeries {
  id: number; name: string; slug: string; short_name: string | null
  logo_url: string | null; description: string | null
  first_episode_date: string | null; is_active: boolean
  episode_count: number; start_year: number | null
}

export default function AllShowsPage() {
  const [shows, setShows] = useState<ShowSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all'|'active'|'inactive'>('all')

  useEffect(() => {
    fetch('/api/shows-list')
      .then(r => r.json())
      .then(d => { setShows(d.shows || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? shows
    : filter === 'active' ? shows.filter(s => s.is_active)
    : shows.filter(s => !s.is_active)

  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[200px] sm:h-[260px] lg:h-[340px] xl:h-[380px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/showpage.jpg"
          alt="All WWE Shows" fill priority sizes="100vw" quality={90}
          className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            All <span className="text-neon-blue">Shows</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            Every WWE weekly show and special program ever aired — from the very first broadcast to today.
          </p>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          {(['all','active','inactive'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                filter===f
                  ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
                  : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'
              }`}>
              {f === 'all' ? `All (${shows.length})` : f === 'active' ? `Active (${shows.filter(s=>s.is_active).length})` : `Inactive (${shows.filter(s=>!s.is_active).length})`}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({length:18}).map((_,i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg">No shows found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(show => (
              <Link key={show.id} href={`/shows/${show.slug}`}
                className="group relative rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden hover:border-neon-blue/25 hover:bg-bg-secondary/35 transition-all duration-300 flex flex-col">
                {/* Logo area */}
                <div className="aspect-square flex items-center justify-center p-4 sm:p-6 relative">
                  {show.logo_url ? (
                    <Image src={show.logo_url} alt={show.name} width={160} height={160}
                      className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-lg sm:text-xl text-text-secondary text-center">{show.short_name || show.name}</span>
                    </div>
                  )}
                  {/* Active badge */}
                  {show.is_active && (
                    <div className="absolute top-2 right-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-glow-pulse" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="px-3 pb-3 mt-auto">
                  <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors leading-tight truncate">
                    {show.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-text-secondary font-mono">
                      {show.start_year || '—'}{show.is_active ? ' — Present' : ''}
                    </span>
                    {show.episode_count > 0 && (
                      <>
                        <span className="text-[10px] text-text-secondary/40">•</span>
                        <span className="text-[10px] text-text-secondary">{show.episode_count} ep.</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom accent */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== SEO CONTENT ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            Complete <span className="text-neon-blue">WWE Show Directory</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            From the original Monday Night Raw premiere in 1993 to today&apos;s multi-platform era, WWE has produced
            hundreds of unique television shows and specials. This directory catalogs every single one — weekly flagships
            like Raw and SmackDown, developmental programs like NXT and OVW, international tours, studio shows, and more.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Each show page contains a complete episode guide with match cards, results, ratings, and detailed statistics.
            Click on any show to explore its full history.
          </p>
        </div>
      </section>
    </div>
  )
}
