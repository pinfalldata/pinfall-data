'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MediaCarousel } from '@/components/ui/MediaCarousel'
import {
  formatDate, formatDuration, formatNumber,
  formatCompactNumber, formatTime,
  getShowColorStyle, getSegmentCategoryLabel, getSegmentCategoryIcon,
} from '@/lib/utils'

const MIC_BG_URL = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Segments/microwwe.png'

function renderDescription(md?: string) {
  if (!md) return null
  const paragraphs = md.split(/\n\s*\n/)
  return paragraphs.map((para, i) => {
    const lines = para.split('\n')
    return (
      <p key={i} className="text-text-primary leading-relaxed mb-4 last:mb-0">
        {lines.map((line, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
    )
  })
}

export default function SegmentDetail({ segment }: { segment: any }) {
  const show = segment.show
  const color = show?.primary_color || '#c7a05a'
  const colorStyle = getShowColorStyle(color) as React.CSSProperties
  const participants = (segment.participants || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
  const media = (segment.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order)

  const epNum = show?.episodeNumber || show?.episode_number
  const seriesName = show?.show_series?.short_name || show?.show_series?.name || ''
  const venue = [show?.venue, show?.city, show?.state_province, show?.country].filter(Boolean).join(', ')

  const commentators = show?.commentators || []
  const ringAnnouncers = show?.ringAnnouncers || []

  const categoryLabel = getSegmentCategoryLabel(segment.category)
  const categoryIcon = getSegmentCategoryIcon(segment.category)

  return (
    <div style={colorStyle}>
      {/* ===== Show header breadcrumb bar (same as MatchHero) ===== */}
      <div className="bg-bg-secondary/60 border-b border-border-subtle/20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3">
          {/* Top row: logo + name + info pills */}
          <div className="flex items-center gap-3 flex-wrap">
            {show?.logo_url && (
              <Link href={`/shows/${show?.slug}`}>
                <Image src={show.logo_url} alt="" width={48} height={48} className="h-10 sm:h-12 w-auto object-contain" />
              </Link>
            )}
            <div className="min-w-0">
              <Link href={`/shows/${show?.slug}`} className="text-sm sm:text-base font-bold hover:underline" style={{ color }}>
                {show?.name}
              </Link>
              <p className="text-xs text-text-secondary">{formatDate(show?.date)}</p>
            </div>
            {/* Quick info pills */}
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {epNum && (
                <span className="text-[10px] px-2 py-1 rounded-full border border-border-subtle/30 bg-bg-tertiary/50 text-text-secondary">
                  📺 {seriesName} #{epNum}
                </span>
              )}
              {show?.attendance && (
                <span className="text-[10px] px-2 py-1 rounded-full border border-border-subtle/30 bg-bg-tertiary/50 text-text-secondary">
                  🏟️ {formatNumber(show.attendance)}
                </span>
              )}
              {show?.tv_audience && (
                <span className="text-[10px] px-2 py-1 rounded-full border border-border-subtle/30 bg-bg-tertiary/50 text-text-secondary">
                  📡 {formatCompactNumber(show.tv_audience)}
                </span>
              )}
              {show?.start_time && (
                <span className="text-[10px] px-2 py-1 rounded-full border border-border-subtle/30 bg-bg-tertiary/50 text-text-secondary">
                  🕐 {formatTime(show.start_time)}
                </span>
              )}
            </div>
          </div>

          {/* Bottom row: venue + commentary + ring announcers */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
            {(show?.arena || venue) && (
              <span className="flex items-center gap-1">
                <span>📍</span>
                {show?.arena?.slug ? (
                  <Link href={`/arenas/${show.arena.slug}`} className="hover:underline" style={{ color }}>
                    {show.arena.name || venue}
                  </Link>
                ) : (
                  <span>{venue}</span>
                )}
                {show?.arena && (
                  <span className="text-text-secondary/60">
                    {[show.arena.city || show?.city, show.arena.state_province || show?.state_province, show.arena.country || show?.country].filter(Boolean).join(', ')}
                  </span>
                )}
              </span>
            )}
            {commentators.length > 0 && (
              <span className="flex items-center gap-1">
                <span>🎧</span>
                {commentators.map((c: any, i: number) => (
                  <span key={c.id || i}>
                    {c.superstar?.slug ? (
                      <Link href={`/superstars/${c.superstar.slug}`} className="hover:underline" style={{ color }}>
                        {c.superstar?.name}
                      </Link>
                    ) : (
                      <span>{c.superstar?.name}</span>
                    )}
                    {i < commentators.length - 1 && ', '}
                  </span>
                ))}
              </span>
            )}
            {ringAnnouncers.length > 0 && (
              <span className="flex items-center gap-1">
                <span>🎙️</span>
                {ringAnnouncers.map((ra: any, i: number) => (
                  <span key={ra.id || i}>
                    {ra.superstar?.slug ? (
                      <Link href={`/superstars/${ra.superstar.slug}`} className="hover:underline" style={{ color }}>
                        {ra.superstar?.name}
                      </Link>
                    ) : (
                      <span>{ra.superstar?.name}</span>
                    )}
                    {i < ringAnnouncers.length - 1 && ', '}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== Segment hero section (same structure as MatchHero) ===== */}
      <section className="relative overflow-hidden bg-bg-primary">
        <div className="relative py-8 sm:py-12 lg:py-16">
          {/* Dynamic background glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[220px] opacity-12 pointer-events-none"
            style={{ backgroundColor: color }}
          />

          {/* Microphone background decoration — always visible, subtle */}
          <div className="absolute right-4 lg:right-16 top-1/2 -translate-y-1/2 w-[180px] h-[280px] sm:w-[220px] sm:h-[340px] lg:w-[300px] lg:h-[460px] pointer-events-none select-none opacity-[0.05]">
            <Image
              src={MIC_BG_URL}
              alt=""
              fill
              className="object-contain"
              aria-hidden="true"
              sizes="300px"
              unoptimized
            />
          </div>

          <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category badge */}
            <div className="text-center mb-4">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
                style={{
                  backgroundColor: `${color}15`,
                  borderColor: `${color}40`,
                  color,
                }}
              >
                {categoryIcon} {categoryLabel}
              </span>
            </div>

            {/* Segment title */}
            <div className="text-center mb-6">
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wide" style={{ color }}>
                {segment.title}
              </h1>
            </div>

            {/* Segment image if any */}
            {segment.image_url && (
              <div className="flex justify-center mb-8">
                <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden border-2 border-border-subtle/30">
                  <Image
                    src={segment.image_url}
                    alt={segment.title}
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 672px"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/40 to-transparent" />
                </div>
              </div>
            )}

            {/* Participants — match card style with photos */}
            {participants.length > 0 && (
              <div className="flex flex-wrap items-start justify-center gap-4 sm:gap-6 lg:gap-8 mb-6">
                {participants.map((p: any) => {
                  const s = p.superstar
                  if (!s) return null
                  return (
                    <div key={p.id} className="flex flex-col items-center text-center" style={{ minWidth: '100px', maxWidth: '160px' }}>
                      <Link href={`/superstars/${s.slug}`}>
                        <div
                          className="relative w-24 h-28 sm:w-32 sm:h-36 lg:w-36 lg:h-40 rounded-xl overflow-hidden border-2 transition-all hover:scale-105"
                          style={{ borderColor: `${color}40` }}
                        >
                          {s.photo_url ? (
                            <Image src={s.photo_url} alt={s.name} fill className="object-cover object-top" sizes="(max-width: 640px) 96px, 144px" />
                          ) : (
                            <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
                              <span className="text-3xl text-border-subtle">?</span>
                            </div>
                          )}
                        </div>
                      </Link>
                      <Link href={`/superstars/${s.slug}`} className="mt-2 text-sm font-medium text-text-white hover:underline" style={{ color }}>
                        {s.name}
                      </Link>
                      {p.role && p.role !== 'participant' && (
                        <span className="mt-0.5 text-[10px] text-text-secondary capitalize">{p.role}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Duration + Rating */}
            <div className="text-center mt-4 space-y-3">
              <div className="flex items-center justify-center gap-4 text-sm text-text-secondary flex-wrap">
                {segment.duration_seconds && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    ⏱️ {formatDuration(segment.duration_seconds)}
                  </span>
                )}
                {segment.rating && (
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    ⭐ {segment.rating}/10
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {segment.description_md && (
              <div className="mt-6 max-w-2xl mx-auto px-4 py-4 rounded-xl border border-border-subtle/20 bg-bg-secondary/20 text-sm leading-relaxed">
                {renderDescription(segment.description_md)}
              </div>
            )}
          </div>
        </div>

        {/* Neon separator */}
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      </section>

      {/* ===== Media Carousel ===== */}
      {media.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-4">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-text-white uppercase tracking-wide">📹 Media</h2>
            <div className="h-px mt-3 max-w-xs mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
          </div>
          <MediaCarousel items={media} columns={2} color={color} />
        </div>
      )}
    </div>
  )
}
