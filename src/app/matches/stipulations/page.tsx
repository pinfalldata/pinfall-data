'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Stipulation {
  id: number; name: string; slug: string; description: string | null
  image_url: string | null; match_count: number; category: string
}

interface Category {
  name: string; count: number
}

const CATEGORY_ICONS: Record<string, string> = {
  'Environmental': '🏗️',
  'Weapon-Based': '⚔️',
  'Submission & Technical': '🤼',
  'Multi-Man Elimination': '👥',
  'Life-Changing': '💀',
  'Standard': '🔔',
}

const CATEGORY_COLORS: Record<string, string> = {
  'Environmental': 'from-blue-500/10 to-cyan-500/5 border-blue-500/20',
  'Weapon-Based': 'from-red-500/10 to-orange-500/5 border-red-500/20',
  'Submission & Technical': 'from-purple-500/10 to-violet-500/5 border-purple-500/20',
  'Multi-Man Elimination': 'from-emerald-500/10 to-green-500/5 border-emerald-500/20',
  'Life-Changing': 'from-yellow-500/10 to-amber-500/5 border-yellow-500/20',
  'Standard': 'from-gray-500/10 to-slate-500/5 border-gray-500/20',
}

export default function StipulationsPage() {
  const [stips, setStips] = useState<Stipulation[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    fetch('/api/stipulations-list')
      .then(r => r.json())
      .then(d => {
        setStips(d.stipulations || [])
        setCategories(d.categories || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Filter when category changes
  const [filtered, setFiltered] = useState<Stipulation[]>([])
  useEffect(() => {
    if (activeCategory === 'all') {
      setFiltered(stips)
    } else {
      setFiltered(stips.filter(s => s.category === activeCategory))
    }
  }, [activeCategory, stips])

  return (
    <div className="relative">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[200px] sm:h-[260px] lg:h-[340px] xl:h-[380px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/pagematchtypes.webp"
          alt="WWE Match Stipulations" fill priority sizes="100vw" quality={100} unoptimized
          className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            Match <span className="text-neon-blue">Stipulations</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            Every match type in WWE history — from classic singles bouts to the most extreme stipulations ever conceived.
          </p>
        </div>
      </section>

      {/* ===== CONTENT ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        {/* Category filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button onClick={() => setActiveCategory('all')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                activeCategory === 'all'
                  ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
                  : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'
              }`}>
              All Types ({stips.length})
            </button>
            {categories.map(cat => (
              <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border flex items-center gap-1.5 ${
                  activeCategory === cat.name
                    ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
                    : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'
                }`}>
                <span>{CATEGORY_ICONS[cat.name] || '📋'}</span>
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({length:20}).map((_,i) => (
              <div key={i} className="aspect-[4/3] rounded-2xl bg-bg-secondary/30 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-secondary text-lg">No match types found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map(stip => (
              <Link key={stip.id} href={`/matches/stipulations/${stip.slug}`}
                className="group relative rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden hover:border-neon-blue/25 hover:bg-bg-secondary/35 transition-all duration-300">
                {/* Image */}
                <div className="aspect-[4/3] relative">
                  {stip.image_url ? (
                    <Image src={stip.image_url} alt={stip.name} fill sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${CATEGORY_COLORS[stip.category] || 'from-bg-tertiary to-bg-secondary'} flex items-center justify-center`}>
                      <span className="text-3xl">{CATEGORY_ICONS[stip.category] || '🔔'}</span>
                    </div>
                  )}
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {/* Match count badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded-md bg-bg-primary/80 backdrop-blur-sm text-[10px] text-text-secondary font-mono border border-border-subtle/30">
                      {stip.match_count.toLocaleString()} match{stip.match_count !== 1 ? 'es' : ''}
                    </span>
                  </div>
                  {/* Category badge */}
                  <div className="absolute bottom-2 left-2">
                    <span className="px-1.5 py-0.5 rounded text-[9px] text-text-secondary/80 bg-bg-primary/60 backdrop-blur-sm">
                      {stip.category}
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div className="px-3 py-3">
                  <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors leading-tight">
                    {stip.name}
                  </h3>
                  {stip.description && (
                    <p className="text-[10px] text-text-secondary leading-snug mt-1 line-clamp-2">
                      {stip.description}
                    </p>
                  )}
                </div>

                {/* Accent */}
                <div className="h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            Complete <span className="text-neon-blue">Match Stipulation Encyclopedia</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            WWE has invented over 200 unique match stipulations across its 70+ year history. From the iconic Steel Cage
            and Hell in a Cell to the extreme TLC and Elimination Chamber, each match type brings its own rules, strategies,
            and unforgettable moments. Browse by category to discover every variation ever used in WWE programming.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Categories include Environmental matches (where the structure defines the rules), Weapon-Based stipulations,
            Submission and Technical challenges, Multi-Man Elimination contests, and Life-Changing stipulations where
            careers, masks, and legacies hang in the balance.
          </p>
        </div>
      </section>
    </div>
  )
}
