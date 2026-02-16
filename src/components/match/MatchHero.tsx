'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  formatDate, formatDuration, formatHeight, formatWeight,
  getRatingColor, getRatingBgColor, getResultLabel, getWinRate,
  groupParticipantsByTeam, isBattleRoyalType, isIronManMatch,
  getShowColorStyle, formatNumber,
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

  return (
    <div style={colorStyle}>
      {/* Show header breadcrumb */}
      <div className="bg-bg-secondary/50 border-b border-border-subtle/20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            {show?.logo_url && (
              <Image src={show.logo_url} alt="" width={32} height={32} className="h-8 w-auto object-contain" />
            )}
            <div>
              <Link href={`/shows/${show?.slug}`} className="text-sm font-medium hover:underline" style={{ color }}>
                {show?.name}
              </Link>
              <p className="text-xs text-text-secondary">{formatDate(show?.date)}</p>
            </div>
            {show?.episodeNumber && (
              <span className="text-xs text-text-secondary ml-auto">Episode #{show.episodeNumber}</span>
            )}
          </div>
        </div>
      </div>

      {/* Match hero */}
      <section className="relative overflow-hidden bg-bg-primary">
        <div className="relative py-8 sm:py-12 lg:py-16">
          {/* Background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[200px] opacity-10 pointer-events-none" style={{ backgroundColor: color }} />

          <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Match type + championship */}
            <div className="text-center mb-6">
              {match.match_type && (
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-wide" style={{ color }}>
                  {match.match_type.name}
                </h1>
              )}
              {match.championship && (
                <div className="flex items-center justify-center gap-2 mt-3">
                  {match.championship.image_url && (
                    <Image src={match.championship.image_url} alt="" width={36} height={36} className="h-9 w-auto object-contain" />
                  )}
                  <span className="text-sm text-yellow-400 font-bold uppercase">{match.championship.name}</span>
                </div>
              )}
            </div>

            {/* Participants display */}
            {!isBattleRoyal ? (
              <div className="flex items-start justify-center gap-4 sm:gap-8 lg:gap-16 flex-wrap">
                {teamEntries.map(([teamNum, members], teamIdx) => (
                  <div key={teamNum} className="flex items-start gap-4 sm:gap-8 lg:gap-16">
                    {teamIdx > 0 && (
                      <div className="flex items-center self-center">
                        <span className="font-display text-2xl sm:text-3xl font-bold text-text-secondary">VS</span>
                      </div>
                    )}
                    <div className="flex items-start gap-3 sm:gap-4 flex-wrap justify-center">
                      {members.map((p: any) => (
                        <ParticipantCard key={p.id} participant={p} color={color} match={match} />
                      ))}
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

            {/* Result + Duration */}
            <div className="text-center mt-8 space-y-2">
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
              <div className="flex items-center justify-center gap-4 text-sm text-text-secondary">
                {match.duration_seconds && <span>Duration: {formatDuration(match.duration_seconds)}</span>}
                {match.rating && (
                  <span className={`font-mono font-bold px-2 py-0.5 rounded border ${getRatingBgColor(match.rating)} ${getRatingColor(match.rating)}`}>
                    {match.rating}/10
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Neon separator */}
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      </section>

      {/* Objects used */}
      {match.objects?.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Objects Used</h3>
          <div className="flex flex-wrap gap-3">
            {match.objects.map((o: any) => (
              <div key={o.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border-subtle/30 bg-bg-secondary/30">
                {o.object?.image_url && (
                  <Image src={o.object.image_url} alt="" width={24} height={24} className="w-6 h-6 object-contain" />
                )}
                <span className="text-xs text-text-white">{o.object?.name}</span>
                {o.used_by && <span className="text-xs text-text-secondary">by {o.used_by.name}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Referees */}
      {match.referees?.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-text-secondary text-xs uppercase tracking-wider">Referee{match.referees.length > 1 ? 's' : ''}</span>
            {match.referees.map((r: any) => (
              <div key={r.id} className="flex items-center gap-1.5">
                {r.superstar?.photo_url && (
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-border-subtle/50">
                    <Image src={r.superstar.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" />
                  </div>
                )}
                {r.superstar?.slug ? (
                  <Link href={`/superstars/${r.superstar.slug}`} className="text-text-white hover:underline" style={{ color }}>
                    {r.superstar?.name || r.referee_name}
                  </Link>
                ) : (
                  <span className="text-text-white">{r.referee_name || 'Unknown'}</span>
                )}
                {r.is_special_referee && <span className="text-[10px] text-yellow-400">(Special)</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Media */}
      {match.media?.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {match.media.map((m: any) => (
              <div key={m.id} className="rounded-xl overflow-hidden border border-border-subtle/30 bg-bg-secondary/50">
                {m.media_type === 'video' && m.url?.includes('youtube') ? (
                  <div className="aspect-video">
                    <iframe src={m.url.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen loading="lazy" />
                  </div>
                ) : m.url ? (
                  <Image src={m.url} alt={m.title || ''} width={400} height={225} className="w-full object-cover" />
                ) : null}
                {m.title && <p className="p-3 text-sm text-text-secondary">{m.title}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Single participant card with photo + stats
function ParticipantCard({ participant, color, match }: { participant: any; color: string; match: any }) {
  const s = participant.superstar
  if (!s) return null
  const isWinner = participant.is_winner
  const managers = (match.managers || []).filter((m: any) =>
    m.managing_for?.id === s.id || m.team_number === participant.team_number
  )

  return (
    <div className="flex flex-col items-center text-center max-w-[140px]">
      {/* Tag team name */}
      {participant.tag_team && (
        <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">{participant.tag_team.name}</p>
      )}
      {/* Photo */}
      <Link href={`/superstars/${s.slug}`}>
        <div
          className={`relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl overflow-hidden border-2 transition-all hover:scale-105`}
          style={{ borderColor: isWinner ? color : 'rgba(30,41,59,0.4)' }}
        >
          {s.photo_url ? (
            <Image src={participant.photo_url_override || s.photo_url} alt={s.name} fill className="object-cover object-top" sizes="128px" />
          ) : (
            <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
              <span className="text-3xl text-border-subtle">?</span>
            </div>
          )}
          {isWinner && (
            <div className="absolute bottom-0 inset-x-0 py-0.5 text-center text-[10px] font-bold" style={{ backgroundColor: color, color: '#000' }}>
              WINNER
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
          <p>{s.win_count}W-{s.loss_count}L ({getWinRate(s.win_count, s.total_matches)})</p>
        ) : null}
        {s.height_cm && <p>{formatHeight(s.height_cm)}</p>}
        {s.weight_kg && <p>{formatWeight(s.weight_kg)}</p>}
        {s.nationalities?.length > 0 && <p>{s.nationalities[0]}</p>}
      </div>
      {/* Managers */}
      {managers.map((mg: any) => (
        <p key={mg.id} className="mt-1 text-[9px] text-text-secondary italic">
          w/ {mg.superstar?.name}
        </p>
      ))}
    </div>
  )
}
