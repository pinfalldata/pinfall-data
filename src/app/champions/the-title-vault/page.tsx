'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Championship {
  id: number; name: string; slug: string; image_url: string | null
  status: string; introduced_date: string | null; retired_date: string | null
  brand: string | null; sort_order: number; description_md: string | null
  current_holder: any | null; current_reign_start: string | null
}
interface Era { id: number; name: string; slug: string; start_year: number; end_year: number | null }

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TitleVaultPage() {
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'retired'>('all')
  const [search, setSearch] = useState('')
  const [superstarSearch, setSuperstarSearch] = useState('')
  const [filteredBySuper, setFilteredBySuper] = useState<number[] | null>(null)
  const [superstarLoading, setSuperstarLoading] = useState(false)
  const [eras, setEras] = useState<Era[]>([])
  const [selectedEra, setSelectedEra] = useState('')

  useEffect(() => {
    fetch('/api/championship-list-all')
      .then(r => r.json())
      .then(d => setChampionships(d.championships || []))
      .catch(() => {})
      .finally(() => setLoading(false))
    fetch('/api/eras')
      .then(r => r.json())
      .then(d => setEras(d.eras || []))
      .catch(() => {})
  }, [])

  // Superstar filter — search which championships a superstar held
  useEffect(() => {
    if (!superstarSearch.trim()) { setFilteredBySuper(null); return }
    const timeout = setTimeout(async () => {
      setSuperstarLoading(true)
      try {
        const r = await fetch(`/api/championship-list-all?superstar=${encodeURIComponent(superstarSearch.trim())}`)
        const d = await r.json()
        if (d.filteredIds) setFilteredBySuper(d.filteredIds)
        else setFilteredBySuper(null)
      } catch { setFilteredBySuper(null) }
      setSuperstarLoading(false)
    }, 400)
    return () => clearTimeout(timeout)
  }, [superstarSearch])

  // Sort: active first, then oldest to newest by introduced_date
  const sorted = useMemo(() => {
    let list = [...championships]
    // Filter by status
    if (filter === 'active') list = list.filter(c => c.status === 'active')
    if (filter === 'retired') list = list.filter(c => c.status === 'retired')
    // Filter by name search
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    // Filter by superstar
    if (filteredBySuper !== null) list = list.filter(c => filteredBySuper.includes(c.id))
    // Filter by era
    if (selectedEra) {
      const era = eras.find(e => String(e.id) === selectedEra)
      if (era) {
        list = list.filter(c => {
          if (!c.introduced_date) return true
          const introYear = new Date(c.introduced_date + 'T00:00:00').getFullYear()
          const retiredYear = c.retired_date ? new Date(c.retired_date + 'T00:00:00').getFullYear() : new Date().getFullYear()
          const eraEnd = era.end_year || new Date().getFullYear()
          return introYear <= eraEnd && retiredYear >= era.start_year
        })
      }
    }
    // Sort: active first, then by introduced_date (oldest first)
    list.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1
      const aDate = a.introduced_date || '9999'
      const bDate = b.introduced_date || '9999'
      return aDate.localeCompare(bDate)
    })
    return list
  }, [championships, filter, search, filteredBySuper, selectedEra, eras])

  const activeList = sorted.filter(c => c.status === 'active')
  const retiredList = sorted.filter(c => c.status !== 'active')

  return (
    <div className="relative min-h-screen">
      {/* Hero */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20champions/qffuupl2lpdd1.jpeg"
          alt="The Title Vault" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <nav className="hidden sm:flex items-center gap-2 text-xs text-text-secondary mb-3">
            <Link href="/champions" className="hover:text-neon-blue transition-colors">Champions</Link>
            <span className="text-border-subtle">/</span>
            <span className="text-neon-blue">The Title Vault</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            The <span className="text-neon-blue">Title Vault</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            Every championship in WWE history — past and present.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search championship..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none transition-colors" />
            </div>
            <div className="relative flex-1 w-full sm:max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <input type="text" placeholder="Search by superstar (e.g. Hulk Hogan)..." value={superstarSearch} onChange={e => setSuperstarSearch(e.target.value)}
                className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none transition-colors" />
              {superstarLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />}
            </div>
            <div className="flex items-center gap-1">
              {(['all', 'active', 'retired'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${filter === f ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>
                  {f === 'all' ? 'All' : f === 'active' ? '🟢 Active' : '🔴 Retired'}
                </button>
              ))}
            </div>
          </div>
          {/* Era filter */}
          {eras.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider shrink-0">Era:</span>
              <button onClick={() => setSelectedEra('')} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border whitespace-nowrap transition-all ${!selectedEra ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>All Eras</button>
              {eras.map(era => (
                <button key={era.id} onClick={() => setSelectedEra(String(era.id))} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium border whitespace-nowrap transition-all ${selectedEra === String(era.id) ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>
                  {era.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Championships */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
          </div>
        ) : (
          <>
            {activeList.length > 0 && (
              <div className="mb-10">
                {filter === 'all' && (
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="font-display text-lg font-bold text-text-white uppercase tracking-wide">Active Championships</h2>
                    <span className="text-text-secondary text-xs">({activeList.length})</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeList.map(c => <ChampCard key={c.id} c={c} />)}
                </div>
              </div>
            )}
            {retiredList.length > 0 && (
              <div>
                {filter === 'all' && (
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="font-display text-lg font-bold text-text-white uppercase tracking-wide">Retired Championships</h2>
                    <span className="text-text-secondary text-xs">({retiredList.length})</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {retiredList.map(c => <ChampCard key={c.id} c={c} />)}
                </div>
              </div>
            )}
            {sorted.length === 0 && (
              <p className="text-center text-text-secondary py-16">No championships found.</p>
            )}
          </>
        )}
      </section>
    </div>
  )
}

function ChampCard({ c }: { c: Championship }) {
  return (
    <Link href={`/champions/${c.slug}`}
      className="group relative rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 overflow-hidden transition-all hover:border-neon-blue/30 hover:shadow-lg hover:shadow-neon-blue/5">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative h-36 flex items-center justify-center bg-gradient-to-b from-bg-tertiary/40 to-transparent p-4">
        {c.image_url ? (
          <Image src={c.image_url} alt={c.name} width={280} height={180} className="max-h-full w-auto object-contain group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <span className="text-4xl opacity-20">🏆</span>
        )}
        {c.status === 'active' && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Active</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors">{c.name}</h3>
        {c.brand && <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wider">{c.brand}</p>}
        <div className="flex items-center gap-2 mt-2 text-[10px] text-text-secondary">
          {c.introduced_date && <span>Est. {formatDate(c.introduced_date)}</span>}
          {c.retired_date && <><span className="text-text-secondary/30">•</span><span>Retired {formatDate(c.retired_date)}</span></>}
        </div>
      </div>
    </Link>
  )
}
