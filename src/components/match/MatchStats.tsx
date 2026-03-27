'use client'

import { useEffect, useState } from 'react'
import { getWinRate } from '@/lib/utils'

// ============================================================
// DONUT CHART — Win method percentages (pure SVG, no deps)
// ============================================================

function DonutChart({ data, color, size = 120 }: {
  data: { label: string; value: number; percentage: number; color: string }[]
  color: string
  size?: number
}) {
  const radius = (size - 16) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        {data.map((d, i) => {
          const strokeLength = (d.percentage / 100) * circumference
          const currentOffset = offset
          offset += strokeLength
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={12}
              strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          )
        })}
        {/* Background track */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={12} />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-mono font-bold text-text-white">{data.length}</span>
        <span className="text-[9px] text-text-secondary uppercase">Methods</span>
      </div>
    </div>
  )
}

// ============================================================
// WIN METHODS SECTION
// ============================================================

const METHOD_COLORS: Record<string, string> = {
  pinfall: '#c7a05a',
  submission: '#c0c0c0',
  dq: '#facc15',
  count_out: '#fb923c',
  ko: '#ef4444',
  referee_stoppage: '#a78bfa',
  escape: '#34d399',
  last_elimination: '#6ee7b7',
  other: '#64748b',
  forfeit: '#94a3b8',
  retrieve: '#38bdf8',
  no_contest: '#475569',
}

export function WinMethodsChart({ winMethods, color }: { winMethods: any[]; color: string }) {
  if (!winMethods || winMethods.length === 0) return null

  const chartData = winMethods.map(m => ({
    label: formatMethodLabel(m.result_type),
    value: Number(m.win_count),
    percentage: Number(m.percentage),
    color: METHOD_COLORS[m.result_type] || '#64748b',
  }))

  return (
    <div className="glass rounded-xl p-5 border border-border-subtle/20">
      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Win Methods</h3>
      <div className="flex items-center gap-6">
        <DonutChart data={chartData} color={color} />
        <div className="flex-1 space-y-2">
          {chartData.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-text-white flex-1">{d.label}</span>
              <span className="text-xs font-mono text-text-secondary">{d.percentage}%</span>
              <div className="w-16 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.percentage}%`, backgroundColor: d.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// HEAD-TO-HEAD BAR
// ============================================================

export function HeadToHeadBar({ label, value1, value2, name1, name2, color1, color2 }: {
  label: string; value1: number; value2: number; name1: string; name2: string; color1: string; color2: string
}) {
  const total = value1 + value2
  const pct1 = total > 0 ? Math.round((value1 / total) * 100) : 50
  const pct2 = 100 - pct1

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-mono font-bold" style={{ color: color1 }}>{value1}</span>
        <span className="text-text-secondary uppercase tracking-wider text-[10px]">{label}</span>
        <span className="font-mono font-bold" style={{ color: color2 }}>{value2}</span>
      </div>
      <div className="flex h-2 rounded-full overflow-hidden bg-bg-tertiary">
        <div className="h-full transition-all duration-700 rounded-l-full" style={{ width: `${pct1}%`, backgroundColor: color1 }} />
        <div className="h-full transition-all duration-700 rounded-r-full" style={{ width: `${pct2}%`, backgroundColor: color2 }} />
      </div>
    </div>
  )
}

// ============================================================
// HEAD-TO-HEAD SECTION (2 wrestlers)
// ============================================================

export function HeadToHeadSection({ h2h, superstar1, superstar2, color }: {
  h2h: any; superstar1: any; superstar2: any; color: string
}) {
  if (!h2h || !h2h.total_matches || h2h.total_matches === 0) return null

  const c1 = '#c7a05a' // blue for superstar 1
  const c2 = '#c0c0c0' // pink for superstar 2

  return (
    <div className="glass rounded-xl p-5 border border-border-subtle/20">
      <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-4 text-center">
        Head to Head ({h2h.total_matches} match{h2h.total_matches > 1 ? 'es' : ''})
      </h3>

      {/* Names header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-bold" style={{ color: c1 }}>{superstar1.name}</span>
        <span className="text-sm font-bold" style={{ color: c2 }}>{superstar2.name}</span>
      </div>

      {/* Bars */}
      <div className="space-y-3">
        <HeadToHeadBar label="Wins" value1={h2h.wins_superstar1} value2={h2h.wins_superstar2} name1={superstar1.name} name2={superstar2.name} color1={c1} color2={c2} />
        {superstar1.total_matches > 0 && superstar2.total_matches > 0 && (
          <HeadToHeadBar
            label="Win Rate (Overall)"
            value1={Math.round((superstar1.win_count / superstar1.total_matches) * 100)}
            value2={Math.round((superstar2.win_count / superstar2.total_matches) * 100)}
            name1={superstar1.name} name2={superstar2.name}
            color1={c1} color2={c2}
          />
        )}
        {superstar1.height_cm && superstar2.height_cm && (
          <HeadToHeadBar label="Height (cm)" value1={superstar1.height_cm} value2={superstar2.height_cm} name1={superstar1.name} name2={superstar2.name} color1={c1} color2={c2} />
        )}
        {superstar1.weight_kg && superstar2.weight_kg && (
          <HeadToHeadBar label="Weight (kg)" value1={superstar1.weight_kg} value2={superstar2.weight_kg} name1={superstar1.name} name2={superstar2.name} color1={c1} color2={c2} />
        )}
      </div>

      {/* Extra stats */}
      <div className="mt-4 pt-3 border-t border-border-subtle/20 flex items-center justify-center gap-6 text-xs text-text-secondary">
        {h2h.avg_rating && (
          <span>Avg Rating: <span className="text-text-white font-mono">{h2h.avg_rating}</span></span>
        )}
        {h2h.draws > 0 && (
          <span>Draws: <span className="text-text-white font-mono">{h2h.draws}</span></span>
        )}
      </div>
    </div>
  )
}

// ============================================================
// SUPERSTAR QUICK STATS (UFC-style card on match page)
// ============================================================

export function SuperstarQuickStats({ superstar, winMethods, color }: {
  superstar: any; winMethods?: any[]; color: string
}) {
  if (!superstar) return null
  const s = superstar

  // Compute win% by method
  const totalWins = s.win_count || 0
  const methodStats = (winMethods || []).map(m => ({
    label: formatMethodLabel(m.result_type),
    pct: Number(m.percentage),
  }))

  return (
    <div className="glass rounded-xl p-4 border border-border-subtle/20">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <StatCell label="Record" value={`${s.win_count}W - ${s.loss_count}L - ${s.draw_count}D`} />
        <StatCell label="Win Rate" value={s.total_matches ? getWinRate(s.win_count, s.total_matches) : '—'} highlight color={color} />
        <StatCell label="Total Matches" value={s.total_matches?.toString() || '0'} />
        <StatCell label="Nationality" value={s.nationalities?.[0] || s.birth_country || '—'} />
      </div>
      {methodStats.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border-subtle/10 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {methodStats.slice(0, 4).map((m, i) => (
            <div key={i} className="text-center">
              <p className="text-[10px] text-text-secondary uppercase">{m.label}</p>
              <p className="text-sm font-mono font-bold text-text-white">{m.pct}%</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCell({ label, value, highlight, color }: { label: string; value: string; highlight?: boolean; color?: string }) {
  return (
    <div>
      <p className="text-[10px] text-text-secondary uppercase tracking-wider">{label}</p>
      <p className={`text-sm font-mono font-bold ${highlight ? '' : 'text-text-white'}`} style={highlight && color ? { color } : {}}>
        {value}
      </p>
    </div>
  )
}

// ============================================================
// HELPERS
// ============================================================

function formatMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    pinfall: 'Pinfall', submission: 'Submission', dq: 'DQ',
    count_out: 'Count Out', ko: 'KO', referee_stoppage: 'Ref Stop',
    escape: 'Escape', last_elimination: 'Elimination',
    forfeit: 'Forfeit', retrieve: 'Retrieve', no_contest: 'No Contest', other: 'Other',
  }
  return labels[method] || method
}
