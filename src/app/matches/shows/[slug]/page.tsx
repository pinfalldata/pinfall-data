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

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateLong(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
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

  // Render description with line breaks
  function renderDescription(desc: string | null) {
    if (!desc) return null
    return desc.split('\n').map((line, i) => (
      <span key={i}>
        {i > 0 && <br />}
        {line}
      </span>
    ))
  }

  return (
    <div className="relative min-h-screen">
      {/* ===== HERO — ShowHero style ===== */}
      <section className="relative overflow-hidden bg-bg-primary">
        <div className="relative h-[300px] sm:h-[360px] lg:h-[420px] overflow-hidden">
          {/* Banner background */}
          {series?.banner_url && (
            <div className="absolute inset-0 z-0">
              <Image src={series.banner_url} alt="" fill className="object-cover opacity-15" priority sizes="100vw" quality={100} unoptimized />
            </div>
          )}

          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-bg-tertiary/95 via-bg-secondary/70 to-transparent pointer-events-none" />
          <div
            className="absolute inset-0 bg-grid opacity-15 animate-grid-pulse pointer-events-none"
            style={{
              maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
            }}
          />

          {/* Gold glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[150px] opacity-15 pointer-events-none bg-neon-blue" />

          {/* Fade to content */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />

          {/* ===== CENTERED CONTENT ===== */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
            {series?.logo_url ? (
              <>
                <div className="relative w-32 h-32 sm:w-44 sm:h-44 lg:w-56 lg:h-56">
                  <div className="absolute -inset-3 rounded-2xl opacity-40 blur-xl pointer-events-none bg-neon-blue" />
                  <div className="absolute -inset-1 rounded-2xl opacity-60 pointer-events-none shadow-neon-blue-lg" />
                  <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-neon-blue/30 bg-bg-tertiary/50 backdrop-blur-sm">
                    <Image
                      src={series.logo_url}
                      alt={series.name}
                      fill
                      sizes="(max-width: 640px) 128px, (max-width: 1024px) 176px, 224px"
                      className="object-contain p-3"
                      priority
                    />
                  </div>
                </div>
                <h1 className="mt-4 font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-text-white tracking-tight text-center">
                  {series.name.toUpperCase()}
                </h1>
              </>
            ) : (
              <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-text-white tracking-tight text-center">
                {series?.name?.toUpperCase() || <span className="bg-bg-secondary/50 rounded w-60 h-12 inline-block animate-pulse" />}
              </h1>
            )}

            {/* Status badge */}
            {series && (
              <div className="mt-3 flex items-center gap-3 flex-wrap justify-center">
                {series.is_ple && (
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-neon-blue/20 border-neon-blue/40 text-neon-blue">
                    Premium Live Event
                  </span>
                )}
                {series.is_active && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400 font-medium text-[10px] uppercase tracking-wider">Active</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Neon separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
      </section>

      {/* ===== STATS BAR ===== */}
      {series && (
        <section className="bg-bg-secondary/30 border-b border-border-subtle/20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5">
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm">
              <div className="text-center">
                <span className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">Total Episodes</span>
                <span className="text-neon-blue font-bold text-2xl font-display">{total.toLocaleString()}</span>
              </div>
              {firstDate && (
                <div className="text-center">
                  <span className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">First Show</span>
                  <span className="text-text-white font-semibold">{formatDateLong(firstDate)}</span>
                </div>
              )}
              {lastDate && (
                <div className="text-center">
                  <span className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">Latest Show</span>
                  <span className="text-text-white font-semibold">{formatDateLong(lastDate)}</span>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== DESCRIPTION (supports line breaks) ===== */}
      {series?.description && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-8">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-5 sm:p-6">
              <p className="text-text-secondary text-sm leading-relaxed text-center">
                {renderDescription(series.description)}
              </p>
            </div>
          </div>
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
            All Shows <span className="text-text-secondary font-normal text-sm">({total})</span>
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
            <div className="hidden lg:grid lg:grid-cols-[110px_48px_1fr_1fr_200px] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-2">
              <span>Date</span>
              <span></span>
              <span>Show</span>
              <span>Arena</span>
              <span>Location</span>
            </div>

            <div className="space-y-0.5">
              {episodes.map(ep => (
                <Link key={ep.id} href={`/shows/${ep.slug}`}
                  className="group block transition-all hover:bg-bg-secondary/30 rounded-xl">
                  {/* Desktop row */}
                  <div className="hidden lg:grid lg:grid-cols-[110px_48px_1fr_1fr_200px] gap-3 items-center px-4 py-2.5 border-b border-border-subtle/10">
                    <span className="text-xs text-text-secondary font-mono">{formatDate(ep.date)}</span>
                    <div className="flex items-center justify-center">
                      {ep.logo_url ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-border-subtle/20 bg-bg-tertiary/30 p-0.5 shrink-0">
                          <Image src={ep.logo_url} alt="" width={36} height={36} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-bg-tertiary/20 border border-border-subtle/10" />
                      )}
                    </div>
                    <span className="text-sm text-text-white font-semibold group-hover:text-neon-blue transition-colors truncate">
                      {ep.name}
                    </span>
                    <span className="text-xs text-text-secondary truncate">
                      {ep.arena?.name || ep.venue || '—'}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-text-secondary truncate">
                      <span className="truncate">
                        {[ep.city, ep.state_province, ep.country].filter(Boolean).join(', ') || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Mobile card */}
                  <div className="lg:hidden px-3 py-3 border-b border-border-subtle/10">
                    <div className="flex items-center gap-3 mb-1.5">
                      {ep.logo_url && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden border border-border-subtle/20 bg-bg-tertiary/30 p-0.5 shrink-0">
                          <Image src={ep.logo_url} alt="" width={32} height={32} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-text-white font-semibold group-hover:text-neon-blue transition-colors truncate flex-1">
                            {ep.name}
                          </span>
                          <span className="text-[10px] text-text-secondary font-mono shrink-0">{formatDate(ep.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary mt-0.5">
                          {(ep.arena?.name || ep.venue) && <span className="truncate">{ep.arena?.name || ep.venue}</span>}
                          {(ep.arena?.name || ep.venue) && ep.city && <span className="text-text-secondary/30">•</span>}
                          <span className="truncate">{[ep.city, ep.state_province, ep.country].filter(Boolean).join(', ')}</span>
                        </div>
                      </div>
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
