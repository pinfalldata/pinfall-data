'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Series {
  id: number; name: string; slug: string; short_name: string | null
  logo_url: string | null; banner_url?: string | null; description: string | null
  first_episode_date: string | null; is_active: boolean; is_ple?: boolean | null
}

interface Episode {
  id: number; name: string; slug: string; date: string
  venue: string | null; city: string | null; state_province: string | null
  country: string | null; attendance: number | null; tv_audience?: number | null
  show_type: string | null; episode_number: number | null
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateLong(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ShowSeriesPage() {
  const params = useParams()
  const slug = params.slug as string

  const [series, setSeries] = useState<Series | null>(null)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

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
    } catch (e: any) {
      setError(e.message || 'Network error')
    }
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchData(1) }, [fetchData])

  const goPage = (n: number) => {
    if (n < 1 || n > totalPages) return
    fetchData(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Extract years
  const lastEpDate = episodes.length > 0 && page === 1 ? episodes[0].date : null

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
      </section>

      {/* ===== STATS BAR ===== */}
      {series && (
        <section className="bg-bg-secondary/30 border-y border-border-subtle/20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
              {series.first_episode_date && (
                <div className="text-center">
                  <span className="block text-[10px] text-text-secondary uppercase tracking-wider">First Episode</span>
                  <span className="text-text-white font-semibold">{formatDateLong(series.first_episode_date)}</span>
                </div>
              )}
              {lastEpDate && (
                <div className="text-center">
                  <span className="block text-[10px] text-text-secondary uppercase tracking-wider">Latest Episode</span>
                  <span className="text-text-white font-semibold">{formatDateLong(lastEpDate)}</span>
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

      {/* ===== ERROR DISPLAY ===== */}
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

      {/* ===== EPISODE LIST ===== */}
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
            {/* Desktop header */}
            <div className="hidden lg:grid lg:grid-cols-[120px_1fr_1fr_160px_100px] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-2">
              <span>Date</span>
              <span>Show</span>
              <span>Venue</span>
              <span>Location</span>
              <span className="text-right">Attendance</span>
            </div>

            <div className="space-y-1">
              {episodes.map(ep => (
                <Link key={ep.id} href={`/shows/${ep.slug}`}
                  className="group block transition-all hover:bg-bg-secondary/30 rounded-xl">
                  {/* Desktop row */}
                  <div className="hidden lg:grid lg:grid-cols-[120px_1fr_1fr_160px_100px] gap-3 items-center px-4 py-3 border-b border-border-subtle/10">
                    <span className="text-xs text-text-secondary font-mono">{formatDate(ep.date)}</span>
                    <span className="text-sm text-text-white font-semibold group-hover:text-neon-blue transition-colors truncate">
                      {ep.name}
                    </span>
                    <span className="text-xs text-text-secondary truncate">{ep.venue || '—'}</span>
                    <span className="text-xs text-text-secondary truncate">
                      {[ep.city, ep.state_province, ep.country].filter(Boolean).join(', ') || '—'}
                    </span>
                    <span className="text-xs text-text-secondary text-right font-mono">
                      {ep.attendance ? ep.attendance.toLocaleString() : '—'}
                    </span>
                  </div>

                  {/* Mobile card */}
                  <div className="lg:hidden px-3 py-3 border-b border-border-subtle/10">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm text-text-white font-semibold group-hover:text-neon-blue transition-colors truncate flex-1">
                        {ep.name}
                      </span>
                      <span className="text-[10px] text-text-secondary font-mono shrink-0">{formatDate(ep.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                      {ep.venue && <span className="truncate">{ep.venue}</span>}
                      {ep.venue && ep.city && <span className="text-text-secondary/30">•</span>}
                      <span className="truncate">{[ep.city, ep.state_province, ep.country].filter(Boolean).join(', ')}</span>
                      {ep.attendance && (
                        <>
                          <span className="text-text-secondary/30">•</span>
                          <span className="shrink-0">🏟️ {ep.attendance.toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && <Pag page={page} tp={totalPages} total={total} go={goPage} />}
          </>
        ) : null}
      </section>

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            Complete <span className="text-neon-blue">{series?.name || 'Show'} Episode Guide</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            This page contains the complete episode history of {series?.name || 'this show series'}, listing every event
            with venue details, locations, and attendance figures. Click on any episode to view the full match card,
            results, and detailed statistics. Pinfall Data catalogs every WWE show from the earliest days to the present.
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
      <p className="text-xs text-text-secondary">Page {page} of {tp} — {total.toLocaleString()} episodes</p>
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
