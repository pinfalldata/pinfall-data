'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'
import { MediaCarousel } from '@/components/ui/MediaCarousel'
import {
  formatDuration, getRatingColor, getRatingBgColor, getResultLabel,
  isBattleRoyalType, isIronManMatch, groupParticipantsByTeam,
  getSegmentCategoryLabel, getSegmentCategoryIcon,
} from '@/lib/utils'

export function ShowCard({ show }: { show: any }) {
  const [spoilerMode, setSpoilerMode] = useState(true)
  const color = show.primary_color || '#2cb2fe'

  const matchCount = (show.matches || []).length
  const segmentCount = (show.segments || []).length

  // Merge matches and segments into timeline
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

  // Find last match for Main Event badge
  const matchItems = timeline.filter(t => t.type === 'match')
  const lastMatchId = matchItems.length > 0 ? matchItems[matchItems.length - 1].data.id : null

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Section title */}
      <h2 className="font-display text-xl sm:text-2xl font-bold text-text-white text-center mb-2 uppercase tracking-wider">
        Full Card & Results
      </h2>
      <p className="text-center text-text-secondary text-sm mb-6">
        {matchCount} match{matchCount !== 1 ? 'es' : ''} • {segmentCount} segment{segmentCount !== 1 ? 's' : ''}
      </p>

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
            {spoilerMode ? '🔒 Spoiler-Free Mode' : '👁 Show Results'}
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
            ? <MatchCard
                key={`m-${item.data.id}`}
                match={item.data}
                show={show}
                color={color}
                spoilerMode={spoilerMode}
                index={i}
                isMainEvent={item.data.id === lastMatchId}
              />
            : <SegmentCard key={`s-${item.data.id}`} segment={item.data} show={show} color={color} spoilerMode={spoilerMode} />
        ))}
      </div>

      {/* Show Media Carousel */}
      {show.media?.length > 0 && (
        <div className="mt-12">
          <MediaCarousel items={show.media} columns={3} color={color} />
        </div>
      )}
    </div>
  )
}

// ============================================================
// MATCH CARD
// ============================================================

function MatchCard({ match, show, color, spoilerMode, index, isMainEvent }: {
  match: any; show: any; color: string; spoilerMode: boolean; index: number; isMainEvent: boolean
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
            {/* Star rating - visible */}
            <StarRating rating={match.rating} size="sm" showValue />
          </div>
        </div>

        {/* Main Event badge — centered */}
        {isMainEvent && (
          <div className="flex justify-center py-1.5 border-b border-border-subtle/10">
            <span className="text-[10px] px-3 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
              ⭐ Main Event
            </span>
          </div>
        )}

{/* Championship — compact golden banner with shimmer */}
        {match.championship && (
          <div className="relative overflow-hidden">
            {/* Golden shimmer overlay */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              background: 'linear-gradient(135deg, transparent 20%, rgba(255,215,0,0.4) 45%, rgba(255,215,0,0.6) 50%, rgba(255,215,0,0.4) 55%, transparent 80%)',
              backgroundSize: '300% 300%',
              animation: 'belt-shimmer 4s ease-in-out infinite',
            }} />
            
            <div className="relative flex items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4">
              {/* Left ornament line */}
              <div className="hidden sm:block flex-1 h-[1px] max-w-[80px]" style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.3))',
              }} />

              {/* Belt image — compact */}
              {match.championship.image_url && (
                <div className="relative w-16 h-10 sm:w-20 sm:h-14 lg:w-24 lg:h-16 shrink-0 group/belt">
                  <Image
                    src={match.championship.image_url}
                    alt={match.championship.name}
                    fill
                    className="object-contain drop-shadow-[0_0_12px_rgba(255,215,0,0.25)] group-hover/belt:drop-shadow-[0_0_20px_rgba(255,215,0,0.4)] transition-all duration-500"
                    sizes="(max-width: 640px) 64px, (max-width: 1024px) 80px, 96px"
                  />
                </div>
              )}

              {/* Title name */}
              <span className="text-[10px] sm:text-[11px] lg:text-xs text-yellow-400/90 font-bold uppercase tracking-[0.15em] text-center leading-tight max-w-[200px] sm:max-w-none">
                {match.championship.name}
              </span>

              {/* Right ornament line */}
              <div className="hidden sm:block flex-1 h-[1px] max-w-[80px]" style={{
                background: 'linear-gradient(90deg, rgba(255,215,0,0.3), transparent)',
              }} />
            </div>

            {/* Bottom golden border */}
            <div className="h-[1px]" style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.15) 30%, rgba(255,215,0,0.25) 50%, rgba(255,215,0,0.15) 70%, transparent)',
            }} />
          </div>
        )}
                        
        {/* Participants */}
        <div className="px-4 sm:px-6 py-5">
          {isBattleRoyal || manyParticipants ? (
            <BattleRoyalParticipants
              participants={participants}
              spoilerMode={spoilerMode}
              color={color}
              match={match}
            />
          ) : (
            <StandardMatchParticipants
              teamEntries={teamEntries}
              spoilerMode={spoilerMode}
              color={color}
              match={match}
            />
          )}

          {/* Iron Man score */}
          {isIronMan && !spoilerMode && match.score_winner != null && (
            <p className="text-center mt-3 font-mono text-sm" style={{ color }}>
              Score: {match.score_winner} – {match.score_loser}
            </p>
          )}

          {/* Result type */}
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

// Standard match with aligned teams
function StandardMatchParticipants({ teamEntries, spoilerMode, color, match }: {
  teamEntries: [number, any[]][]; spoilerMode: boolean; color: string; match: any
}) {
  // Check if any team has a tag team name (to reserve space uniformly)
  const anyTagTeam = teamEntries.some(([, members]) => members[0]?.tag_team)

  return (
    <div className="flex items-start justify-center gap-4 sm:gap-6 lg:gap-10">
      {teamEntries.map(([teamNum, members], teamIdx) => (
        <div key={teamNum} className="flex items-start gap-4 sm:gap-6 lg:gap-10">
          {teamIdx > 0 && (
            <div className="flex items-center self-center" style={{ paddingTop: anyTagTeam ? '24px' : '6px' }}>
              <span className="font-display text-lg sm:text-xl font-bold text-text-secondary">VS</span>
            </div>
          )}
          {/* Team container — all members share same alignment */}
          <div className="flex flex-col items-center">
            {/* Tag team name — always reserve space if any team has one */}
            <div className="h-5 flex items-end justify-center mb-1">
              {members[0]?.tag_team && teamEntries.length <= 2 ? (
                <p className="text-[10px] text-text-secondary uppercase tracking-wider">
                  {members[0].tag_team.name}
                </p>
              ) : anyTagTeam ? (
                <span />
              ) : null}
            </div>
            {/* Member photos row — ALIGNED */}
            <div className="flex items-start gap-2 sm:gap-3 flex-wrap justify-center">
              {members.map((p: any) => {
                const isWinner = !spoilerMode && p.is_winner
                return (
                  <div key={p.id} className="flex flex-col items-center text-center" style={{ minWidth: '70px' }}>
                    {/* Photo */}
                    <div
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl overflow-hidden border-2 transition-all ${isWinner ? 'ring-2' : ''}`}
                      style={{
                        borderColor: isWinner ? color : 'rgba(30,41,59,0.4)',
                        ...(isWinner ? { '--tw-ring-color': `${color}40` } as any : {}),
                      }}
                    >
                      {p.superstar?.photo_url ? (
                        <Image src={p.photo_url_override || p.superstar.photo_url} alt={p.superstar.name} fill className="object-cover object-top" sizes="96px" />
                      ) : (
                        <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
                          <span className="text-2xl text-border-subtle">?</span>
                        </div>
                      )}
                      {isWinner && (
                        <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-t text-[8px] font-bold" style={{ backgroundColor: color, color: '#000' }}>
                          ★ WIN
                        </div>
                      )}
                    </div>
                    {/* Name */}
                    <p className={`mt-1.5 text-xs sm:text-sm font-medium truncate max-w-[80px] sm:max-w-[100px] ${isWinner ? 'font-bold' : 'text-text-white'}`}
                      style={isWinner ? { color } : {}}>
                      {p.superstar?.name || 'TBD'}
                    </p>
                  </div>
                )
              })}
            </div>
            {/* Managers — below the team, not per-participant (prevents misalignment) */}
            {(() => {
              const teamManagers = (match.managers || []).filter((m: any) =>
                m.team_number === teamNum || members.some((p: any) => m.managing_for?.id === p.superstar?.id)
              )
              if (teamManagers.length === 0) return null
              return (
                <div className="mt-2 flex items-center gap-2 justify-center">
                  {teamManagers.map((mg: any) => (
                    <div key={mg.id} className="flex items-center gap-1">
                      {mg.superstar?.photo_url && (
                        <div className="w-4 h-4 rounded-full overflow-hidden border border-border-subtle/50 shrink-0">
                          <Image src={mg.superstar.photo_url} alt="" width={16} height={16} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <span className="text-[9px] text-text-secondary italic">w/ {mg.superstar?.name}</span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      ))}
    </div>
  )
}

// Battle Royal participants
function BattleRoyalParticipants({ participants, spoilerMode, color, match }: {
  participants: any[]; spoilerMode: boolean; color: string; match: any
}) {
  return (
    <div className="text-center">
      <div className="flex flex-wrap justify-center gap-1.5 max-w-3xl mx-auto">
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
          <span className="text-xl shrink-0">{getSegmentCategoryIcon(segment.category)}</span>
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
          <svg className="w-4 h-4 text-text-secondary group-hover:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
