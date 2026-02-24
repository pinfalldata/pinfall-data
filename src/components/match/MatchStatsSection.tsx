'use client'

import { HeadToHeadSection, WinMethodsChart, SuperstarQuickStats } from './MatchStats'
import { groupParticipantsByTeam } from '@/lib/utils'

export function MatchStatsSection({ match, h2hData, winMethodsMap }: {
  match: any
  h2hData: any
  winMethodsMap: Record<number, any[]>
}) {
  const participants = match.participants || []
  const color = match.show?.primary_color || '#c7a05a'
  const teams = groupParticipantsByTeam(participants)
  const teamEntries = Array.from(teams.entries())
  const uniqueSuperstars = Array.from(
    new Map(participants.map((p: any) => [p.superstar?.id, p.superstar])).values()
  ).filter(Boolean)

  const has1v1 = uniqueSuperstars.length === 2
  const hasStats = h2hData || Object.keys(winMethodsMap).length > 0

  if (!hasStats) return null

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Section title */}
      <div className="text-center">
        <h2 className="font-display text-xl sm:text-2xl font-bold text-text-white uppercase tracking-wide">📊 Statistics</h2>
        <div className="h-px mt-3 max-w-xs mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      </div>

      {/* Head-to-head (1v1 only) */}
      {has1v1 && h2hData && (
        <HeadToHeadSection
          h2h={h2hData}
          superstar1={uniqueSuperstars[0]}
          superstar2={uniqueSuperstars[1]}
          color={color}
        />
      )}

      {/* Quick stats for each participant */}
      <div className={`grid gap-4 ${uniqueSuperstars.length === 2 ? 'grid-cols-1 lg:grid-cols-2' : uniqueSuperstars.length <= 4 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {uniqueSuperstars.slice(0, 6).map((s: any) => (
          <div key={s.id}>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 text-center">{s.name}</p>
            <SuperstarQuickStats superstar={s} winMethods={winMethodsMap[s.id]} color={color} />
          </div>
        ))}
      </div>

      {/* Win methods donuts (1v1 side by side) */}
      {has1v1 && uniqueSuperstars.length === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {uniqueSuperstars.map((s: any) => (
            winMethodsMap[s.id]?.length > 0 ? (
              <div key={s.id}>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 text-center">{s.name} — Win Methods</p>
                <WinMethodsChart winMethods={winMethodsMap[s.id]} color={color} />
              </div>
            ) : null
          ))}
        </div>
      )}

      {/* Multi-man: show win methods */}
      {!has1v1 && uniqueSuperstars.length > 2 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueSuperstars.slice(0, 6).map((s: any) => (
            winMethodsMap[s.id]?.length > 0 ? (
              <div key={s.id}>
                <p className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 text-center">{s.name}</p>
                <WinMethodsChart winMethods={winMethodsMap[s.id]} color={color} />
              </div>
            ) : null
          ))}
        </div>
      )}
    </div>
  )
}
