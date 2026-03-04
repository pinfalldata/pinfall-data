'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Series {
  id: number; name: string; slug: string; short_name: string | null
  logo_url: string | null; banner_url: string | null; description: string | null
  first_episode_date: string | null; is_active: boolean; is_ple: boolean | null
}

interface Episode {
  id: number; name: string; slug: string; date: string
  venue: string | null; city: string | null; state_province: string | null
  country: string | null; attendance: number | null; tv_audience?: number | null
  show_type: string | null; episode_number: number | null; logo_url: string | null
  arena?: { id: number; name: string } | null
}

interface AdjacentSeries {
  slug: string; name: string; short_name: string | null; logo_url: string | null
}

interface RosterMember {
  id: number; name: string; slug: string; photo_url: string | null
  appearances: number; wins?: number; losses?: number; draws?: number
}

interface SeriesStats {
  totalMatches: number; totalShows: number; totalTitleChanges: number
  titleChangePercentage: number; avgRating: number | null; avgDuration: number | null
  winMethods: { method: string; count: number; percentage: number }[]
  topMatchTypes: { id: number; name: string; slug: string; count: number }[]
}

type TabKey = 'episodes' | 'superstars' | 'referees' | 'commentators' | 'announcers' | 'interviewers' | 'stats'

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}
function formatDateLong(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
function formatDuration(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const resultLabels: Record<string, string> = {
  pinfall: 'Pinfall', submission: 'Submission', dq: 'Disqualification',
  count_out: 'Count Out', no_contest: 'No Contest', forfeit: 'Forfeit',
  ko: 'Knockout', referee_stoppage: 'Referee Stoppage', escape: 'Escape',
  retrieve: 'Retrieve', last_elimination: 'Last Elimination',
  time_limit_draw: 'Time Limit Draw', other: 'Other',
}

const tabLabels: Record<TabKey, string> = {
  episodes: 'Episodes', superstars: 'Superstars', referees: 'Referees',
  commentators: 'Commentators', announcers: 'Ring Announcers',
  interviewers: 'Interviewers', stats: 'Stats',
}

export default function ShowSeriesDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [series, setSeries] = useState<Series | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [firstDate, setFirstDate] = useState<string | null>(null)
  const [lastDate, setLastDate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [prevSeries, setPrevSeries] = useState<AdjacentSeries | null>(null)
  const [nextSeries, setNextSeries] = useState<AdjacentSeries | null>(null)

  // Tab system
  const [activeTab, setActiveTab] = useState<TabKey>('episodes')
  const [availableTabs, setAvailableTabs] = useState<TabKey[]>(['episodes'])
  const [tabsChecked, setTabsChecked] = useState(false)

  // Roster data
  const [roster, setRoster] = useState<RosterMember[]>([])
  const [rosterTotal, setRosterTotal] = useState(0)
  const [rosterPage, setRosterPage] = useState(1)
  const [rosterTotalPages, setRosterTotalPages] = useState(0)
  const [rosterLoading, setRosterLoading] = useState(false)

  // Stats data
  const [stats, setStats] = useState<SeriesStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // Fetch episodes
  const fetchData = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/show-series-detail?slug=${slug}&page=${p}&limit=50`)
      const d = await r.json()
      if (!r.ok) {
        setError(d.error || `Error ${r.status}`)
        setLoading(false)
        return
      }
      if (d.series) setSeries(d.series)
      setEpisodes(d.episodes || [])
      setTotal(d.total || 0)
      setTotalPages(d.totalPages || 1)
      setPage(d.page || 1)
      if (d.firstDate) setFirstDate(d.firstDate)
      if (d.lastDate) setLastDate(d.lastDate)
      if (d.prevSeries) setPrevSeries(d.prevSeries)
      if (d.nextSeries) setNextSeries(d.nextSeries)
    } catch (e: any) {
      setError(e.message || 'Network error')
    }
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchData(1) }, [fetchData])

  // Check available tabs
  useEffect(() => {
    if (!slug || tabsChecked) return
    fetch(`/api/show-series-roster?slug=${slug}&tab=check`)
      .then(r => r.json())
      .then(d => {
        if (d.availableTabs) {
          setAvailableTabs(['episodes', ...d.availableTabs])
        }
        setTabsChecked(true)
      })
      .catch(() => setTabsChecked(true))
  }, [slug, tabsChecked])

  // Fetch roster tab data
  const fetchRoster = useCallback(async (tab: string, p: number) => {
    setRosterLoading(true)
    try {
      const r = await fetch(`/api/show-series-roster?slug=${slug}&tab=${tab}&page=${p}&limit=60`)
      const d = await r.json()
      setRoster(d.roster || [])
      setRosterTotal(d.total || 0)
      setRosterPage(d.page || 1)
      setRosterTotalPages(d.totalPages || 0)
    } catch { }
    setRosterLoading(false)
  }, [slug])

  // Fetch stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const r = await fetch(`/api/show-series-roster?slug=${slug}&tab=stats`)
      const d = await r.json()
      setStats(d.stats || null)
    } catch { }
    setStatsLoading(false)
  }, [slug])

  // Handle tab change
  useEffect(() => {
    if (activeTab === 'episodes') return
    if (activeTab === 'stats') {
      if (!stats) fetchStats()
      return
    }
    // Roster tabs
    setRosterPage(1)
    fetchRoster(activeTab, 1)
  }, [activeTab, fetchRoster, fetchStats, stats])

  const goPage = (n: number) => {
    if (n < 1 || n > totalPages) return
    fetchData(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goRosterPage = (n: number) => {
    if (n < 1 || n > rosterTotalPages) return
    fetchRoster(activeTab, n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] overflow-hidden">
        {series?.banner_url ? (
          <Image src={series.banner_url} alt={series?.name || ''} fill priority
            sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          {series?.logo_url && (
            <div className="relative w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 mb-3">
              <Image src={series.logo_url} alt={series.name} fill className="object-contain drop-shadow-2xl" sizes="144px" />
            </div>
          )}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-text-white text-center tracking-tight">
            {series?.name || <span className="bg-bg-secondary/50 rounded w-60 h-10 inline-block animate-pulse" />}
          </h1>
        </div>

        {/* ===== PREV / NEXT SERIES navigation ===== */}
        {prevSeries && (
          <Link
            href={`/matches/shows/${prevSeries.slug}`}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-primary/80 border border-border-subtle/30 backdrop-blur-sm hover:border-border-subtle/60 transition-all group"
          >
            <svg className="w-4 h-4 text-text-secondary group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="hidden sm:block">
              <p className="text-[9px] text-text-secondary uppercase tracking-wider">Previous</p>
              <p className="text-xs text-text-white font-medium truncate max-w-[120px]">{prevSeries.short_name || prevSeries.name}</p>
            </div>
          </Link>
        )}
        {nextSeries && (
          <Link
            href={`/matches/shows/${nextSeries.slug}`}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-primary/80 border border-border-subtle/30 backdrop-blur-sm hover:border-border-subtle/60 transition-all group"
          >
            <div className="hidden sm:block text-right">
              <p className="text-[9px] text-text-secondary uppercase tracking-wider">Next</p>
              <p className="text-xs text-text-white font-medium truncate max-w-[120px]">{nextSeries.short_name || nextSeries.name}</p>
            </div>
            <svg className="w-4 h-4 text-text-secondary group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </section>

      {/* ===== STATS BAR ===== */}
      {series && (
        <section className="bg-bg-secondary/30 border-y border-border-subtle/20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
              {firstDate && (
                <div className="text-center">
                  <span className="block text-[10px] text-text-secondary uppercase tracking-wider">First Episode</span>
                  <span className="text-text-white font-semibold">{formatDateLong(firstDate)}</span>
                </div>
              )}
              {lastDate && (
                <div className="text-center">
                  <span className="block text-[10px] text-text-secondary uppercase tracking-wider">Latest Episode</span>
                  <span className="text-text-white font-semibold">{formatDateLong(lastDate)}</span>
                </div>
              )}
              <div className="text-center">
                <span className="block text-[10px] text-text-secondary uppercase tracking-wider">Total Episodes</span>
                <span className="text-neon-blue font-bold text-lg">{total.toLocaleString()}</span>
              </div>
              {series.is_active && (
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 font-medium text-xs">Active</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== DESCRIPTION ===== */}
      {series?.description && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6">
          <p className="text-text-secondary text-sm leading-relaxed max-w-3xl mx-auto text-center">
            {series.description}
          </p>
        </section>
      )}

      {/* ===== TABS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
          {availableTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-medium border whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue'
                  : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'
              }`}
            >
              {tabLabels[tab] || tab}
            </button>
          ))}
        </div>
      </section>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
            <p className="text-red-400 text-sm">Error loading data: {error}</p>
            <button onClick={() => fetchData(page)} className="mt-2 px-4 py-1.5 text-xs bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ===== EPISODES TAB ===== */}
      {activeTab === 'episodes' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold text-text-white">
              All Episodes <span className="text-text-secondary font-normal text-sm">({total})</span>
            </h2>
            <span className="text-xs text-text-secondary">Page {page} of {totalPages}</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-bg-secondary/30 animate-pulse" />
              ))}
            </div>
          ) : episodes.length === 0 && !error ? (
            <div className="text-center py-20">
              <p className="text-text-secondary text-lg">No episodes found</p>
            </div>
          ) : episodes.length > 0 ? (
            <>
              <div className="hidden lg:grid lg:grid-cols-[120px_1fr_1fr_160px_100px] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-2">
                <span>Date</span><span>Show</span><span>Venue</span><span>Location</span><span className="text-right">Attendance</span>
              </div>
              <div className="space-y-1">
                {episodes.map(ep => (
                  <Link key={ep.id} href={`/shows/${ep.slug}`} className="group block transition-all hover:bg-bg-secondary/30 rounded-xl">
                    <div className="hidden lg:grid lg:grid-cols-[120px_1fr_1fr_160px_100px] gap-3 items-center px-4 py-3 border-b border-border-subtle/10">
                      <span className="text-xs text-text-secondary font-mono">{formatDate(ep.date)}</span>
                      <span className="text-sm text-text-white font-semibold group-hover:text-neon-blue transition-colors truncate">{ep.name}</span>
                      <span className="text-xs text-text-secondary truncate">{ep.venue || '—'}</span>
                      <span className="text-xs text-text-secondary truncate">{[ep.city, ep.state_province, ep.country].filter(Boolean).join(', ') || '—'}</span>
                      <span className="text-xs text-text-secondary text-right font-mono">{ep.attendance ? ep.attendance.toLocaleString() : '—'}</span>
                    </div>
                    <div className="lg:hidden px-3 py-3 border-b border-border-subtle/10">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm text-text-white font-semibold group-hover:text-neon-blue transition-colors truncate flex-1">{ep.name}</span>
                        <span className="text-[10px] text-text-secondary font-mono shrink-0">{formatDate(ep.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                        {ep.venue && <span className="truncate">{ep.venue}</span>}
                        {ep.venue && ep.city && <span className="text-text-secondary/30">•</span>}
                        <span className="truncate">{[ep.city, ep.state_province, ep.country].filter(Boolean).join(', ')}</span>
                        {ep.attendance && <><span className="text-text-secondary/30">•</span><span className="shrink-0">🏟️ {ep.attendance.toLocaleString()}</span></>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && <Pag page={page} tp={totalPages} total={total} go={goPage} label="episodes" />}
            </>
          ) : null}
        </section>
      )}

      {/* ===== SUPERSTARS TAB ===== */}
      {activeTab === 'superstars' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <h2 className="font-display text-lg font-bold text-text-white mb-6">
            Superstars <span className="text-text-secondary font-normal text-sm">({rosterTotal})</span>
          </h2>
          {rosterLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 20 }).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
            </div>
          ) : roster.length === 0 ? (
            <div className="text-center py-16"><p className="text-text-secondary">No superstars found</p></div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {roster.map(m => (
                  <Link key={m.id} href={`/superstars/${m.slug}`}
                    className="group rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 card-glow">
                    <div className="relative h-32 sm:h-36 bg-bg-tertiary/30 overflow-hidden">
                      {m.photo_url ? (
                        <Image src={m.photo_url} alt={m.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="text-3xl opacity-20">👤</span></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent" />
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-bg-primary/80 backdrop-blur-sm border border-neon-blue/20">
                        <span className="text-[10px] text-neon-blue font-bold">{m.appearances}</span>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-text-white group-hover:text-neon-blue transition-colors truncate">{m.name}</p>
                      {m.wins !== undefined && (
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] text-emerald-400 font-bold">{m.wins}W</span>
                          <span className="text-[9px] text-red-400 font-bold">{m.losses}L</span>
                          {(m.draws || 0) > 0 && <span className="text-[9px] text-yellow-400 font-bold">{m.draws}D</span>}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
              {rosterTotalPages > 1 && <Pag page={rosterPage} tp={rosterTotalPages} total={rosterTotal} go={goRosterPage} label="superstars" />}
            </>
          )}
        </section>
      )}

      {/* ===== STAFF TABS (Referees, Commentators, Announcers, Interviewers) ===== */}
      {(['referees', 'commentators', 'announcers', 'interviewers'] as TabKey[]).includes(activeTab) && activeTab !== 'episodes' && activeTab !== 'superstars' && activeTab !== 'stats' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <h2 className="font-display text-lg font-bold text-text-white mb-6">
            {tabLabels[activeTab]} <span className="text-text-secondary font-normal text-sm">({rosterTotal})</span>
          </h2>
          {rosterLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
            </div>
          ) : roster.length === 0 ? (
            <div className="text-center py-16"><p className="text-text-secondary">No data found</p></div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {roster.map(m => (
                  <Link key={m.id} href={`/superstars/${m.slug}`}
                    className="group rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 card-glow">
                    <div className="relative h-28 sm:h-32 bg-bg-tertiary/30 overflow-hidden">
                      {m.photo_url ? (
                        <Image src={m.photo_url} alt={m.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="text-3xl opacity-20">👤</span></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-text-white group-hover:text-neon-blue transition-colors truncate">{m.name}</p>
                      <p className="text-[10px] text-text-secondary mt-1">
                        <span className="text-neon-blue font-bold">{m.appearances}</span> appearance{m.appearances !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
              {rosterTotalPages > 1 && <Pag page={rosterPage} tp={rosterTotalPages} total={rosterTotal} go={goRosterPage} label={tabLabels[activeTab].toLowerCase()} />}
            </>
          )}
        </section>
      )}

      {/* ===== STATS TAB ===== */}
      {activeTab === 'stats' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <h2 className="font-display text-lg font-bold text-text-white mb-6">Statistics</h2>
          {statsLoading || !stats ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { label: 'Total Shows', value: stats.totalShows.toLocaleString(), color: 'text-neon-blue' },
                  { label: 'Total Matches', value: stats.totalMatches.toLocaleString(), color: 'text-text-white' },
                  { label: 'Avg Rating', value: stats.avgRating ? `${stats.avgRating}★` : '—', color: 'text-yellow-400' },
                  { label: 'Avg Duration', value: stats.avgDuration ? formatDuration(stats.avgDuration) : '—', color: 'text-text-white' },
                  { label: 'Title Changes', value: stats.totalTitleChanges.toLocaleString(), color: 'text-yellow-400' },
                  { label: 'Title Change %', value: `${stats.titleChangePercentage}%`, color: 'text-text-white' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-4 text-center">
                    <span className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">{s.label}</span>
                    <span className={`block text-xl font-bold font-display ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Win methods */}
              {stats.winMethods.length > 0 && (
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                  <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Win Methods</h3>
                  <div className="space-y-3">
                    {stats.winMethods.slice(0, 10).map(wm => (
                      <div key={wm.method} className="flex items-center gap-3">
                        <span className="text-xs text-text-white w-36 truncate">{resultLabels[wm.method] || wm.method}</span>
                        <div className="flex-1 h-2 rounded-full bg-bg-tertiary/50 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-neon-blue/60 to-neon-blue transition-all" style={{ width: `${wm.percentage}%` }} />
                        </div>
                        <span className="text-[11px] text-text-secondary font-mono w-20 text-right">{wm.count} ({wm.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top match types */}
              {stats.topMatchTypes.length > 0 && (
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                  <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Top Match Types</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {stats.topMatchTypes.map((mt, i) => (
                      <Link key={mt.id} href={`/matches/stipulations/${mt.slug}`}
                        className="flex items-center gap-3 p-3 rounded-xl border border-border-subtle/10 bg-bg-tertiary/20 hover:border-neon-blue/20 transition-all">
                        <span className="w-6 h-6 rounded-lg bg-neon-blue/10 flex items-center justify-center text-[10px] text-neon-blue font-bold">{i + 1}</span>
                        <span className="text-xs text-text-white font-medium flex-1 truncate">{mt.name}</span>
                        <span className="text-[11px] text-neon-blue font-bold">{mt.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            Complete <span className="text-neon-blue">{series?.name || 'Show'} Episode Guide</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            This page contains the complete episode history of {series?.name || 'this show series'}, listing every event
            with venue details, locations, and attendance figures. Browse superstars, referees, commentators, and detailed
            statistics. Click on any episode to view the full match card, results, and statistics on Pinfall Data.
          </p>
        </div>
      </section>
    </div>
  )
}

/* Pagination component */
function Pag({ page, tp, total, go, label }: { page: number; tp: number; total: number; go: (n: number) => void; label?: string }) {
  const vis = () => {
    const p: (number | 'e')[] = []
    if (tp <= 7) { for (let i = 1; i <= tp; i++) p.push(i) }
    else { p.push(1); if (page > 3) p.push('e'); for (let i = Math.max(2, page - 1); i <= Math.min(tp - 1, page + 1); i++) p.push(i); if (page < tp - 2) p.push('e'); p.push(tp) }
    return p
  }
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
      <p className="text-xs text-text-secondary">Page {page} of {tp} — {total.toLocaleString()} {label || 'items'}</p>
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
