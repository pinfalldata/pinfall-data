'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ShareButtons } from '@/components/ui/ShareButtons'

function fmt(d: string | null) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
function fmtDur(s: number) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, '0')}` }

// Get the arena name valid at a specific date
function getArenaNameAtDate(arenaNames: any[], date: string | null, fallbackName: string): string {
  if (!arenaNames || arenaNames.length === 0 || !date) return fallbackName
  for (let i = arenaNames.length - 1; i >= 0; i--) {
    const an = arenaNames[i]
    const start = an.start_date || '0000-01-01'
    const end = an.end_date || '9999-12-31'
    if (date >= start && date <= end) return an.name
  }
  return fallbackName
}

// ★ ROBUST FIX: Get current arena name from arena_names (client-side)
// Handles is_current as: true, 'true', 1, '1', etc.
function getCurrentName(names: any[], fallback: string): string {
  if (!names || names.length === 0) return fallback
  // Strategy 1: explicit is_current flag
  const current = names.find((n: any) => 
    n.is_current === true || n.is_current === 'true' || n.is_current === 1 || n.is_current === '1'
  )
  if (current) return current.name
  // Strategy 2: no end_date = still current
  const openEnded = names.find((n: any) => !n.end_date || n.end_date === null)
  if (openEnded) return openEnded.name
  // Strategy 3: latest start_date
  const sorted = [...names].sort((a: any, b: any) => (b.start_date || '').localeCompare(a.start_date || ''))
  return sorted[0]?.name || fallback
}

const showTypeLabels: Record<string, string> = {
  ppv: 'PPV / PLE', weekly: 'TV Show', special: 'Special', tournament: 'Tournament', other: 'Other', house_show: 'House Show',
}
const resultLabels: Record<string, string> = {
  pinfall: 'Pinfall', submission: 'Submission', dq: 'Disqualification', count_out: 'Count Out', no_contest: 'No Contest', forfeit: 'Forfeit', ko: 'Knockout', referee_stoppage: 'Referee Stoppage', escape: 'Escape', retrieve: 'Retrieve', last_elimination: 'Last Elimination', time_limit_draw: 'Time Limit Draw', other: 'Other',
}

type TabKey = 'shows' | 'superstars' | 'stats'

export default function ArenaDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const t = useTranslations()
  const [arena, setArena] = useState<any>(null)
  const [shows, setShows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [prevArena, setPrevArena] = useState<any>(null)
  const [nextArena, setNextArena] = useState<any>(null)
  const [arenaNames, setArenaNames] = useState<any[]>([])
  const [tab, setTab] = useState<TabKey>('shows')

  // ★ FIX: Compute display name CLIENT-SIDE from arenaNames
  const displayName = arenaNames.length > 0 ? getCurrentName(arenaNames, arena?.name || '') : (arena?.name || '')

  // Superstars
  const [stars, setStars] = useState<any[]>([])
  const [starsTotal, setStarsTotal] = useState(0)
  const [starsPage, setStarsPage] = useState(1)
  const [starsTotalPages, setStarsTotalPages] = useState(0)
  const [starsLoading, setStarsLoading] = useState(false)

  // Stats
  const [stats, setStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const fetchShows = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const r = await fetch(`/api/arena-detail?slug=${slug}&page=${p}&limit=50`)
      const d = await r.json()
      if (d.arena) setArena(d.arena)
      if (d.arenaNames) setArenaNames(d.arenaNames)
      setShows(d.shows || [])
      setTotal(d.total || 0)
      setTotalPages(d.totalPages || 1)
      setPage(d.page || 1)
      if (d.prevArena) setPrevArena(d.prevArena)
      if (d.nextArena) setNextArena(d.nextArena)
    } catch {}
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchShows(1) }, [fetchShows])

  const fetchStars = useCallback(async (p: number) => {
    if (!arena) return
    setStarsLoading(true)
    try {
      const r = await fetch(`/api/arena-superstars?arenaId=${arena.id}&page=${p}&limit=60`)
      const d = await r.json()
      setStars(d.superstars || [])
      setStarsTotal(d.total || 0)
      setStarsTotalPages(d.totalPages || 0)
      setStarsPage(d.page || 1)
    } catch {}
    setStarsLoading(false)
  }, [arena])

  useEffect(() => { if (tab === 'superstars' && stars.length === 0 && arena) fetchStars(1) }, [tab, arena, stars.length, fetchStars])

  const fetchStats = useCallback(async () => {
    if (!arena) return
    setStatsLoading(true)
    try {
      const r = await fetch(`/api/arena-stats?arenaId=${arena.id}`)
      const d = await r.json()
      setStats(d.stats || null)
    } catch {}
    setStatsLoading(false)
  }, [arena])

  useEffect(() => { if (tab === 'stats' && !stats && arena) fetchStats() }, [tab, arena, stats, fetchStats])

  const goPage = (n: number) => { if (n < 1 || n > totalPages) return; fetchShows(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const goStarsPage = (n: number) => { if (n < 1 || n > starsTotalPages) return; fetchStars(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <div className="relative min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[240px] sm:h-[320px] lg:h-[400px] xl:h-[440px] overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
        {arena?.image_url && (
          <Image
            src={arena.image_url}
            alt={displayName || 'Arena'}
            fill
            priority
            sizes="100vw"
            quality={100}
            unoptimized
            className="object-cover object-center"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <nav className="hidden sm:flex items-center gap-2 text-xs text-text-secondary mb-3">
            <Link href="/matches" className="hover:text-neon-blue transition-colors">Matches</Link>
            <span className="text-border-subtle">/</span>
            <span className="text-neon-blue">Arena</span>
          </nav>
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            {displayName || <span className="bg-bg-secondary/50 rounded w-60 h-10 inline-block animate-pulse" />}
          </h1>
          {/* ★ FIX: Former names — MUCH more visible */}
          {arenaNames.filter(an => an.name !== displayName).length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mb-2">
              <span className="text-xs text-text-secondary font-medium">Formerly known as:</span>
              {arenaNames.filter(an => an.name !== displayName).map((an, i) => (
                <span key={an.id || i} className="text-sm text-neon-blue font-semibold italic">
                  {an.name}
                  {an.start_date && (
                    <span className="text-xs text-text-secondary/70 font-normal ml-1">
                      ({an.start_date.substring(0, 4)}–{an.end_date ? an.end_date.substring(0, 4) : 'now'})
                    </span>
                  )}
                  {i < arenaNames.filter(an2 => an2.name !== displayName).length - 1 && (
                    <span className="text-text-secondary/40 mx-1">·</span>
                  )}
                </span>
              ))}
            </div>
          )}
          {arena && (
            <p className="text-text-secondary text-sm sm:text-base text-center">
              {[arena.city, arena.state_province, arena.country].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {/* Prev/Next */}
        {prevArena && <Link href={`/arenas/${prevArena.slug}`} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-primary/80 border border-border-subtle/30 backdrop-blur-sm hover:border-neon-blue/30 transition-all"><svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg><div className="hidden sm:block"><p className="text-[9px] text-text-secondary uppercase">Prev</p><p className="text-xs text-text-white font-medium truncate max-w-[120px]">{prevArena.name}</p></div></Link>}
        {nextArena && <Link href={`/arenas/${nextArena.slug}`} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-primary/80 border border-border-subtle/30 backdrop-blur-sm hover:border-neon-blue/30 transition-all"><div className="hidden sm:block text-right"><p className="text-[9px] text-text-secondary uppercase">{t('common.next')}</p><p className="text-xs text-text-white font-medium truncate max-w-[120px]">{nextArena.name}</p></div><svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></Link>}
      </section>

      {/* ===== INFO BAR ===== */}
      {arena && (
        <section className="bg-bg-secondary/30 border-y border-border-subtle/20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
              {arena.capacity && <div className="text-center"><span className="block text-[10px] text-text-secondary uppercase tracking-wider">{t('arenas.detail.capacity')}</span><span className="text-text-white font-bold">{arena.capacity.toLocaleString()}</span></div>}
              {arena.opened_year && <div className="text-center"><span className="block text-[10px] text-text-secondary uppercase tracking-wider">{t('arenas.detail.opened')}</span><span className="text-text-white font-semibold">{arena.opened_year}</span></div>}
              <div className="text-center"><span className="block text-[10px] text-text-secondary uppercase tracking-wider">{t('arenas.detail.totalEvents')}</span><span className="text-neon-blue font-bold text-lg">{total}</span></div>
              {arena.city && <div className="text-center"><span className="block text-[10px] text-text-secondary uppercase tracking-wider">{t('arenas.detail.location')}</span><span className="text-text-white font-semibold">{arena.city}{arena.country ? `, ${arena.country}` : ''}</span></div>}
            </div>

            {/* Arena name history timeline */}
            {arenaNames.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border-subtle/15">
                <p className="text-[10px] text-text-secondary uppercase tracking-wider text-center mb-2">Name History</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {arenaNames.map((an, i) => (
                    <div key={an.id || i} className="flex items-center gap-1.5">
                      {i > 0 && <span className="text-text-secondary/30 text-xs">›</span>}
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs ${an.name === displayName ? 'border-neon-blue/30 bg-neon-blue/10 text-neon-blue font-bold' : 'border-border-subtle/20 bg-bg-tertiary/30 text-text-secondary'}`}>
                        <span>{an.name}</span>
                        <span className="text-[9px] opacity-60">
                          {an.start_date ? an.start_date.substring(0, 4) : '?'}–{an.end_date ? an.end_date.substring(0, 4) : 'now'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===== TABS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {([
            { key: 'shows' as TabKey, label: '📺 Shows', count: total },
            { key: 'superstars' as TabKey, label: '💪 Superstars', count: starsTotal || null },
            { key: 'stats' as TabKey, label: '📊 Statistics' },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium border whitespace-nowrap transition-all ${
                tab === t.key
                  ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue'
                  : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'
              }`}
            >
              {t.label}
              {t.count ? <span className="ml-1.5 text-[10px] opacity-70">({t.count})</span> : null}
            </button>
          ))}
        </div>
      </section>

      {/* ===== SHOWS TAB ===== */}
      {tab === 'shows' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-bg-secondary/30 animate-pulse" />)}</div>
          ) : shows.length === 0 ? (
            <p className="text-center text-text-secondary py-16">No events found at this arena.</p>
          ) : (
            <>
              {/* Desktop header */}
              <div className="hidden lg:grid lg:grid-cols-[100px_minmax(80px,0.5fr)_minmax(200px,2fr)_100px_120px] gap-4 px-4 pb-2 text-[9px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-1">
                <span>{t('matches.search.date')}</span><span>{t('matches.search.type')}</span><span>{t('arenas.detail.event')}</span><span>{t('shows.series.attendance')}</span><span>{arenaNames.length > 1 ? 'Venue Name' : 'Show'}</span>
              </div>

              <div className="space-y-0.5">
                {shows.map((s: any) => {
                  const nameAtDate = arenaNames.length > 1 ? getArenaNameAtDate(arenaNames, s.date, displayName || '') : null
                  const isDiff = nameAtDate && nameAtDate !== displayName
                  return (
                  <Link key={s.id} href={`/shows/${s.slug}`} className="group block">
                    <div className="hidden lg:grid lg:grid-cols-[100px_minmax(80px,0.5fr)_minmax(200px,2fr)_100px_120px] gap-4 items-center px-4 py-3 rounded-lg border border-transparent hover:bg-bg-secondary/40 hover:border-border-subtle/20 transition-all">
                      <span className="text-xs text-text-secondary font-mono">{fmt(s.date)}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-tertiary border border-border-subtle/20 text-text-secondary text-center truncate">{showTypeLabels[s.show_type] || s.show_type}</span>
                      <div className="flex items-center gap-2 min-w-0">
                        {s.show_series?.logo_url && <div className="w-6 h-6 rounded overflow-hidden shrink-0"><Image src={s.show_series.logo_url} alt="" width={24} height={24} className="w-full h-full object-contain" /></div>}
                        <span className="text-sm text-text-white font-medium truncate group-hover:text-neon-blue transition-colors">{s.name}</span>
                      </div>
                      <span className="text-xs text-text-secondary font-mono text-right">{s.attendance ? s.attendance.toLocaleString() : '—'}</span>
                      <span className="text-[10px] truncate">{isDiff ? <span className="text-neon-blue/70 italic">{nameAtDate}</span> : <span className="text-neon-blue">{s.show_series?.short_name || s.show_series?.name || ''}</span>}</span>
                    </div>
                    <div className="lg:hidden flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent hover:bg-bg-secondary/40 hover:border-border-subtle/20 transition-all">
                      {s.show_series?.logo_url && <div className="w-8 h-8 rounded overflow-hidden shrink-0"><Image src={s.show_series.logo_url} alt="" width={32} height={32} className="w-full h-full object-contain" /></div>}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text-white font-medium truncate group-hover:text-neon-blue">{s.name}</p>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-text-secondary">
                          <span className="font-mono">{fmt(s.date)}</span><span>•</span><span>{showTypeLabels[s.show_type] || s.show_type}</span>
                          {s.attendance && <><span>•</span><span>{s.attendance.toLocaleString()}</span></>}
                        </div>
                        {isDiff && <p className="text-[9px] text-neon-blue/60 italic mt-0.5">as {nameAtDate}</p>}
                      </div>
                      <svg className="w-4 h-4 text-text-secondary/30 group-hover:text-neon-blue shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </Link>
                  )
                })}
              </div>

              {totalPages > 1 && <Pag page={page} tp={totalPages} total={total} go={goPage} label="events" />}
            </>
          )}
        </section>
      )}

      {/* ===== SUPERSTARS TAB ===== */}
      {tab === 'superstars' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <h2 className="font-display text-lg font-bold text-text-white mb-6">
            Superstars <span className="text-text-secondary font-normal text-sm">({starsTotal})</span>
          </h2>
          {starsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-48 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
          ) : stars.length === 0 ? (
            <p className="text-center text-text-secondary py-16">No superstars found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {stars.map(m => (
                  <Link key={m.id} href={`/superstars/${m.slug}`}
                    className="group rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 card-glow">
                    <div className="relative aspect-square bg-bg-tertiary/30 overflow-hidden">
                      {m.photo_url ? (
                        <Image src={m.photo_url} alt={m.name} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-300" sizes="200px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><span className="text-3xl opacity-20">👤</span></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent" />
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-text-white group-hover:text-neon-blue transition-colors truncate">{m.name}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-text-secondary">
                        <span><span className="text-neon-blue font-bold">{m.appearances}</span> match{m.appearances !== 1 ? 'es' : ''}</span>
                        {m.wins > 0 && <span>• <span className="text-emerald-400 font-bold">{m.wins}W</span></span>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              {starsTotalPages > 1 && <Pag page={starsPage} tp={starsTotalPages} total={starsTotal} go={goStarsPage} label="superstars" />}
            </>
          )}
        </section>
      )}

      {/* ===== STATS TAB ===== */}
      {tab === 'stats' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <h2 className="font-display text-lg font-bold text-text-white mb-6">Statistics</h2>
          {statsLoading || !stats ? (
            <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-8">
              {/* Key stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { l: t('arenas.stats.totalEvents'), v: stats.totalShows, c: 'text-neon-blue' },
                  { l: t('arenas.stats.totalMatches'), v: stats.totalMatches, c: 'text-text-white' },
                  { l: t('arenas.stats.totalAttendance'), v: stats.totalAttendance?.toLocaleString(), c: 'text-neon-blue' },
                  { l: t('arenas.stats.avgAttendance'), v: stats.avgAttendance?.toLocaleString(), c: 'text-text-white' },
                  { l: t('arenas.stats.avgRating'), v: stats.avgRating ? `${stats.avgRating}★` : '—', c: 'text-yellow-400' },
                  { l: t('arenas.stats.titleChanges'), v: stats.titleChanges, c: 'text-neon-blue' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-4 text-center">
                    <span className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">{s.l}</span>
                    <span className={`block text-xl font-bold font-display ${s.c}`}>{s.v}</span>
                  </div>
                ))}
              </div>

              {/* Additional stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.maxAttendance > 0 && <div className="rounded-2xl border border-neon-blue/20 bg-neon-blue/5 p-4 text-center"><span className="block text-[10px] text-text-secondary uppercase mb-1">{t('arenas.stats.recordAttendance')}</span><span className="block text-xl font-bold text-neon-blue">{stats.maxAttendance?.toLocaleString()}</span>{stats.maxAttendanceShow && <span className="block text-[10px] text-text-secondary mt-0.5">{fmt(stats.maxAttendanceShow.date)}</span>}</div>}
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-4 text-center"><span className="block text-[10px] text-text-secondary uppercase mb-1">{t('arenas.stats.firstEvent')}</span><span className="block text-sm font-bold text-text-white">{fmt(stats.firstShowDate)}</span></div>
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-4 text-center"><span className="block text-[10px] text-text-secondary uppercase mb-1">{t('arenas.stats.lastEvent')}</span><span className="block text-sm font-bold text-text-white">{fmt(stats.lastShowDate)}</span></div>
                {stats.avgDuration && <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-4 text-center"><span className="block text-[10px] text-text-secondary uppercase mb-1">{t('arenas.stats.avgMatchLength')}</span><span className="block text-xl font-bold text-text-white">{fmtDur(stats.avgDuration)}</span></div>}
              </div>

              {/* By decade & by series */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {stats.byDecade?.length > 0 && (
                  <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                    <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">{t('arenas.stats.eventsByDecade')}</h3>
                    <div className="space-y-2">{stats.byDecade.map((d: any) => { const mx = Math.max(...stats.byDecade.map((x: any) => x.count)); return <div key={d.decade} className="flex items-center gap-2"><span className="text-xs text-text-secondary w-10 font-mono">{d.decade}</span><div className="flex-1 h-2.5 rounded-full bg-bg-tertiary/50 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-neon-blue/60 to-neon-blue" style={{ width: `${(d.count / mx) * 100}%` }} /></div><span className="text-xs text-neon-blue font-bold w-8 text-right">{d.count}</span></div> })}</div>
                  </div>
                )}
                {stats.bySeries?.length > 0 && (
                  <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                    <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">{t('arenas.stats.showsBySeries')}</h3>
                    <div className="space-y-2">{stats.bySeries.slice(0, 10).map((s: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        {s.logo_url && <div className="w-5 h-5 rounded overflow-hidden shrink-0"><Image src={s.logo_url} alt="" width={20} height={20} className="w-full h-full object-contain" /></div>}
                        <span className="text-xs text-text-white flex-1 truncate">{s.short_name || s.name}</span>
                        <span className="text-xs text-neon-blue font-bold">{s.count}</span>
                      </div>
                    ))}</div>
                  </div>
                )}
              </div>

              {/* Win methods & match types */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {stats.winMethods?.length > 0 && (
                  <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                    <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">{t('arenas.stats.winMethods')}</h3>
                    <div className="space-y-2">{stats.winMethods.slice(0, 8).map((wm: any) => (
                      <div key={wm.method} className="flex items-center gap-2">
                        <span className="text-xs text-text-white w-28 truncate">{resultLabels[wm.method] || wm.method}</span>
                        <div className="flex-1 h-2 rounded-full bg-bg-tertiary/50 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-neon-blue/60 to-neon-blue" style={{ width: `${wm.percentage}%` }} /></div>
                        <span className="text-[10px] text-text-secondary font-mono w-16 text-right">{wm.count} ({wm.percentage}%)</span>
                      </div>
                    ))}</div>
                  </div>
                )}
                {stats.topMatchTypes?.length > 0 && (
                  <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                    <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">{t('arenas.stats.topMatchTypes')}</h3>
                    <div className="space-y-2">{stats.topMatchTypes.slice(0, 8).map((mt: any, i: number) => (
                      <Link key={mt.id} href={`/matches/stipulations/${mt.slug}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-tertiary/30 transition-all">
                        <span className="w-5 h-5 rounded bg-neon-blue/10 flex items-center justify-center text-[9px] text-neon-blue font-bold">{i + 1}</span>
                        <span className="text-xs text-text-white flex-1 truncate">{mt.name}</span>
                        <span className="text-xs text-neon-blue font-bold">{mt.count}</span>
                      </Link>
                    ))}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Share */}
      {arena && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-4">
          <ShareButtons title={`${displayName || "Arena"} — WWE Arena History | Pinfall Data`} />
        </div>
      )}

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            <span className="text-neon-blue">{displayName || 'Arena'}</span> — Complete WWE Event History
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Full history of every WWE event held at {displayName || 'this arena'}
            {arena?.city ? ` in ${arena.city}` : ''}. Browse all shows, discover which superstars competed here the most, 
            and explore detailed statistics including attendance records, match ratings, and title changes — only on Pinfall Data.
          </p>
        </div>
      </section>
    </div>
  )
}

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
        <button onClick={() => go(page - 1)} disabled={page === 1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        {vis().map((p, i) => p === 'e' ? <span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span> :
          <button key={p} onClick={() => go(p as number)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue' : 'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{p}</button>)}
        <button onClick={() => go(page + 1)} disabled={page === tp} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
      </div>
    </div>
  )
}
