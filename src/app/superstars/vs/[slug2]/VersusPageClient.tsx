'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */
interface Superstar {
  id: number; name: string; slug: string; photo_url: string | null
  total_matches: number; wins: number; losses: number; draws: number
}
interface VersusMatch {
  id: number; slug: string; date: string; duration_seconds: number | null
  rating: number | null; result_type: string | null; is_title_change: boolean
  is_dark_match: boolean; championship: any; match_type: any; show: any
  participants: any[]; outcome: string; score_winner: number | null; score_loser: number | null
}
interface H2H { total: number; wins1: number; wins2: number; draws: number; firstMatch: string | null; lastMatch: string | null }

interface Props {
  superstar1: Superstar
  superstar2: Superstar
  initialMatchCount: number
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export function VersusPageClient({ superstar1: s1, superstar2: s2, initialMatchCount }: Props) {
  const [matches, setMatches] = useState<VersusMatch[]>([])
  const [h2h, setH2h] = useState<H2H | null>(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [year, setYear] = useState('')
  const [showSeriesId, setShowSeriesId] = useState('')
  const [matchTypeId, setMatchTypeId] = useState('')
  const [minRating, setMinRating] = useState('')
  const [result, setResult] = useState('')
  const [resultType, setResultType] = useState('')
  const [champOnly, setChampOnly] = useState(false)
  const [titleChangeOnly, setTitleChangeOnly] = useState(false)

  useEffect(() => {
    fetch(`/api/versus?slug1=${s1.slug}&slug2=${s2.slug}`)
      .then(r => r.json())
      .then(data => {
        setMatches(data.matches || [])
        setH2h(data.h2h || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [s1.slug, s2.slug])

  // Derive filter options from data
  const years = useMemo(() => {
    const set = new Set(matches.map(m => m.date?.slice(0, 4)).filter(Boolean))
    return [...set].sort((a, b) => b.localeCompare(a))
  }, [matches])

  const showSeries = useMemo(() => {
    const map = new Map()
    matches.forEach(m => {
      if (m.show?.show_series) map.set(m.show.show_series.id, m.show.show_series)
    })
    return [...map.values()]
  }, [matches])

  const matchTypes = useMemo(() => {
    const map = new Map()
    matches.forEach(m => {
      if (m.match_type) map.set(m.match_type.id, m.match_type)
    })
    return [...map.values()]
  }, [matches])

  // Filtered results
  const filtered = useMemo(() => {
    return matches.filter(m => {
      if (year && !m.date?.startsWith(year)) return false
      if (showSeriesId && m.show?.show_series?.id !== parseInt(showSeriesId)) return false
      if (matchTypeId && m.match_type?.id !== parseInt(matchTypeId)) return false
      if (minRating && (m.rating === null || m.rating < parseFloat(minRating))) return false
      if (result === 'win' && m.outcome !== 'win') return false
      if (result === 'loss' && m.outcome !== 'loss') return false
      if (result === 'draw' && m.outcome !== 'draw') return false
      if (resultType && m.result_type !== resultType) return false
      if (champOnly && !m.championship) return false
      if (titleChangeOnly && !m.is_title_change) return false
      return true
    })
  }, [matches, year, showSeriesId, matchTypeId, minRating, result, resultType, champOnly, titleChangeOnly])

  // Filtered H2H
  const filteredH2h = useMemo(() => ({
    total: filtered.length,
    wins1: filtered.filter(m => m.outcome === 'win').length,
    wins2: filtered.filter(m => m.outcome === 'loss').length,
    draws: filtered.filter(m => m.outcome === 'draw').length,
  }), [filtered])

  const resetFilters = () => {
    setYear(''); setShowSeriesId(''); setMatchTypeId(''); setMinRating('')
    setResult(''); setResultType(''); setChampOnly(false); setTitleChangeOnly(false)
  }

  const activeFilters = [year, showSeriesId, matchTypeId, minRating, result, resultType, champOnly, titleChangeOnly].filter(Boolean).length

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ═══════════════════════════════════════════
          HERO — Epic VS Section
          ═══════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-secondary/60 via-bg-primary to-bg-primary" />
        <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-30" />

        {/* Neon glow orbs */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-neon-blue/5 blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-neon-pink/5 blur-[120px]" />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-6 sm:pb-10">

          {/* VS Layout */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 lg:gap-10">

            {/* Superstar 1 */}
            <div className="flex flex-col items-center flex-1 max-w-[240px] sm:max-w-[280px]">
              <Link href={`/superstars/${s1.slug}`} className="group">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-2xl overflow-hidden border-2 border-neon-blue/30 group-hover:border-neon-blue/60 transition-all duration-300 shadow-neon-blue">
                  {s1.photo_url ? (
                    <Image src={s1.photo_url} alt={s1.name} fill sizes="176px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-bg-tertiary/30 flex items-center justify-center"><span className="text-4xl opacity-30">👤</span></div>
                  )}
                  {/* Gold corner accent */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-neon-blue/50 rounded-tl-2xl" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-neon-blue/50 rounded-br-2xl" />
                </div>
              </Link>
              <Link href={`/superstars/${s1.slug}`} className="mt-3 text-center">
                <h2 className="font-display text-sm sm:text-lg lg:text-xl font-bold text-text-white hover:text-neon-blue transition-colors leading-tight">
                  {s1.name}
                </h2>
              </Link>
              {/* Record */}
              {h2h && (
                <p className="font-stats text-2xl sm:text-3xl lg:text-4xl text-neon-blue tracking-wider mt-1">
                  {h2h.wins1} <span className="text-text-secondary/40 text-lg">W</span>
                </p>
              )}
            </div>

            {/* VS Badge */}
            <div className="flex flex-col items-center shrink-0">
              <div className="relative">
                {/* Outer glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neon-blue via-neon-pink to-neon-blue blur-md opacity-40 animate-glow-pulse" style={{ margin: '-4px' }} />
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-bg-primary border-2 border-border-subtle/40 flex items-center justify-center">
                  <span className="font-display text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-br from-neon-blue via-text-white to-neon-pink bg-clip-text text-transparent">
                    VS
                  </span>
                </div>
              </div>
              {/* Match count */}
              <p className="mt-3 text-center">
                <span className="font-stats text-xl sm:text-2xl text-text-white tracking-wide">{initialMatchCount}</span>
                <span className="block text-[10px] sm:text-xs text-text-secondary uppercase tracking-widest">Match{initialMatchCount !== 1 ? 'es' : ''}</span>
              </p>
              {h2h && h2h.draws > 0 && (
                <p className="text-xs text-text-secondary mt-0.5">
                  <span className="text-neon-pink font-mono">{h2h.draws}</span> Draw{h2h.draws !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Superstar 2 */}
            <div className="flex flex-col items-center flex-1 max-w-[240px] sm:max-w-[280px]">
              <Link href={`/superstars/${s2.slug}`} className="group">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-2xl overflow-hidden border-2 border-neon-pink/30 group-hover:border-neon-pink/60 transition-all duration-300 shadow-neon-pink">
                  {s2.photo_url ? (
                    <Image src={s2.photo_url} alt={s2.name} fill sizes="176px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-bg-tertiary/30 flex items-center justify-center"><span className="text-4xl opacity-30">👤</span></div>
                  )}
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-neon-pink/50 rounded-tr-2xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-neon-pink/50 rounded-bl-2xl" />
                </div>
              </Link>
              <Link href={`/superstars/${s2.slug}`} className="mt-3 text-center">
                <h2 className="font-display text-sm sm:text-lg lg:text-xl font-bold text-text-white hover:text-neon-pink transition-colors leading-tight">
                  {s2.name}
                </h2>
              </Link>
              {h2h && (
                <p className="font-stats text-2xl sm:text-3xl lg:text-4xl text-neon-pink tracking-wider mt-1">
                  {h2h.wins2} <span className="text-text-secondary/40 text-lg">W</span>
                </p>
              )}
            </div>
          </div>

          {/* H2H Bar */}
          {h2h && h2h.total > 0 && (
            <div className="mt-6 max-w-xl mx-auto">
              <div className="flex items-center gap-2 h-4 rounded-full overflow-hidden bg-bg-tertiary/50 border border-border-subtle/20">
                {h2h.wins1 > 0 && (
                  <div className="h-full bg-gradient-to-r from-neon-blue to-neon-blue/70 rounded-l-full transition-all duration-700"
                    style={{ width: `${(h2h.wins1 / h2h.total) * 100}%` }} />
                )}
                {h2h.draws > 0 && (
                  <div className="h-full bg-border-subtle/60 transition-all duration-700"
                    style={{ width: `${(h2h.draws / h2h.total) * 100}%` }} />
                )}
                {h2h.wins2 > 0 && (
                  <div className="h-full bg-gradient-to-r from-neon-pink/70 to-neon-pink rounded-r-full transition-all duration-700"
                    style={{ width: `${(h2h.wins2 / h2h.total) * 100}%` }} />
                )}
              </div>
              {/* Timeline info */}
              {h2h.firstMatch && h2h.lastMatch && (
                <div className="flex justify-between mt-2 text-[10px] text-text-secondary/60 font-mono">
                  <span>First: {new Date(h2h.firstMatch + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>Last: {new Date(h2h.lastMatch + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom neon line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent" />
      </section>

      {/* ═══════════════════════════════════════════
          FILTERS
          ═══════════════════════════════════════════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-sm font-bold text-text-white flex items-center gap-2">
              <svg className="w-4 h-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {activeFilters > 0 && (
                <span className="px-1.5 py-0.5 rounded-md bg-neon-blue/15 text-neon-blue text-[10px] font-mono">{activeFilters}</span>
              )}
            </h3>
            {activeFilters > 0 && (
              <button onClick={resetFilters} className="text-[11px] text-text-secondary hover:text-neon-blue transition-colors">
                Reset all
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            <Select label="Year" value={year} onChange={setYear}>
              <option value="">All years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </Select>

            <Select label="Promotion" value={showSeriesId} onChange={setShowSeriesId}>
              <option value="">All promotions</option>
              {showSeries.map(s => <option key={s.id} value={s.id}>{s.short_name || s.name}</option>)}
            </Select>

            <Select label="Match Type" value={matchTypeId} onChange={setMatchTypeId}>
              <option value="">All types</option>
              {matchTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>

            <Select label="Min. Rating" value={minRating} onChange={setMinRating}>
              <option value="">Any rating</option>
              {[1,2,3,4,5,6,7,8,9,10].map(r => <option key={r} value={r}>{r}+/10</option>)}
            </Select>

            <Select label={`Result (${s1.name.split(' ').pop()})`} value={result} onChange={setResult}>
              <option value="">Any result</option>
              <option value="win">Wins</option>
              <option value="loss">Losses</option>
              <option value="draw">Draws / No Contest</option>
            </Select>

            <Select label="Finish Type" value={resultType} onChange={setResultType}>
              <option value="">Any finish</option>
              {['pinfall','submission','dq','count_out','ko','referee_stoppage','escape','retrieve','last_elimination','forfeit','no_contest','time_limit_draw','other']
                .map(r => <option key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
            </Select>

            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-tertiary/30 border border-border-subtle/20 cursor-pointer hover:border-neon-blue/20 transition-colors col-span-1">
              <input type="checkbox" checked={champOnly} onChange={e => setChampOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-neon-blue" />
              <span className="text-[11px] text-text-secondary">🏆 Championship</span>
            </label>

            <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg-tertiary/30 border border-border-subtle/20 cursor-pointer hover:border-neon-blue/20 transition-colors col-span-1">
              <input type="checkbox" checked={titleChangeOnly} onChange={e => setTitleChangeOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded accent-neon-blue" />
              <span className="text-[11px] text-text-secondary">🔄 Title Change</span>
            </label>
          </div>

          {/* Filtered H2H mini summary */}
          {activeFilters > 0 && (
            <div className="mt-3 pt-3 border-t border-border-subtle/20 flex items-center gap-4 text-xs text-text-secondary">
              <span>Filtered: <span className="text-text-white font-mono">{filteredH2h.total}</span> match{filteredH2h.total !== 1 ? 'es' : ''}</span>
              <span className="text-neon-blue font-mono">{filteredH2h.wins1}W</span>
              <span className="text-neon-pink font-mono">{filteredH2h.wins2}W</span>
              <span className="text-text-secondary/60 font-mono">{filteredH2h.draws}D</span>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          MATCH TABLE
          ═══════════════════════════════════════════ */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-16">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-text-secondary">
            <p className="text-4xl mb-3 opacity-30">🤼</p>
            <p className="text-lg font-display text-text-white mb-1">No matches found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden lg:grid grid-cols-[100px_1fr_180px_1fr_160px_80px] gap-3 px-4 py-2 text-[10px] text-text-secondary/60 uppercase tracking-widest font-mono border-b border-border-subtle/20 mb-2">
              <span>Date</span>
              <span>Show</span>
              <span>Match Type</span>
              <span>Participants</span>
              <span>Championship</span>
              <span className="text-right">Rating</span>
            </div>

            <div className="space-y-1.5">
              {filtered.map((m) => (
                <MatchRow key={m.id} match={m} s1={s1} s2={s2} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* SEO-only content (hidden for users, visible for crawlers) */}
      <section className="sr-only" aria-hidden="false">
        <h1>{s1.name} vs {s2.name} — Complete Match History</h1>
        <p>Full head-to-head record between {s1.name} and {s2.name} on Pinfall Data. {initialMatchCount} matches analyzed with results, ratings, championships, and detailed statistics.</p>
      </section>
    </div>
  )
}

/* ═══════════════════════════════════════════
   MATCH ROW
   ═══════════════════════════════════════════ */
function MatchRow({ match: m, s1, s2 }: { match: VersusMatch; s1: Superstar; s2: Superstar }) {
  const showHref = m.show?.slug ? `/shows/${m.show.slug}` : '#'
  const matchHref = m.show?.slug && m.slug ? `/shows/${m.show.slug}/matches/${m.slug}` : '#'

  const outcomeColor = m.outcome === 'win' ? 'border-l-neon-blue' : m.outcome === 'loss' ? 'border-l-neon-pink' : 'border-l-border-subtle/50'

  // Group participants by team
  const teams: Record<number, any[]> = {}
  for (const p of (m.participants || [])) {
    const tn = p.team_number ?? 0
    if (!teams[tn]) teams[tn] = []
    teams[tn].push(p)
  }
  const teamEntries = Object.entries(teams).sort(([a], [b]) => parseInt(a) - parseInt(b))

  const fmtDate = m.date ? new Date(m.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  return (
    <Link href={matchHref}
      className={`group block rounded-xl border border-border-subtle/15 bg-bg-secondary/15 hover:bg-bg-secondary/30 hover:border-neon-blue/15 transition-all duration-200 border-l-[3px] ${outcomeColor}`}>

      {/* Desktop */}
      <div className="hidden lg:grid grid-cols-[100px_1fr_180px_1fr_160px_80px] gap-3 items-center px-4 py-3">
        {/* Date */}
        <span className="text-xs text-text-secondary font-mono">{fmtDate}</span>

        {/* Show */}
        <div className="flex items-center gap-2 min-w-0">
          {m.show?.show_series?.logo_url && (
            <div className="w-5 h-5 shrink-0 rounded overflow-hidden">
              <Image src={m.show.show_series.logo_url} alt="" width={20} height={20} className="w-full h-full object-contain" />
            </div>
          )}
          <span className="text-xs text-text-white truncate group-hover:text-neon-blue transition-colors">{m.show?.name || '—'}</span>
        </div>

        {/* Match Type */}
        <span className="text-xs text-text-secondary truncate">{m.match_type?.name || 'Match'}</span>

        {/* Participants */}
        <div className="flex items-center gap-1 flex-wrap">
          {teamEntries.map(([tn, members], ti) => (
            <span key={tn} className="flex items-center gap-1">
              {ti > 0 && <span className="text-[10px] text-neon-blue/60 font-bold mx-0.5">vs</span>}
              {members.map((p: any, pi: number) => (
                <span key={p.superstar?.id || pi} className="flex items-center gap-1">
                  {pi > 0 && <span className="text-[9px] text-text-secondary/40">&</span>}
                  {p.superstar?.photo_url && (
                    <div className="w-5 h-5 rounded-full overflow-hidden border border-border-subtle/20 shrink-0">
                      <Image src={p.superstar.photo_url} alt="" width={20} height={20} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className={`text-[11px] ${p.is_winner ? 'text-text-white font-bold' : 'text-text-secondary'} ${p.superstar?.id === s1.id ? 'text-neon-blue' : ''} ${p.superstar?.id === s2.id ? 'text-neon-pink' : ''}`}>
                    {p.superstar?.name || '?'}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </div>

        {/* Championship */}
        <div className="flex items-center gap-1.5 min-w-0">
          {m.championship ? (
            <>
              {m.championship.image_url && (
                <div className="w-6 h-6 shrink-0">
                  <Image src={m.championship.image_url} alt="" width={24} height={24} className="w-full h-full object-contain" />
                </div>
              )}
              <span className="text-[10px] text-neon-blue truncate">{m.championship.name}</span>
              {m.is_title_change && <span className="text-[9px] px-1 py-0.5 rounded bg-status-danger/15 text-status-danger font-bold">NEW!</span>}
            </>
          ) : (
            <span className="text-[10px] text-text-secondary/30">—</span>
          )}
        </div>

        {/* Rating */}
        <div className="text-right">
          {m.rating ? (
            <span className="text-xs text-yellow-400 font-mono font-bold">{m.rating}<span className="text-yellow-400/40">/10</span></span>
          ) : (
            <span className="text-[10px] text-text-secondary/30">—</span>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {m.show?.show_series?.logo_url && (
              <div className="w-4 h-4 shrink-0 rounded overflow-hidden">
                <Image src={m.show.show_series.logo_url} alt="" width={16} height={16} className="w-full h-full object-contain" />
              </div>
            )}
            <span className="text-xs text-text-white font-medium truncate max-w-[180px]">{m.show?.name || '—'}</span>
          </div>
          <span className="text-[10px] text-text-secondary font-mono shrink-0">{fmtDate}</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-text-secondary/70">{m.match_type?.name || 'Match'}</span>
          {m.championship && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-blue/10 text-neon-blue">🏆 {m.championship.name}</span>
          )}
          {m.is_title_change && (
            <span className="text-[9px] px-1 py-0.5 rounded bg-status-danger/15 text-status-danger font-bold">TITLE CHANGE</span>
          )}
          {m.rating && (
            <span className="text-[10px] text-yellow-400 font-mono ml-auto">{m.rating}★</span>
          )}
        </div>

        {/* Participants */}
        <div className="flex items-center gap-1 flex-wrap">
          {teamEntries.map(([tn, members], ti) => (
            <span key={tn} className="flex items-center gap-0.5">
              {ti > 0 && <span className="text-[9px] text-neon-blue/60 font-bold mx-0.5">vs</span>}
              {members.map((p: any, pi: number) => (
                <span key={p.superstar?.id || pi} className="flex items-center gap-0.5">
                  {pi > 0 && <span className="text-[8px] text-text-secondary/40">&</span>}
                  {p.superstar?.photo_url && (
                    <div className="w-4 h-4 rounded-full overflow-hidden border border-border-subtle/20 shrink-0">
                      <Image src={p.superstar.photo_url} alt="" width={16} height={16} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className={`text-[10px] ${p.is_winner ? 'font-bold' : ''} ${p.superstar?.id === s1.id ? 'text-neon-blue' : p.superstar?.id === s2.id ? 'text-neon-pink' : 'text-text-secondary'}`}>
                    {p.superstar?.name || '?'}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

/* ═══════════════════════════════════════════
   SELECT COMPONENT
   ═══════════════════════════════════════════ */
function Select({ label, value, onChange, children }: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[9px] text-text-secondary/50 uppercase tracking-wider mb-1 font-mono">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2.5 py-2 rounded-lg bg-bg-tertiary/40 border border-border-subtle/20 text-text-primary text-xs focus:border-neon-blue/40 focus:outline-none transition-colors appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 6px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '28px',
        }}
      >
        {children}
      </select>
    </div>
  )
}
