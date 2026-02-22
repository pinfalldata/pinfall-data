'use client'

import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'
import { formatDate, formatTime, formatNumber, formatCompactNumber } from '@/lib/utils'

export function ShowInfoBar({ show }: { show: any }) {
  const color = show.primary_color || '#2cb2fe'
  const epNum = show.episodeNumber || show.episode_number
  const seriesName = show.show_series?.short_name || show.show_series?.name || ''

  // Arena data (from arenas table via arena_id relation)
  const arena = show.arena
  const arenaName = arena?.name || show.venue
  const arenaLocation = [arena?.city || show.city, arena?.state_province || show.state_province, arena?.country || show.country].filter(Boolean).join(', ')

  // Build info cells — only include non-null ones
  const infoCells: { label: string; value: string; icon: string }[] = []
  infoCells.push({ label: 'Date', icon: '📅', value: formatDate(show.date) })
  if (epNum) infoCells.push({ label: 'Episode', icon: '📺', value: `${seriesName} #${epNum}` })
  if (show.start_time) infoCells.push({ label: 'Start Time', icon: '🕐', value: formatTime(show.start_time) })
  if (show.attendance) infoCells.push({ label: 'Attendance', icon: '🏟️', value: formatNumber(show.attendance) })
  if (show.tv_audience) infoCells.push({ label: 'TV Audience', icon: '📡', value: formatCompactNumber(show.tv_audience) })
  if (show.averageAge) infoCells.push({ label: 'Avg. Wrestler Age', icon: '👤', value: `${show.averageAge} years` })

  return (
    <div className="relative bg-bg-secondary/50 backdrop-blur-sm">
      {/* Neon line top */}
      <div
        className="h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, transparent 30%, ${color} 50%, transparent 70%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: 'neon-sweep 3s ease-in-out infinite',
        }}
      />

      <div className="max-w-[1440px] mx-auto">

        {/* Show Rating — prominent centered */}
        {show.rating && (
          <div className="flex items-center justify-center gap-3 py-3 border-b border-border-subtle/15">
            <span className="text-text-secondary text-[10px] uppercase tracking-widest">Show Rating</span>
            <StarRating rating={show.rating} size="lg" showValue />
          </div>
        )}

        {/* Info cells — flex-wrap for perfect distribution */}
        {infoCells.length > 0 && (
          <div className="flex flex-wrap justify-center">
            {infoCells.map((cell, i) => (
              <div
                key={cell.label}
                className="relative flex-1 min-w-[140px] max-w-[250px] px-4 py-3 text-center border-b border-border-subtle/15 sm:border-b-0 sm:border-r sm:border-border-subtle/15 last:border-r-0"
              >
                <p className="text-text-secondary text-[10px] uppercase tracking-widest mb-0.5 flex items-center justify-center gap-1">
                  <span>{cell.icon}</span> {cell.label}
                </p>
                <p className="text-sm font-medium text-text-white truncate">{cell.value}</p>
                {/* Neon dot separator */}
                {i < infoCells.length - 1 && (
                  <span
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full hidden sm:block"
                    style={{ backgroundColor: `${color}60`, boxShadow: `0 0 8px ${color}60` }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Neon line middle */}
        <div
          className="h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, transparent 30%, ${color}80 50%, transparent 70%, transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: 'neon-sweep-reverse 4s ease-in-out infinite',
          }}
        />

        {/* Arena section — separate dedicated row with image */}
        {arenaName && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 py-3 px-4 border-b border-border-subtle/10">
            {/* Arena image */}
            {arena?.image_url && (
              arena?.slug ? (
                <Link href={`/arenas/${arena.slug}`} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-border-subtle/30 bg-bg-tertiary/50 shrink-0 hover:border-border-subtle/60 transition-all">
                  <Image src={arena.image_url} alt={arenaName} width={56} height={56} className="w-full h-full object-cover" />
                </Link>
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-border-subtle/30 bg-bg-tertiary/50 shrink-0">
                  <Image src={arena.image_url} alt={arenaName} width={56} height={56} className="w-full h-full object-cover" />
                </div>
              )
            )}
            <div className="text-center sm:text-left">
              {arena?.slug ? (
                <Link href={`/arenas/${arena.slug}`} className="text-text-white text-sm font-medium hover:underline transition-colors" style={{ color: `${color}` }}>
                  {arenaName}
                </Link>
              ) : (
                <p className="text-text-white text-sm font-medium">{arenaName}</p>
              )}
              {arenaLocation && (
                <p className="text-text-secondary text-xs flex items-center justify-center sm:justify-start gap-1">
                  <span>📍</span> {arenaLocation}
                </p>
              )}
              {arena?.capacity && (
                <p className="text-text-secondary text-[10px]">Capacity: {formatNumber(arena.capacity)}</p>
              )}
            </div>
          </div>
        )}

        {/* Theme song + Ring announcers + Commentators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 py-3 px-4 flex-wrap">
          {/* Theme Song */}
          {show.theme_song && (
            <div className="flex items-center gap-2 text-sm">
              <span>🎵</span>
              <span className="text-text-white">&quot;{show.theme_song}&quot;</span>
              {show.theme_song_artist && <span className="text-text-secondary">by {show.theme_song_artist}</span>}
            </div>
          )}

          {/* Ring Announcers — with photos like commentators */}
          {show.ringAnnouncers?.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span>🎙️</span>
              <span className="text-text-secondary text-[10px] uppercase tracking-wider">Ring Announcer</span>
              <div className="flex items-center gap-2">
                {show.ringAnnouncers.map((ra: any) => (
                  <Link key={ra.id} href={`/superstars/${ra.superstar?.slug}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                    {ra.superstar?.photo_url && (
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-border-subtle/50 shrink-0">
                        <Image src={ra.superstar.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="hover:underline" style={{ color }}>{ra.superstar?.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Commentators with photos */}
          {show.commentators?.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span>🎧</span>
              <span className="text-text-secondary text-[10px] uppercase tracking-wider">Commentary</span>
              <div className="flex items-center gap-2">
                {show.commentators.map((c: any) => (
                  <Link key={c.id} href={`/superstars/${c.superstar?.slug}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                    {c.superstar?.photo_url && (
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-border-subtle/50 shrink-0">
                        <Image src={c.superstar.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="hover:underline" style={{ color }}>{c.superstar?.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Highlights / Description */}
        {show.highlights_md && (
          <>
            <div
              className="h-px"
              style={{
                background: `linear-gradient(90deg, transparent 0%, transparent 30%, ${color}60 50%, transparent 70%, transparent 100%)`,
                backgroundSize: '200% 100%',
                animation: 'neon-sweep 3s ease-in-out infinite',
              }}
            />
            <div className="py-4 px-4 sm:px-8 text-center">
              <p className="text-text-secondary text-[10px] uppercase tracking-widest mb-2">Overview</p>
              <p className="text-sm text-text-white/80 leading-relaxed max-w-3xl mx-auto">
                {show.highlights_md}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Neon line bottom */}
      <div
        className="h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, transparent 30%, ${color} 50%, transparent 70%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: 'neon-sweep 3s ease-in-out infinite',
        }}
      />
    </div>
  )
}
