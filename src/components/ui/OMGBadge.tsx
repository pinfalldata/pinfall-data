'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * Animated OMG Moment badge — WWE premium design.
 * 
 * Usage:
 *   <OMGBadge matchId={123} />                           — fetch & display for match
 *   <OMGBadge segmentId={456} />                         — fetch & display for segment
 *   <OMGBadge showId={789} variant="inline" />           — tiny inline badge
 *   <OMGBadge moments={[{...}]} variant="inline" />      — pre-loaded (no fetch)
 *   <OMGBadge moments={[{...}]} variant="full" />        — large banner
 */

interface OMGMoment {
  id: number
  title: string
  slug: string
  category: string
}

interface Props {
  matchId?: number
  segmentId?: number
  showId?: number
  moments?: OMGMoment[]
  variant?: 'badge' | 'full' | 'inline'
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string; gradient: string }> = {
  extreme:   { label: 'Extreme',   color: '#ef4444', icon: '🔥', gradient: 'from-red-600/20 via-red-500/10 to-transparent' },
  wtf:       { label: 'WTF',       color: '#a855f7', icon: '🤯', gradient: 'from-purple-600/20 via-purple-500/10 to-transparent' },
  sexy:      { label: 'Sexy',      color: '#ec4899', icon: '💋', gradient: 'from-pink-600/20 via-pink-500/10 to-transparent' },
  return:    { label: 'Return',    color: '#22c55e', icon: '🚀', gradient: 'from-emerald-600/20 via-emerald-500/10 to-transparent' },
  betrayal:  { label: 'Betrayal',  color: '#f97316', icon: '🗡️', gradient: 'from-orange-600/20 via-orange-500/10 to-transparent' },
  emotional: { label: 'Emotional', color: '#3b82f6', icon: '💎', gradient: 'from-blue-600/20 via-blue-500/10 to-transparent' },
}

export function OMGBadge({ matchId, segmentId, showId, moments: preloaded, variant = 'badge' }: Props) {
  const [moments, setMoments] = useState<OMGMoment[]>(preloaded || [])

  useEffect(() => {
    // If pre-loaded moments provided, skip fetch
    if (preloaded) {
      setMoments(preloaded)
      return
    }

    const params = new URLSearchParams()
    if (matchId) params.set('matchId', String(matchId))
    if (segmentId) params.set('segmentId', String(segmentId))
    if (showId) params.set('showId', String(showId))
    if (!matchId && !segmentId && !showId) return

    fetch(`/api/omg-check?${params}`)
      .then(r => r.json())
      .then(d => setMoments(d.moments || []))
      .catch(() => {})
  }, [matchId, segmentId, showId, preloaded])

  if (moments.length === 0) return null

  const m = moments[0]
  const cat = CATEGORY_CONFIG[m.category] || { label: 'OMG', color: '#c7a05a', icon: '⚡', gradient: 'from-yellow-600/20 via-yellow-500/10 to-transparent' }

  // ========================
  // INLINE — tiny badge for show match/segment rows
  // ========================
  if (variant === 'inline') {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 relative overflow-hidden"
        style={{
          background: `${cat.color}15`,
          color: cat.color,
          border: `1px solid ${cat.color}35`,
          textShadow: `0 0 6px ${cat.color}40`,
        }}
      >
        {/* Animated shimmer */}
        <span
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(90deg, transparent, ${cat.color}20, transparent)`,
            backgroundSize: '200% 100%',
            animation: 'omg-shimmer 2s ease-in-out infinite',
          }}
        />
        <span className="relative flex items-center gap-0.5">
          <span className="text-[8px]">{cat.icon}</span>
          <span>OMG</span>
        </span>
      </span>
    )
  }

  // ========================
  // BADGE — medium badge for show detail header area
  // ========================
  if (variant === 'badge') {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider relative overflow-hidden"
        style={{
          background: `${cat.color}12`,
          color: cat.color,
          border: `1px solid ${cat.color}30`,
        }}
      >
        {/* Animated border glow */}
        <span
          className="absolute inset-0 rounded-lg opacity-40"
          style={{
            boxShadow: `inset 0 0 12px ${cat.color}20, 0 0 8px ${cat.color}10`,
            animation: 'omg-glow 2s ease-in-out infinite alternate',
          }}
        />
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: cat.color }} />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: cat.color }} />
        </span>
        <span className="relative">{cat.icon} OMG {cat.label}</span>
      </div>
    )
  }

  // ========================
  // FULL — large animated premium banner for match/segment detail pages
  // ========================
  return (
    <div
      className="relative overflow-hidden rounded-xl border my-4 group"
      style={{
        borderColor: `${cat.color}30`,
        background: `linear-gradient(135deg, ${cat.color}08, ${cat.color}03, transparent)`,
      }}
    >
      {/* Animated background pulse */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(ellipse at 20% 50%, ${cat.color}15, transparent 60%)`,
          animation: 'omg-pulse 3s ease-in-out infinite alternate',
        }}
      />

      {/* Top accent line with sweep animation */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{
          background: `linear-gradient(90deg, transparent, ${cat.color}60, ${cat.color}, ${cat.color}60, transparent)`,
          backgroundSize: '200% 100%',
          animation: 'omg-sweep 3s ease-in-out infinite',
        }}
      />

      <div className="relative px-4 py-3.5 flex items-center gap-3">
        {/* Animated icon with glow ring */}
        <div className="relative shrink-0 w-10 h-10 flex items-center justify-center">
          <span
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              background: cat.color,
              animation: 'omg-glow 2s ease-in-out infinite alternate',
              filter: 'blur(6px)',
            }}
          />
          <span className="relative text-2xl" style={{ filter: `drop-shadow(0 0 4px ${cat.color}50)` }}>
            {cat.icon}
          </span>
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: cat.color }} />
            <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: cat.color, boxShadow: `0 0 6px ${cat.color}` }} />
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-[11px] font-black uppercase tracking-widest"
              style={{ color: cat.color, textShadow: `0 0 10px ${cat.color}30` }}
            >
              ⚡ OMG {cat.label} Moment
            </span>
          </div>
          <Link
            href={`/omg-moments/${getCategorySlug(m.category)}`}
            className="text-sm text-text-white font-semibold hover:underline line-clamp-1 transition-colors"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
          >
            {m.title}
          </Link>
        </div>

        <Link
          href={`/omg-moments/${getCategorySlug(m.category)}`}
          className="text-[10px] font-bold shrink-0 px-3 py-1.5 rounded-lg transition-all uppercase tracking-wider hover:scale-105"
          style={{
            color: cat.color,
            background: `${cat.color}15`,
            border: `1px solid ${cat.color}25`,
            boxShadow: `0 0 10px ${cat.color}10`,
          }}
        >
          View →
        </Link>
      </div>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes omg-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes omg-glow {
          0% { opacity: 0.15; }
          100% { opacity: 0.4; }
        }
        @keyframes omg-pulse {
          0% { opacity: 0.1; transform: scale(1); }
          100% { opacity: 0.25; transform: scale(1.05); }
        }
        @keyframes omg-sweep {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
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
