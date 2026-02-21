'use client'

import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'
import { MediaCarousel } from '@/components/ui/MediaCarousel'
import {
  formatDate, formatDuration, formatHeight, formatWeight, formatNumber,
  formatCompactNumber, formatTime,
  getRatingColor, getRatingBgColor, getResultLabel, getWinRate,
  groupParticipantsByTeam, isBattleRoyalType, isIronManMatch,
  getShowColorStyle,
} from '@/lib/utils'

export function MatchHero({ match }: { match: any }) {
  const show = match.show
  const color = show?.primary_color || '#2cb2fe'
  const colorStyle = getShowColorStyle(color) as React.CSSProperties
  const participants = match.participants || []
  const teams = groupParticipantsByTeam(participants)
  const teamEntries = Array.from(teams.entries())
  const isBattleRoyal = isBattleRoyalType(match.match_type?.name)
  const isIronMan = isIronManMatch(match.match_type?.name)

  const epNum = show?.episodeNumber || show?.episode_number
  const seriesName = show?.show_series?.short_name || show?.show_series?.name || ''
  const venue = [show?.venue, show?.city, show?.state_province, show?.country].filter(Boolean).join(', ')

  // Commentators & ring announcers (from show data)
  const commentators = show?.commentators || match.commentators || []
  const ringAnnouncers = show?.ringAnnouncers || match.ringAnnouncers || []

  return (
    <div style={colorStyle}>
      {/* ===== Show header breadcrumb bar ===== */}
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
            {venue && (
              <span className="flex items-center gap-1">
                <span>📍</span> {venue}
              </span>
            )}
            {commentators.length > 0 && (
              <span className="flex items-center gap-1">
                <span>🎧</span>
                {commentators.map((c: any, i: number) => (
                  <span key={c.id}>
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
                  <span key={ra.id}>
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

      {/* ===== Match hero section ===== */}
      <section className="relative overflow-hidden bg-bg-primary">
        <div className="relative py-8 sm:py-12 lg:py-16">
          {/* Dynamic background glow — uses show color */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[220px] opacity-12 pointer-events-none"
            style={{ backgroundColor: color }}
          />

          <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Match type title */}
            <div className="text-center mb-4">
              {match.match_type && (
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wide" style={{ color }}>
                  {match.match_type.name}
                </h1>
              )}
            </div>

{/* Championship — GIGANTIC belt, extreme tight spacing */}
            {match.championship && (
              <div className="flex flex-col items-center -mb-8 sm:-mb-12 z-10 relative">
                {match.championship.image_url && (
                  <div className="relative w-56 h-56 sm:w-80 sm:h-80 lg:w-[400px] lg:h-[400px]">
                    <Image
                      src={match.championship.image_url}
                      alt={match.championship.name}
                      fill
                      className="object-contain drop-shadow-2xl"
                      sizes="(max-width: 640px) 224px, (max-width: 1024px) 320px, 400px"
                    />
                  </div>
                )}
                <span className="text-xl sm:text-2xl lg:text-4xl text-yellow-400 font-black uppercase tracking-wider -mt-10 sm:-mt-16 text-center drop-shadow-md z-10 relative">
                  {match.championship.name}
                </span>
              </div>
            )}
                                    
            {/* ===== Participants display ===== */}
            {!isBattleRoyal ? (
              <div className="flex items-start justify-center gap-4 sm:gap-8 lg:gap-16 flex-wrap">
                {teamEntries.map(([teamNum, members], teamIdx) => (
                  <div key={teamNum} className="flex items-start gap-4 sm:gap-8 lg:gap-16">
                    {teamIdx > 0 && (
                      <div className="flex items-center self-center pt-8 sm:pt-12">
                        <span className="font-display text-2xl sm:text-3xl font-bold text-text-secondary">VS</span>
                      </div>
                    )}
                    {/* Team block */}
                    <div className="flex flex-col items-center">
                      {/* Tag team name */}
                      {members[0]?.tag_team && (
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">{members[0].tag_team.name}</p>
                      )}
                      {/* Members grid — 2 per row on mobile for tag teams */}
                      <div className={`grid gap-3 sm:gap-4 justify-items-center ${
                        members.length <= 1 ? 'grid-cols-1' :
                        members.length === 2 ? 'grid-cols-2' :
                        members.length <= 4 ? 'grid-cols-2' :
                        'grid-cols-2 sm:grid-cols-3'
                      }`}>
                        {members.map((p: any) => (
                          <ParticipantCard key={p.id} participant={p} color={color} match={match} />
                        ))}
                      </div>
                      {/* Team managers — below all members */}
                      {(() => {
                        const teamManagers = (match.managers || []).filter((m: any) =>
                          m.team_number === teamNum || members.some((p: any) => m.managing_for?.id === p.superstar?.id)
                        )
                        if (teamManagers.length === 0) return null
                        return (
                          <div className="mt-3 flex items-center gap-2 justify-center">
                            {teamManagers.map((mg: any) => (
                              <Link key={mg.id} href={`/superstars/${mg.superstar?.slug || '#'}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                                {mg.superstar?.photo_url && (
                                  <div className="w-5 h-5 rounded-full overflow-hidden border border-border-subtle/50 shrink-0">
                                    <Image src={mg.superstar.photo_url} alt="" width={20} height={20} className="w-full h-full object-cover" />
                                  </div>
                                )}
                                <span className="text-[10px] text-text-secondary italic">w/ {mg.superstar?.name}</span>
                              </Link>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Battle Royal */
              <div className="text-center">
                <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                  {participants
                    .sort((a: any, b: any) => (a.elimination_order ?? 999) - (b.elimination_order ?? 999))
                    .map((p: any) => (
                      <Link key={p.id} href={`/superstars/${p.superstar?.slug}`}
                        className={`text-xs px-2.5 py-1.5 rounded border transition-colors hover:opacity-80 ${p.is_winner ? 'font-bold' : 'text-text-secondary border-border-subtle/30'}`}
                        style={p.is_winner ? { color, borderColor: `${color}40`, backgroundColor: `${color}15` } : {}}>
                        {p.entry_number ? `#${p.entry_number} ` : ''}{p.superstar?.name}
                        {p.is_winner ? ' ★ WINNER' : ''}
                        {p.elimination_order ? ` (elim. #${p.elimination_order})` : ''}
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* Result + Duration + Rating */}
            <div className="text-center mt-8 space-y-3">
              {match.result_type && (
                <p className="text-sm text-text-secondary">
                  Result: <span className="text-text-white font-medium">{getResultLabel(match.result_type)}</span>
                </p>
              )}
              {isIronMan && match.score_winner != null && (
                <p className="font-mono text-lg font-bold" style={{ color }}>
                  Score: {match.score_winner} – {match.score_loser}
                </p>
              )}
              <div className="flex items-center justify-center gap-4 text-sm text-text-secondary flex-wrap">
                {match.duration_seconds && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {formatDuration(match.duration_seconds)}
                  </span>
                )}
                <StarRating rating={match.rating} size="md" showValue />
              </div>
            </div>

            {/* Match description / summary */}
            {match.summary_md && (
              <div className="mt-6 max-w-2xl mx-auto px-4 py-3 rounded-xl border border-border-subtle/20 bg-bg-secondary/20 text-sm text-text-white/80 text-center leading-relaxed">
                {match.summary_md}
              </div>
            )}
          </div>
        </div>

        {/* Neon separator */}
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      </section>

      {/* ===== Objects Used — bigger cards ===== */}
      {match.objects?.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-center mb-4 flex items-center justify-center gap-2">
            <span className="text-red-400">🪑</span>
            <span className="text-text-white">Objects Used</span>
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {match.objects.map((o: any) => (
              <div key={o.id} className="flex flex-col items-center gap-2 px-5 py-4 rounded-xl border border-border-subtle/30 bg-bg-secondary/30 min-w-[120px]">
                {o.object?.image_url && (
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16">
                    <Image src={o.object.image_url} alt="" fill className="object-contain" sizes="64px" />
                  </div>
                )}
                <span className="text-sm text-text-white font-medium">{o.object?.name}</span>
                {o.used_by && (
                  <span className="text-[10px] text-text-secondary">
                    Used by <span style={{ color }}>{o.used_by.name}</span>
                  </span>
                )}
                {o.description && (
                  <p className="text-[10px] text-text-secondary text-center">{o.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Referees ===== */}
      {match.referees?.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex items-center justify-center gap-3 py-3 rounded-xl border border-border-subtle/20 bg-bg-secondary/20 px-6">
            <span className="text-text-secondary text-xs uppercase tracking-wider">🏁 Referee{match.referees.length > 1 ? 's' : ''}</span>
            {match.referees.map((r: any) => (
              <div key={r.id} className="flex items-center gap-1.5">
                {r.superstar?.photo_url && (
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-border-subtle/50">
                    <Image src={r.superstar.photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" />
                  </div>
                )}
                {r.superstar?.slug ? (
                  <Link href={`/superstars/${r.superstar.slug}`} className="text-sm text-text-white hover:underline" style={{ color }}>
                    {r.superstar?.name || r.referee_name}
                  </Link>
                ) : (
                  <span className="text-sm text-text-white">{r.referee_name || 'Unknown'}</span>
                )}
                {r.is_special_referee && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full font-bold">
                    Special Guest
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Media Carousel ===== */}
      {match.media?.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MediaCarousel items={match.media} columns={2} color={color} />
        </div>
      )}
    </div>
  )
}

// ============================================================
// PARTICIPANT CARD (match page — bigger photos)
// ============================================================

function ParticipantCard({ participant, color, match }: { participant: any; color: string; match: any }) {
  const s = participant.superstar
  if (!s) return null
  const isWinner = participant.is_winner

  return (
    <div className="flex flex-col items-center text-center" style={{ minWidth: '100px', maxWidth: '160px' }}>
      {/* Photo — bigger sizes */}
      <Link href={`/superstars/${s.slug}`}>
        <div
          className={`relative w-24 h-28 sm:w-32 sm:h-36 lg:w-36 lg:h-40 rounded-xl overflow-hidden border-2 transition-all hover:scale-105`}
          style={{ borderColor: isWinner ? color : 'rgba(30,41,59,0.4)' }}
        >
          {s.photo_url ? (
            <Image src={participant.photo_url_override || s.photo_url} alt={s.name} fill className="object-cover object-top" sizes="(max-width: 640px) 96px, 144px" />
          ) : (
            <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
              <span className="text-3xl text-border-subtle">?</span>
            </div>
          )}
          {isWinner && (
            <div className="absolute bottom-0 inset-x-0 py-1 text-center text-[10px] font-bold" style={{ backgroundColor: color, color: '#000' }}>
              ★ WINNER
            </div>
          )}
        </div>
      </Link>
      {/* Name */}
      <Link href={`/superstars/${s.slug}`} className="mt-2 text-sm font-medium text-text-white hover:underline" style={isWinner ? { color } : {}}>
        {s.name}
      </Link>
      {/* Quick stats */}
      <div className="mt-1 text-[10px] text-text-secondary space-y-0.5">
        {s.win_count != null && s.total_matches ? (
          <p>{s.win_count}W - {s.loss_count}L ({getWinRate(s.win_count, s.total_matches)})</p>
        ) : null}
        {s.height_cm && <p>{formatHeight(s.height_cm)}</p>}
        {s.weight_kg && <p>{formatWeight(s.weight_kg)}</p>}
        {s.nationalities?.length > 0 && <p>{s.nationalities[0]}</p>}
      </div>
    </div>
  )
}
