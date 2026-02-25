'use client'

import { useState, useEffect, useRef } from 'react'
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
}

// Explicit grid positions for each breakpoint — guaranteed full rectangle
interface GridSlot {
  col: string // CSS grid-column value e.g. "1 / 3" for span-2
  row: string // CSS grid-row value
  featured: boolean
}

// DESKTOP: 6 cols × 4 rows = 24 cells, 3 featured, 12 normal = 15 items
const DESKTOP_SLOTS: GridSlot[] = [
  { col: '1 / 3', row: '1 / 3', featured: true },  // 0: top-left featured
  { col: '3 / 4', row: '1 / 2', featured: false },
  { col: '4 / 5', row: '1 / 2', featured: false },
  { col: '5 / 7', row: '1 / 3', featured: true },   // 3: top-right featured
  { col: '3 / 4', row: '2 / 3', featured: false },
  { col: '4 / 5', row: '2 / 3', featured: false },
  { col: '1 / 2', row: '3 / 4', featured: false },
  { col: '2 / 3', row: '3 / 4', featured: false },
  { col: '3 / 5', row: '3 / 5', featured: true },   // 8: center featured
  { col: '5 / 6', row: '3 / 4', featured: false },
  { col: '6 / 7', row: '3 / 4', featured: false },
  { col: '1 / 2', row: '4 / 5', featured: false },
  { col: '2 / 3', row: '4 / 5', featured: false },
  { col: '5 / 6', row: '4 / 5', featured: false },
  { col: '6 / 7', row: '4 / 5', featured: false },
]

// TABLET: 5 cols × 4 rows = 20 cells, 2 featured, 12 normal = 14 items
const TABLET_SLOTS: GridSlot[] = [
  { col: '1 / 3', row: '1 / 3', featured: true },   // 0: top-left featured
  { col: '3 / 4', row: '1 / 2', featured: false },
  { col: '4 / 5', row: '1 / 2', featured: false },
  { col: '5 / 6', row: '1 / 2', featured: false },
  { col: '3 / 4', row: '2 / 3', featured: false },
  { col: '4 / 6', row: '2 / 4', featured: true },   // 5: mid-right featured
  { col: '1 / 2', row: '3 / 4', featured: false },
  { col: '2 / 3', row: '3 / 4', featured: false },
  { col: '3 / 4', row: '3 / 4', featured: false },
  { col: '1 / 2', row: '4 / 5', featured: false },
  { col: '2 / 3', row: '4 / 5', featured: false },
  { col: '3 / 4', row: '4 / 5', featured: false },
  { col: '4 / 5', row: '4 / 5', featured: false },
  { col: '5 / 6', row: '4 / 5', featured: false },
]

// MOBILE: 4 cols × 4 rows = 16 cells, 2 featured, 8 normal = 10 items
const MOBILE_SLOTS: GridSlot[] = [
  { col: '1 / 3', row: '1 / 3', featured: true },   // 0: top-left featured
  { col: '3 / 4', row: '1 / 2', featured: false },
  { col: '4 / 5', row: '1 / 2', featured: false },
  { col: '3 / 4', row: '2 / 3', featured: false },
  { col: '4 / 5', row: '2 / 3', featured: false },
  { col: '1 / 2', row: '3 / 4', featured: false },
  { col: '2 / 3', row: '3 / 4', featured: false },
  { col: '3 / 5', row: '3 / 5', featured: true },   // 7: bottom-right featured
  { col: '1 / 2', row: '4 / 5', featured: false },
  { col: '2 / 3', row: '4 / 5', featured: false },
]

export function SuperstarGrid() {
  const [cells, setCells] = useState<Cell[]>([])
  const poolRef = useRef<Superstar[]>([])
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const containerRef = useRef<HTMLDivElement>(null)

  // Detect breakpoint based on container width (not window)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const check = () => {
      const w = el.getBoundingClientRect().width
      setBp(w < 480 ? 'mobile' : w < 700 ? 'tablet' : 'desktop')
    }
    check()

    const ro = new ResizeObserver(check)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const slots = bp === 'mobile' ? MOBILE_SLOTS : bp === 'tablet' ? TABLET_SLOTS : DESKTOP_SLOTS
  const cols = bp === 'mobile' ? 4 : bp === 'tablet' ? 5 : 6
  const rows = 4
  const total = slots.length

  // Fetch superstars
  useEffect(() => {
    fetch(`/api/random-superstars?count=${total + 30}`)
      .then(r => r.json())
      .then(data => {
        const all = (data.superstars || []).filter((s: Superstar) => s.photo_url && s.photo_url.trim() !== '')
        if (all.length < total) return

        const initial: Cell[] = all.slice(0, total).map((s: Superstar) => ({
          superstar: s,
          phase: 'visible' as const,
        }))
        setCells(initial)
        poolRef.current = all.slice(total)
      })
      .catch(() => {})
  }, [total])

  // Slow transitions — 5.5s between swaps
  useEffect(() => {
    if (cells.length === 0) return

    const interval = setInterval(() => {
      if (poolRef.current.length < 2) {
        fetch(`/api/random-superstars?count=30`)
          .then(r => r.json())
          .then(data => {
            poolRef.current = (data.superstars || []).filter((s: Superstar) => s.photo_url && s.photo_url.trim() !== '')
          })
        return
      }

      const cellIndex = Math.floor(Math.random() * cells.length)
      const nextSuperstar = poolRef.current.shift()!

      setCells(prev => prev.map((c, i) =>
        i === cellIndex ? { ...c, phase: 'fading-out' as const, nextSuperstar } : c
      ))

      setTimeout(() => {
        setCells(prev => prev.map((c, i) =>
          i === cellIndex && c.nextSuperstar
            ? { ...c, superstar: c.nextSuperstar, phase: 'fading-in' as const, nextSuperstar: undefined }
            : c
        ))
      }, 1500)

      setTimeout(() => {
        setCells(prev => prev.map((c, i) =>
          i === cellIndex ? { ...c, phase: 'visible' as const } : c
        ))
      }, 3000)
    }, 5500)

    return () => clearInterval(interval)
  }, [cells.length])

  return (
    <div ref={containerRef}>
      {cells.length > 0 && (
        <div
          className="grid gap-1.5 sm:gap-2"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, ${bp === 'mobile' ? '80px' : bp === 'tablet' ? '95px' : '105px'})`,
          }}
        >
          {cells.map((cell, i) => {
            const slot = slots[i]
            if (!slot) return null

            return (
              <Link
                key={`cell-${i}-${cell.superstar.id}`}
                href={`/superstars/${cell.superstar.slug}`}
                className="relative group overflow-hidden rounded-lg border border-border-subtle/15 hover:border-neon-blue/40 transition-all duration-300"
                style={{
                  gridColumn: slot.col,
                  gridRow: slot.row,
                }}
              >
                {/* Image */}
                <div
                  className="absolute inset-0 transition-all ease-in-out"
                  style={{
                    transitionDuration: '1500ms',
                    opacity: cell.phase === 'fading-out' ? 0 : 1,
                    transform: cell.phase === 'fading-out' ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <Image
                    src={cell.superstar.photo_url}
                    alt={cell.superstar.name}
                    fill
                    sizes={slot.featured ? '(max-width: 640px) 50vw, 25vw' : '(max-width: 640px) 25vw, 15vw'}
                    className="object-cover"
                  />
                </div>

                {/* Dark overlay when fading */}
                <div
                  className="absolute inset-0 bg-bg-primary transition-opacity ease-in-out"
                  style={{
                    transitionDuration: '1500ms',
                    opacity: cell.phase === 'fading-out' ? 0.9 : 0,
                  }}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-2 sm:pb-3 px-2">
                  <span className={`text-text-white font-display font-bold text-center leading-tight ${
                    slot.featured ? 'text-sm sm:text-base' : 'text-[10px] sm:text-xs'
                  }`}>
                    {cell.superstar.name}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
