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
  featured: boolean
}

// Which indices should be featured (2x2) per breakpoint
// Desktop: 8 cols → items 1, 6, 10 are featured (2x2)
// Tablet: 6 cols → items 0, 4 are featured
// Mobile: 4 cols → items 0, 5 are featured
const FEATURED_DESKTOP = new Set([1, 6, 10])
const FEATURED_TABLET = new Set([0, 4])
const FEATURED_MOBILE = new Set([0, 5])

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

  // Number of items to show: enough to fill ~3 rows
  // Desktop 8cols: 3 featured(=4cells each) + ~14 normal ≈ 18 items → ~3 rows
  // We'll use a fixed count and let auto-flow handle it
  const total = bp === 'mobile' ? 12 : bp === 'tablet' ? 15 : 18
  const featuredSet = bp === 'mobile' ? FEATURED_MOBILE : bp === 'tablet' ? FEATURED_TABLET : FEATURED_DESKTOP
  const gridCols = bp === 'mobile' ? 4 : bp === 'tablet' ? 6 : 8

  useEffect(() => {
    fetch(`/api/random-superstars?count=${total + 30}`)
      .then(r => r.json())
      .then(data => {
        const all = (data.superstars || []).filter((s: Superstar) => s.photo_url && s.photo_url.trim() !== '')
        if (all.length < 6) return

        const count = Math.min(total, all.length)
        const initial: Cell[] = all.slice(0, count).map((s: Superstar, i: number) => ({
          superstar: s,
          phase: 'visible' as const,
          featured: featuredSet.has(i),
        }))
        setCells(initial)
        poolRef.current = all.slice(count)
      })
      .catch(() => {})
  }, [total])

  // Slow dramatic transitions — 5.5s between swaps
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

      // Phase 1: fade out (1.5s)
      setCells(prev => prev.map((c, i) =>
        i === cellIndex ? { ...c, phase: 'fading-out' as const, nextSuperstar } : c
      ))

      // Phase 2: swap + fade in (after 1.5s)
      setTimeout(() => {
        setCells(prev => prev.map((c, i) =>
          i === cellIndex && c.nextSuperstar
            ? { ...c, superstar: c.nextSuperstar, phase: 'fading-in' as const, nextSuperstar: undefined }
            : c
        ))
      }, 1500)

      // Phase 3: fully visible
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
    <div
      className="grid gap-1.5 sm:gap-2"
      style={{
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gridAutoRows: bp === 'mobile' ? '85px' : bp === 'tablet' ? '100px' : '115px',
        gridAutoFlow: 'dense',
      }}
    >
      {cells.map((cell, i) => (
        <Link
          key={`cell-${i}-${cell.superstar.id}`}
          href={`/superstars/${cell.superstar.slug}`}
          className={`relative group overflow-hidden rounded-lg border border-border-subtle/15 hover:border-neon-blue/40 transition-all duration-300 ${
            cell.featured ? 'col-span-2 row-span-2' : ''
          }`}
        >
          {/* Image with phase-based opacity */}
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
              sizes={cell.featured ? '(max-width: 640px) 50vw, 25vw' : '(max-width: 640px) 25vw, 12vw'}
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
              cell.featured ? 'text-sm sm:text-base' : 'text-[10px] sm:text-xs'
            }`}>
              {cell.superstar.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
