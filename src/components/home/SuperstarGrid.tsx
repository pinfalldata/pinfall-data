'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
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
  phase: 'visible' | 'fading-out' | 'fading-in'
  nextSuperstar?: Superstar
  span: 1 | 2 // 1 = normal, 2 = featured (2x2)
}

// Bento layout patterns: { col, row, span } — span 2 = takes 2col x 2row
// Desktop: 8 columns, 3 rows — 12 cells shown
const DESKTOP_LAYOUT = [
  { col: 1, row: 1, span: 1 }, { col: 2, row: 1, span: 2 }, { col: 4, row: 1, span: 1 },
  { col: 5, row: 1, span: 1 }, { col: 6, row: 1, span: 1 }, { col: 7, row: 1, span: 2 },
  { col: 1, row: 2, span: 1 }, { col: 4, row: 2, span: 2 }, { col: 6, row: 2, span: 1 },
  { col: 1, row: 3, span: 2 }, { col: 3, row: 3, span: 1 }, { col: 4, row: 3, span: 1 },
  { col: 6, row: 3, span: 1 }, { col: 7, row: 3, span: 1 }, { col: 8, row: 3, span: 1 },
  { col: 3, row: 2, span: 1 }, { col: 8, row: 1, span: 1 }, { col: 8, row: 2, span: 1 },
]

// Tablet: 6 columns, 3 rows
const TABLET_LAYOUT = [
  { col: 1, row: 1, span: 2 }, { col: 3, row: 1, span: 1 }, { col: 4, row: 1, span: 1 },
  { col: 5, row: 1, span: 2 }, { col: 3, row: 2, span: 2 }, { col: 5, row: 2, span: 1 },
  { col: 1, row: 2, span: 1 }, { col: 2, row: 2, span: 1 }, { col: 6, row: 2, span: 1 },
  { col: 1, row: 3, span: 1 }, { col: 2, row: 3, span: 1 }, { col: 5, row: 3, span: 1 },
  { col: 6, row: 3, span: 1 },
]

// Mobile: 4 columns, 3 rows
const MOBILE_LAYOUT = [
  { col: 1, row: 1, span: 2 }, { col: 3, row: 1, span: 1 }, { col: 4, row: 1, span: 1 },
  { col: 3, row: 2, span: 2 }, { col: 1, row: 2, span: 1 }, { col: 2, row: 2, span: 1 },
  { col: 1, row: 3, span: 1 }, { col: 2, row: 3, span: 1 }, { col: 3, row: 3, span: 1 },
  { col: 4, row: 3, span: 1 },
]

export function SuperstarGrid() {
  const [cells, setCells] = useState<Cell[]>([])
  const poolRef = useRef<Superstar[]>([])
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setBp(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop')
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const layout = bp === 'mobile' ? MOBILE_LAYOUT : bp === 'tablet' ? TABLET_LAYOUT : DESKTOP_LAYOUT
  const total = layout.length
  const gridCols = bp === 'mobile' ? 4 : bp === 'tablet' ? 6 : 8

  // Fetch superstars
  useEffect(() => {
    fetch(`/api/random-superstars?count=${total + 30}`)
      .then(r => r.json())
      .then(data => {
        const all = (data.superstars || []).filter((s: Superstar) => s.photo_url)
        if (all.length < total) return
        const initial = all.slice(0, total).map((s: Superstar, i: number) => ({
          superstar: s,
          phase: 'visible' as const,
          span: (layout[i]?.span || 1) as 1 | 2,
        }))
        setCells(initial)
        poolRef.current = all.slice(total)
      })
      .catch(() => {})
  }, [total])

  // Slow dramatic transitions — 5.5s between swaps, 1.5s fade out + 1.5s fade in
  useEffect(() => {
    if (cells.length === 0) return

    const interval = setInterval(() => {
      if (poolRef.current.length === 0) {
        fetch(`/api/random-superstars?count=30`)
          .then(r => r.json())
          .then(data => {
            poolRef.current = (data.superstars || []).filter((s: Superstar) => s.photo_url)
          })
        return
      }

      const cellIndex = Math.floor(Math.random() * cells.length)
      const nextSuperstar = poolRef.current.shift()!

      // Phase 1: fade out (1.5s)
      setCells(prev => prev.map((c, i) =>
        i === cellIndex ? { ...c, phase: 'fading-out' as const, nextSuperstar } : c
      ))

      // Phase 2: swap + fade in (after 1.5s)
      setTimeout(() => {
        setCells(prev => prev.map((c, i) =>
          i === cellIndex && c.nextSuperstar
            ? { superstar: c.nextSuperstar, phase: 'fading-in' as const, span: c.span }
            : c
        ))
      }, 1500)

      // Phase 3: fully visible (after 3s total)
      setTimeout(() => {
        setCells(prev => prev.map((c, i) =>
          i === cellIndex ? { ...c, phase: 'visible' as const } : c
        ))
      }, 3000)
    }, 5500)

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
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridAutoRows: bp === 'mobile' ? '90px' : bp === 'tablet' ? '110px' : '120px',
        }}
      >
        {cells.map((cell, i) => {
          const pos = layout[i]
          if (!pos) return null
          const isFeatured = pos.span === 2

          return (
            <Link
              key={`cell-${i}`}
              href={`/superstars/${cell.superstar.slug}`}
              className="relative group overflow-hidden rounded-lg border border-border-subtle/15 hover:border-neon-blue/40 transition-all duration-300 hover:shadow-neon-blue"
              style={{
                gridColumn: `${pos.col} / span ${pos.span}`,
                gridRow: `${pos.row} / span ${pos.span}`,
              }}
            >
              {/* Image with phase-based opacity */}
              <div
                className="absolute inset-0 transition-all duration-[1500ms] ease-in-out"
                style={{
                  opacity: cell.phase === 'fading-out' ? 0 : cell.phase === 'fading-in' ? 1 : 1,
                  transform: cell.phase === 'fading-out' ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <Image
                  src={cell.superstar.photo_url}
                  alt={cell.superstar.name}
                  fill
                  sizes={isFeatured ? '(max-width: 640px) 50vw, 25vw' : '(max-width: 640px) 25vw, 12vw'}
                  className="object-cover"
                />
              </div>

              {/* Dark vignette when fading */}
              <div
                className="absolute inset-0 bg-bg-primary transition-opacity duration-[1500ms]"
                style={{ opacity: cell.phase === 'fading-out' ? 0.9 : 0 }}
              />

              {/* Hover overlay with name */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-2 sm:pb-3 px-2">
                <span className={`text-text-white font-display font-bold text-center leading-tight ${
                  isFeatured ? 'text-sm sm:text-lg' : 'text-[10px] sm:text-xs'
                }`}>
                  {cell.superstar.name}
                </span>
              </div>

              {/* Featured cell gold corner accent */}
              {isFeatured && (
                <div className="absolute top-0 left-0 w-8 h-8 overflow-hidden">
                  <div className="absolute -top-4 -left-4 w-8 h-8 rotate-45 bg-neon-blue/20" />
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
