'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/* ============================================================
   TYPES
   ============================================================ */
interface SegmentData {
  id: number; slug: string; title: string; category: string
  image_url: string | null; duration_seconds: number | null; rating: number | null
  show: {
    id: number; name: string; slug: string; date: string
    city: string | null; country: string | null
    show_series: { id: number; name: string; short_name: string | null; logo_url: string | null } | null
  } | null
  participants: { id: number; name: string; slug: string; photo_url: string | null; role: string }[]
  omg: { id: number; title: string; category: string } | null
}

interface Filters {
  year: string; month: string
  category: string
  superstarId: string; superstarName: string
  superstar2Id: string; superstar2Name: string
  showSeriesId: string
  country: string; city: string
  omgOnly: boolean; omgCategory: string
}

interface FilterOptions {
  segmentCategories: { value: string; count: number }[]
  showSeries: { id: number; name: string; short_name: string | null }[]
  countries: string[]
  omgCategories: { value: string; label: string }[]
}

const PER_PAGE = 50
const defaultFilters: Filters = {
  year: '', month: '', category: '',
  superstarId: '', superstarName: '',
  superstar2Id: '', superstar2Name: '',
  showSeriesId: '', country: '', city: '',
  omgOnly: false, omgCategory: '',
}

const YEAR0 = 1953
const NOW_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: NOW_YEAR - YEAR0 + 1 }, (_, i) => NOW_YEAR - i)

const CAT_LABELS: Record<string, { label: string; icon: string }> = {
  in_ring_segment: { label: 'In-Ring Segment', icon: '🎤' },
  backstage: { label: 'Backstage', icon: '🚪' },
  interference: { label: 'Interference', icon: '⚡' },
  ceremony: { label: 'Ceremony', icon: '🏆' },
  authority: { label: 'Authority', icon: '👔' },
  psychology: { label: 'Mind Games', icon: '🧠' },
  props_spectacle: { label: 'Spectacle', icon: '🔥' },
  medical_injury: { label: 'Medical', icon: '🏥' },
  musical: { label: 'Musical', icon: '🎵' },
  fan_engagement: { label: 'Fan Engagement', icon: '👏' },
  broadcast: { label: 'Broadcast', icon: '📺' },
  digital: { label: 'Digital', icon: '📱' },
  interview: { label: 'Interview', icon: '🎙️' },
  promo: { label: 'Promo', icon: '📢' },
  entrance: { label: 'Entrance', icon: '🎵' },
  video_package: { label: 'Video Package', icon: '📹' },
  announcement: { label: 'Announcement', icon: '📣' },
  other: { label: 'Other', icon: '📋' },
}

const OMG_COLORS: Record<string, string> = {
  extreme: '#ef4444', wtf: '#a855f7', sexy: '#ec4899',
  return: '#22c55e', betrayal: '#f97316', emotional: '#3b82f6',
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function fmtDuration(s: number) {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/* ============================================================
   MAIN PAGE
   ============================================================ */
export default function SegmentSearchPage() {
  const [segments, setSegments] = useState<SegmentData[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [init, setInit] = useState(true)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [opts, setOpts] = useState<FilterOptions>({ segmentCategories: [], showSeries: [], countries: [], omgCategories: [] })
  const [showF, setShowF] = useState(true)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { if (typeof window !== 'undefined' && window.innerWidth < 640) setShowF(false) }, [])

  useEffect(() => {
    fetch('/api/segment-search-filters').then(r => r.json()).then(d => setOpts(d)).catch(() => {})
  }, [])

  const fetchS = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) })
    if (filters.year) p.set('year', filters.year)
    if (filters.year && filters.month) p.set('month', filters.month)
    if (filters.category) p.set('category', filters.category)
    if (filters.superstarId) p.set('superstarId', filters.superstarId)
    if (filters.superstar2Id) p.set('superstar2Id', filters.superstar2Id)
    if (filters.showSeriesId) p.set('showSeriesId', filters.showSeriesId)
    if (filters.country) p.set('country', filters.country)
    if (filters.city) p.set('city', filters.city)
    if (filters.omgOnly) p.set('omgOnly', 'true')
    if (filters.omgCategory) p.set('omgCategory', filters.omgCategory)
    try {
      const r = await fetch(`/api/segment-search?${p.toString()}`)
      const d = await r.json()
      setSegments(d.segments || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 0)
    } catch { setSegments([]); setTotal(0) }
    finally { setLoading(false); setInit(false) }
  }, [page, filters])

  useEffect(() => { fetchS() }, [fetchS])

  const upd = (k: keyof Filters, v: string | boolean) => { setFilters(p => ({ ...p, [k]: v })); setPage(1) }
  const reset = () => { setFilters(defaultFilters); setPage(1) }
  const hasF = Object.entries(filters).some(([, v]) => v !== '' && v !== false)
  const fCount = Object.entries(filters).filter(([, v]) => v !== '' && v !== false).length
  const goP = (n: number) => { setPage(n); ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/WWE_superstars_2026-03-21_15_07_50.510067.jpg.png"
          alt="WWE Segment Search" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            <span className="text-neon-blue">Segment</span> Search
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            Search every WWE segment ever — promos, backstage confrontations, ceremonies, interviews, and more.
          </p>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section ref={ref} className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 lg:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
          <p className="text-text-secondary text-sm">
            {loading && !init ? 'Searching…' : `${total.toLocaleString()} segment${total !== 1 ? 's' : ''} found`}
          </p>
          <button onClick={() => setShowF(!showF)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showF ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/50 border-border-subtle/30 text-text-secondary hover:text-text-white'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            {showF ? 'Hide Filters' : 'Show Filters'}
            {fCount > 0 && <span className="w-5 h-5 rounded-full bg-neon-blue text-[10px] text-black font-bold flex items-center justify-center">{fCount}</span>}
          </button>
        </div>

        {/* ===== FILTERS ===== */}
        {showF && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm animate-fade-in">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <Sel label="Year" value={filters.year} set={v => upd('year', v)} opts={YEARS.map(y => ({ value: String(y), label: String(y) }))} ph="All years" />
              {filters.year && <Sel label="Month" value={filters.month} set={v => upd('month', v)}
                opts={Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2000, i).toLocaleString('en-US', { month: 'long' }) }))} ph="All months" />}
              <Sel label="Promotion" value={filters.showSeriesId} set={v => upd('showSeriesId', v)}
                opts={opts.showSeries.map(s => ({ value: String(s.id), label: s.name }))} ph="All promotions" />
              <Sel label="Segment Category" value={filters.category} set={v => upd('category', v)}
                opts={opts.segmentCategories.map(c => ({
                  value: c.value,
                  label: `${CAT_LABELS[c.value]?.icon || '📋'} ${CAT_LABELS[c.value]?.label || c.value} (${c.count})`
                }))} ph="All categories" />
              <Sel label="Country" value={filters.country} set={v => upd('country', v)}
                opts={opts.countries.map(c => ({ value: c, label: c }))} ph="All countries" />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">City</label>
                <input type="text" value={filters.city} onChange={e => upd('city', e.target.value)} placeholder="e.g. New York"
                  className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50 transition-colors" />
              </div>
              <SSrch label="Superstar" ph="Search superstar…" value={filters.superstarName}
                onSel={(id, n) => { upd('superstarId', id); setFilters(p => ({ ...p, superstarName: n })) }}
                onClr={() => { upd('superstarId', ''); setFilters(p => ({ ...p, superstarName: '' })) }} />
              {filters.superstarId &&
                <SSrch label="2nd Superstar" ph="Search 2nd superstar…" value={filters.superstar2Name}
                  onSel={(id, n) => { upd('superstar2Id', id); setFilters(p => ({ ...p, superstar2Name: n })) }}
                  onClr={() => { upd('superstar2Id', ''); setFilters(p => ({ ...p, superstar2Name: '' })) }} />
              }
              <Sel label="OMG Category" value={filters.omgCategory} set={v => { upd('omgCategory', v); if (v) setFilters(p => ({ ...p, omgOnly: true })) }}
                opts={opts.omgCategories.map(c => ({ value: c.value, label: c.label }))} ph="Any OMG" />
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle/20">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${filters.omgOnly ? 'bg-purple-500/40' : 'bg-bg-tertiary'}`}
                    onClick={() => upd('omgOnly', !filters.omgOnly)}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${filters.omgOnly ? 'translate-x-[18px] bg-purple-400' : 'translate-x-[2px] bg-text-secondary'}`} />
                  </div>
                  <span className="text-xs text-text-secondary group-hover:text-text-white transition-colors">⚡ OMG Moments only</span>
                </label>
              </div>
              {hasF && <button onClick={reset} className="text-xs text-neon-pink hover:text-neon-pink/80 transition-colors flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Clear all filters
              </button>}
            </div>
          </div>
        )}

        {/* ===== SEGMENT LIST ===== */}
        {init ? (
          <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-[88px] rounded-xl bg-bg-secondary/30 animate-pulse" />)}</div>
        ) : segments.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block opacity-20">🎤</span>
            <p className="text-text-secondary text-lg mb-2">No segments found</p>
            <p className="text-text-secondary/60 text-sm mb-4">Try adjusting your filters</p>
            {hasF && <button onClick={reset} className="text-sm text-neon-blue hover:underline">Clear all filters</button>}
          </div>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden lg:grid lg:grid-cols-[90px_minmax(120px,1.2fr)_110px_minmax(200px,3fr)_minmax(180px,2fr)_70px] gap-3 px-4 pb-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20">
              <span>Date</span><span>Show</span><span>Category</span><span>Title</span><span>Participants</span><span className="text-center">Duration</span>
            </div>
            <div className={`space-y-0.5 mt-0.5 transition-opacity duration-200 ${loading && !init ? 'opacity-50' : 'opacity-100'}`}>
              {segments.map(s => <SRow key={s.id} s={s} />)}
            </div>
            {totalPages > 1 && <Pag page={page} tp={totalPages} total={total} go={goP} />}
          </>
        )}
      </section>

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            About the <span className="text-neon-blue">Segment Search Engine</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            The most comprehensive WWE segment search ever built. Filter through every promo, backstage confrontation,
            ceremony, interview, and special moment by year, superstar, show, category, and OMG Moment status.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Whether you&apos;re looking for iconic Stone Cold promos, emotional retirement speeches, or shocking
            backstage attacks — this search has you covered.
          </p>
        </div>
      </section>
    </div>
  )
}

/* ============================================================
   SEGMENT ROW
   ============================================================ */
function SRow({ s }: { s: SegmentData }) {
  const cat = CAT_LABELS[s.category] || { label: s.category, icon: '📋' }
  const showSlug = s.show?.slug
  const href = showSlug ? `/shows/${showSlug}/segments/${s.slug}` : '#'
  const omgColor = s.omg ? OMG_COLORS[s.omg.category] || '#c7a05a' : null

  return (
    <Link href={href} className="block group">
      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-[90px_minmax(120px,1.2fr)_110px_minmax(200px,3fr)_minmax(180px,2fr)_70px] gap-3 items-center px-4 py-4 rounded-lg border border-transparent transition-all duration-150 hover:bg-bg-secondary/40 hover:border-border-subtle/20"
        style={omgColor ? { borderLeftWidth: '3px', borderLeftColor: `${omgColor}60` } : {}}>
        <span className="text-xs text-text-secondary font-mono whitespace-nowrap">{s.show?.date ? fmtDate(s.show.date) : '—'}</span>
        <div className="flex items-center gap-2 min-w-0">
          {s.show?.show_series?.logo_url && <div className="w-5 h-5 rounded overflow-hidden shrink-0"><Image src={s.show.show_series.logo_url} alt="" width={20} height={20} className="w-full h-full object-contain" /></div>}
          <span className="text-sm text-text-white truncate">{s.show?.name || '—'}</span>
        </div>
        <span className="text-xs font-semibold truncate" style={{ color: '#c7a05a' }}>{cat.icon} {cat.label}</span>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-text-white font-medium truncate group-hover:text-neon-blue transition-colors">{s.title}</span>
          {s.omg && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0"
              style={{ background: `${omgColor}15`, color: omgColor, border: `1px solid ${omgColor}35` }}>
              ⚡ OMG
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 min-w-0 overflow-hidden">
          {s.participants.length > 0 && (
            <>
              <div className="flex -space-x-1.5 shrink-0">
                {s.participants.slice(0, 4).map(p => (
                  <div key={p.id} className="w-7 h-7 rounded-full overflow-hidden border-2 border-bg-primary bg-bg-tertiary">
                    {p.photo_url ? <Image src={p.photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}
                  </div>
                ))}
                {s.participants.length > 4 && <div className="w-7 h-7 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[8px] text-text-secondary">+{s.participants.length - 4}</div>}
              </div>
              <span className="text-xs text-text-secondary truncate">{s.participants.slice(0, 2).map(p => p.name).join(', ')}{s.participants.length > 2 ? ` +${s.participants.length - 2}` : ''}</span>
            </>
          )}
        </div>
        <span className="text-xs text-text-secondary text-center font-mono">{s.duration_seconds ? fmtDuration(s.duration_seconds) : '—'}</span>
      </div>

      {/* Mobile */}
      <div className="lg:hidden px-3 py-4 rounded-xl border border-transparent transition-all hover:bg-bg-secondary/40 hover:border-border-subtle/20"
        style={omgColor ? { borderLeftWidth: '3px', borderLeftColor: `${omgColor}60` } : {}}>
        <div className="flex items-center gap-2 mb-2">
          {s.show?.show_series?.logo_url && <div className="w-4 h-4 rounded overflow-hidden shrink-0"><Image src={s.show.show_series.logo_url} alt="" width={16} height={16} className="w-full h-full object-contain" /></div>}
          <span className="text-[11px] text-text-secondary truncate flex-1">{s.show?.name}</span>
          <span className="text-[10px] text-text-secondary font-mono shrink-0">{s.show?.date ? fmtDate(s.show.date) : ''}</span>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm text-text-white font-medium truncate flex-1 group-hover:text-neon-blue transition-colors">{s.title}</span>
          {s.omg && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider shrink-0"
              style={{ background: `${omgColor}15`, color: omgColor, border: `1px solid ${omgColor}35` }}>
              ⚡ OMG
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase" style={{ color: '#c7a05a' }}>{cat.icon} {cat.label}</span>
          {s.participants.length > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1 shrink-0">
                {s.participants.slice(0, 3).map(p => (
                  <div key={p.id} className="w-5 h-5 rounded-full overflow-hidden border border-bg-primary bg-bg-tertiary">
                    {p.photo_url ? <Image src={p.photo_url} alt="" width={20} height={20} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-text-secondary truncate">{s.participants.slice(0, 2).map(p => p.name).join(', ')}</span>
            </div>
          )}
          {s.duration_seconds && <span className="text-[10px] text-text-secondary ml-auto shrink-0">⏱ {fmtDuration(s.duration_seconds)}</span>}
        </div>
      </div>
    </Link>
  )
}

/* ============================================================
   PAGINATION
   ============================================================ */
function Pag({ page, tp, total, go }: { page: number; tp: number; total: number; go: (n: number) => void }) {
  const vis = () => {
    const p: (number | 'e')[] = []
    if (tp <= 7) { for (let i = 1; i <= tp; i++) p.push(i) }
    else { p.push(1); if (page > 3) p.push('e'); for (let i = Math.max(2, page - 1); i <= Math.min(tp - 1, page + 1); i++) p.push(i); if (page < tp - 2) p.push('e'); p.push(tp) }
    return p
  }
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
      <p className="text-xs text-text-secondary">Page {page} of {tp} — {total.toLocaleString()} segments</p>
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

/* ============================================================
   FILTER SELECT
   ============================================================ */
function Sel({ label, value, set, opts, ph }: { label: string; value: string; set: (v: string) => void; opts: { value: string; label: string }[]; ph: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">{label}</label>
      <select value={value} onChange={e => set(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
        <option value="">{ph}</option>
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

/* ============================================================
   SUPERSTAR SEARCH
   ============================================================ */
function SSrch({ label, ph, value, onSel, onClr }: { label: string; ph: string; value: string; onSel: (id: string, n: string) => void; onClr: () => void }) {
  const [q, setQ] = useState(value)
  const [res, setRes] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const db = useRef<NodeJS.Timeout>()
  const cRef = useRef<HTMLDivElement>(null)
  useEffect(() => { setQ(value) }, [value])
  useEffect(() => {
    const h = (e: MouseEvent) => { if (cRef.current && !cRef.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h)
  }, [])
  const search = (v: string) => {
    setQ(v); if (v.length < 2) { setRes([]); setOpen(false); return }
    clearTimeout(db.current)
    db.current = setTimeout(async () => {
      try { const r = await fetch(`/api/search-superstars?q=${encodeURIComponent(v)}`); const d = await r.json(); setRes(d.results || []); setOpen(true) } catch { setRes([]) }
    }, 300)
  }
  return (
    <div ref={cRef} className="flex flex-col gap-1 relative">
      <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">{label}</label>
      <div className="relative">
        <input type="text" value={q} onChange={e => search(e.target.value)} onFocus={() => res.length > 0 && setOpen(true)} placeholder={ph}
          className="w-full px-3 py-2 pr-8 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50 transition-colors" />
        {value && <button onClick={() => { onClr(); setQ(''); setRes([]); setOpen(false) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-white">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>}
      </div>
      {open && res.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border-subtle/40 rounded-xl overflow-hidden shadow-xl z-50 max-h-48 overflow-y-auto">
          {res.map((s: any) => (
            <button key={s.id} onClick={() => { onSel(String(s.id), s.name); setQ(s.name); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-white hover:bg-bg-tertiary transition-colors text-left">
              {s.photo_url && <div className="w-6 h-6 rounded-full overflow-hidden shrink-0"><Image src={s.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /></div>}
              <span className="truncate">{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
