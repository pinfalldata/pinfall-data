'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/* ────────────────────────────── Types ────────────────────────────── */

interface Theme {
  id: number; song_name: string; artist: string | null
  start_date: string | null; end_date: string | null
  video_url: string | null; is_current: boolean
}

interface Attire {
  id: number; image_url: string | null; video_url: string | null
  name: string | null; date: string | null; category: string
  match_id: number | null; segment_id: number | null; description: string | null
  match: { id: number; show: { id: number; name: string; slug: string; date: string } | null } | null
  segment: { id: number; slug: string; title: string; show: { id: number; name: string; slug: string; date: string } | null } | null
}

interface Counts { ring: number; entrance: number; backstage: number }

/* ────────────────────────────── Helpers ────────────────────────────── */

function fmt(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtYear(d: string | null) {
  if (!d) return '?'
  return d.substring(0, 4)
}

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/)
  return m ? m[1] : null
}

function isVideoUrl(url: string | null): boolean {
  if (!url) return false
  return !!getYoutubeId(url) || /\.(mp4|webm|ogg)(\?|$)/i.test(url)
}

const CATEGORIES = [
  { key: 'ring', label: 'Ring Gear', icon: '🤼' },
  { key: 'entrance', label: 'Entrance', icon: '🚪' },
  { key: 'backstage', label: 'Backstage', icon: '🎬' },
] as const

/* ────────────────────────────── Component ────────────────────────────── */

export default function TabPersona({ superstar }: { superstar: any }) {
  const [loading, setLoading] = useState(true)
  const [themes, setThemes] = useState<Theme[]>([])
  const [counts, setCounts] = useState<Counts>({ ring: 0, entrance: 0, backstage: 0 })

  // Attire sub-tab state
  const [activeCat, setActiveCat] = useState<string>('')
  const [attires, setAttires] = useState<Attire[]>([])
  const [attirePage, setAttirePage] = useState(1)
  const [attireTotalPages, setAttireTotalPages] = useState(0)
  const [attireTotal, setAttireTotal] = useState(0)
  const [attireLoading, setAttireLoading] = useState(false)

  // Lightbox
  const [lightbox, setLightbox] = useState<{ src: string; type: 'image' | 'video'; title: string; sub?: string } | null>(null)

  // Initial fetch — themes + counts
  useEffect(() => {
    fetch(`/api/superstar-entrance?superstarId=${superstar.id}`)
      .then(r => r.json())
      .then(d => {
        setThemes(d.themes || [])
        const c = d.counts || { ring: 0, entrance: 0, backstage: 0 }
        setCounts(c)
        // Auto-select first category that has data
        const first = CATEGORIES.find(cat => (c[cat.key] || 0) > 0)
        if (first) setActiveCat(first.key)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [superstar.id])

  // Fetch attires for a specific category + page
  const fetchAttires = useCallback(async (cat: string, page: number) => {
    if (!cat) return
    setAttireLoading(true)
    try {
      const r = await fetch(`/api/superstar-entrance?superstarId=${superstar.id}&category=${cat}&page=${page}`)
      const d = await r.json()
      setAttires(d.attires || [])
      setAttireTotal(d.attireTotal || 0)
      setAttirePage(d.attirePage || 1)
      setAttireTotalPages(d.attireTotalPages || 0)
    } catch {}
    setAttireLoading(false)
  }, [superstar.id])

  // Re-fetch when category changes
  useEffect(() => {
    if (activeCat) fetchAttires(activeCat, 1)
  }, [activeCat, fetchAttires])

  const goAttirePage = (p: number) => {
    if (p < 1 || p > attireTotalPages) return
    fetchAttires(activeCat, p)
    // Scroll to attire section
    document.getElementById('attire-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  /* ────────────────────────────── Loading ────────────────────────────── */

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-bg-secondary/30 animate-pulse" />
        ))}
      </div>
    )
  }

  const hasThemes = themes.length > 0
  const totalAttires = counts.ring + counts.entrance + counts.backstage
  const hasAttires = totalAttires > 0

  if (!hasThemes && !hasAttires) {
    return <p className="text-center py-12 text-text-secondary">No persona data yet.</p>
  }

  const visibleCats = CATEGORIES.filter(c => (counts[c.key] || 0) > 0)

  return (
    <div className="max-w-5xl mx-auto space-y-14">

      {/* ================================================================ */}
      {/* ENTRANCE THEMES                                                  */}
      {/* ================================================================ */}
      {hasThemes && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-neon-blue/10 border border-neon-blue/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-text-white">Entrance Themes</h3>
              <p className="text-xs text-text-secondary">{themes.length} theme{themes.length > 1 ? 's' : ''} in career history</p>
            </div>
          </div>

          <div className="space-y-4">
            {themes.map((t) => {
              const ytId = t.video_url ? getYoutubeId(t.video_url) : null

              return (
                <div key={t.id} className={`group rounded-2xl border overflow-hidden transition-all ${
                  t.is_current
                    ? 'border-neon-blue/30 bg-gradient-to-r from-neon-blue/[0.06] to-transparent'
                    : 'border-border-subtle/20 bg-bg-secondary/10 hover:bg-bg-secondary/20'
                }`}>
                  <div className="flex flex-col lg:flex-row">
                    {/* Video embed */}
                    {ytId && (
                      <div className="lg:w-[360px] xl:w-[400px] shrink-0 bg-black">
                        <div className="relative w-full pt-[56.25%] lg:pt-0 lg:h-full lg:min-h-[200px]">
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title={t.song_name}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {t.is_current && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-neon-blue/15 border border-neon-blue/30 text-neon-blue font-bold uppercase tracking-wider shrink-0">
                            Current
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-tertiary border border-border-subtle/20 text-text-secondary font-mono shrink-0">
                          {fmtYear(t.start_date)}–{t.end_date ? fmtYear(t.end_date) : 'now'}
                        </span>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-text-white leading-tight mt-1 truncate">
                        &ldquo;{t.song_name}&rdquo;
                      </h4>
                      {t.artist && (
                        <p className="text-sm text-text-secondary mt-0.5">by <span className="text-text-white/80">{t.artist}</span></p>
                      )}

                      {/* Non-YouTube link */}
                      {t.video_url && !ytId && (
                        <a href={t.video_url} target="_blank" rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs text-neon-blue hover:text-neon-blue/80 transition-colors w-fit">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Watch entrance video
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ================================================================ */}
      {/* ATTIRES — 3 sub-categories with pagination                       */}
      {/* ================================================================ */}
      {hasAttires && (
        <section id="attire-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-neon-pink/10 border border-neon-pink/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-neon-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-text-white">Look & Attire</h3>
              <p className="text-xs text-text-secondary">{totalAttires} media across {visibleCats.length} categor{visibleCats.length > 1 ? 'ies' : 'y'}</p>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide">
            {visibleCats.map(cat => (
              <button
                key={cat.key}
                onClick={() => { setActiveCat(cat.key); setAttirePage(1) }}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium border whitespace-nowrap transition-all ${
                  activeCat === cat.key
                    ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue shadow-[0_0_12px_rgba(199,160,90,0.1)]'
                    : 'bg-bg-secondary/20 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  activeCat === cat.key ? 'bg-neon-blue/20 text-neon-blue' : 'bg-bg-tertiary text-text-secondary'
                }`}>{counts[cat.key]}</span>
              </button>
            ))}
          </div>

          {/* Attire grid */}
          {attireLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-bg-secondary/30 animate-pulse" />
              ))}
            </div>
          ) : attires.length === 0 ? (
            <p className="text-center text-text-secondary py-12">No items in this category yet.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {attires.map((a) => {
                  const hasVideo = !!a.video_url
                  const ytId = a.video_url ? getYoutubeId(a.video_url) : null
                  const hasImage = !!a.image_url
                  const showSlug = a.match?.show?.slug || a.segment?.show?.slug
                  const showName = a.match?.show?.name || a.segment?.show?.name
                  const showDate = a.match?.show?.date || a.segment?.show?.date

                  return (
                    <div
                      key={a.id}
                      className="group flex flex-col rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 overflow-hidden transition-all hover:border-neon-blue/25 hover:shadow-[0_0_20px_rgba(199,160,90,0.06)]"
                    >
                      {/* Media area */}
                      <div className="relative w-full aspect-[3/4] bg-bg-tertiary/30 overflow-hidden">
                        {hasVideo && ytId ? (
                          /* YouTube thumbnail — click opens lightbox with embed */
                          <button
                            onClick={() => setLightbox({
                              src: a.video_url!,
                              type: 'video',
                              title: a.name || activeCat,
                              sub: showName ? `${showName} — ${fmt(showDate)}` : (a.date ? fmt(a.date) : undefined),
                            })}
                            className="w-full h-full relative"
                          >
                            <Image
                              src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                              alt={a.name || ''}
                              fill
                              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </button>
                        ) : hasVideo && !ytId ? (
                          /* Direct video — click opens lightbox */
                          <button
                            onClick={() => setLightbox({
                              src: a.video_url!,
                              type: 'video',
                              title: a.name || activeCat,
                              sub: showName ? `${showName} — ${fmt(showDate)}` : undefined,
                            })}
                            className="w-full h-full relative flex items-center justify-center bg-bg-tertiary/60"
                          >
                            <div className="w-14 h-14 rounded-full bg-neon-blue/15 border border-neon-blue/30 flex items-center justify-center">
                              <svg className="w-7 h-7 text-neon-blue ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                            <span className="absolute bottom-3 text-[10px] text-text-secondary">Video</span>
                          </button>
                        ) : hasImage ? (
                          /* Image — click opens lightbox */
                          <button
                            onClick={() => setLightbox({
                              src: a.image_url!,
                              type: 'image',
                              title: a.name || activeCat,
                              sub: showName ? `${showName} — ${fmt(showDate)}` : (a.date ? fmt(a.date) : undefined),
                            })}
                            className="w-full h-full relative"
                          >
                            <Image
                              src={a.image_url!}
                              alt={a.name || 'Attire'}
                              fill
                              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-70 transition-opacity drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                              </svg>
                            </div>
                          </button>
                        ) : (
                          /* No media */
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl opacity-15">🎭</span>
                          </div>
                        )}

                        {/* Date badge */}
                        {a.date && (
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-text-white font-mono pointer-events-none">
                            {fmtYear(a.date)}
                          </div>
                        )}

                        {/* Video badge */}
                        {hasVideo && (
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-red-600/90 text-[9px] text-white font-bold pointer-events-none">
                            VIDEO
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-col gap-1 p-3 flex-1">
                        {a.name && <p className="text-xs font-medium text-text-white line-clamp-2 leading-snug">{a.name}</p>}
                        {a.description && <p className="text-[10px] text-text-secondary line-clamp-2 mt-0.5">{a.description}</p>}

                        {/* Show/segment link */}
                        {showSlug && showName && (
                          <Link
                            href={`/shows/${showSlug}`}
                            className="mt-auto pt-1.5 text-[10px] text-neon-blue/70 hover:text-neon-blue transition-colors truncate flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                            <span className="truncate">{showName}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Pagination */}
              {attireTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
                  <p className="text-xs text-text-secondary">Page {attirePage} of {attireTotalPages} — {attireTotal} items</p>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => goAttirePage(attirePage - 1)}
                      disabled={attirePage === 1}
                      className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    {Array.from({ length: Math.min(attireTotalPages, 7) }).map((_, i) => {
                      let p: number
                      if (attireTotalPages <= 7) { p = i + 1 }
                      else if (attirePage <= 4) { p = i + 1 }
                      else if (attirePage >= attireTotalPages - 3) { p = attireTotalPages - 6 + i }
                      else { p = attirePage - 3 + i }

                      return (
                        <button
                          key={p}
                          onClick={() => goAttirePage(p)}
                          className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                            p === attirePage
                              ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue'
                              : 'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'
                          }`}
                        >{p}</button>
                      )
                    })}

                    <button
                      onClick={() => goAttirePage(attirePage + 1)}
                      disabled={attirePage === attireTotalPages}
                      className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ================================================================ */}
      {/* LIGHTBOX                                                         */}
      {/* ================================================================ */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.type === 'video' ? (
              (() => {
                const ytId = getYoutubeId(lightbox.src)
                if (ytId) {
                  return (
                    <div className="w-full rounded-2xl overflow-hidden bg-black">
                      <div className="relative w-full pt-[56.25%]">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                          title={lightbox.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    </div>
                  )
                }
                return (
                  <div className="w-full rounded-2xl overflow-hidden bg-black">
                    <video
                      src={lightbox.src}
                      controls
                      autoPlay
                      className="w-full max-h-[75vh]"
                    />
                  </div>
                )
              })()
            ) : (
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={lightbox.src}
                  alt={lightbox.title}
                  className="max-w-full max-h-[75vh] object-contain"
                />
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-base font-bold text-white">{lightbox.title}</p>
              {lightbox.sub && <p className="text-sm text-white/60 mt-1">{lightbox.sub}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
