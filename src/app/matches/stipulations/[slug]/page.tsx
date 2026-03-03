'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'

interface MatchType {
  id: number; name: string; slug: string; description: string | null
  image_url: string | null; rules: string | null; category: string | null
}

interface Team {
  team_number: number; is_winner: boolean
  members: { id: number; name: string; slug: string; photo_url: string | null; is_winner: boolean }[]
}

interface Match {
  id: number; slug: string; date: string; rating: number | null
  result_type: string | null; is_title_change: boolean; isDraw: boolean
  championship: { id: number; name: string; slug: string; image_url: string | null } | null
  show: {
    id: number; name: string; slug: string; city: string | null; country: string | null
    show_series: { id: number; name: string; short_name: string | null; logo_url: string | null } | null
  } | null
  teams: Team[]
  participantCount: number
}

interface WinMethod {
  method: string; count: number; percentage: number
}

interface Stats {
  winMethods: WinMethod[]; totalMatches: number
  avgRating: number | null; avgDuration: number | null
  titleChangeCount: number; titleChangePercentage: number
}

interface Filters {
  year: string; showSeriesId: string; minRating: string; maxRating: string
  resultType: string; championshipOnly: boolean; titleChangeOnly: boolean
}

const categoryIcons: Record<string, string> = {
  'Environmental': '🏗️', 'Weapon-Based': '🪜', 'Submission & Technical': '🔒',
  'Multi-Man Elimination': '👥', 'Life-Changing': '💀', 'Standard': '🤼',
}

const resultLabels: Record<string, string> = {
  pinfall: 'Pinfall', submission: 'Submission', dq: 'Disqualification',
  count_out: 'Count Out', no_contest: 'No Contest', forfeit: 'Forfeit',
  ko: 'Knockout', referee_stoppage: 'Referee Stoppage', escape: 'Escape',
  retrieve: 'Retrieve', last_elimination: 'Last Elimination',
  time_limit_draw: 'Time Limit Draw', other: 'Other',
}

const resultColors: Record<string, string> = {
  pinfall: 'bg-emerald-500', submission: 'bg-blue-500', dq: 'bg-yellow-500',
  count_out: 'bg-orange-500', no_contest: 'bg-gray-500', forfeit: 'bg-red-500',
  ko: 'bg-red-600', referee_stoppage: 'bg-amber-600', escape: 'bg-cyan-500',
  retrieve: 'bg-purple-500', last_elimination: 'bg-teal-500',
  time_limit_draw: 'bg-gray-400', other: 'bg-zinc-500',
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Generate year options
function getYearOptions() {
  const years = []
  const now = new Date().getFullYear()
  for (let y = now; y >= 1980; y--) years.push(y.toString())
  return years
}

export default function StipulationDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [matchType, setMatchType] = useState<MatchType | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    year: '', showSeriesId: '', minRating: '', maxRating: '',
    resultType: '', championshipOnly: false, titleChangeOnly: false,
  })
  const [showSeries, setShowSeries] = useState<{ id: number; name: string; short_name: string | null }[]>([])

  // Fetch show series for filter dropdown
  useEffect(() => {
    fetch('/api/match-search-filters')
      .then(r => r.json())
      .then(d => { if (d.showSeries) setShowSeries(d.showSeries) })
      .catch(() => {})
  }, [])

  const fetchData = useCallback(async (p: number, f?: Filters) => {
    setLoading(true)
    const activeFilters = f || filters
    try {
      const params = new URLSearchParams({ slug, page: p.toString(), limit: '50' })
      if (activeFilters.year) params.set('year', activeFilters.year)
      if (activeFilters.showSeriesId) params.set('showSeriesId', activeFilters.showSeriesId)
      if (activeFilters.minRating) params.set('minRating', activeFilters.minRating)
      if (activeFilters.maxRating) params.set('maxRating', activeFilters.maxRating)
      if (activeFilters.resultType) params.set('resultType', activeFilters.resultType)
      if (activeFilters.championshipOnly) params.set('championshipOnly', 'true')
      if (activeFilters.titleChangeOnly) params.set('titleChangeOnly', 'true')

      const r = await fetch(`/api/stipulation-detail?${params.toString()}`)
      const d = await r.json()
      if (d.matchType) setMatchType(d.matchType)
      setMatches(d.matches || [])
      setTotal(d.total || 0)
      setTotalPages(d.totalPages || 1)
      setPage(d.page || 1)
      if (d.stats) setStats(d.stats)
    } catch { }
    setLoading(false)
  }, [slug, filters])

  useEffect(() => { fetchData(1) }, [fetchData])

  const goPage = (n: number) => {
    if (n < 1 || n > totalPages) return
    fetchData(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const applyFilters = () => {
    fetchData(1, filters)
  }

  const resetFilters = () => {
    const empty: Filters = { year: '', showSeriesId: '', minRating: '', maxRating: '', resultType: '', championshipOnly: false, titleChangeOnly: false }
    setFilters(empty)
    fetchData(1, empty)
  }

  const hasActiveFilters = filters.year || filters.showSeriesId || filters.minRating || filters.maxRating || filters.resultType || filters.championshipOnly || filters.titleChangeOnly

  return (
    <div className="relative">
      {/* ===== MOBILE HERO ===== */}
      <section className="lg:hidden relative w-full h-[260px] sm:h-[320px] overflow-hidden">
        {matchType?.image_url ? (
          <Image src={matchType.image_url} alt={matchType?.name || ''} fill priority
            sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 px-4">
          {matchType?.category && (
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
              {categoryIcons[matchType.category] || ''} {matchType.category}
            </span>
          )}
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-white text-center tracking-tight mb-1">
            {matchType?.name || <span className="bg-bg-secondary/50 rounded w-60 h-10 inline-block animate-pulse" />}
          </h1>
          <p className="text-text-secondary text-sm text-center">
            <span className="text-neon-blue font-bold">{total.toLocaleString()}</span> match{total !== 1 ? 'es' : ''} in WWE history
          </p>
        </div>
      </section>

      {/* ===== DESKTOP HERO — split layout with FULL image ===== */}
      <section className="hidden lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
        {matchType?.image_url && (
          <div className="absolute inset-0 opacity-10">
            <Image src={matchType.image_url} alt="" fill className="object-cover blur-2xl" sizes="100vw" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />

        <div className="relative max-w-[1440px] mx-auto px-6 py-10">
          <div className="flex items-center gap-10">
            {/* Image — FIXED: use object-contain in a proper container */}
            {matchType?.image_url ? (
              <div className="relative w-[460px] h-[300px] shrink-0 rounded-2xl overflow-hidden border border-border-subtle/20 bg-black/40">
                <Image
                  src={matchType.image_url}
                  alt={matchType?.name || ''}
                  fill
                  priority
                  quality={100}
                  unoptimized
                  className="object-contain p-2"
                  sizes="460px"
                />
              </div>
            ) : (
              <div className="w-[460px] h-[300px] shrink-0 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-border-subtle/20 flex items-center justify-center">
                <span className="text-6xl opacity-30">🤼</span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              {matchType?.category && (
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 bg-neon-blue/10 text-neon-blue border border-neon-blue/20">
                  {categoryIcons[matchType.category] || ''} {matchType.category}
                </span>
              )}
              <h1 className="font-display text-4xl xl:text-5xl font-bold text-text-white tracking-tight mb-3">
                {matchType?.name || <span className="bg-bg-secondary/50 rounded w-60 h-12 inline-block animate-pulse" />}
              </h1>
              <p className="text-text-secondary text-lg mb-5">
                <span className="text-neon-blue font-bold text-2xl">{total.toLocaleString()}</span> match{total !== 1 ? 'es' : ''} recorded in WWE history
              </p>

              {matchType?.description && (
                <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
                  {matchType.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== DESCRIPTION + RULES ===== */}
      {(matchType?.description || matchType?.rules) && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {matchType.description && (
              <div className="lg:hidden rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-5 sm:p-6">
                <h2 className="font-display text-sm font-bold text-neon-blue uppercase tracking-wider mb-2">Description</h2>
                <p className="text-text-secondary text-sm leading-relaxed">{matchType.description}</p>
              </div>
            )}
            {matchType.rules && (
              <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-5 sm:p-6">
                <h2 className="font-display text-sm font-bold text-neon-blue uppercase tracking-wider mb-2">Rules</h2>
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{matchType.rules}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== WIN METHOD STATISTICS ===== */}
      {stats && stats.winMethods.length > 0 && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-5 sm:p-6">
              <h2 className="font-display text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">
                How are {matchType?.name || 'these matches'} won?
              </h2>

              {/* Quick stats row */}
              <div className="flex flex-wrap gap-4 mb-5">
                {stats.avgRating && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-tertiary/50 border border-border-subtle/20">
                    <span className="text-[10px] text-text-secondary uppercase tracking-wider">Avg Rating</span>
                    <span className="text-neon-blue font-bold text-sm">{stats.avgRating.toFixed(2)}</span>
                  </div>
                )}
                {stats.avgDuration && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-tertiary/50 border border-border-subtle/20">
                    <span className="text-[10px] text-text-secondary uppercase tracking-wider">Avg Duration</span>
                    <span className="text-text-white font-bold text-sm">{formatDuration(stats.avgDuration)}</span>
                  </div>
                )}
                {stats.titleChangeCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-tertiary/50 border border-border-subtle/20">
                    <span className="text-[10px] text-text-secondary uppercase tracking-wider">Title Changes</span>
                    <span className="text-yellow-400 font-bold text-sm">{stats.titleChangeCount} ({stats.titleChangePercentage}%)</span>
                  </div>
                )}
              </div>

              {/* Win method bars */}
              <div className="space-y-2.5">
                {stats.winMethods.slice(0, 8).map((wm) => {
                  const barColor = resultColors[wm.method] || 'bg-zinc-500'
                  return (
                    <div key={wm.method} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-white font-medium">
                          {resultLabels[wm.method] || wm.method}
                        </span>
                        <span className="text-[11px] text-text-secondary font-mono">
                          {wm.count} ({wm.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-bg-tertiary/80 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                          style={{ width: `${Math.max(wm.percentage, 1)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== FILTERS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue'
                : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-neon-blue" />}
          </button>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="text-[11px] text-text-secondary hover:text-red-400 transition-colors">
              Clear all
            </button>
          )}
        </div>

        {showFilters && (
          <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-4 sm:p-5 mb-6 animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Year */}
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">Year</label>
                <select value={filters.year} onChange={e => setFilters(f => ({ ...f, year: e.target.value }))}
                  className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-lg px-3 py-2 text-xs text-text-white focus:border-neon-blue/50 focus:outline-none">
                  <option value="">All Years</option>
                  {getYearOptions().map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              {/* Show Series */}
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">Show</label>
                <select value={filters.showSeriesId} onChange={e => setFilters(f => ({ ...f, showSeriesId: e.target.value }))}
                  className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-lg px-3 py-2 text-xs text-text-white focus:border-neon-blue/50 focus:outline-none">
                  <option value="">All Shows</option>
                  {showSeries.map(s => <option key={s.id} value={s.id.toString()}>{s.short_name || s.name}</option>)}
                </select>
              </div>

              {/* Min Rating */}
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">Min Rating</label>
                <select value={filters.minRating} onChange={e => setFilters(f => ({ ...f, minRating: e.target.value }))}
                  className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-lg px-3 py-2 text-xs text-text-white focus:border-neon-blue/50 focus:outline-none">
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => <option key={r} value={r}>★ {r}+</option>)}
                </select>
              </div>

              {/* Result Type */}
              <div>
                <label className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">Result</label>
                <select value={filters.resultType} onChange={e => setFilters(f => ({ ...f, resultType: e.target.value }))}
                  className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-lg px-3 py-2 text-xs text-text-white focus:border-neon-blue/50 focus:outline-none">
                  <option value="">All Results</option>
                  {Object.entries(resultLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              {/* Championship Only */}
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg bg-bg-tertiary border border-border-subtle/30 hover:border-border-subtle/50 transition-colors">
                  <input type="checkbox" checked={filters.championshipOnly}
                    onChange={e => setFilters(f => ({ ...f, championshipOnly: e.target.checked }))}
                    className="w-3.5 h-3.5 rounded border-border-subtle accent-neon-blue" />
                  <span className="text-xs text-text-secondary">🏆 Title</span>
                </label>
              </div>

              {/* Apply button */}
              <div className="flex flex-col justify-end">
                <button onClick={applyFilters}
                  className="px-4 py-2 rounded-lg bg-neon-blue/20 border border-neon-blue/30 text-neon-blue text-xs font-bold hover:bg-neon-blue/30 transition-all">
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===== MATCH LIST ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2 lg:py-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-text-white">
            All Matches <span className="text-text-secondary font-normal text-sm">({total})</span>
          </h2>
          <span className="text-xs text-text-secondary">Page {page} of {totalPages}</span>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg">No matches found{hasActiveFilters ? ' with these filters' : ''}</p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="mt-3 px-4 py-2 rounded-lg bg-neon-blue/15 border border-neon-blue/30 text-neon-blue text-xs font-medium hover:bg-neon-blue/25 transition-all">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden lg:grid lg:grid-cols-[100px_60px_1fr_180px_80px] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-2">
              <span>Date</span>
              <span>Show</span>
              <span>Participants</span>
              <span>Championship</span>
              <span className="text-center">Rating</span>
            </div>

            <div className="space-y-0.5">
              {matches.map(m => {
                const teams = m.teams || []
                const showParticipants = m.participantCount <= 12

                return (
                  <Link key={m.id} href={m.show ? `/shows/${m.show.slug}/matches/${m.slug}` : '#'}
                    className="group block transition-all hover:bg-bg-secondary/30 rounded-xl">

                    {/* Desktop row */}
                    <div className="hidden lg:grid lg:grid-cols-[100px_60px_1fr_180px_80px] gap-3 items-center px-4 py-2.5 border-b border-border-subtle/10">
                      <span className="text-[11px] text-text-secondary font-mono">{formatDate(m.date)}</span>

                      <div className="flex items-center">
                        {m.show?.show_series?.logo_url ? (
                          <div className="w-7 h-7 rounded overflow-hidden shrink-0" title={m.show.name}>
                            <Image src={m.show.show_series.logo_url} alt="" width={28} height={28} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <span className="text-[9px] text-text-secondary truncate">{m.show?.show_series?.short_name || ''}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                        {showParticipants ? teams.map((t, i) => (
                          <span key={i} className="flex items-center gap-1 min-w-0 shrink-0">
                            {i > 0 && <span className="text-[11px] text-neon-blue font-bold mx-0.5 shrink-0">vs</span>}
                            <div className="flex -space-x-1.5 shrink-0">
                              {t.members.slice(0, 3).map(p => (
                                <div key={p.id} className={`w-7 h-7 rounded-full overflow-hidden border-2 ${t.is_winner ? 'border-emerald-500/40' : m.isDraw ? 'border-yellow-500/30' : 'border-bg-primary'}`}>
                                  {p.photo_url ? <Image src={p.photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}
                                </div>
                              ))}
                              {t.members.length > 3 && <div className="w-7 h-7 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[8px] text-text-secondary">+{t.members.length - 3}</div>}
                            </div>
                            <span className={`text-xs truncate max-w-[140px] ${t.is_winner ? 'text-emerald-400 font-semibold' : 'text-text-white'}`}>{t.members.map(p => p.name).join(', ')}</span>
                            {t.is_winner && <span className="text-[9px] text-emerald-400 font-bold shrink-0">✓</span>}
                          </span>
                        )) : <span className="text-xs text-text-secondary italic truncate">{m.participantCount} participants</span>}
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        {m.championship ? <>
                          {m.championship.image_url && <div className="w-7 h-5 shrink-0"><Image src={m.championship.image_url} alt="" width={28} height={20} className="w-full h-full object-contain" /></div>}
                          <span className="text-[10px] text-yellow-400 font-medium truncate">{m.championship.name}</span>
                          {m.is_title_change && <span className="text-[8px] px-1 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-bold shrink-0">NEW!</span>}
                        </> : <span className="text-[10px] text-text-secondary/30">—</span>}
                      </div>

                      <div className="flex justify-center">{m.rating ? <StarRating rating={m.rating} size="xs" /> : <span className="text-[10px] text-text-secondary/30">—</span>}</div>
                    </div>

                    {/* Mobile card */}
                    <div className="lg:hidden px-3 py-3 border-b border-border-subtle/10">
                      <div className="flex items-center gap-2 mb-2">
                        {m.show?.show_series?.logo_url && <div className="w-4 h-4 rounded overflow-hidden shrink-0"><Image src={m.show.show_series.logo_url} alt="" width={16} height={16} className="w-full h-full object-contain" /></div>}
                        <span className="text-[11px] text-text-secondary truncate flex-1">{m.show?.name}</span>
                        <span className="text-[10px] text-text-secondary font-mono shrink-0">{formatDate(m.date)}</span>
                      </div>
                      <div className="space-y-1.5">
                        {showParticipants ? teams.map((t, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[9px] font-bold border ${t.is_winner ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : m.isDraw ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' : 'bg-bg-tertiary/50 border-border-subtle/20 text-text-secondary/50'}`}>
                              {t.is_winner ? 'W' : m.isDraw ? 'D' : 'L'}
                            </div>
                            <div className="flex -space-x-1 shrink-0">
                              {t.members.slice(0, 3).map(p => (
                                <div key={p.id} className="w-6 h-6 rounded-full overflow-hidden border border-bg-primary">
                                  {p.photo_url ? <Image src={p.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}
                                </div>
                              ))}
                            </div>
                            <span className={`text-xs truncate ${t.is_winner ? 'text-text-white font-medium' : 'text-text-secondary'}`}>{t.members.map(p => p.name).join(', ')}</span>
                          </div>
                        )) : <div className="text-xs text-text-secondary">{m.participantCount} participants</div>}
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {m.championship && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold">🏆 {m.championship.name}</span>}
                        {m.rating && <div className="ml-auto shrink-0"><StarRating rating={m.rating} size="xs" /></div>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && <Pag page={page} tp={totalPages} total={total} go={goPage} />}
          </>
        )}
      </section>

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            <span className="text-neon-blue">{matchType?.name || 'Match Type'}</span> — Complete Match History
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            This page lists every {matchType?.name || 'match of this type'} in WWE history, from the first recorded bout
            to the most recent event. Each match entry includes participants, results, championship information, and fan ratings.
            Click on any match to view detailed statistics, play-by-play, and more on Pinfall Data.
          </p>
        </div>
      </section>
    </div>
  )
}

/* Pagination component */
function Pag({ page, tp, total, go }: { page: number; tp: number; total: number; go: (n: number) => void }) {
  const vis = () => {
    const p: (number | 'e')[] = []
    if (tp <= 7) { for (let i = 1; i <= tp; i++) p.push(i) }
    else { p.push(1); if (page > 3) p.push('e'); for (let i = Math.max(2, page - 1); i <= Math.min(tp - 1, page + 1); i++) p.push(i); if (page < tp - 2) p.push('e'); p.push(tp) }
    return p
  }
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
      <p className="text-xs text-text-secondary">Page {page} of {tp} — {total.toLocaleString()} matches</p>
      <div className="flex items-center gap-1">
        <button onClick={() => go(page - 1)} disabled={page === 1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        {vis().map((p, i) => p === 'e' ? <span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span> :
          <button key={p} onClick={() => go(p as number)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue' : 'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{p}</button>)}
        <button onClick={() => go(page + 1)} disabled={page === tp} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  )
}
