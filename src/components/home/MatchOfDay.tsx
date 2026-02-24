'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'

export function MatchOfDay() {
  const [match, setMatch] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/match-of-day')
      .then(r => r.json())
      .then(data => { setMatch(data.match); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-neon-blue mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-neon-blue rounded-full animate-glow-pulse" />
          Match of the Day
        </h2>
        <div className="h-48 rounded-xl bg-bg-tertiary/30 animate-pulse" />
      </div>
    )
  }

  if (!match) return null

  const participants = match.participants || []
  const teams = new Map<number, any[]>()
  participants.forEach((p: any) => {
    const team = p.team_number || 0
    if (!teams.has(team)) teams.set(team, [])
    teams.get(team)!.push(p)
  })
  const teamEntries = Array.from(teams.entries())

  return (
    <Link
      href={`/shows/${match.show?.slug}/matches/${match.slug}`}
      className="block group rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden hover:border-neon-blue/20 hover:bg-bg-secondary/30 transition-all duration-300"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-neon-blue flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-blue rounded-full animate-glow-pulse" />
            Match of the Day
          </h2>
          {match.rating && <StarRating rating={match.rating} size="sm" showValue />}
        </div>

        {/* Show info */}
        <div className="flex items-center gap-2 mb-4">
          {match.show?.show_series?.logo_url && (
            <div className="w-6 h-6 rounded overflow-hidden shrink-0">
              <Image src={match.show.show_series.logo_url} alt="" width={24} height={24} className="w-full h-full object-contain" />
            </div>
          )}
          <span className="text-sm text-text-white font-medium">{match.show?.name}</span>
          <span className="text-xs text-text-secondary">•</span>
          <span className="text-xs text-text-secondary font-mono">{match.date}</span>
        </div>

        {/* Match type */}
        <span className="inline-block px-2.5 py-1 rounded-md bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-semibold uppercase mb-4">
          {match.match_type?.name || 'Match'}
        </span>

        {/* Championship */}
        {match.championship && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
            {match.championship.image_url && (
              <div className="w-8 h-6 shrink-0">
                <Image src={match.championship.image_url} alt="" width={32} height={24} className="w-full h-full object-contain" />
              </div>
            )}
            <span className="text-xs text-yellow-400 font-medium">{match.championship.name}</span>
          </div>
        )}

        {/* Teams */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {teamEntries.map(([teamNum, members], ti) => (
            <div key={teamNum} className="flex items-center gap-2">
              {ti > 0 && <span className="text-sm font-bold text-neon-blue mx-1">vs</span>}
              <div className="flex items-center gap-2">
                {members.slice(0, 4).map((p: any) => (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 ${
                      p.is_winner ? 'border-emerald-500/50' : 'border-border-subtle/30'
                    }`}>
                      {p.superstar?.photo_url ? (
                        <Image src={p.superstar.photo_url} alt="" width={56} height={56} className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full bg-bg-tertiary" />}
                    </div>
                    <span className="text-[10px] text-text-white text-center max-w-[60px] truncate">
                      {p.superstar?.name}
                    </span>
                    {p.is_winner && (
                      <span className="text-[8px] text-emerald-400 font-bold uppercase">Winner</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}
