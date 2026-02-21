'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { getShowColorStyle, formatDate } from '@/lib/utils'

export function ShowHero({ show }: { show: any }) {
  const [logoError, setLogoError] = useState(false)
  const color = show.primary_color || '#2cb2fe'
  const colorStyle = getShowColorStyle(color) as React.CSSProperties
  const hasLogo = show.logo_url && !logoError
  const seriesName = show.show_series?.short_name || ''
  const showTypeLabel = show.show_type === 'ppv' ? 'Premium Live Event'
    : show.show_type === 'weekly' ? 'Weekly Show'
    : show.show_type === 'house_show' ? 'House Show'
    : show.show_type === 'special' ? 'Special Event'
    : show.show_type || ''

  return (
    <section className="relative overflow-hidden bg-bg-primary" style={colorStyle}>
      {/* Banner background */}
      <div className="relative h-[340px] sm:h-[400px] lg:h-[480px] overflow-hidden">
        {show.banner_url && (
          <div className="absolute inset-0 z-0">
            <Image src={show.banner_url} alt="" fill className="object-cover opacity-15" priority />
          </div>
        )}

        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-tertiary/95 via-bg-secondary/70 to-transparent pointer-events-none" />
        <div
          className="absolute inset-0 bg-grid opacity-15 animate-grid-pulse pointer-events-none"
          style={{
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
          }}
        />

        {/* Dynamic color glow orbs */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[180px] opacity-20 pointer-events-none"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute top-10 right-1/4 w-72 h-72 rounded-full blur-[120px] opacity-10 pointer-events-none"
          style={{ backgroundColor: color }}
        />

        {/* Fade to content */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />

        {/* ===== CENTERED LOGO ===== */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          {hasLogo ? (
            <div className="relative w-56 h-56 sm:w-72 sm:h-72 lg:w-80 lg:h-80">
              <div
                className="absolute -inset-4 rounded-2xl opacity-40 blur-xl pointer-events-none"
                style={{ backgroundColor: color }}
              />
              <div
                className="absolute -inset-1 rounded-2xl opacity-60 pointer-events-none"
                style={{ boxShadow: `0 0 40px ${color}66, 0 0 80px ${color}33, 0 0 120px ${color}1a` }}
              />
              <div
                className="relative w-full h-full rounded-2xl overflow-hidden border-2 bg-bg-tertiary/50 backdrop-blur-sm"
                style={{ borderColor: `${color}50` }}
              >
                <Image
                  src={show.logo_url}
                  alt={show.name}
                  fill
                  sizes="(max-width: 640px) 224px, (max-width: 1024px) 288px, 320px"
                  className="object-contain p-5"
                  priority
                  onError={() => setLogoError(true)}
                />
              </div>
            </div>
          ) : (
            <div className="text-center">
              {seriesName && (
                <span className="text-sm font-bold uppercase tracking-widest mb-2 block" style={{ color }}>
                  {seriesName}
                </span>
              )}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-text-white tracking-tight">
                {show.name.toUpperCase()}
              </h1>
            </div>
          )}

          {/* Show name below logo */}
          {hasLogo && (
            <div className="mt-5 text-center">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-text-white tracking-tight">
                {show.name.toUpperCase()}
              </h1>
            </div>
          )}

          {/* Show type badge + date */}
          <div className="mt-3 flex items-center gap-3 flex-wrap justify-center">
            {showTypeLabel && (
              <span
                className="px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: `${color}20`,
                  borderColor: `${color}40`,
                  color,
                }}
              >
                {showTypeLabel}
              </span>
            )}
            <span className="text-sm text-text-secondary">{formatDate(show.date)}</span>
          </div>

          {/* Description */}
          {show.description_md && (
            <p className="mt-4 text-sm text-text-secondary max-w-2xl text-center leading-relaxed line-clamp-3">
              {show.description_md}
            </p>
          )}
        </div>
      </div>

      {/* Prev / Next Navigation */}
      {(show.prevShow || show.nextShow) && (
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 -mt-4 mb-2">
          <div className="flex items-center justify-between">
            {show.prevShow ? (
              <Link
                href={`/shows/${show.prevShow.slug}`}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all hover:translate-x-[-2px]"
                style={{ borderColor: `${color}25`, backgroundColor: `${color}08` }}
              >
                <svg className="w-4 h-4 text-text-secondary group-hover:text-text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <div className="text-left">
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider">Previous</p>
                  <p className="text-xs text-text-white font-medium truncate max-w-[140px] sm:max-w-[200px]">{show.prevShow.name}</p>
                </div>
              </Link>
            ) : <div />}
            {show.nextShow ? (
              <Link
                href={`/shows/${show.nextShow.slug}`}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all hover:translate-x-[2px]"
                style={{ borderColor: `${color}25`, backgroundColor: `${color}08` }}
              >
                <div className="text-right">
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider">Next</p>
                  <p className="text-xs text-text-white font-medium truncate max-w-[140px] sm:max-w-[200px]">{show.nextShow.name}</p>
                </div>
                <svg className="w-4 h-4 text-text-secondary group-hover:text-text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : <div />}
          </div>
        </div>
      )}

      {/* Animated neon separator */}
      <div
        className="h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, transparent 30%, ${color} 50%, transparent 70%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: 'neon-sweep 3s ease-in-out infinite',
        }}
      />
    </section>
  )
}
