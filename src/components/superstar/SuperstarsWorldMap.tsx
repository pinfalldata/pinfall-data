'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface CountryData {
  name: string
  count: number
}

/* ============================================================
   COUNTRY CODE MAP (for flag emojis)
   ============================================================ */
const COUNTRY_CODES: Record<string, string> = {
  'United States': 'US', 'Canada': 'CA', 'Mexico': 'MX', 'United Kingdom': 'GB',
  'Japan': 'JP', 'Australia': 'AU', 'Germany': 'DE', 'Ireland': 'IE',
  'India': 'IN', 'Brazil': 'BR', 'Italy': 'IT', 'France': 'FR',
  'Scotland': 'GB', 'England': 'GB', 'Wales': 'GB', 'Puerto Rico': 'PR',
  'South Africa': 'ZA', 'New Zealand': 'NZ', 'Switzerland': 'CH',
  'Spain': 'ES', 'Netherlands': 'NL', 'Finland': 'FI', 'Sweden': 'SE',
  'Norway': 'NO', 'Denmark': 'DK', 'Poland': 'PL', 'Romania': 'RO',
  'Bulgaria': 'BG', 'Croatia': 'HR', 'Serbia': 'RS', 'Greece': 'GR',
  'Turkey': 'TR', 'Israel': 'IL', 'Iran': 'IR', 'China': 'CN',
  'South Korea': 'KR', 'Philippines': 'PH', 'Singapore': 'SG',
  'Thailand': 'TH', 'Vietnam': 'VN', 'Pakistan': 'PK', 'Afghanistan': 'AF',
  'Nigeria': 'NG', 'Ghana': 'GH', 'Kenya': 'KE', 'Egypt': 'EG',
  'Morocco': 'MA', 'Tunisia': 'TN', 'Argentina': 'AR', 'Chile': 'CL',
  'Colombia': 'CO', 'Peru': 'PE', 'Venezuela': 'VE', 'Cuba': 'CU',
  'Dominican Republic': 'DO', 'Jamaica': 'JM', 'Trinidad and Tobago': 'TT',
  'Samoa': 'WS', 'American Samoa': 'AS', 'Tonga': 'TO', 'Fiji': 'FJ',
  'Austria': 'AT', 'Belgium': 'BE', 'Czech Republic': 'CZ', 'Hungary': 'HU',
  'Portugal': 'PT', 'Russia': 'RU', 'Ukraine': 'UA', 'Saudi Arabia': 'SA',
  'Iraq': 'IQ', 'Syria': 'SY', 'Lebanon': 'LB', 'Jordan': 'JO',
}

function getFlag(country: string): string {
  const code = COUNTRY_CODES[country]
  if (!code) return '🌍'
  // Convert code to flag emoji
  return String.fromCodePoint(...code.split('').map(c => c.charCodeAt(0) + 127397))
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function SuperstarsWorldMap() {
  const [countries, setCountries] = useState<CountryData[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    fetch('/api/superstars-map')
      .then(r => r.json())
      .then(d => setCountries(d.countries || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 rounded-xl bg-bg-secondary/30" />
        ))}
      </div>
    )
  }

  if (countries.length === 0) return null

  const maxCount = countries[0]?.count || 1
  const totalSuperstars = countries.reduce((s, c) => s + c.count, 0)
  const displayCount = expanded ? countries.length : Math.min(20, countries.length)
  const displayed = countries.slice(0, displayCount)

  return (
    <div>
      {/* Stats header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌍</span>
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Global reach</p>
            <p className="text-text-white font-bold">
              <span className="text-neon-blue font-mono">{totalSuperstars.toLocaleString()}</span> superstars
              from <span className="text-neon-blue font-mono">{countries.length}</span> countries
            </p>
          </div>
        </div>
      </div>

      {/* Country bars */}
      <div className="space-y-1.5">
        {displayed.map((c, idx) => {
          const pct = (c.count / maxCount) * 100
          return (
            <Link
              key={c.name}
              href={`/superstars/wrestlers?country=${encodeURIComponent(c.name)}`}
              className="group flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent hover:border-border-subtle/20 hover:bg-bg-secondary/30 transition-all"
            >
              {/* Rank */}
              <span className="text-[10px] text-text-secondary font-mono w-5 text-right shrink-0">
                {idx + 1}.
              </span>

              {/* Flag */}
              <span className="text-lg shrink-0 w-7 text-center">{getFlag(c.name)}</span>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm text-text-white font-medium truncate group-hover:text-neon-blue transition-colors">
                    {c.name}
                  </span>
                  <span className="text-xs text-neon-blue font-mono font-bold shrink-0 ml-2">
                    {c.count}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 rounded-full bg-bg-tertiary/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: idx === 0
                        ? 'linear-gradient(90deg, #c7a05a, #e8d5a0)'
                        : idx < 3
                        ? 'linear-gradient(90deg, #c7a05a90, #c7a05a)'
                        : 'linear-gradient(90deg, #c7a05a40, #c7a05a70)',
                    }}
                  />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Show more/less */}
      {countries.length > 20 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-neon-blue hover:text-neon-blue/80 transition-colors"
          >
            {expanded ? `Show top 20 ▲` : `Show all ${countries.length} countries ▼`}
          </button>
        </div>
      )}
    </div>
  )
}
