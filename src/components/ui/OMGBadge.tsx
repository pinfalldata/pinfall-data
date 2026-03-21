'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * Animated OMG Moment badge.
 * Shows on matches/segments/shows that have associated OMG moments.
 * 
 * Usage:
 *   <OMGBadge matchId={123} />          — for match pages
 *   <OMGBadge segmentId={456} />        — for segment pages
 *   <OMGBadge showId={789} />           — for show pages (inline on rows)
 *   <OMGBadge showId={789} variant="full" /> — for show detail pages
 */

interface Props {
  matchId?: number
  segmentId?: number
  showId?: number
  variant?: 'badge' | 'full' | 'inline'
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  extreme: { label: 'Extreme', color: '#ef4444' },
  wtf: { label: 'WTF', color: '#a855f7' },
  sexy: { label: 'Sexy', color: '#ec4899' },
  return: { label: 'Return', color: '#22c55e' },
  betrayal: { label: 'Betrayal', color: '#f97316' },
  emotional: { label: 'Emotional', color: '#3b82f6' },
}

export function OMGBadge({ matchId, segmentId, showId, variant = 'badge' }: Props) {
  const [moments, setMoments] = useState<any[]>([])

  useEffect(() => {
    const params = new URLSearchParams()
    if (matchId) params.set('matchId', String(matchId))
    if (segmentId) params.set('segmentId', String(segmentId))
    if (showId) params.set('showId', String(showId))
    if (!matchId && !segmentId && !showId) return

    fetch(`/api/omg-check?${params}`)
      .then(r => r.json())
      .then(d => setMoments(d.moments || []))
      .catch(() => {})
  }, [matchId, segmentId, showId])

  if (moments.length === 0) return null

  const m = moments[0]
  const cat = CATEGORY_LABELS[m.category] || { label: 'OMG', color: '#c7a05a' }

  // INLINE — tiny badge for show match rows
  if (variant === 'inline') {
    return (
      <span
        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider animate-pulse shrink-0"
        style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}40` }}
      >
        ⚡ OMG
      </span>
    )
  }

  // BADGE — medium badge for show detail
  if (variant === 'badge') {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider"
        style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: cat.color }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: cat.color }} />
        </span>
        OMG {cat.label}
      </div>
    )
  }

  // FULL — large animated banner for match/segment detail pages
  return (
    <div className="relative overflow-hidden rounded-xl border my-4" style={{ borderColor: `${cat.color}30`, background: `linear-gradient(135deg, ${cat.color}08, transparent)` }}>
      {/* Animated glow border */}
      <div className="absolute inset-0 rounded-xl opacity-30 animate-pulse" style={{ boxShadow: `inset 0 0 20px ${cat.color}15, 0 0 15px ${cat.color}10` }} />

      <div className="relative px-4 py-3 flex items-center gap-3">
        {/* Pulsing icon */}
        <div className="relative shrink-0">
          <span className="text-2xl">⚡</span>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: cat.color }} />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: cat.color }} />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: cat.color }}>
              OMG {cat.label} Moment
            </span>
          </div>
          <Link href={`/omg-moments/${getCategorySlug(m.category)}`}
            className="text-sm text-text-white font-medium hover:underline line-clamp-1">
            {m.title}
          </Link>
        </div>

        <Link href={`/omg-moments/${getCategorySlug(m.category)}`}
          className="text-[10px] font-medium shrink-0 px-2 py-1 rounded-lg transition-all hover:opacity-80"
          style={{ color: cat.color, background: `${cat.color}15`, border: `1px solid ${cat.color}20` }}>
          View →
        </Link>
      </div>
    </div>
  )
}

function getCategorySlug(cat: string): string {
  const map: Record<string, string> = {
    extreme: 'extreme-moments', wtf: 'wtf-moments', sexy: 'sexy-moments',
    return: 'greatest-returns', betrayal: 'greatest-betrayals', emotional: 'most-emotional-moments',
  }
  return map[cat] || 'extreme-moments'
}
