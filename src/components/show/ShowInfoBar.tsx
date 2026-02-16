'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDate, formatTime, formatNumber, formatCompactNumber, getRatingColor } from '@/lib/utils'

export function ShowInfoBar({ show }: { show: any }) {
  const color = show.primary_color || '#2cb2fe'
  const venue = [show.venue, show.city, show.state_province, show.country].filter(Boolean).join(', ')
  const epNum = show.episodeNumber || show.episode_number
  const seriesName = show.show_series?.short_name || show.show_series?.name || ''

  const infoCells = [
    { label: 'Date', value: formatDate(show.date) },
    epNum ? { label: 'Episode', value: `${seriesName} #${epNum}` } : null,
    show.start_time ? { label: 'Start Time', value: formatTime(show.start_time) } : null,
    show.attendance ? { label: 'Attendance', value: formatNumber(show.attendance) } : null,
    show.tv_audience ? { label: 'TV Audience', value: formatCompactNumber(show.tv_audience) } : null,
    show.rating ? { label: 'Show Rating', value: `${show.rating}/10`, colorClass: getRatingColor(show.rating) } : null,
    venue ? { label: 'Venue', value: venue } : null,
  ].filter(Boolean) as { label: string; value: string; colorClass?: string }[]

  return (
    <div className="relative bg-bg-secondary/50 backdrop-blur-sm">
      {/* Neon line top — dynamic color */}
      <div
        className="h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, transparent 30%, ${color} 50%, transparent 70%, transparent 100%)`,
          backgroundSize: '200% 100%',
          animation: 'neon-sweep 3s ease-in-out infinite',
        }}
      />

      <div className="max-w-[1440px] mx-auto">
        {/* Info cells */}
        {infoCells.length > 0 && (
          <div className={`grid ${infoCells.length <= 3 ? 'grid-cols-1 sm:grid-cols-3' : infoCells.length <= 4 ? 'grid-cols-2 sm:grid-cols-4' : infoCells.length <= 5 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-' + Math.min(infoCells.length, 7)}`}>
            {infoCells.map((cell, i) => (
              <div key={cell.label} className="relative px-4 py-4 text-center border-b border-border-subtle/20 sm:border-b-0 sm:border-r sm:border-border-subtle/20 last:border-r-0">
                <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-widest mb-1">{cell.label}</p>
                <p className={`text-sm sm:text-base font-medium truncate ${cell.colorClass || 'text-text-white'}`}>{cell.value}</p>
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

        {/* Neon line middle — reverse */}
        <div
          className="h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, transparent 30%, ${color}80 50%, transparent 70%, transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: 'neon-sweep-reverse 4s ease-in-out infinite',
          }}
        />

        {/* Theme song + Ring announcers + Commentators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 py-4 px-4 flex-wrap">
          {/* Theme Song */}
          {show.theme_song && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary text-xs uppercase tracking-wider">Theme</span>
              <span className="text-text-white">&quot;{show.theme_song}&quot;</span>
              {show.theme_song_artist && <span className="text-text-secondary">by {show.theme_song_artist}</span>}
            </div>
          )}

          {/* Ring Announcers */}
          {show.ringAnnouncers?.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary text-xs uppercase tracking-wider">Ring Announcer{show.ringAnnouncers.length > 1 ? 's' : ''}</span>
              <div className="flex items-center gap-1.5">
                {show.ringAnnouncers.map((ra: any) => (
                  <Link key={ra.id} href={`/superstars/${ra.superstar?.slug}`} className="text-text-white hover:underline" style={{ color }}>
                    {ra.superstar?.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Commentators with photos */}
          {show.commentators?.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary text-xs uppercase tracking-wider">Commentary</span>
              <div className="flex items-center gap-2">
                {show.commentators.map((c: any) => (
                  <Link key={c.id} href={`/superstars/${c.superstar?.slug}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                    {c.superstar?.photo_url && (
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-border-subtle/50 shrink-0">
                        <Image src={c.superstar.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="text-text-white hover:underline" style={{ color }}>{c.superstar?.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
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
