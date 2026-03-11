'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Championship {
  id: number; name: string; slug: string; image_url: string | null
  status: string; introduced_date: string | null; retired_date: string | null
  brand: string | null; sort_order: number; description_md: string | null
  current_holder: any | null; current_reign_start: string | null
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TitleVaultPage() {
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'retired'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/champions-current')
      .then(r => r.json())
      .then(d => setChampionships(d.championships || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Also fetch retired championships
  useEffect(() => {
    fetch('/api/championship-list-all')
      .then(r => r.json())
      .then(d => {
        if (d.championships) setChampionships(d.championships)
      })
      .catch(() => {})
  }, [])

  const filtered = championships.filter(c => {
    if (filter === 'active' && c.status !== 'active') return false
    if (filter === 'retired' && c.status !== 'retired') return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const active = filtered.filter(c => c.status === 'active')
  const retired = filtered.filter(c => c.status === 'retired')

  return (
    <div className="relative min-h-screen">
      {/* Hero */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20champions/champions.jpg"
          alt="The Title Vault" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <nav className="hidden sm:flex items-center gap-2 text-xs text-text-secondary mb-3">
            <Link href="/champions" className="hover:text-yellow-400 transition-colors">Champions</Link>
            <span className="text-border-subtle">/</span>
            <span className="text-yellow-400">The Title Vault</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            The <span className="text-yellow-400">Title Vault</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            Every championship in WWE history — past and present.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search championships..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-yellow-500/50 focus:outline-none transition-colors" />
          </div>
          <div className="flex items-center gap-1">
            {(['all', 'active', 'retired'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${filter === f ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>
                {f === 'all' ? 'All' : f === 'active' ? '🟢 Active' : '🔴 Retired'}
              </button>
            ))}
          </div>
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
            {active.length > 0 && (
              <div className="mb-10">
                {filter === 'all' && (
                  <div className="flex items-center gap-3 mb-5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h2 className="font-display text-lg font-bold text-text-white uppercase tracking-wide">Active Championships</h2>
                    <span className="text-text-secondary text-xs">({active.length})</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {active.map(c => <ChampCard key={c.id} c={c} />)}
                </div>
              </div>
            )}
            {retired.length > 0 && (
              <div>
                {filter === 'all' && (
                  <div className="flex items-center gap-3 mb-5">
                    <h2 className="font-display text-lg font-bold text-text-white uppercase tracking-wide">Retired Championships</h2>
                    <span className="text-text-secondary text-xs">({retired.length})</span>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {retired.map(c => <ChampCard key={c.id} c={c} />)}
                </div>
              </div>
            )}
            {filtered.length === 0 && (
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
      className="group relative rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 overflow-hidden transition-all hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/5">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
        <h3 className="font-display text-sm font-bold text-text-white group-hover:text-yellow-400 transition-colors">{c.name}</h3>
        {c.brand && <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wider">{c.brand}</p>}
        <div className="flex items-center gap-2 mt-2 text-[10px] text-text-secondary">
          {c.introduced_date && <span>Est. {formatDate(c.introduced_date)}</span>}
          {c.retired_date && <><span className="text-text-secondary/30">•</span><span>Retired {formatDate(c.retired_date)}</span></>}
        </div>
      </div>
    </Link>
  )
}
