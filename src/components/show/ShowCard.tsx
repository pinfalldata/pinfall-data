'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  formatDuration, getRatingColor, getRatingBgColor, getResultLabel,
  isBattleRoyalType, isIronManMatch, groupParticipantsByTeam,
  getSegmentCategoryLabel, getSegmentCategoryIcon,
} from '@/lib/utils'

export function ShowCard({ show }: { show: any }) {
  const [spoilerMode, setSpoilerMode] = useState(true) // true = spoiler hidden
  const color = show.primary_color || '#2cb2fe'

  // Merge matches and segments into timeline by sort_order / match_order
  const timeline = useMemo(() => {
    const items: any[] = []
    for (const m of (show.matches || [])) {
      items.push({ type: 'match', order: m.match_order ?? 0, data: m })
    }
    for (const s of (show.segments || [])) {
      items.push({ type: 'segment', order: s.sort_order ?? 0, data: s })
    }
    items.sort((a, b) => a.order - b.order)
    return items
  }, [show.matches, show.segments])

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Spoiler Toggle */}
      <div className="flex items-center justify-center mb-8">
        <button
          onClick={() => setSpoilerMode(!spoilerMode)}
          className="flex items-center gap-3 px-6 py-3 rounded-xl border transition-all"
          style={{
            backgroundColor: spoilerMode ? `${color}15` : 'transparent',
            borderColor: spoilerMode ? `${color}40` : 'rgba(30,41,59,0.5)',
            color: spoilerMode ? color : '#888',
          }}
        >
          <div className={`w-10 h-5 rounded-full relative transition-colors ${spoilerMode ? '' : 'bg-bg-tertiary'}`}
            style={{ backgroundColor: spoilerMode ? `${color}40` : undefined }}>
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full transition-transform"
              style={{
                backgroundColor: spoilerMode ? color : '#666',
                transform: spoilerMode ? 'translateX(20px)' : 'translateX(2px)',
              }}
            />
          </div>
          <span className="text-sm font-medium">
            {spoilerMode ? 'Spoiler-Free Mode' : 'Show Results'}
          </span>
          <span className="text-xs opacity-60">
            {spoilerMode ? '(winners hidden)' : '(all results visible)'}
          </span>
        </button>
      </div>

      {/* Timeline: Matches & Segments */}
      <div className="space-y-4">
        {timeline.map((item, i) => (
          item.type === 'match'
            ? <MatchCard key={`m-${item.data.id}`} match={item.data} show={show} color={color} spoilerMode={spoilerMode} index={i} />
            : <SegmentCard key={`s-${item.data.id}`} segment={item.data} show={show} color={color} spoilerMode={spoilerMode} />
        ))}
      </div>

      {/* Media Section */}
      {show.media?.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display text-xl font-bold text-text-white mb-6">Media</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {show.media.map((m: any) => (
              <div key={m.id} className="rounded-xl overflow-hidden border border-border-subtle/30 bg-bg-secondary/50">
                {m.media_type === 'video' && m.url?.includes('youtube') ? (
                  <div className="aspect-video">
                    <iframe
                      src={m.url.replace('watch?v=', 'embed/')}
                      className="w-full h-full"
                      allowFullScreen
                      loading="lazy"
                    />
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

// ============================================================
// MATCH CARD
// ============================================================

function MatchCard({ match, show, color, spoilerMode, index }: {
  match: any; show: any; color: string; spoilerMode: boolean; index: number
}) {
  const participants = match.participants || []
  const teams = groupParticipantsByTeam(participants)
  const teamEntries = Array.from(teams.entries())
  const isBattleRoyal = isBattleRoyalType(match.match_type?.name)
  const isIronMan = isIronManMatch(match.match_type?.name)
  const manyParticipants = participants.length > 10
  const matchSlug = match.slug || match.id

  return (
    <Link
      href={`/shows/${show.slug}/matches/${matchSlug}`}
      className="block group"
    >
      <div
        className="relative rounded-2xl border bg-bg-secondary/30 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
        style={{
          borderColor: 'rgba(30,41,59,0.3)',
          boxShadow: 'none',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = `${color}30`;
          (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${color}15, 0 0 40px ${color}08`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = 'rgba(30,41,59,0.3)';
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        }}
      >
        {/* Match header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border-subtle/20">
          <div className="flex items-center gap-3">
            <span className="text-text-secondary text-xs font-mono">#{index + 1}</span>
            {match.match_type && (
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                {match.match_type.name}
              </span>
            )}
            {match.is_title_change && !spoilerMode && (
              <span className="text-[10px] px-2 py-0.5 bg-neon-pink/20 text-neon-pink border border-neon-pink/30 rounded-full font-bold uppercase">
                Title Change
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {match.duration_seconds && (
              <span className="text-text-secondary text-xs">{formatDuration(match.duration_seconds)}</span>
            )}
            {match.rating && (
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${getRatingBgColor(match.rating)} ${getRatingColor(match.rating)}`}>
                {match.rating}
              </span>
            )}
          </div>
        </div>

        {/* Championship badge */}
        {match.championship && (
          <div className="flex items-center justify-center gap-2 py-2 border-b border-border-subtle/10">
            {match.championship.image_url && (
              <Image src={match.championship.image_url} alt="" width={28} height={28} className="h-7 w-auto object-contain" />
            )}
            <span className="text-xs text-yellow-400 font-bold uppercase tracking-wider">
              {match.championship.name}
            </span>
          </div>
        )}

        {/* Participants */}
        <div className="px-4 sm:px-6 py-5">
          {isBattleRoyal || manyParticipants ? (
            /* Battle Royal / Many participants: just list names */
            <div className="text-center">
              <p className="font-display text-lg font-bold text-text-white mb-3">
                {match.match_type?.name || 'Battle Royal'}
              </p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {participants
                  .sort((a: any, b: any) => (a.entry_number ?? 99) - (b.entry_number ?? 99))
                  .map((p: any) => {
                    const isWinner = !spoilerMode && p.is_winner
                    return (
                      <span
                        key={p.id}
                        className={`text-xs px-2 py-1 rounded border ${isWinner ? 'font-bold' : 'text-text-secondary border-border-subtle/30'}`}
                        style={isWinner ? { color, borderColor: `${color}40`, backgroundColor: `${color}15` } : {}}
                      >
                        {p.entry_number ? `#${p.entry_number} ` : ''}
                        {p.superstar?.name || 'TBD'}
                        {isWinner ? ' ★' : ''}
                      </span>
                    )
                  })}
              </div>
              {!spoilerMode && match.winner_id && (
                <p className="mt-3 text-sm font-bold" style={{ color }}>
                  Winner: {participants.find((p: any) => p.is_winner)?.superstar?.name}
                </p>
              )}
            </div>
          ) : (
            /* Standard match: teams face to face */
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {teamEntries.map(([teamNum, members], teamIdx) => (
                <div key={teamNum} className="flex items-center gap-2 sm:gap-4">
                  {teamIdx > 0 && (
                    <span className="font-display text-lg sm:text-xl font-bold text-text-secondary mx-1 sm:mx-3">VS</span>
                  )}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                    {members.map((p: any) => {
                      const isWinner = !spoilerMode && p.is_winner
                      const managers = (match.managers || []).filter((m: any) =>
                        m.managing_for?.id === p.superstar?.id || m.team_number === teamNum
                      )
                      return (
                        <div key={p.id} className="flex flex-col items-center text-center">
                          {/* Tag team name */}
                          {p.tag_team && teamEntries.length <= 2 && members.indexOf(p) === 0 && (
                            <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">
                              {p.tag_team.name}
                            </p>
                          )}
                          {/* Superstar photo */}
                          <div
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden border-2 transition-all ${isWinner ? 'ring-2' : ''}`}
                            style={{
                              borderColor: isWinner ? color : 'rgba(30,41,59,0.4)',
                              ...(isWinner ? { ringColor: `${color}40` } : {}),
                            }}
                          >
                            {p.superstar?.photo_url ? (
                              <Image src={p.photo_url_override || p.superstar.photo_url} alt={p.superstar.name} fill className="object-cover object-top" sizes="96px" />
                            ) : (
                              <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
                                <span className="text-2xl text-border-subtle">?</span>
                              </div>
                            )}
                            {/* Winner indicator */}
                            {isWinner && (
                              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-t text-[8px] font-bold" style={{ backgroundColor: color, color: '#000' }}>
                                WIN
                              </div>
                            )}
                          </div>
                          {/* Name */}
                          <p className={`mt-1.5 text-xs sm:text-sm font-medium truncate max-w-[80px] sm:max-w-[100px] ${isWinner ? 'font-bold' : 'text-text-white'}`}
                            style={isWinner ? { color } : {}}>
                            {p.superstar?.name || 'TBD'}
                          </p>
                          {/* Manager(s) */}
                          {managers.length > 0 && (
                            <div className="mt-0.5">
                              {managers.map((mg: any) => (
                                <p key={mg.id} className="text-[9px] text-text-secondary italic">
                                  w/ {mg.superstar?.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Iron Man score */}
          {isIronMan && !spoilerMode && match.score_winner != null && (
            <p className="text-center mt-3 font-mono text-sm" style={{ color }}>
              Score: {match.score_winner} – {match.score_loser}
            </p>
          )}

          {/* Result type (spoiler) */}
          {!spoilerMode && match.result_type && (
            <p className="text-center mt-2 text-xs text-text-secondary">
              via {getResultLabel(match.result_type)}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}

// ============================================================
// SEGMENT CARD
// ============================================================

function SegmentCard({ segment, show, color, spoilerMode }: {
  segment: any; show: any; color: string; spoilerMode: boolean
}) {
  const participants = segment.participants || []
  const isSpoiler = segment.is_spoiler && spoilerMode

  return (
    <Link
      href={`/shows/${show.slug}/segments/${segment.slug}`}
      className="block group"
    >
      <div
        className="relative rounded-xl border border-border-subtle/20 bg-bg-secondary/20 overflow-hidden transition-all duration-300 hover:border-border-subtle/40 hover:translate-y-[-1px]"
      >
        <div className="flex items-center gap-4 px-4 sm:px-6 py-4">
          {/* Category icon */}
          <span className="text-xl shrink-0">{getSegmentCategoryIcon(segment.category)}</span>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-0.5">
              {getSegmentCategoryLabel(segment.category)}
            </p>
            {isSpoiler ? (
              <p className="text-sm text-text-secondary italic">
                [Segment hidden — disable Spoiler-Free mode to reveal]
              </p>
            ) : (
              <p className="text-sm text-text-white font-medium truncate">
                {segment.title}
              </p>
            )}
          </div>

          {/* Participant photos (hidden in spoiler mode) */}
          {!isSpoiler && participants.length > 0 && (
            <div className="flex items-center -space-x-2 shrink-0">
              {participants.slice(0, 5).map((p: any) => (
                <div key={p.id} className="w-8 h-8 rounded-full overflow-hidden border-2 border-bg-primary">
                  {p.superstar?.photo_url ? (
                    <Image src={p.superstar.photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-bg-tertiary" />
                  )}
                </div>
              ))}
              {participants.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[10px] text-text-secondary">
                  +{participants.length - 5}
                </div>
              )}
            </div>
          )}

          {/* Arrow */}
          <svg className="w-4 h-4 text-text-secondary group-hover:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
