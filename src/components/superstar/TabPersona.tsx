'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Theme {
  id: number; song_name: string; artist: string | null
  start_date: string | null; end_date: string | null
  video_url: string | null; is_current: boolean
}
interface Attire {
  id: number; image_url: string; name: string | null
  date: string | null; match_id: number | null; description: string | null
  match: { id: number; show: { id: number; name: string; slug: string; date: string } | null } | null
}
interface OutsideRing {
  id: number; type: string; title: string; year: number | null
  role: string | null; description: string | null
  image_url: string | null; external_url: string | null
}

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

export default function TabPersona({ superstar }: { superstar: any }) {
  const [loading, setLoading] = useState(true)
  const [themes, setThemes] = useState<Theme[]>([])
  const [attires, setAttires] = useState<Attire[]>([])
  const [outsideRing, setOutsideRing] = useState<OutsideRing[]>([])
  const [lightbox, setLightbox] = useState<{ image: string; title: string; sub?: string } | null>(null)

  useEffect(() => {
    fetch(`/api/superstar-entrance?superstarId=${superstar.id}`)
      .then(r => r.json())
      .then(d => {
        setThemes(d.themes || [])
        setAttires(d.attires || [])
        setOutsideRing(d.outsideRing || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [superstar.id])

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
  const hasAttires = attires.length > 0
  const hasOutside = outsideRing.length > 0

  if (!hasThemes && !hasAttires && !hasOutside) {
    return <p className="text-center py-12 text-text-secondary">No persona data yet.</p>
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">

      {/* ============================================================ */}
      {/* ENTRANCE THEMES */}
      {/* ============================================================ */}
      {hasThemes && (
        <section>
          <h3 className="font-display text-lg font-bold text-neon-blue mb-5 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-blue rounded-full" />
            Entrance Themes
            <span className="text-xs text-text-secondary font-normal ml-1">({themes.length})</span>
          </h3>

          <div className="space-y-4">
            {themes.map((t) => {
              const ytId = t.video_url ? getYoutubeId(t.video_url) : null

              return (
                <div key={t.id} className={`rounded-2xl border overflow-hidden transition-all ${
                  t.is_current
                    ? 'border-neon-blue/30 bg-neon-blue/5'
                    : 'border-border-subtle/20 bg-bg-secondary/15'
                }`}>
                  <div className="flex flex-col lg:flex-row gap-0">
                    {/* Video embed */}
                    {ytId && (
                      <div className="lg:w-[360px] xl:w-[420px] shrink-0 aspect-video lg:aspect-auto lg:h-auto bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}`}
                          title={t.song_name}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full min-h-[200px] lg:min-h-[180px]"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 p-5 flex flex-col justify-center">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-bg-tertiary/50 border border-border-subtle/20 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-bold text-text-white leading-tight">
                            {t.song_name}
                          </h4>
                          {t.artist && (
                            <p className="text-sm text-text-secondary mt-0.5">by {t.artist}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-tertiary border border-border-subtle/20 text-text-secondary font-mono">
                              {fmtYear(t.start_date)}–{t.end_date ? fmtYear(t.end_date) : 'present'}
                            </span>
                            {t.is_current && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-blue/15 border border-neon-blue/30 text-neon-blue font-bold uppercase tracking-wider">
                                Current Theme
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Non-YouTube video link */}
                      {t.video_url && !ytId && (
                        <a href={t.video_url} target="_blank" rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-1.5 text-xs text-neon-blue hover:text-neon-blue/80 transition-colors">
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

      {/* ============================================================ */}
      {/* RING ATTIRES */}
      {/* ============================================================ */}
      {hasAttires && (
        <section>
          <h3 className="font-display text-lg font-bold text-neon-pink mb-5 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-neon-pink rounded-full" />
            Ring Attire
            <span className="text-xs text-text-secondary font-normal ml-1">({attires.length})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {attires.map((a) => (
              <button
                key={a.id}
                onClick={() => setLightbox({
                  image: a.image_url,
                  title: a.name || 'Ring Attire',
                  sub: a.match?.show ? `${a.match.show.name} — ${fmt(a.match.show.date)}` : (a.date ? fmt(a.date) : undefined),
                })}
                className="group flex flex-col rounded-xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-pink/30 hover:shadow-lg text-left"
              >
                <div className="relative w-full aspect-[3/4] bg-bg-tertiary overflow-hidden">
                  <Image
                    src={a.image_url}
                    alt={a.name || 'Ring attire'}
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Zoom icon overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                  {a.date && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-text-white font-mono">
                      {fmtYear(a.date)}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  {a.name && <p className="text-xs font-medium text-text-white line-clamp-2 leading-snug">{a.name}</p>}
                  {a.description && <p className="text-[10px] text-text-secondary line-clamp-2 mt-0.5">{a.description}</p>}
                  {a.match?.show && (
                    <p className="text-[9px] text-neon-blue/70 mt-1 truncate">{a.match.show.name}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* OUTSIDE THE RING */}
      {/* ============================================================ */}
      {hasOutside && (
        <section>
          <h3 className="font-display text-lg font-bold text-text-white mb-5 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-gradient-to-b from-neon-blue to-neon-pink rounded-full" />
            Outside the Ring
            <span className="text-xs text-text-secondary font-normal ml-1">({outsideRing.length})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {outsideRing.map((o) => {
              const hasImage = !!o.image_url
              const isLink = !!o.external_url

              return (
                <div
                  key={o.id}
                  className="group flex flex-col rounded-xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-border-subtle/40 hover:shadow-lg"
                >
                  {/* Image or icon placeholder */}
                  {hasImage ? (
                    <button
                      onClick={() => setLightbox({
                        image: o.image_url!,
                        title: o.title,
                        sub: [o.role, o.year].filter(Boolean).join(' • '),
                      })}
                      className="relative w-full aspect-[3/4] bg-bg-tertiary overflow-hidden"
                    >
                      <Image
                        src={o.image_url!}
                        alt={o.title}
                        fill
                        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-80 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                      {o.year && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-text-white font-mono">
                          {o.year}
                        </div>
                      )}
                      {o.type && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-neon-blue/80 text-[9px] text-white font-bold uppercase tracking-wider">
                          {o.type.replace(/_/g, ' ')}
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className="relative w-full aspect-[4/3] bg-bg-tertiary/30 flex items-center justify-center">
                      <span className="text-3xl opacity-20">
                        {o.type === 'movie' ? '🎬' : o.type === 'tv_show' ? '📺' : o.type === 'music' ? '🎵' : o.type === 'book' ? '📚' : '🌟'}
                      </span>
                      {o.year && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[10px] text-text-white font-mono">
                          {o.year}
                        </div>
                      )}
                      {o.type && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-neon-blue/80 text-[9px] text-white font-bold uppercase tracking-wider">
                          {o.type.replace(/_/g, ' ')}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col gap-1 p-3 flex-1">
                    <h4 className="text-xs font-medium text-text-white line-clamp-2 leading-snug">{o.title}</h4>
                    {o.role && <p className="text-[10px] text-neon-blue/70">{o.role}</p>}
                    {o.description && (
                      <p className="text-[10px] text-text-secondary line-clamp-3 leading-relaxed mt-0.5">{o.description}</p>
                    )}
                    {isLink && (
                      <a href={o.external_url!} target="_blank" rel="noopener noreferrer"
                        className="mt-auto pt-2 text-[10px] text-neon-blue font-medium flex items-center gap-1 hover:gap-1.5 transition-all">
                        View more
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ============================================================ */}
      {/* LIGHTBOX */}
      {/* ============================================================ */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="max-w-3xl max-h-[85vh] mx-4 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-h-[70vh] rounded-2xl overflow-hidden">
              <img
                src={lightbox.image}
                alt={lightbox.title}
                className="w-full h-full object-contain max-h-[70vh]"
              />
            </div>
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
