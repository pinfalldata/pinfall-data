'use client'

import { useId } from 'react'

/**
 * StarRating — Meltzer-style 5-star rating display
 * Converts a 0-10 scale to 0-5 stars with half-star support.
 */

interface StarRatingProps {
  rating: number | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  showValue?: boolean
  color?: string
  showOutOf5?: boolean
}

const SIZE_MAP = {
  xs: { star: 12, gap: 1, text: 'text-[10px]' },
  sm: { star: 16, gap: 1.5, text: 'text-xs' },
  md: { star: 20, gap: 2, text: 'text-sm' },
  lg: { star: 24, gap: 2.5, text: 'text-base' },
  xl: { star: 32, gap: 3, text: 'text-lg' },
}

function getStarColor(rating10: number): string {
  if (rating10 >= 9) return '#10b981'
  if (rating10 >= 7) return '#22c55e'
  if (rating10 >= 5) return '#facc15'
  if (rating10 >= 3) return '#fb923c'
  return '#ef4444'
}

function StarIcon({ size, fill, halfFill, color, uniqueId }: {
  size: number; fill: boolean; halfFill: boolean; color: string; uniqueId: string
}) {
  if (halfFill) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={uniqueId}>
            <stop offset="50%" stopColor={color} />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill={`url(#${uniqueId})`}
          stroke={color}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={fill ? color : 'transparent'}
        stroke={fill ? color : 'rgba(255,255,255,0.15)'}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function StarRating({ rating, size = 'md', showValue = false, color, showOutOf5 }: StarRatingProps) {
  const id = useId()
  if (rating == null || rating === 0) return null

  const stars5 = rating / 2
  const fullStars = Math.floor(stars5)
  const hasHalf = (stars5 - fullStars) >= 0.25 && (stars5 - fullStars) < 0.75
  const roundedUp = (stars5 - fullStars) >= 0.75
  const totalFull = roundedUp ? fullStars + 1 : fullStars
  const starColor = color || getStarColor(rating)
  const { star: starSize, gap, text: textClass } = SIZE_MAP[size]

  return (
    <div className="inline-flex items-center" style={{ gap: `${gap * 4}px` }}>
      <div className="flex items-center" style={{ gap: `${gap}px` }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <StarIcon
            key={i}
            size={starSize}
            fill={i < totalFull}
            halfFill={!roundedUp && hasHalf && i === fullStars}
            color={starColor}
            uniqueId={`${id}-star-${i}`}
          />
        ))}
      </div>
      {showValue && (
        <span className={`font-mono font-bold ${textClass}`} style={{ color: starColor }}>
          {showOutOf5 ? `${stars5.toFixed(1)}` : `${rating}/10`}
        </span>
      )}
    </div>
  )
}
