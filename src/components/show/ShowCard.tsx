'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  formatDuration, getRatingColor, getRatingBgColor, getResultLabel,
  isBattleRoyalType, isIronManMatch, groupParticipantsByTeam,
  getSegmentCategoryLabel, getSegmentCategoryIcon,
} from '@/lib/utils'
import { StarRating } from '@/components/ui/StarRating'
// On a retiré l'import de MediaGrid ici !

export function ShowCard({ show }: { show: any }) {
  const [spoilerMode, setSpoilerMode] = useState(true)
  const color = show.primary_color || '#2cb2fe'

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

  // Find the last match for Main Event badge
  const matchItems = timeline.filter(t => t.type === 'match')
  const lastMatchId = matchItems.length > 0 ? matchItems[matchItems.length - 1].data.id : null

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Section header */}
      <div className="text-center mb-6">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-text-white uppercase tracking-wide">
          Full Card &amp; Results
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          {show.matches?.length || 0} match{(show.matches?.length || 0) !== 1 ? 'es' : ''} • {show.segments?.length || 0} segment{(show.segments?.length || 0) !== 1 ? 's' : ''}
        </p>
        <div className="h-px mt-3 max-w-xs mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      </div>

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
            {spoilerMode ? '🔒 Spoiler-Free Mode' : '👁️ Show Results'}
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

      {/* Media Section (Désactivée car MediaGrid n'existe pas) */}
      {/* {show.media?.length > 0 && (
        <div className="mt-12">
          <div className="text-center mb-6">
            <h2 className="font-display text-xl font-bold text-text-white uppercase tracking-wide">Media</h2>
            <div className="h-px mt-3 max-w-xs mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
          </div>
        </div>
      )}
      */}
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
    <Link href={`/shows/${show.slug}/matches/${matchSlug}`} className="block group">
      <div
        className="relative rounded-2xl border bg-bg-secondary/30 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:translate-y-[-2px]"
        style={{ borderColor: isMainEvent ? `${color}40` : 'rgba(30,41,59,0.3)' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = `${color}40`
          ;(e.currentTarget as HTMLElement).style.boxShadow = `0 0 25px ${color}15, 0 0 50px ${color}08`
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = isMainEvent ? `${color}40` : 'rgba(30,41,59,0.3)'
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
        }}
      >
        {/* Main Event badge */}
        {isMainEvent && (
          <div
            className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-wider z-10"
            style={{ backgroundColor: color, color: '#000' }}
          >
            ⭐ Main Event
          </div>
        )}

        {/* Match header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border-subtle/20">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-text-secondary text-xs font-mono">#{index + 1}</span>
            {match.match_type && (
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color }}>
                {match.match_type.name}
              </span>
            )}
            {match.is_title_change && !spoilerMode && (
              <span className="text-[10px] px-2 py-0.5 bg-neon-pink/20 text-neon-pink border border-neon-pink/30 rounded-full font-bold uppercase">
                Title Change!
              </span>
            )}
            {match.is_dark_match && (
              <span className="text-[10px] px-2 py-0.5 bg-bg-tertiary text-text-secondary border border-border-subtle/30 rounded-full font-bold uppercase">
                Dark Match
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {match.duration_seconds && (
              <span className="text-text-secondary text-xs font-mono">{formatDuration(match.duration_seconds)}</span>
            )}
            {match.rating && (
              <StarRating rating={match.rating} size="sm" showValue />
            )}
          </div>
        </div>

        {/* Championship badge — BIGGER */}
        {match.championship && (
          <div className="flex items-center justify-center gap-3 py-3 border-b border-border-subtle/10" style={{ backgroundColor: `${color}06` }}>
            {match.championship.image_url && (
              <Image src={match.championship.image_url} alt="" width={56} height={56} className="h-14 w-auto object-contain drop-shadow-lg" />
            )}
            <span className="text-sm text-yellow-400 font-bold uppercase tracking-wider">
              {match.championship.name}
            </span>
          </div>
        )}

        {/* Participants */}
        <div className="px-4 sm:px-6 py-6">
          {isBattleRoyal || manyParticipants ? (
            <div className="text-center">
              <div className="flex flex-wrap justify-center gap-1.5">
                {participants
                  .sort((a: any, b: any) => (a.entry_number ?? 99) - (b.entry_number ?? 99))
                  .map((p: any) => {
                    const isWinner = !spoilerMode && p.is_winner
                    return (
                      <span
                        key={p.id}
                        className={`text-xs px-2.5 py-1 rounded-lg border ${isWinner ? 'font-bold' : 'text-text-secondary border-border-subtle/30'}`}
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
            /* Standard match: teams face to face — BIGGER PHOTOS */
            <div className="flex items-center justify-center gap-3 sm:gap-6 lg:gap-10">
              {teamEntries.map(([teamNum, members], teamIdx) => (
                <div key={teamNum} className="flex items-center gap-3 sm:gap-6 lg:gap-10">
                  {teamIdx > 0 && (
                    <span className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-text-secondary mx-1">VS</span>
                  )}
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
                    {members.map((p: any) => {
                      const isWinner = !spoilerMode && p.is_winner
                      const managers = (match.managers || []).filter((m: any) =>
                        m.managing_for?.id === p.superstar?.id || m.team_number === teamNum
                      )
                      return (
                        <div key={p.id} className="flex flex-col items-center text-center">
                          {p.tag_team && teamEntries.length <= 2 && members.indexOf(p) === 0 && (
                            <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-1">{p.tag_team.name}</p>
                          )}
                          {/* Superstar photo — BIGGER */}
                          <div
                            className={`relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl overflow-hidden border-2 transition-all`}
                            style={{
                              borderColor: isWinner ? color : 'rgba(30,41,59,0.4)',
                              boxShadow: isWinner ? `0 0 15px ${color}30` : 'none',
                            }}
                          >
                            {p.superstar?.photo_url ? (
                              <Image src={p.photo_url_override || p.superstar.photo_url} alt={p.superstar.name} fill className="object-cover object-top" sizes="(max-width: 640px) 80px, (max-width: 1024px) 112px, 128px" />
                            ) : (
                              <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
                                <span className="text-3xl text-border-subtle">?</span>
                              </div>
                            )}
                            {isWinner && (
                              <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-t text-[9px] font-bold" style={{ backgroundColor: color, color: '#000' }}>
                                WIN
                              </div>
                            )}
                          </div>
                          {/* Name */}
                          <p className={`mt-2 text-xs sm:text-sm font-medium truncate max-w-[90px] sm:max-w-[120px] ${isWinner ? 'font-bold' : 'text-text-white'}`}
                            style={isWinner ? { color } : {}}>
                            {p.superstar?.name || 'TBD'}
                          </p>
                          {/* Manager(s) with photo */}
                          {managers.length > 0 && (
                            <div className="mt-1 flex items-center gap-1 justify-center">
                              {managers.map((mg: any) => (
                                <div key={mg.id} className="flex items-center gap-1">
                                  {mg.superstar?.photo_url && (
                                    <div className="w-5 h-5 rounded-full overflow-hidden border border-border-subtle/40 shrink-0">
                                      <Image src={mg.superstar.photo_url} alt="" width={20} height={20} className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <p className="text-[9px] text-text-secondary italic">w/ {mg.superstar?.name}</p>
                                </div>
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

// ============================================================
// SEGMENT CARD
// ============================================================
function SegmentCard({ segment, show, color, spoilerMode }: {
  segment: any; show: any; color: string; spoilerMode: boolean
}) {
  const participants = segment.participants || []
  const isSpoiler = segment.is_spoiler && spoilerMode

  return (
    <Link href={`/shows/${show.slug}/segments/${segment.slug}`} className="block group">
      <div className="relative rounded-xl border border-border-subtle/20 bg-bg-secondary/20 overflow-hidden transition-all duration-300 hover:border-border-subtle/40 hover:translate-y-[-1px]">
        <div className="flex items-center gap-4 px-4 sm:px-6 py-4">
          <span className="text-xl shrink-0">{getSegmentCategoryIcon(segment.category)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-text-secondary uppercase tracking-widest mb-0.5">
              {getSegmentCategoryLabel(segment.category)}
            </p>
            {isSpoiler ? (
              <p className="text-sm text-text-secondary italic">[Segment hidden — disable Spoiler-Free mode to reveal]</p>
            ) : (
              <p className="text-sm text-text-white font-medium truncate">{segment.title}</p>
            )}
          </div>
          {!isSpoiler && participants.length > 0 && (
            <div className="flex items-center -space-x-2 shrink-0">
              {participants.slice(0, 5).map((p: any) => (
                <div key={p.id} className="w-9 h-9 rounded-full overflow-hidden border-2 border-bg-primary">
                  {p.superstar?.photo_url ? (
                    <Image src={p.superstar.photo_url} alt="" width={36} height={36} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-bg-tertiary" />
                  )}
                </div>
              ))}
              {participants.length > 5 && (
                <div className="w-9 h-9 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[10px] text-text-secondary">
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