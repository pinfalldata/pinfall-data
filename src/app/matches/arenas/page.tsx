'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Arena {
  id: number; name: string; slug: string; city: string | null
  state_province: string | null; country: string | null
  capacity: number | null; image_url: string | null
  show_count: number; max_attendance: number
  name_history: { name: string; start_date: string | null; end_date: string | null; is_current: boolean }[]
}

interface FilterOptions {
  countries: string[]; states: string[]; cities: string[]; years: string[]
}

const SORT_OPTIONS = [
  { value: 'most_used', label: '🏆 Most Used' },
  { value: 'highest_attendance', label: '👥 Highest Attendance' },
  { value: 'alphabetical', label: '🔤 Alphabetical' },
]

export default function AllArenasPage() {
  const [arenas, setArenas] = useState<Arena[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filterOpts, setFilterOpts] = useState<FilterOptions>({ countries: [], states: [], cities: [], years: [] })

  // Filters
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [sort, setSort] = useState('most_used')

  const ref = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async (p: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: '40', sort })
    if (year) params.set('year', year)
    if (year && month) params.set('month', month)
    if (country) params.set('country', country)
    if (state) params.set('state', state)
    if (city) params.set('city', city)
    try {
      const r = await fetch(`/api/arenas-list?${params}`)
      const d = await r.json()
      setArenas(d.arenas || [])
      setTotal(d.total || 0)
      setTotalPages(d.totalPages || 0)
      setPage(p)
      if (d.filterOptions) setFilterOpts(d.filterOptions)
    } catch { }
    setLoading(false)
  }, [year, month, country, state, city, sort])

  useEffect(() => { fetchData(1) }, [fetchData])

  const goP = (n: number) => { fetchData(n); ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const hasF = !!(year || month || country || state || city)
  const resetFilters = () => { setYear(''); setMonth(''); setCountry(''); setState(''); setCity('') }

  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/irak.png"
          alt="WWE Arenas" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            All <span className="text-neon-blue">Arenas</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            Every venue that has hosted a WWE event — from legendary arenas to hidden gems around the world.
          </p>
        </div>
      </section>

      {/* ===== FILTERS ===== */}
      <section ref={ref} className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 lg:py-8">
        <div className="p-4 sm:p-5 rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            <span className="text-xs font-bold text-neon-blue uppercase tracking-wider">Filters & Sorting</span>
            <span className="text-xs text-text-secondary ml-auto">{loading ? 'Loading…' : `${total.toLocaleString()} arena${total !== 1 ? 's' : ''}`}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {/* Year */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Year Used</label>
              <select value={year} onChange={e => { setYear(e.target.value); if (!e.target.value) setMonth('') }}
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
                <option value="">All years</option>
                {filterOpts.years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {/* Month */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Month</label>
              <select value={month} onChange={e => setMonth(e.target.value)} disabled={!year}
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
                <option value="">All months</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>{new Date(2000, i).toLocaleString('en-US', { month: 'long' })}</option>
                ))}
              </select>
            </div>
            {/* Country */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Country</label>
              <select value={country} onChange={e => { setCountry(e.target.value); setState(''); setCity('') }}
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
                <option value="">All countries</option>
                {filterOpts.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* State */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">State / Province</label>
              <select value={state} onChange={e => { setState(e.target.value); setCity('') }}
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
                <option value="">All states</option>
                {filterOpts.states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {/* City */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">City</label>
              <select value={city} onChange={e => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
                <option value="">All cities</option>
                {filterOpts.cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {/* Sort */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Sort By</label>
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {/* Clear */}
            <div className="flex items-end">
              {hasF && (
                <button onClick={resetFilters} className="w-full px-3 py-2 rounded-lg text-xs text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== ARENA GRID ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
          </div>
        ) : arenas.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block opacity-20">🏟️</span>
            <p className="text-text-secondary text-lg mb-2">No arenas found</p>
            {hasF && <button onClick={resetFilters} className="mt-3 text-sm text-neon-blue hover:underline">Clear filters</button>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {arenas.map(a => <ArenaCard key={a.id} arena={a} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
                <p className="text-xs text-text-secondary">Page {page} of {totalPages} — {total.toLocaleString()} arenas</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => goP(page - 1)} disabled={page <= 1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {getVis(page, totalPages).map((p, i) => p === 'e' ? <span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span> :
                    <button key={p} onClick={() => goP(p as number)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue' : 'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{p}</button>)}
                  <button onClick={() => goP(page + 1)} disabled={page >= totalPages} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            About <span className="text-neon-blue">WWE Arenas & Venues</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            From the iconic Madison Square Garden to stadiums around the world, WWE has performed in thousands
            of venues across seven decades. This page catalogs every arena with show history, attendance records,
            and venue name changes over time.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Filter by year to see which arenas were active during the Attitude Era, the Ruthless Aggression years,
            or the modern era. Sort by most used to find WWE&apos;s favorite homes, or by highest attendance
            for the biggest crowds in wrestling history.
          </p>
        </div>
      </section>
    </div>
  )
}

/* ============================================================
   ARENA CARD — OMG-style design with photo, name, location, stats, name history
   ============================================================ */
function ArenaCard({ arena }: { arena: Arena }) {
  const location = [arena.city, arena.state_province, arena.country].filter(Boolean).join(', ')
  const hasNameHistory = arena.name_history.length > 1

  // Get the display name — use current arena_names entry if available, or fallback to arena.name
  const currentNameEntry = arena.name_history.find(n => n.is_current)
  const displayName = currentNameEntry?.name || arena.name

  // Former names (exclude the current one)
  const formerNames = arena.name_history.filter(n => !n.is_current && n.name !== displayName)

  return (
    <Link href={`/arenas/${arena.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 hover:bg-bg-secondary/25 card-glow">
      {/* Image */}
      <div className="relative h-40 sm:h-44 overflow-hidden bg-bg-tertiary/30">
        {arena.image_url ? (
          <Image src={arena.image_url} alt={displayName} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-5xl opacity-15">🏟️</span></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent" />

        {/* Show count badge */}
        <div className="absolute top-2 right-2">
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-bg-primary/80 backdrop-blur-sm border border-neon-blue/20 text-neon-blue font-bold">
            {arena.show_count} show{arena.show_count !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Max attendance */}
        {arena.max_attendance > 0 && (
          <div className="absolute top-2 left-2">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-bg-primary/80 backdrop-blur-sm border border-border-subtle/30 text-text-secondary font-mono">
              👥 {arena.max_attendance.toLocaleString()}
            </span>
          </div>
        )}

        {/* Location — bottom */}
        {location && (
          <div className="absolute bottom-2 left-2 right-2">
            <span className="text-[10px] text-text-secondary/90 bg-bg-primary/60 backdrop-blur-sm px-2 py-0.5 rounded truncate block">
              📍 {location}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors line-clamp-2 mb-1">
          {displayName}
        </h3>

        {/* Former names — subtle, shows history */}
        {hasNameHistory && formerNames.length > 0 && (
          <div className="mb-2">
            <p className="text-[9px] text-text-secondary/60 uppercase tracking-wider mb-0.5">Formerly known as</p>
            <div className="flex flex-wrap gap-1">
              {formerNames.slice(0, 3).map((n, i) => (
                <span key={i} className="text-[10px] text-text-secondary/70 px-1.5 py-0.5 rounded bg-bg-tertiary/40 border border-border-subtle/15 truncate max-w-full">
                  {n.name}
                  {n.start_date && n.end_date && (
                    <span className="text-text-secondary/40 ml-1">
                      ({n.start_date.slice(0, 4)}–{n.end_date.slice(0, 4)})
                    </span>
                  )}
                </span>
              ))}
              {formerNames.length > 3 && (
                <span className="text-[9px] text-text-secondary/50">+{formerNames.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Capacity */}
        {arena.capacity && (
          <p className="text-[10px] text-text-secondary">Capacity: {arena.capacity.toLocaleString()}</p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {arena.show_count > 0 && <span className="text-[10px] text-neon-blue font-bold">{arena.show_count} events</span>}
          </div>
          <span className="text-[10px] text-neon-blue font-medium group-hover:translate-x-1 transition-transform shrink-0">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}

function getVis(page: number, tp: number): (number | 'e')[] {
  const p: (number | 'e')[] = []
  if (tp <= 7) { for (let i = 1; i <= tp; i++) p.push(i) }
  else { p.push(1); if (page > 3) p.push('e'); for (let i = Math.max(2, page - 1); i <= Math.min(tp - 1, page + 1); i++) p.push(i); if (page < tp - 2) p.push('e'); p.push(tp) }
  return p
}
