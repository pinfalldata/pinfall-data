'use client'

import Image from 'next/image'
import { useState } from 'react'
import { getShowColorStyle } from '@/lib/utils'

export function ShowHero({ show }: { show: any }) {
  const [logoError, setLogoError] = useState(false)
  const color = show.primary_color || '#2cb2fe'
  const colorStyle = getShowColorStyle(color) as React.CSSProperties
  const hasLogo = show.logo_url && !logoError
  const seriesName = show.show_series?.short_name || ''

  return (
    <section className="relative overflow-hidden bg-bg-primary" style={colorStyle}>
      {/* Banner background */}
      <div className="relative h-[320px] sm:h-[380px] lg:h-[440px] overflow-hidden">
        {/* Banner image if exists */}
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
              {/* Glow effect behind logo — like the superstar photo border */}
              <div
                className="absolute -inset-3 rounded-2xl opacity-40 blur-xl pointer-events-none"
                style={{ backgroundColor: color }}
              />
              <div
                className="absolute -inset-1 rounded-2xl opacity-60 pointer-events-none"
                style={{
                  boxShadow: `0 0 30px ${color}66, 0 0 60px ${color}33, 0 0 90px ${color}1a`,
                }}
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
            /* Fallback: show name as text */
            <div className="text-center">
              {seriesName && (
                <span
                  className="text-sm font-bold uppercase tracking-widest mb-2 block"
                  style={{ color }}
                >
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

          {/* Show type badge */}
          <div className="mt-3 flex items-center gap-2">
            {show.show_type && (
              <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: `${color}20`,
                  borderColor: `${color}40`,
                  color,
                }}
              >
                {show.show_type === 'ppv' ? 'Premium Live Event' : show.show_type === 'weekly' ? 'Weekly Show' : show.show_type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Animated neon separator with dynamic color */}
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
