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

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const categoryIcons: Record<string, string> = {
  'Environmental': '🏗️',
  'Weapon-Based': '🪜',
  'Submission & Technical': '🔒',
  'Multi-Man Elimination': '👥',
  'Life-Changing': '💀',
  'Standard': '🤼',
}

export default function StipulationDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [matchType, setMatchType] = useState<MatchType | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchData = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const r = await fetch(`/api/stipulation-detail?slug=${slug}&page=${p}&limit=50`)
      const d = await r.json()
      if (d.matchType) setMatchType(d.matchType)
      setMatches(d.matches || [])
      setTotal(d.total || 0)
      setTotalPages(d.totalPages || 1)
      setPage(d.page || 1)
    } catch { }
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchData(1) }, [fetchData])

  const goPage = (n: number) => {
    if (n < 1 || n > totalPages) return
    fetchData(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* ===== HERO — MOBILE: banner overlay / DESKTOP: split layout ===== */}

      {/* --- MOBILE HERO (visible on small screens) --- */}
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

      {/* --- DESKTOP HERO (visible on large screens) — split layout --- */}
      <section className="hidden lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
        {/* Subtle background blur of the image */}
        {matchType?.image_url && (
          <div className="absolute inset-0 opacity-10">
            <Image src={matchType.image_url} alt="" fill className="object-cover blur-2xl" sizes="100vw" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />

        <div className="relative max-w-[1440px] mx-auto px-6 py-10">
          <div className="flex items-center gap-10">
            {/* Image — fully visible with object-contain */}
            {matchType?.image_url ? (
              <div className="relative w-[420px] h-[280px] shrink-0 rounded-2xl overflow-hidden border border-border-subtle/20 bg-black/40">
                <Image
                  src={matchType.image_url}
                  alt={matchType?.name || ''}
                  fill
                  priority
                  quality={100}
                  unoptimized
                  className="object-contain"
                  sizes="420px"
                />
              </div>
            ) : (
              <div className="w-[420px] h-[280px] shrink-0 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-border-subtle/20 flex items-center justify-center">
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

              {/* Description inline on desktop */}
              {matchType?.description && (
                <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
                  {matchType.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== DESCRIPTION + RULES (mobile only, or rules on both) ===== */}
      {(matchType?.description || matchType?.rules) && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {/* Description — show on mobile only (already shown on desktop hero) */}
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

      {/* ===== MATCH LIST ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
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
            <p className="text-text-secondary text-lg">No matches found for this stipulation</p>
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
