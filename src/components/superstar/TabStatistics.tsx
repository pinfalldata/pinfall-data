'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

const RESULT_LABELS: Record<string, string> = {
  pinfall: 'Pinfall', submission: 'Submission', dq: 'Disqualification', count_out: 'Count Out',
  no_contest: 'No Contest', forfeit: 'Forfeit', ko: 'Knockout', referee_stoppage: 'Ref Stoppage',
  escape: 'Escape', retrieve: 'Retrieve', last_elimination: 'Last Elimination', time_limit_draw: 'Time Limit Draw', other: 'Other',
}

function fmtDur(s: number) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, '0')}` }

export default function TabStatistics({ superstar }: { superstar: any }) {
  const [stats, setStats] = useState<any>(null)
  const [years, setYears] = useState<string[]>([])
  const [year, setYear] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async (y: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ superstarId: String(superstar.id) })
      if (y) params.set('year', y)
      const r = await fetch(`/api/superstar-stats?${params}`)
      const d = await r.json()
      setStats(d.stats)
      if (d.years?.length > 0) setYears(d.years)
    } catch {}
    setLoading(false)
  }, [superstar.id])

  useEffect(() => { fetchStats('') }, [fetchStats])

  const changeYear = (y: string) => { setYear(y); fetchStats(y) }

  if (loading) return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
    </div>
  )

  if (!stats) return <p className="text-center py-12 text-text-secondary">No match data available.</p>

  const s = stats

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Year filter */}
      {years.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-secondary">Period:</span>
          <select value={year} onChange={e => changeYear(e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg-secondary/30 border border-border-subtle/30 text-xs text-text-white cursor-pointer focus:outline-none focus:border-neon-blue/40">
            <option value="">All-time career</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {year && <button onClick={() => changeYear('')} className="text-xs text-red-400 hover:text-red-300">Reset</button>}
        </div>
      )}

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { l: 'Matches', v: s.totalMatches, c: 'text-neon-blue' },
          { l: 'Wins', v: s.wins, c: 'text-emerald-400' },
          { l: 'Losses', v: s.losses, c: 'text-red-400' },
          { l: 'Draws', v: s.draws, c: 'text-yellow-400' },
          { l: 'Win Rate', v: `${s.winRate}%`, c: s.winRate >= 60 ? 'text-emerald-400' : s.winRate >= 40 ? 'text-yellow-400' : 'text-red-400' },
          { l: 'Avg Duration', v: s.avgDuration > 0 ? fmtDur(s.avgDuration) : '—', c: 'text-text-white' },
          { l: 'Avg Rating', v: s.avgRating ? `${s.avgRating}★` : '—', c: 'text-yellow-400' },
        ].map((item, i) => (
          <div key={i} className="rounded-xl border border-border-subtle/20 bg-bg-secondary/15 p-3 text-center">
            <span className="block text-[9px] text-text-secondary uppercase tracking-wider mb-1">{item.l}</span>
            <span className={`block text-lg font-bold font-display ${item.c}`}>{item.v}</span>
          </div>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {s.longestWinStreak > 0 && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
            <span className="block text-[9px] text-text-secondary uppercase mb-1">Longest Win Streak</span>
            <span className="block text-xl font-bold text-emerald-400">{s.longestWinStreak}</span>
          </div>
        )}
        {s.longestLossStreak > 0 && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center">
            <span className="block text-[9px] text-text-secondary uppercase mb-1">Longest Loss Streak</span>
            <span className="block text-xl font-bold text-red-400">{s.longestLossStreak}</span>
          </div>
        )}
        {s.titleMatches > 0 && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-center">
            <span className="block text-[9px] text-text-secondary uppercase mb-1">Title Matches</span>
            <span className="block text-xl font-bold text-yellow-400">{s.titleMatches}</span>
          </div>
        )}
        {s.maxRating && (
          <div className="rounded-xl border border-neon-blue/20 bg-neon-blue/5 p-3 text-center">
            <span className="block text-[9px] text-text-secondary uppercase mb-1">Best Rated Match</span>
            <span className="block text-xl font-bold text-neon-blue">{s.maxRating}★</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Win Methods */}
        {s.winMethods?.length > 0 && (
          <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-5">
            <h4 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">How They Win</h4>
            <div className="space-y-2.5">
              {s.winMethods.slice(0, 8).map((wm: any) => (
                <div key={wm.method} className="flex items-center gap-2">
                  <span className="text-xs text-text-white w-28 truncate">{RESULT_LABELS[wm.method] || wm.method}</span>
                  <div className="flex-1 h-3 rounded-full bg-bg-tertiary/50 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500/60 to-emerald-400 transition-all duration-500" style={{ width: `${wm.pct}%` }} />
                  </div>
                  <span className="text-[10px] text-text-secondary font-mono w-16 text-right">{wm.count} ({wm.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Match Types */}
        {s.matchTypes?.length > 0 && (
          <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-5">
            <h4 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Match Types</h4>
            <div className="space-y-2.5">
              {s.matchTypes.map((mt: any, i: number) => {
                const max = s.matchTypes[0].count
                return (
                  <div key={mt.id} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-neon-blue/10 flex items-center justify-center text-[9px] text-neon-blue font-bold shrink-0">{i + 1}</span>
                    <span className="text-xs text-text-white flex-1 truncate">{mt.name}</span>
                    <div className="w-20 h-2.5 rounded-full bg-bg-tertiary/50 overflow-hidden">
                      <div className="h-full rounded-full bg-neon-blue/50" style={{ width: `${(mt.count / max) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-neon-blue font-bold w-8 text-right">{mt.count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Yearly Record Chart */}
      {s.yearlyChart?.length > 1 && !year && (
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-5">
          <h4 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Record by Year</h4>
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1" style={{ minWidth: s.yearlyChart.length * 48 }}>
              {s.yearlyChart.map((yr: any) => {
                const max = Math.max(...s.yearlyChart.map((y: any) => y.total))
                const h = max > 0 ? (yr.total / max) * 120 : 0
                const wPct = yr.total > 0 ? (yr.wins / yr.total) * 100 : 0
                return (
                  <div key={yr.year} className="flex flex-col items-center flex-1 min-w-[40px]">
                    <span className="text-[9px] text-text-secondary font-mono mb-1">{yr.winRate}%</span>
                    <div className="w-full flex flex-col rounded-t overflow-hidden" style={{ height: Math.max(h, 4) }}>
                      <div className="bg-emerald-500/60" style={{ height: `${wPct}%` }} />
                      <div className="bg-red-500/40 flex-1" />
                    </div>
                    <span className="text-[8px] text-text-secondary mt-1 font-mono">{yr.year.slice(2)}</span>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 justify-center">
              <span className="flex items-center gap-1 text-[9px] text-text-secondary"><span className="w-2 h-2 rounded-sm bg-emerald-500/60" /> Wins</span>
              <span className="flex items-center gap-1 text-[9px] text-text-secondary"><span className="w-2 h-2 rounded-sm bg-red-500/40" /> Losses</span>
            </div>
          </div>
        </div>
      )}

      {/* Show breakdown */}
      {s.showSeriesBreakdown?.length > 0 && (
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-5">
          <h4 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Matches by Show</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {s.showSeriesBreakdown.map((ss: any) => (
              <div key={ss.ss.id} className="flex items-center gap-2 p-2 rounded-lg bg-bg-tertiary/20 border border-border-subtle/10">
                {ss.ss.logo_url && <div className="w-6 h-6 rounded shrink-0 overflow-hidden"><Image src={ss.ss.logo_url} alt="" width={24} height={24} className="w-full h-full object-contain" unoptimized /></div>}
                <div className="min-w-0">
                  <span className="text-xs text-text-white font-medium block truncate">{ss.ss.short_name || ss.ss.name}</span>
                  <span className="text-[10px] text-neon-blue font-bold">{ss.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
