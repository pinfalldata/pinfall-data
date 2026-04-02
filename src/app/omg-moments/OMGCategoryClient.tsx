'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


interface Superstar {
  id: number; name: string; slug: string; photo_url: string | null
}

interface OMGMoment {
  id: number; category: string; title: string; slug: string; date: string | null
  image_url: string | null; video_url: string | null; sort_order: number
  show: { id: number; name: string; slug: string } | null
  match: { id: number; slug: string; show: { slug: string } | null } | null
  segment: { id: number; slug: string; show: { slug: string } | null } | null
  superstars: Superstar[]
}

interface Props {
  category: string
  title: string
  subtitle: string
  heroImage: string
  icon: string
}

function fmt(d: string | null) { if (!d) return ''; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function OMGCategoryClient({ category, title, subtitle, heroImage, icon }: Props) {
  const t = useTranslations()

  const [moments, setMoments] = useState<OMGMoment[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [years, setYears] = useState<number[]>([])
  const [filterYear, setFilterYear] = useState('')
  const [search, setSearch] = useState('')
  const [superstarSearch, setSuperstarSearch] = useState('')
  const [superstarResults, setSuperstarResults] = useState<any[]>([])
  const [selectedSuperstar, setSelectedSuperstar] = useState<{ id: string; name: string } | null>(null)
  const [ssOpen, setSsOpen] = useState(false)
  const ssRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchMoments = useCallback(async (p: number) => {
    setLoading(true)
    const params = new URLSearchParams({ category, page: String(p), limit: '50' })
    if (filterYear) params.set('year', filterYear)
    if (search) params.set('search', search)
    if (selectedSuperstar) params.set('superstarId', selectedSuperstar.id)
    try {
      const r = await fetch(`/api/omg-moments-list?${params}`)
      const d = await r.json()
      setMoments(d.moments || [])
      setTotal(d.total || 0)
      setTotalPages(d.totalPages || 0)
      setPage(d.page || 1)
      if (d.years) setYears(d.years)
    } catch {}
    setLoading(false)
  }, [category, filterYear, search, selectedSuperstar])

  useEffect(() => { fetchMoments(1) }, [fetchMoments])

  const handleSuperstarSearch = (q: string) => {
    setSuperstarSearch(q)
    if (q.length < 2) { setSuperstarResults([]); setSsOpen(false); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search-superstars?q=${encodeURIComponent(q)}`)
        const d = await r.json()
        setSuperstarResults(d.results || [])
        setSsOpen(true)
      } catch {}
    }, 300)
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ssRef.current && !ssRef.current.contains(e.target as Node)) setSsOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const goPage = (n: number) => { fetchMoments(n); scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  const getMomentLink = (m: OMGMoment): string => {
    if (m.match?.show?.slug && m.match.slug) return `/shows/${m.match.show.slug}/matches/${m.match.slug}`
    if (m.segment?.show?.slug && m.segment.slug) return `/shows/${m.segment.show.slug}/segments/${m.segment.slug}`
    if (m.show?.slug) return `/shows/${m.show.slug}`
    return '#'
  }

  const hasFilters = !!filterYear || !!search || !!selectedSuperstar
  const resetFilters = () => { setFilterYear(''); setSearch(''); setSelectedSuperstar(null); setSuperstarSearch(''); setPage(1) }

  return (
    <div className="min-h-screen bg-bg-primary" ref={scrollRef}>
      {/* ===== HERO — tall to show more image ===== */}
      <section className="relative w-full h-[260px] sm:h-[360px] lg:h-[440px] xl:h-[500px] overflow-hidden">
        <Image src={heroImage} alt={title} fill priority sizes="100vw" quality={100} className="object-cover" style={{ objectPosition: 'center 25%' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/20 via-transparent to-bg-primary/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <nav className="hidden sm:flex items-center gap-2 text-xs text-text-secondary mb-3">
            <Link href="/omg-moments" className="hover:text-neon-blue transition-colors">{t('omg.title')}</Link>
            <span className="text-border-subtle">/</span>
            <span className="text-neon-blue">{title}</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            {title.split(' ').map((w, i, a) => i === a.length - 1 ? <span key={i} className="text-neon-blue">{w}</span> : <span key={i}>{w} </span>)}
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">{subtitle}</p>
        </div>
      </section>

      {/* ===== FILTERS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search moments..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none transition-colors" />
          </div>

          {/* Superstar search */}
          <div ref={ssRef} className="relative flex-1 sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <input type="text" placeholder="Filter by Superstar..." value={selectedSuperstar ? selectedSuperstar.name : superstarSearch}
              onChange={e => { if (selectedSuperstar) { setSelectedSuperstar(null) }; handleSuperstarSearch(e.target.value) }}
              className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-8 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none transition-colors" />
            {selectedSuperstar && (
              <button onClick={() => { setSelectedSuperstar(null); setSuperstarSearch(''); setPage(1) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
            {ssOpen && superstarResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border-subtle/40 rounded-xl overflow-hidden shadow-xl z-50 max-h-48 overflow-y-auto">
                {superstarResults.map((s: any) => (
                  <button key={s.id} onClick={() => { setSelectedSuperstar({ id: String(s.id), name: s.name }); setSuperstarSearch(''); setSsOpen(false); setPage(1) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-white hover:bg-bg-tertiary transition-colors text-left">
                    {s.photo_url && <div className="w-6 h-6 rounded-full overflow-hidden shrink-0"><Image src={s.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /></div>}
                    <span className="truncate">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year filter */}
          <select value={filterYear} onChange={e => { setFilterYear(e.target.value); setPage(1) }}
            className="bg-bg-tertiary border border-border-subtle/30 rounded-xl px-3 py-2.5 text-xs text-text-white focus:border-neon-blue/50 focus:outline-none transition-colors sm:w-32 appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
            <option value="">{t('common.allYears')}</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {hasFilters && (
            <button onClick={resetFilters} className="text-xs text-neon-pink hover:text-neon-pink/80 flex items-center gap-1 shrink-0">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Clear
            </button>
          )}
        </div>

        <p className="text-text-secondary text-xs mt-3">
          {loading ? t('common.loading') : `${total} moment${total !== 1 ? 's' : ''} found`}
        </p>
      </section>

      {/* ===== MOMENTS GRID ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
          </div>
        ) : moments.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg">No moments found</p>
            {hasFilters && <button onClick={resetFilters} className="mt-3 text-sm text-neon-blue hover:underline">Clear filters</button>}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {moments.map(m => (
                <MomentCard key={m.id} moment={m} link={getMomentLink(m)} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
                <p className="text-xs text-text-secondary">Page {page} of {totalPages} — {total} moments</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => goPage(page - 1)} disabled={page === 1}
                    className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  {getVisiblePages(page, totalPages).map((p, i) =>
                    p === 'e' ? <span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span> :
                    <button key={p} onClick={() => goPage(p as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue' : 'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{p}</button>
                  )}
                  <button onClick={() => goPage(page + 1)} disabled={page >= totalPages}
                    className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
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
            <span className="text-neon-blue">{title}</span> — Complete WWE Database
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Browse every {title.toLowerCase()} in WWE history. Filter by superstar, year, or search by name.
            Click on any moment to view the full match or segment details on Pinfall Data.
          </p>
        </div>
      </section>
    </div>
  )
}

/* ============================================================
   VISIBLE PAGES for pagination
   ============================================================ */
function getVisiblePages(page: number, tp: number): (number | 'e')[] {
  const p: (number | 'e')[] = []
  if (tp <= 7) { for (let i = 1; i <= tp; i++) p.push(i) }
  else {
    p.push(1)
    if (page > 3) p.push('e')
    for (let i = Math.max(2, page - 1); i <= Math.min(tp - 1, page + 1); i++) p.push(i)
    if (page < tp - 2) p.push('e')
    p.push(tp)
  }
  return p
}

/* ============================================================
   MOMENT CARD — Clean design, no description, multiple superstar photos, small date
   ============================================================ */
function MomentCard({ moment, link }: { moment: OMGMoment; link: string }) {
  return (
    <Link href={link} className="group relative flex flex-col rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 hover:bg-bg-secondary/25 card-glow">
      {/* Image */}
      <div className="relative h-40 sm:h-44 overflow-hidden bg-bg-tertiary/30">
        {moment.image_url ? (
          <Image src={moment.image_url} alt={moment.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-5xl opacity-15">🎬</span></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 via-transparent to-transparent" />

        {/* Superstar photos — bottom left, stacked */}
        {moment.superstars.length > 0 && (
          <div className="absolute bottom-2 left-2 flex -space-x-1.5">
            {moment.superstars.slice(0, 4).map(s => (
              <div key={s.id} className="w-7 h-7 rounded-full overflow-hidden border-2 border-bg-primary shrink-0 bg-bg-tertiary">
                {s.photo_url ? (
                  <Image src={s.photo_url} alt={s.name} width={28} height={28} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-text-secondary">👤</div>
                )}
              </div>
            ))}
            {moment.superstars.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[9px] text-text-secondary font-bold">
                +{moment.superstars.length - 4}
              </div>
            )}
          </div>
        )}

        {/* Date — small, clean */}
        {moment.date && (
          <div className="absolute top-2 right-2">
            <span className="text-[9px] text-text-secondary/80 font-mono bg-bg-primary/70 backdrop-blur-sm px-1.5 py-0.5 rounded">
              {fmt(moment.date)}
            </span>
          </div>
        )}
      </div>

      {/* Title only — no description */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors line-clamp-2">
          {moment.title}
        </h3>

        <div className="mt-auto pt-3 flex items-center justify-between">
          {moment.show && <span className="text-[10px] text-text-secondary truncate max-w-[65%]">{moment.show.name}</span>}
          <span className="text-[10px] text-neon-blue font-medium group-hover:translate-x-1 transition-transform shrink-0">
            View →
          </span>
        </div>
      </div>
    </Link>
  )
}
