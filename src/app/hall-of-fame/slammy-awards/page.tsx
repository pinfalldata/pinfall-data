'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HERO = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Hall%20Of%20Fame/wwe-slammy-awards-2037751.webp'

export default function SlammyAwardsPage() {
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [years, setYears] = useState<number[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [filterYear, setFilterYear] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const ref = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const fetchData = useCallback(async (p: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (filterYear) params.set('year', filterYear)
    if (filterCat) params.set('category', filterCat)
    if (search) params.set('search', search)
    if (sort !== 'newest') params.set('sort', sort)
    try {
      const r = await fetch(`/api/slammy-list?${params}`)
      const d = await r.json()
      setItems(d.items || []); setTotal(d.total || 0); setPage(d.page || 1); setTotalPages(d.totalPages || 0)
      if (d.filterOptions) { setYears(d.filterOptions.years || []); setCategories(d.filterOptions.categories || []) }
    } catch { }
    setLoading(false)
  }, [filterYear, filterCat, search, sort])

  useEffect(() => { fetchData(1) }, [fetchData])
  const goP = (n: number) => { fetchData(n); ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const handleSearch = (v: string) => { setSearch(v); clearTimeout(debounceRef.current); debounceRef.current = setTimeout(() => fetchData(1), 400) }

  return (
    <div className="relative">
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] overflow-hidden">
        <Image src={HERO} alt="WWE Slammy Awards" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center lg:object-[50%_20%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <Link href="/hall-of-fame" className="text-[10px] text-text-secondary uppercase tracking-widest mb-2 hover:text-neon-blue transition-colors">← Hall of Fame & Awards</Link>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            <span className="text-neon-blue">Slammy</span> Awards
          </h1>
          <p className="text-text-secondary text-sm sm:text-base text-center max-w-2xl">Every Slammy Award winner in WWE history — the most prestigious annual honors in sports entertainment.</p>
        </div>
      </section>

      <section ref={ref} className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="p-4 sm:p-5 rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Sel label="Year" value={filterYear} set={setFilterYear} opts={years.map(y => ({ value: String(y), label: String(y) }))} ph="All years" />
            <Sel label="Category" value={filterCat} set={setFilterCat} opts={categories.map(c => ({ value: c, label: c }))} ph="All categories" />
            <Sel label="Sort" value={sort} set={setSort} opts={[{ value: 'newest', label: 'Newest' }, { value: 'oldest', label: 'Oldest' }, { value: 'alpha', label: 'A → Z' }]} ph="" />
            <div className="flex flex-col gap-1 col-span-2 sm:col-span-1 lg:col-span-2">
              <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Search</label>
              <input type="text" value={search} onChange={e => handleSearch(e.target.value)} placeholder="Search winner or category…"
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border-subtle/20">
            <p className="text-xs text-text-secondary">{loading ? 'Loading…' : `${total} award${total !== 1 ? 's' : ''}`}</p>
            {(filterYear || filterCat || search) && <button onClick={() => { setFilterYear(''); setFilterCat(''); setSearch('') }} className="text-xs text-neon-pink hover:text-neon-pink/80 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Clear</button>}
          </div>
        </div>

        {loading ? <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-square rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
        : items.length === 0 ? <div className="text-center py-20"><p className="text-text-secondary text-lg">No awards found</p></div>
        : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {items.map((item: any) => <AwardCard key={item.id} item={item} />)}
            </div>
            {totalPages > 1 && <Pag page={page} tp={totalPages} total={total} go={goP} />}
          </>
        )}
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">About the <span className="text-neon-blue">Slammy Awards</span></h2>
          <p className="text-text-secondary text-sm leading-relaxed">The Slammy Awards are WWE&apos;s annual awards ceremony honoring the best performers, matches, and moments of each year. Browse every winner from the first ceremony to the most recent, filterable by year and category.</p>
        </div>
      </section>
    </div>
  )
}

function AwardCard({ item }: { item: any }) {
  const photo = item.winner?.photo_url
  const slug = item.winner?.slug
  const href = slug ? `/superstars/${slug}` : '#'

  return (
    <Link href={href} className="group relative flex flex-col rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 hover:translate-y-[-2px] card-glow">
      <div className="relative aspect-square overflow-hidden bg-bg-tertiary/30">
        {photo ? <Image src={photo} alt={item.winner_name || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, 20vw" unoptimized />
        : <div className="w-full h-full flex items-center justify-center"><span className="text-4xl opacity-20">🏆</span></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 to-transparent" />
        <div className="absolute top-2 right-2"><span className="text-[9px] px-2 py-0.5 rounded-full bg-bg-primary/80 backdrop-blur-sm border border-neon-blue/20 text-neon-blue font-bold">{item.year}</span></div>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <p className="text-[10px] text-neon-blue font-bold uppercase tracking-wider mb-1 line-clamp-1">{item.category}</p>
        <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors line-clamp-1">{item.winner_name || '—'}</h3>
        {item.notes && <p className="text-[10px] text-text-secondary mt-1 line-clamp-2">{item.notes}</p>}
      </div>
    </Link>
  )
}

function Sel({ label, value, set, opts, ph }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">{label}</label>
      <select value={value} onChange={(e: any) => set(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer" style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
        {ph && <option value="">{ph}</option>}
        {opts.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Pag({ page, tp, total, go }: any) {
  return (
    <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-border-subtle/20">
      <button onClick={() => go(page - 1)} disabled={page <= 1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
      <span className="text-xs text-text-secondary">Page {page} / {tp} — {total} awards</span>
      <button onClick={() => go(page + 1)} disabled={page >= tp} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
    </div>
  )
}
