'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


interface Props { type: 'tag_team' | 'stable'; title: string; subtitle: string; heroImage: string }

export default function TeamListClient({ type, title, subtitle, heroImage }: Props) {
  const t = useTranslations()

  const [items, setItems] = useState<any[]>([])
  const [allItems, setAllItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const [superstarSearch, setSuperstarSearch] = useState('')
  const [superstarResults, setSuperstarResults] = useState<any[]>([])
  const [selectedSuperstar, setSelectedSuperstar] = useState<{ id: number; name: string } | null>(null)
  const [ssOpen, setSsOpen] = useState(false)
  const [filterYear, setFilterYear] = useState('')
  const [years, setYears] = useState<number[]>([])
  const ssRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const scrollRef = useRef<HTMLDivElement>(null)

  const endpoint = type === 'tag_team' ? '/api/tag-teams-list' : '/api/stables-list'
  const basePath = type === 'tag_team' ? '/tag-teams/teams' : '/tag-teams/stables'

  const fetchData = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: '1' })
    if (search) params.set('search', search)
    if (activeFilter) params.set('active', activeFilter)
    try {
      const r = await fetch(`${endpoint}?${params}`)
      const d = await r.json()
      const raw = d.teams || d.stables || []
      setAllItems(raw)

      // Extract years
      const ys = new Set<number>()
      for (const item of raw) {
        if (item.formed_date) ys.add(parseInt(item.formed_date.substring(0, 4)))
      }
      setYears(Array.from(ys).sort((a, b) => b - a))
    } catch {}
    setLoading(false)
  }, [endpoint, search, activeFilter])

  useEffect(() => { fetchData() }, [fetchData])

  // Client-side filtering for superstar and year
  useEffect(() => {
    let filtered = allItems

    if (selectedSuperstar) {
      filtered = filtered.filter(item => {
        const memberIds = (item.members || []).map((m: any) => m.superstar?.id).filter(Boolean)
        return memberIds.includes(selectedSuperstar.id)
      })
    }

    if (filterYear) {
      filtered = filtered.filter(item => {
        if (!item.formed_date) return false
        return item.formed_date.startsWith(filterYear)
      })
    }

    setItems(filtered)
  }, [allItems, selectedSuperstar, filterYear])

  // Superstar autocomplete
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

  const hasFilters = !!search || !!activeFilter || !!selectedSuperstar || !!filterYear
  const resetAll = () => { setSearch(''); setActiveFilter(''); setSelectedSuperstar(null); setSuperstarSearch(''); setFilterYear('') }

  return (
    <div className="min-h-screen bg-bg-primary" ref={scrollRef}>
      {/* HERO */}
      <section className="relative w-full h-[260px] sm:h-[360px] lg:h-[440px] xl:h-[500px] overflow-hidden">
        <Image src={heroImage} alt={title} fill priority sizes="100vw" quality={100} unoptimized className="object-cover" style={{ objectPosition: 'center 25%' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/20 via-transparent to-bg-primary/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <nav className="hidden sm:flex items-center gap-2 text-xs text-text-secondary mb-3">
            <Link href="/tag-teams" className="hover:text-neon-blue transition-colors">{t('tagTeams.title')}</Link>
            <span className="text-border-subtle">/</span>
            <span className="text-neon-blue">{title}</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            {title.split(' ').map((w, i, a) => i === a.length - 1 ? <span key={i} className="text-neon-blue">{w}</span> : <span key={i}>{w} </span>)}
          </h1>
          <p className="text-text-secondary text-sm sm:text-base text-center max-w-2xl">{subtitle}</p>
        </div>
      </section>

      {/* FILTERS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search name */}
          <div className="relative flex-1 sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder={`Search ${type === 'tag_team' ? 'tag teams' : 'stables'}...`} value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none" />
          </div>

          {/* Superstar filter */}
          <div ref={ssRef} className="relative flex-1 sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <input type="text" placeholder="Filter by Superstar..." value={selectedSuperstar ? selectedSuperstar.name : superstarSearch}
              onChange={e => { if (selectedSuperstar) setSelectedSuperstar(null); handleSuperstarSearch(e.target.value) }}
              className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-8 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none" />
            {selectedSuperstar && (
              <button onClick={() => { setSelectedSuperstar(null); setSuperstarSearch('') }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-white">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
            {ssOpen && superstarResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border-subtle/40 rounded-xl overflow-hidden shadow-xl z-50 max-h-48 overflow-y-auto">
                {superstarResults.map((s: any) => (
                  <button key={s.id} onClick={() => { setSelectedSuperstar({ id: s.id, name: s.name }); setSuperstarSearch(''); setSsOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-white hover:bg-bg-tertiary transition-colors text-left">
                    {s.photo_url && <div className="w-6 h-6 rounded-full overflow-hidden shrink-0"><Image src={s.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /></div>}
                    <span className="truncate">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year filter */}
          {years.length > 0 && (
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              className="bg-bg-tertiary border border-border-subtle/30 rounded-xl px-3 py-2.5 text-xs text-text-white focus:border-neon-blue/50 focus:outline-none sm:w-32 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
              <option value="">{t('common.allYears')}</option>
              {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          )}

          {/* Active/Inactive */}
          <div className="flex items-center gap-1.5">
            {['', 'true', 'false'].map(v => (
              <button key={v} onClick={() => setActiveFilter(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${activeFilter === v ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>
                {v === '' ? t('common.all') : v === 'true' ? '🟢 Active' : '⚪ Inactive'}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button onClick={resetAll} className="text-xs text-neon-pink hover:text-neon-pink/80 flex items-center gap-1 shrink-0">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> Clear
            </button>
          )}
        </div>
        <p className="text-text-secondary text-xs mt-3">{loading ? t('common.loading') : `${items.length} ${type === 'tag_team' ? 'tag team' : 'stable'}${items.length !== 1 ? 's' : ''}`}</p>
      </section>

      {/* GRID */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg">None found</p>
            {hasFilters && <button onClick={resetAll} className="mt-3 text-sm text-neon-blue hover:underline">Clear filters</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(item => <TeamCard key={item.id} item={item} basePath={basePath} />)}
          </div>
        )}
      </section>

      {/* SEO */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3"><span className="text-neon-blue">{title}</span> — Complete Database</h2>
          <p className="text-text-secondary text-sm leading-relaxed">Browse every {title.toLowerCase()} with rosters, match records, statistics and more on Pinfall Data.</p>
        </div>
      </section>
    </div>
  )
}

function TeamCard({ item, basePath }: { item: any; basePath: string }) {
  const members = (item.members || []).map((m: any) => m.superstar).filter(Boolean)
  return (
    <Link href={`${basePath}/${item.slug}`} className="group relative flex flex-col rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 hover:bg-bg-secondary/25 card-glow">
      <div className="relative h-40 sm:h-44 overflow-hidden bg-bg-tertiary/30">
        {item.photo_url ? (
          <Image src={item.photo_url} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-5xl opacity-15">👥</span></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 via-transparent to-transparent" />

        {/* Member photos stacked */}
        {members.length > 0 && (
          <div className="absolute bottom-2 left-2 flex -space-x-1.5">
            {members.slice(0, 5).map((s: any) => (
              <div key={s.id} className="w-7 h-7 rounded-full overflow-hidden border-2 border-bg-primary bg-bg-tertiary shrink-0">
                {s.photo_url ? <Image src={s.photo_url} alt={s.name} width={28} height={28} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px]">👤</div>}
              </div>
            ))}
            {members.length > 5 && <div className="w-7 h-7 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[9px] text-text-secondary font-bold">+{members.length - 5}</div>}
          </div>
        )}

        {/* Active badge */}
        {item.is_active && (
          <div className="absolute top-2 right-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors">{item.name}</h3>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-[10px] text-text-secondary">{members.length} member{members.length !== 1 ? 's' : ''}</span>
          <span className="text-[10px] text-neon-blue font-medium group-hover:translate-x-1 transition-transform">View →</span>
        </div>
      </div>
    </Link>
  )
}
