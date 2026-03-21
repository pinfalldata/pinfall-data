'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HERO = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Hall%20Of%20Fame/216_WM39_04022023RC_42848--11c292c2be35a5ca5d00f8ad298b804d.jpg'

// Royal blue/gold color scheme
const GOLD = '#d4af37'
const ROYAL_BLUE = '#1a3a7a'

export default function HallOfFamePage() {
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [years, setYears] = useState<number[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [filterYear, setFilterYear] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const ref = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const fetchData = useCallback(async (p: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (filterYear) params.set('year', filterYear)
    if (filterClass) params.set('class', filterClass)
    if (search) params.set('search', search)
    if (sort !== 'newest') params.set('sort', sort)
    try {
      const r = await fetch(`/api/hof-list?${params}`)
      const d = await r.json()
      setItems(d.items || []); setTotal(d.total || 0); setPage(d.page || 1); setTotalPages(d.totalPages || 0)
      if (d.filterOptions) { setYears(d.filterOptions.years || []); setClasses(d.filterOptions.classes || []) }
    } catch { }
    setLoading(false)
  }, [filterYear, filterClass, search, sort])

  useEffect(() => { fetchData(1) }, [fetchData])

  const goP = (n: number) => { fetchData(n); ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  const handleSearch = (v: string) => {
    setSearch(v)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchData(1), 400)
  }

  return (
    <div className="relative">
      {/* ===== HERO — Royal blue/gold gradient ===== */}
      <section className="relative w-full h-[240px] sm:h-[320px] lg:h-[400px] overflow-hidden">
        <Image src={HERO} alt="WWE Hall of Fame" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, #050507 0%, ${ROYAL_BLUE}40 40%, transparent 100%)` }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${ROYAL_BLUE}20, transparent 50%, ${GOLD}10)` }} />
        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}80, ${GOLD}, ${GOLD}80, transparent)` }} />
        {/* Sparkle overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 20% 50%, ${GOLD}40 0%, transparent 50%), radial-gradient(circle at 80% 30%, ${GOLD}30 0%, transparent 40%)` }} />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <Link href="/hall-of-fame" className="text-[10px] uppercase tracking-widest mb-2 transition-colors hover:opacity-80" style={{ color: GOLD }}>← Hall of Fame & Awards</Link>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-6xl font-bold text-text-white text-center tracking-tight mb-2">
            WWE <span style={{ color: GOLD }}>Hall of Fame</span>
          </h1>
          <p className="text-sm sm:text-base text-center max-w-2xl" style={{ color: '#b0b8c8' }}>
            The immortals of professional wrestling — every inductee who earned their place among the legends.
          </p>
        </div>
      </section>

      {/* ===== FILTERS ===== */}
      <section ref={ref} className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="p-4 sm:p-5 rounded-2xl border bg-bg-secondary/30 backdrop-blur-sm" style={{ borderColor: `${GOLD}20` }}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: GOLD }}>Year</label>
              <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none transition-colors" style={{ ['--tw-ring-color' as any]: `${GOLD}50` }}>
                <option value="">All years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: GOLD }}>Class</label>
              <select value={filterClass} onChange={e => setFilterClass(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none transition-colors">
                <option value="">All classes</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: GOLD }}>Sort</label>
              <select value={sort} onChange={e => setSort(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none transition-colors">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alpha">A → Z</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 col-span-2 sm:col-span-1 lg:col-span-2">
              <label className="text-[10px] uppercase tracking-wider font-medium" style={{ color: GOLD }}>Search</label>
              <input type="text" value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search inductee…"
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none transition-colors" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: `${GOLD}15` }}>
            <p className="text-xs" style={{ color: '#8899aa' }}>{loading ? 'Loading…' : `${total} inductee${total !== 1 ? 's' : ''}`}</p>
            {(filterYear || filterClass || search) && (
              <button onClick={() => { setFilterYear(''); setFilterClass(''); setSearch('') }} className="text-xs flex items-center gap-1" style={{ color: GOLD }}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ===== INDUCTEE GRID — Royal design ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20"><span className="text-5xl block mb-4 opacity-20">🏛️</span><p className="text-text-secondary text-lg">No inductees found</p></div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item: any) => {
                const photo = item.superstar?.photo_url || item.image_url
                const slug = item.superstar?.slug
                const href = slug ? `/superstars/${slug}` : '#'

                return (
                  <Link key={item.id} href={href} className="group relative">
                    <div className="relative aspect-square rounded-2xl overflow-hidden border transition-all duration-300 group-hover:translate-y-[-3px]"
                      style={{ borderColor: `${GOLD}20`, boxShadow: `0 0 0 0 ${GOLD}00` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${GOLD}50`; (e.currentTarget as HTMLElement).style.boxShadow = `0 0 25px ${GOLD}15, 0 4px 20px rgba(0,0,0,0.3)` }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = `${GOLD}20`; (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}>
                      {photo ? (
                        <Image src={photo} alt={item.inductee_name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw" unoptimized />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ROYAL_BLUE}30, ${GOLD}10)` }}>
                          <span className="text-5xl opacity-20">🏛️</span>
                        </div>
                      )}
                      <div className="absolute inset-0" style={{ background: `linear-gradient(to top, #050507 0%, ${ROYAL_BLUE}15 30%, transparent 60%)` }} />

                      {/* Year badge — gold */}
                      <div className="absolute top-2 right-2">
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold backdrop-blur-sm" style={{ background: `${GOLD}25`, color: GOLD, border: `1px solid ${GOLD}40` }}>
                          {item.induction_year}
                        </span>
                      </div>

                      {/* Class badge */}
                      {item.class && (
                        <div className="absolute top-2 left-2">
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold backdrop-blur-sm" style={{ background: `${ROYAL_BLUE}60`, color: '#b0c4de', border: `1px solid ${ROYAL_BLUE}80` }}>
                            {item.class}
                          </span>
                        </div>
                      )}

                      {/* Video icon — if speech video exists */}
                      {item.speech_video_url && (
                        <div className="absolute bottom-12 right-2">
                          <span className="flex items-center justify-center w-7 h-7 rounded-full backdrop-blur-sm" style={{ background: `${GOLD}30`, border: `1px solid ${GOLD}40` }}>
                            <svg className="w-3.5 h-3.5" style={{ color: GOLD }} fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </span>
                        </div>
                      )}

                      {/* Info — bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="font-display text-sm font-bold text-text-white group-hover:text-[#d4af37] transition-colors line-clamp-2 leading-tight mb-0.5">
                          {item.inductee_name}
                        </h3>
                        {item.inducted_by && (
                          <p className="text-[9px] line-clamp-1" style={{ color: '#8899aa' }}>
                            Inducted by {item.inducted_by}
                          </p>
                        )}
                        {item.description && (
                          <p className="text-[8px] mt-1 line-clamp-2" style={{ color: '#667788' }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t" style={{ borderColor: `${GOLD}15` }}>
                <button onClick={() => goP(page - 1)} disabled={page <= 1} className="w-8 h-8 rounded-lg border flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all" style={{ borderColor: `${GOLD}20` }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <span className="text-xs text-text-secondary">Page {page} / {totalPages} — {total} inductees</span>
                <button onClick={() => goP(page + 1)} disabled={page >= totalPages} className="w-8 h-8 rounded-lg border flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all" style={{ borderColor: `${GOLD}20` }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* SEO */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border bg-bg-secondary/10 p-6 sm:p-8" style={{ borderColor: `${GOLD}15` }}>
          <h2 className="font-display text-xl font-bold text-text-white mb-3">About the <span style={{ color: GOLD }}>WWE Hall of Fame</span></h2>
          <p className="text-text-secondary text-sm leading-relaxed">The WWE Hall of Fame honors the legends who have made an indelible impact on sports entertainment. Browse every inductee from the first class to the most recent ceremony, with induction details, class information, and career profiles.</p>
        </div>
      </section>

      {/* Gold shimmer effect CSS */}
      <style jsx global>{`
        @keyframes hof-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
