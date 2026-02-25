'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface Era {
  id: number
  name: string
  slug: string
  start_year: number
  end_year: number | null
  description_md: string | null
  image_url: string | null
  sort_order: number
}

export function EraTimeline() {
  const [eras, setEras] = useState<Era[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/match-filters') // Reuse or create dedicated endpoint
      .then(r => r.json())
      .catch(() => null)

    // Fetch eras directly
    fetch('/api/homepage-stats')
      .then(() => {
        // We need a separate call for eras - use inline fetch
        return fetch('/api/eras')
      })
      .then(r => r.ok ? r.json() : { eras: [] })
      .then(data => {
        setEras(data.eras || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = 320
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-text-white mb-6 text-center">
          <span className="text-neon-blue">Wrestling</span> Through the Ages
        </h2>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-72 h-56 rounded-2xl bg-bg-secondary/30 animate-pulse shrink-0" />
          ))}
        </div>
      </section>
    )
  }

  if (eras.length === 0) return null

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-text-white">
          <span className="text-neon-blue">Wrestling</span> Through the Ages
        </h2>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue hover:border-neon-blue/30 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue hover:border-neon-blue/30 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      {/* Timeline line */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/30 to-transparent z-0" />

        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 relative z-10">
          {eras.map((era, i) => (
            <div
              key={era.id}
              className="group relative w-72 sm:w-80 shrink-0 rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 overflow-hidden hover:border-neon-blue/30 hover:bg-bg-secondary/50 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative w-full h-36 bg-bg-tertiary overflow-hidden">
                {era.image_url ? (
                  <Image src={era.image_url} alt={era.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neon-blue/5 to-neon-pink/5">
                    <span className="text-4xl opacity-30">📜</span>
                  </div>
                )}
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-transparent to-transparent" />
                {/* Year badge */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-neon-blue/20 border border-neon-blue/30 text-neon-blue text-xs font-mono font-bold">
                    {era.start_year}
                  </span>
                  <span className="text-text-secondary text-xs">→</span>
                  <span className="px-2 py-0.5 rounded-md bg-neon-pink/20 border border-neon-pink/30 text-neon-pink text-xs font-mono font-bold">
                    {era.end_year || 'Now'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-display text-base font-bold text-text-white group-hover:text-neon-blue transition-colors">
                  {era.name}
                </h3>
                {era.description_md && (
                  <p className="text-text-secondary text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {era.description_md.replace(/[#*_]/g, '').slice(0, 120)}
                  </p>
                )}
              </div>

              {/* Timeline dot */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-neon-blue bg-bg-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-neon-blue" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
