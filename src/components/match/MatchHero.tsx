'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  formatDate, formatDuration, formatHeight, formatWeight, formatTime,
  formatNumber, formatCompactNumber,
  getRatingColor, getRatingBgColor, getResultLabel, getWinRate,
  groupParticipantsByTeam, isBattleRoyalType, isIronManMatch,
  getShowColorStyle,
} from '@/lib/utils'
import { StarRating } from '@/components/ui/StarRating'

export function MatchHero({ match }: { match: any }) {
  const show = match.show || {}
  const color = show.primary_color || '#2cb2fe'
  const colorStyle = getShowColorStyle(color) as React.CSSProperties
  const participants = match.participants || []
  const teams = groupParticipantsByTeam(participants)
  const teamEntries = Array.from(teams.entries())
  const isBattleRoyal = isBattleRoyalType(match.match_type?.name)
  const isIronMan = isIronManMatch(match.match_type?.name)
  const venue = [show.venue, show.city, show.state_province, show.country].filter(Boolean).join(', ')
  const epNum = show.episodeNumber || show.episode_number
  const seriesName = show.show_series?.short_name || show.show_series?.name || ''

  return (
    <div style={colorStyle}>
      {/* ===== SHOW HEADER BAR — Full info like show page ===== */}
      <div className="relative bg-bg-secondary/60 backdrop-blur-sm border-b border-border-subtle/20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Show logo + name */}
            <Link href={`/shows/${show.slug}`} className="flex items-center gap-3 group shrink-0">
              {show.logo_url && (
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border bg-bg-tertiary/50 shrink-0"
                  style={{ borderColor: `${color}30` }}>
                  <Image src={show.logo_url} alt="" fill className="object-contain p-1" sizes="56px" />
                </div>
              )}
              <div>
                <p className="text-base sm:text-lg font-display font-bold text-text-white group-hover:underline uppercase tracking-wide">
                  {show.name}
                </p>
                <p className="text-xs text-text-secondary">{formatDate(show.date)}</p>
              </div>
            </Link>

            {/* Quick info pills */}
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              {epNum && (
                <span className="text-[10px] px-2.5 py-1 rounded-full border text-text-white" style={{ borderColor: `${color}30`, backgroundColor: `${color}10` }}>
                  📺 {seriesName} #{epNum}
                </span>
              )}
              {show.attendance && (
                <span className="text-[10px] px-2.5 py-1 rounded-full border border-border-subtle/30 text-text-secondary">
                  🏟️ {formatNumber(show.attendance)}
                </span>
              )}
              {show.tv_audience && (
                <span className="text-[10px] px-2.5 py-1 rounded-full border border-border-subtle/30 text-text-secondary">
                  📡 {formatCompactNumber(show.tv_audience)}
                </span>
              )}
              {show.start_time && (
                <span className="text-[10px] px-2.5 py-1 rounded-full border border-border-subtle/30 text-text-secondary">
                  ⏰ {formatTime(show.start_time)}
                </span>
              )}
            </div>
          </div>

          {/* Venue + Commentary + Ring Announcer */}
          <div className="mt-3 flex items-center gap-4 flex-wrap text-xs text-text-secondary">
            {venue && (
              <span className="flex items-center gap-1">
                <span>📍</span> {venue}
              </span>
            )}
            {show.commentators?.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span>🎧</span>
                {show.commentators.map((c: any, i: number) => (
                  <span key={c.id}>
                    <Link href={`/superstars/${c.superstar?.slug}`} className="hover:underline" style={{ color }}>
                      {c.superstar?.name}
                    </Link>
                    {i < show.commentators.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </span>
            )}
            {show.ringAnnouncers?.length > 0 && (
              <span className="flex items-center gap-1.5">
                <span>🎙️</span>
                {show.ringAnnouncers.map((ra: any) => (
                  <Link key={ra.id} href={`/superstars/${ra.superstar?.slug}`} className="hover:underline" style={{ color }}>
                    {ra.superstar?.name}
                  </Link>
                ))}
              </span>
            )}
          </div>
        </div>
        {/* Neon line */}
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, backgroundSize: '200% 100%', animation: 'neon-sweep 3s ease-in-out infinite' }} />
      </div>

      {/* ===== MATCH HERO SECTION ===== */}
      <section className="relative overflow-hidden bg-bg-primary">
        <div className="relative py-10 sm:py-14 lg:py-20">
          {/* Background effects */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[220px] opacity-12 pointer-events-none" style={{ backgroundColor: color }} />
          <div
            className="absolute inset-0 bg-grid opacity-10 animate-grid-pulse pointer-events-none"
            style={{ maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)' }}
          />

          <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Match type title */}
            {match.match_type && (
              <div className="text-center mb-4">
                <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-wide" style={{ color }}>
                  {match.match_type.name}
                </h1>
              </div>
            )}

            {/* Championship — BIGGER */}
            {match.championship && (
              <div className="flex items-center justify-center gap-3 mb-8">
                {match.championship.image_url && (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 shrink-0">
                    <Image src={match.championship.image_url} alt={match.championship.name} fill className="object-contain drop-shadow-lg" sizes="96px" />
                  </div>
                )}
                <span className="text-sm sm:text-base text-yellow-400 font-bold uppercase tracking-wider">
                  {match.championship.name}
                </span>
              </div>
            )}

            {/* Participants display — MUCH BIGGER */}
            {!isBattleRoyal ? (
              <div className="flex items-start justify-center gap-6 sm:gap-10 lg:gap-20 flex-wrap">
                {teamEntries.map(([teamNum, members], teamIdx) => (
                  <div key={teamNum} className="flex items-start gap-6 sm:gap-10 lg:gap-20">
                    {teamIdx > 0 && (
                      <div className="flex items-center self-center">
                        <span className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-secondary">VS</span>
                      </div>
                    )}
                    <div className="flex items-start gap-4 sm:gap-6 flex-wrap justify-center">
                      {members.map((p: any) => (
                        <ParticipantCard key={p.id} participant={p} color={color} match={match} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                  {participants
                    .sort((a: any, b: any) => (a.elimination_order ?? 999) - (b.elimination_order ?? 999))
                    .map((p: any) => (
                      <Link key={p.id} href={`/superstars/${p.superstar?.slug}`}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors hover:opacity-80 ${p.is_winner ? 'font-bold' : 'text-text-secondary border-border-subtle/30'}`}
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
            <div className="text-center mt-10 space-y-3">
              {match.result_type && (
                <p className="text-sm text-text-secondary">
                  Result: <span className="text-text-white font-semibold">{getResultLabel(match.result_type)}</span>
                </p>
              )}
              {isIronMan && match.score_winner != null && (
                <p className="font-mono text-xl font-bold" style={{ color }}>
                  Score: {match.score_winner} – {match.score_loser}
                </p>
              )}
              <div className="flex items-center justify-center gap-5 flex-wrap">
                {match.duration_seconds && (
                  <span className="text-sm text-text-secondary flex items-center gap-1.5">
                    ⏱️ {formatDuration(match.duration_seconds)}
                  </span>
                )}
                {match.rating && (
                  <StarRating rating={match.rating} size="lg" showValue color={color} />
                )}
              </div>
            </div>

            {/* Match description */}
            {match.summary_md && (
              <div className="mt-8 max-w-2xl mx-auto">
                <div className="rounded-xl border border-border-subtle/20 bg-bg-secondary/30 p-5">
                  <p className="text-xs text-text-secondary uppercase tracking-widest mb-2">Match Summary</p>
                  <p className="text-sm text-text-primary leading-relaxed">{match.summary_md}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Neon separator */}
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)`, backgroundSize: '200% 100%', animation: 'neon-sweep 3s ease-in-out infinite' }} />
      </section>

      {/* ===== OBJECTS USED — Improved visual ===== */}
      {match.objects?.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-6">
            <h3 className="font-display text-lg font-bold text-text-white uppercase tracking-wide">🪑 Objects Used</h3>
            <div className="h-px mt-2 max-w-[120px] mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {match.objects.map((o: any) => (
              <div key={o.id} className="flex items-center gap-4 px-5 py-4 rounded-xl border border-border-subtle/30 bg-bg-secondary/30 hover:border-border-subtle/50 transition-all">
                {o.object?.image_url ? (
                  <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-bg-tertiary">
                    <Image src={o.object.image_url} alt="" fill className="object-contain p-1" sizes="48px" />
                  </div>
                ) : (
                  <div className="w-12 h-12 shrink-0 rounded-lg bg-bg-tertiary flex items-center justify-center text-xl">🪑</div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-white">{o.object?.name || 'Unknown Object'}</p>
                  {o.used_by && (
                    <p className="text-xs text-text-secondary mt-0.5">
                      Used by <span style={{ color }}>{o.used_by.name}</span>
                    </p>
                  )}
                  {o.description && (
                    <p className="text-xs text-text-secondary mt-0.5 truncate">{o.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== REFEREES ===== */}
      {match.referees?.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex items-center justify-center gap-4 py-3 rounded-xl border border-border-subtle/15 bg-bg-secondary/20">
            <span className="text-text-secondary text-xs uppercase tracking-wider">👨‍⚖️ Referee{match.referees.length > 1 ? 's' : ''}</span>
            <div className="flex items-center gap-3">
              {match.referees.map((r: any) => (
                <div key={r.id} className="flex items-center gap-2">
                  {r.superstar?.photo_url && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-border-subtle/50 shrink-0">
                      <Image src={r.superstar.photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
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
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 font-bold">
                      Special Guest
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ============================================================
// PARTICIPANT CARD — Much bigger, with managers
// ============================================================
function ParticipantCard({ participant, color, match }: { participant: any; color: string; match: any }) {
  const s = participant.superstar
  if (!s) return null
  const isWinner = participant.is_winner
  const managers = (match.managers || []).filter((m: any) =>
    m.managing_for?.id === s.id || m.team_number === participant.team_number
  )

  return (
    <div className="flex flex-col items-center text-center max-w-[180px]">
      {/* Tag team name */}
      {participant.tag_team && (
        <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1.5">{participant.tag_team.name}</p>
      )}

      {/* Photo — MUCH BIGGER */}
      <Link href={`/superstars/${s.slug}`} className="group">
        <div
          className="relative w-28 h-28 sm:w-36 sm:h-36 lg:w-44 lg:h-44 rounded-xl overflow-hidden border-2 transition-all group-hover:scale-105"
          style={{
            borderColor: isWinner ? color : 'rgba(30,41,59,0.4)',
            boxShadow: isWinner ? `0 0 20px ${color}35, 0 0 40px ${color}15` : 'none',
          }}
        >
          {s.photo_url ? (
            <Image
              src={participant.photo_url_override || s.photo_url}
              alt={s.name}
              fill
              className="object-cover object-top"
              sizes="(max-width: 640px) 112px, (max-width: 1024px) 144px, 176px"
            />
          ) : (
            <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
              <span className="text-4xl text-border-subtle">?</span>
            </div>
          )}
          {isWinner && (
            <div className="absolute bottom-0 inset-x-0 py-1 text-center text-[11px] font-bold" style={{ backgroundColor: color, color: '#000' }}>
              ★ WINNER
            </div>
          )}
        </div>
      </Link>

      {/* Name */}
      <Link href={`/superstars/${s.slug}`} className="mt-2.5 text-sm sm:text-base font-semibold text-text-white hover:underline" style={isWinner ? { color } : {}}>
        {s.name}
      </Link>

      {/* Quick stats */}
      <div className="mt-1.5 text-[10px] text-text-secondary space-y-0.5">
        {s.win_count != null && s.total_matches ? (
          <p className="font-mono">{s.win_count}W - {s.loss_count}L ({getWinRate(s.win_count, s.total_matches)})</p>
        ) : null}
        {s.height_cm && <p>{formatHeight(s.height_cm)}</p>}
        {s.weight_kg && <p>{formatWeight(s.weight_kg)}</p>}
        {s.nationalities?.length > 0 && <p>{s.nationalities[0]}</p>}
      </div>

      {/* Manager(s) with photos */}
      {managers.length > 0 && (
        <div className="mt-2 space-y-1">
          {managers.map((mg: any) => (
            <Link key={mg.id} href={`/superstars/${mg.superstar?.slug}`} className="flex items-center gap-1.5 justify-center group/mgr">
              {mg.superstar?.photo_url && (
                <div className="w-6 h-6 rounded-full overflow-hidden border border-border-subtle/40 shrink-0">
                  <Image src={mg.superstar.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" />
                </div>
              )}
              <span className="text-[10px] text-text-secondary italic group-hover/mgr:underline">
                w/ {mg.superstar?.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
