'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { getShowColorStyle, formatDate } from '@/lib/utils'

export function ShowHero({ show }: { show: any }) {
  const [logoError, setLogoError] = useState(false)
  const color = show.primary_color || '#c7a05a'
  const colorStyle = getShowColorStyle(color) as React.CSSProperties
  const hasLogo = show.logo_url && !logoError
  const seriesName = show.show_series?.short_name || ''

  return (
    <section className="relative overflow-hidden bg-bg-primary" style={colorStyle}>
      {/* Banner background */}
      <div className="relative h-[320px] sm:h-[380px] lg:h-[440px] overflow-hidden">
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[150px] opacity-20 pointer-events-none"
          style={{ backgroundColor: color }}
        />
        <div
          className="absolute top-10 right-1/4 w-60 h-60 rounded-full blur-[100px] opacity-10 pointer-events-none"
          style={{ backgroundColor: color }}
        />

        {/* Fade to content */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />

        {/* ===== CENTERED LOGO ===== */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">
          {hasLogo ? (
            <div className="relative w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72">
              <div
                className="absolute -inset-3 rounded-2xl opacity-40 blur-xl pointer-events-none"
                style={{ backgroundColor: color }}
              />
              <div
                className="absolute -inset-1 rounded-2xl opacity-60 pointer-events-none"
                style={{ boxShadow: `0 0 30px ${color}66, 0 0 60px ${color}33, 0 0 90px ${color}1a` }}
              />
              <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 bg-bg-tertiary/50 backdrop-blur-sm"
                style={{ borderColor: `${color}50` }}>
                <Image
                  src={show.logo_url}
                  alt={show.name}
                  fill
                  sizes="(max-width: 640px) 192px, (max-width: 1024px) 240px, 288px"
                  className="object-contain p-4"
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
            <div className="mt-4 text-center">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-text-white tracking-tight">
                {show.name.toUpperCase()}
              </h1>
            </div>
          )}

          {/* Show type badge + date */}
          <div className="mt-3 flex items-center gap-3 flex-wrap justify-center">
            {show.show_type && (
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: `${color}20`,
                  borderColor: `${color}40`,
                  color,
                }}
              >
                {show.show_type === 'ppv' ? 'Premium Live Event' : show.show_type === 'weekly' ? 'Weekly Show' : show.show_type === 'house_show' ? 'House Show' : show.show_type}
              </span>
            )}
            <span className="text-text-secondary text-sm">{formatDate(show.date)}</span>
          </div>
        </div>

        {/* ===== PREV / NEXT navigation ===== */}
        {show.prevShow && (
          <Link
            href={`/shows/${show.prevShow.slug}`}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-primary/80 border border-border-subtle/30 backdrop-blur-sm hover:border-border-subtle/60 transition-all group"
          >
            <svg className="w-4 h-4 text-text-secondary group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <div className="hidden sm:block">
              <p className="text-[9px] text-text-secondary uppercase tracking-wider">Previous</p>
              <p className="text-xs text-text-white font-medium truncate max-w-[120px]">{show.prevShow.name}</p>
            </div>
          </Link>
        )}

        {show.nextShow && (
          <Link
            href={`/shows/${show.nextShow.slug}`}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-primary/80 border border-border-subtle/30 backdrop-blur-sm hover:border-border-subtle/60 transition-all group"
          >
            <div className="hidden sm:block text-right">
              <p className="text-[9px] text-text-secondary uppercase tracking-wider">Next</p>
              <p className="text-xs text-text-white font-medium truncate max-w-[120px]">{show.nextShow.name}</p>
            </div>
            <svg className="w-4 h-4 text-text-secondary group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>

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
