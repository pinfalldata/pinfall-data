'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface ShowSeries {
  id: number
  name: string
  slug: string
  short_name: string | null
  logo_url: string | null
  description: string | null
  first_episode_date: string | null
  is_active: boolean
  episode_count: number
  start_year: number | null
  end_year: number | null
  last_show_date: string | null
  sort_order: number | null
  is_ple?: boolean | null
}

function formatYear(d: string | null) {
  if (!d) return null
  return new Date(d + 'T00:00:00').getFullYear()
}

export default function ShowSeriesListPage() {
  const [shows, setShows] = useState<ShowSeries[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchShows() {
      setLoading(true)
      setError(null)
      try {
        const r = await fetch('/api/shows-list')
        const d = await r.json()
        if (!r.ok) {
          setError(d.error || `Error ${r.status}`)
        } else {
          setShows(d.shows || [])
        }
      } catch (e: any) {
        setError(e.message || 'Network error')
      }
      setLoading(false)
    }
    fetchShows()
  }, [])

  const filtered = shows.filter(s => {
    if (filter === 'active' && !s.is_active) return false
    if (filter === 'inactive' && s.is_active) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        (s.short_name || '').toLowerCase().includes(q)
      )
    }
    return true
  })

  const activeShows = filtered.filter(s => s.is_active)
  const inactiveShows = filtered.filter(s => !s.is_active)
  const totalEpisodes = shows.reduce((sum, s) => sum + s.episode_count, 0)

  return (
    <div className="relative min-h-screen">
      {/* ===== HERO IMAGE ===== */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/shows.jpeg"
          alt="WWE Shows" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            WWE <span className="text-neon-blue">Shows</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            Browse every WWE show series — from weekly programming to Premium Live Events.
          </p>
        </div>
      </section>

      {/* ===== FILTERS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search show series..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'active', 'inactive'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                  filter === f
                    ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue'
                    : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'
                }`}
              >
                {f === 'all' ? 'All' : f === 'active' ? '🟢 Active' : 'Inactive'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-6">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
            <p className="text-red-400 text-sm">Error loading data: {error}</p>
            <button onClick={() => window.location.reload()} className="mt-2 px-4 py-1.5 text-xs bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ===== LOADING ===== */}
      {loading && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-52 rounded-2xl bg-bg-secondary/30 animate-pulse" />
            ))}
          </div>
        </section>
      )}

      {/* ===== SHOW SERIES GRID ===== */}
      {!loading && !error && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
          {activeShows.length > 0 && (
            <div className="mb-10">
              {filter === 'all' && (
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="font-display text-lg font-bold text-text-white uppercase tracking-wide">Active Shows</h2>
                  <span className="text-text-secondary text-xs">({activeShows.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeShows.map(s => <ShowSeriesCard key={s.id} series={s} />)}
              </div>
            </div>
          )}

          {inactiveShows.length > 0 && (
            <div>
              {filter === 'all' && (
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="font-display text-lg font-bold text-text-white uppercase tracking-wide">Past Shows</h2>
                  <span className="text-text-secondary text-xs">({inactiveShows.length})</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {inactiveShows.map(s => <ShowSeriesCard key={s.id} series={s} />)}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-text-secondary text-lg">No show series found</p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-3 px-4 py-2 rounded-lg bg-neon-blue/15 border border-neon-blue/30 text-neon-blue text-xs font-medium hover:bg-neon-blue/25 transition-all">
                  Clear search
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            Complete <span className="text-neon-blue">WWE Show Directory</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            This page lists every WWE show series, from flagship weekly programs like Raw and SmackDown to
            Premium Live Events like WrestleMania and Royal Rumble. Click on any show to browse its complete episode history
            with match cards, results, venues, attendance, and detailed statistics on Pinfall Data.
          </p>
        </div>
      </section>
    </div>
  )
}

/* ===== Show Series Card — bigger logos + end year for inactive ===== */
function ShowSeriesCard({ series }: { series: ShowSeries }) {
  const startYear = formatYear(series.first_episode_date)
  const endYear = series.end_year || (series.last_show_date ? formatYear(series.last_show_date) : null)
  const yearStr = startYear
    ? `${startYear}–${series.is_active ? 'Present' : (endYear || '')}`
    : ''

  return (
    <Link
      href={`/matches/shows/${series.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 hover:bg-bg-secondary/25 card-glow"
    >
      {/* Logo area — BIGGER logos */}
      <div className="relative h-40 sm:h-44 flex items-center justify-center bg-bg-tertiary/30 p-4">
        {series.logo_url ? (
          <div className="relative w-32 h-32 sm:w-36 sm:h-36">
            <Image
              src={series.logo_url}
              alt={series.name}
              fill
              className="object-contain group-hover:scale-110 transition-transform duration-300"
              sizes="144px"
            />
          </div>
        ) : (
          <div className="w-32 h-32 rounded-2xl bg-bg-tertiary/50 flex items-center justify-center">
            <span className="text-4xl opacity-30">📺</span>
          </div>
        )}

        {/* Active badge */}
        {series.is_active && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Active</span>
          </div>
        )}

        {/* Show type badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            series.is_ple ? 'bg-yellow-500/15 border border-yellow-500/25 text-yellow-400' : 'bg-neon-blue/10 border border-neon-blue/20 text-neon-blue'
          }`}>
            {series.is_ple ? '🏟️ PLE' : '📺 Weekly'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors truncate">
          {series.name}
        </h3>
        {yearStr && (
          <p className="text-[10px] text-text-secondary mt-0.5">{yearStr}</p>
        )}
        {series.description && (
          <p className="text-[11px] text-text-secondary mt-2 line-clamp-2 leading-relaxed">
            {series.description}
          </p>
        )}

        {/* Episode count */}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-text-secondary uppercase tracking-wider">Episodes</span>
            <span className="text-sm text-neon-blue font-bold">{series.episode_count.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
