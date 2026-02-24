'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Superstar {
  id: number
  name: string
  slug: string
  photo_url: string
}

interface Cell {
  superstar: Superstar
  opacity: number
  fading: boolean
  nextSuperstar?: Superstar
}

export function SuperstarGrid() {
  const [cells, setCells] = useState<Cell[]>([])
  const [pool, setPool] = useState<Superstar[]>([])
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [cols, setCols] = useState(8)
  const poolRef = useRef<Superstar[]>([])

  // Determine grid size based on screen
  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth
      if (w < 640) setCols(4)
      else if (w < 1024) setCols(6)
      else setCols(8)
    }
    updateCols()
    window.addEventListener('resize', updateCols)
    return () => window.removeEventListener('resize', updateCols)
  }, [])

  const rows = 2
  const total = cols * rows

  // Fetch superstars
  useEffect(() => {
    fetch(`/api/random-superstars?count=${total + 20}`)
      .then(r => r.json())
      .then(data => {
        const all = (data.superstars || []).filter((s: Superstar) => s.photo_url)
        if (all.length < total) return

        const initial = all.slice(0, total).map((s: Superstar) => ({
          superstar: s,
          opacity: 1,
          fading: false,
        }))
        setCells(initial)
        setPool(all.slice(total))
        poolRef.current = all.slice(total)
      })
      .catch(() => {})
  }, [total])

  // Periodic swap animation
  useEffect(() => {
    if (cells.length === 0) return

    const interval = setInterval(() => {
      const currentPool = poolRef.current
      if (currentPool.length === 0) {
        // Refetch pool
        fetch(`/api/random-superstars?count=20`)
          .then(r => r.json())
          .then(data => {
            const fresh = (data.superstars || []).filter((s: Superstar) => s.photo_url)
            setPool(fresh)
            poolRef.current = fresh
          })
        return
      }

      // Pick random cell to swap
      const cellIndex = Math.floor(Math.random() * cells.length)
      const nextSuperstar = currentPool[0]
      poolRef.current = currentPool.slice(1)
      setPool(prev => prev.slice(1))

      // Start fade out
      setCells(prev => prev.map((c, i) =>
        i === cellIndex ? { ...c, fading: true, nextSuperstar } : c
      ))

      // After fade out, swap and fade in
      setTimeout(() => {
        setCells(prev => prev.map((c, i) =>
          i === cellIndex && c.nextSuperstar
            ? { superstar: c.nextSuperstar, opacity: 1, fading: false }
            : c
        ))
      }, 600)
    }, 2500)

    return () => clearInterval(interval)
  }, [cells.length])

  if (cells.length === 0) return null

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
      <h2 className="font-display text-2xl lg:text-3xl font-bold text-text-white mb-6 text-center">
        <span className="text-neon-pink">Hall</span> of Legends
      </h2>

      <div
        className="grid gap-1.5 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {cells.map((cell, i) => (
          <Link
            key={`${cell.superstar.id}-${i}`}
            href={`/superstars/${cell.superstar.slug}`}
            className="relative group aspect-square rounded-lg overflow-hidden border border-border-subtle/20 hover:border-neon-blue/30 transition-all duration-300"
            onMouseEnter={() => setHoveredId(cell.superstar.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div
              className="absolute inset-0 transition-opacity duration-600"
              style={{ opacity: cell.fading ? 0 : 1 }}
            >
              <Image
                src={cell.superstar.photo_url}
                alt={cell.superstar.name}
                fill
                sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 12vw"
                className="object-cover"
              />
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center pb-2 sm:pb-3">
              <span className="text-[10px] sm:text-xs text-text-white font-medium text-center px-1 truncate max-w-full">
                {cell.superstar.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
