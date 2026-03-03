'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Stipulation {
  id: number
  name: string
  slug: string
  description: string | null
  image_url: string | null
  category: string
  match_count: number
}

interface Category {
  name: string
  count: number
}

const categoryIcons: Record<string, string> = {
  'Environmental': '🏗️',
  'Weapon-Based': '🪜',
  'Submission & Technical': '🔒',
  'Multi-Man Elimination': '👥',
  'Life-Changing': '💀',
  'Standard': '🤼',
}

export default function StipulationsListPage() {
  const [stipulations, setStipulations] = useState<Stipulation[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      try {
        const r = await fetch('/api/stipulations-list')
        const d = await r.json()
        if (!r.ok) {
          setError(d.error || `Error ${r.status}`)
        } else {
          setStipulations(d.stipulations || [])
          setCategories(d.categories || [])
        }
      } catch (e: any) {
        setError(e.message || 'Network error')
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Re-fetch with category filter
  useEffect(() => {
    if (activeCategory === 'all' && !loading) return
    // We already have all data, filter client-side
  }, [activeCategory])

  const filtered = stipulations.filter(s => {
    if (activeCategory !== 'all' && s.category !== activeCategory) return false
    if (search) {
      const q = search.toLowerCase()
      return s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q)
    }
    return true
  })

  const totalMatches = stipulations.reduce((sum, s) => sum + s.match_count, 0)

  return (
    <div className="relative min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-bg-primary">
        <div className="relative py-12 sm:py-16 lg:py-20">
          {/* Grid background */}
          <div
            className="absolute inset-0 bg-grid opacity-15 animate-grid-pulse pointer-events-none"
            style={{
              maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
            }}
          />

          {/* Gold glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[150px] opacity-15 pointer-events-none bg-neon-blue" />

          <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 text-center">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white tracking-tight">
              Match <span className="text-neon-blue">Stipulations</span>
            </h1>
            <p className="mt-3 text-text-secondary text-sm sm:text-base max-w-xl mx-auto">
              Every match type in WWE history — from Standard singles to Hell in a Cell. Browse complete match histories for each stipulation.
            </p>

            {/* Quick stats */}
            {!loading && (
              <div className="flex items-center justify-center gap-6 sm:gap-8 mt-6">
                <div className="text-center">
                  <span className="block text-2xl sm:text-3xl font-bold text-neon-blue font-display">{stipulations.length}</span>
                  <span className="block text-[10px] text-text-secondary uppercase tracking-wider">Stipulations</span>
                </div>
                <div className="w-px h-8 bg-border-subtle/30" />
                <div className="text-center">
                  <span className="block text-2xl sm:text-3xl font-bold text-text-white font-display">{totalMatches.toLocaleString()}</span>
                  <span className="block text-[10px] text-text-secondary uppercase tracking-wider">Total Matches</span>
                </div>
                <div className="w-px h-8 bg-border-subtle/30" />
                <div className="text-center">
                  <span className="block text-2xl sm:text-3xl font-bold text-text-white font-display">{categories.length}</span>
                  <span className="block text-[10px] text-text-secondary uppercase tracking-wider">Categories</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
      </section>

      {/* ===== FILTERS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search stipulations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                activeCategory === 'all'
                  ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue'
                  : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'
              }`}
            >
              All ({stipulations.length})
            </button>
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  activeCategory === cat.name
                    ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue'
                    : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'
                }`}
              >
                {categoryIcons[cat.name] || '📋'} {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ERROR ===== */}
      {error && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-6">
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
            <p className="text-red-400 text-sm">Error loading data: {error}</p>
            <button onClick={() => window.location.reload()} className="mt-2 px-4 py-1.5 text-xs bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ===== LOADING ===== */}
      {loading && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-bg-secondary/30 animate-pulse" />
            ))}
          </div>
        </section>
      )}

      {/* ===== STIPULATIONS GRID ===== */}
      {!loading && !error && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(s => (
                <StipulationCard key={s.id} stipulation={s} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-text-secondary text-lg">No stipulations found</p>
              {(search || activeCategory !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setActiveCategory('all') }}
                  className="mt-3 px-4 py-2 rounded-lg bg-neon-blue/15 border border-neon-blue/30 text-neon-blue text-xs font-medium hover:bg-neon-blue/25 transition-all"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </section>
      )}

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            Complete <span className="text-neon-blue">WWE Match Stipulation Guide</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            This page catalogs every type of match in WWE history, from standard singles matches to extreme stipulations
            like Hell in a Cell, TLC, and Elimination Chamber. Click on any stipulation to view its complete match history
            with results, participants, championship information, and ratings on Pinfall Data.
          </p>
        </div>
      </section>
    </div>
  )
}

/* ===== Stipulation Card Component ===== */
function StipulationCard({ stipulation }: { stipulation: Stipulation }) {
  return (
    <Link
      href={`/matches/stipulations/${stipulation.slug}`}
      className="group relative flex flex-col rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 hover:bg-bg-secondary/25 card-glow"
    >
      {/* Image area */}
      <div className="relative h-36 sm:h-40 flex items-center justify-center bg-bg-tertiary/30 overflow-hidden">
        {stipulation.image_url ? (
          <Image
            src={stipulation.image_url}
            alt={stipulation.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-bg-tertiary/50 to-bg-secondary/30 flex items-center justify-center">
            <span className="text-5xl opacity-20">{categoryIcons[stipulation.category] || '🤼'}</span>
          </div>
        )}
        {stipulation.image_url && (
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-transparent" />
        )}

        {/* Category pill */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-bg-primary/80 backdrop-blur-sm border border-border-subtle/30 text-text-secondary">
            {categoryIcons[stipulation.category] || '📋'} {stipulation.category}
          </span>
        </div>

        {/* Match count — always visible */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-1 rounded-lg text-xs font-bold bg-bg-primary/80 backdrop-blur-sm border border-neon-blue/20 text-neon-blue">
            {stipulation.match_count.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors">
          {stipulation.name}
        </h3>
        {stipulation.description && (
          <p className="text-[11px] text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
            {stipulation.description}
          </p>
        )}

        {/* Bottom bar */}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-[10px] text-text-secondary uppercase tracking-wider">
            {stipulation.match_count.toLocaleString()} match{stipulation.match_count !== 1 ? 'es' : ''}
          </span>
          <span className="text-[10px] text-neon-blue font-medium group-hover:translate-x-1 transition-transform">
            View all →
          </span>
        </div>
      </div>
    </Link>
  )
}
