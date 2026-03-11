'use client'

import { useState, useEffect, memo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

/* ============================================================
   DYNAMIC IMPORT — avoid SSR for react-simple-maps
   ============================================================ */
const ComposableMap = dynamic(() => import('react-simple-maps').then(m => m.ComposableMap), { ssr: false })
const Geographies = dynamic(() => import('react-simple-maps').then(m => m.Geographies), { ssr: false })
const Geography = dynamic(() => import('react-simple-maps').then(m => m.Geography), { ssr: false })
const ZoomableGroup = dynamic(() => import('react-simple-maps').then(m => m.ZoomableGroup), { ssr: false })

import { getFlagUrl, getFlagEmoji } from '@/lib/flags'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

interface CountryData { name: string; count: number }

/* ============================================================
   COUNTRY NAME → ISO numeric mapping (topojson uses ISO numeric)
   We match by NAME from DB to the topojson properties.name
   ============================================================ */
/* Flag helper uses imported getFlagUrl */

/* Flag helper - uses flagcdn.com images */
function FlagImg({ country, size = 20 }: { country: string; size?: number }) {
  const url = getFlagUrl(country, size * 2) // retina
  if (!url) return <span className="text-lg">{getFlagEmoji(country)}</span>
  return <img src={url} alt={country} width={size} height={Math.round(size * 0.75)} className="rounded-sm object-cover inline-block" style={{ width: size, height: Math.round(size * 0.75) }} loading="lazy" />
}

/* Map DB country names → topojson country names for geo matching */
const NAME_TO_GEO: Record<string, string> = {
  'United States': 'United States of America',
  'United Kingdom': 'United Kingdom',
  'England': 'United Kingdom',
  'Scotland': 'United Kingdom',
  'Wales': 'United Kingdom',
  'South Korea': 'South Korea',
  'Puerto Rico': 'Puerto Rico',
  'Dominican Republic': 'Dominican Rep.',
  'Czech Republic': 'Czechia',
}

/* ============================================================ MAIN */
export default function SuperstarsWorldMap() {
  const [countries, setCountries] = useState<CountryData[]>([])
  const [loading, setLoading] = useState(true)
  const [tooltip, setTooltip] = useState<{ name: string; count: number; x: number; y: number } | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    fetch('/api/superstars-map')
      .then(r => r.json())
      .then(d => { setCountries(d.countries || []); setMapReady(true) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="animate-pulse space-y-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 rounded-xl bg-bg-secondary/30" />)}</div>
  }
  if (countries.length === 0) return null

  // Build lookup: geoName → count
  const geoLookup = new Map<string, number>()
  for (const c of countries) {
    // Direct name
    geoLookup.set(c.name, (geoLookup.get(c.name) || 0) + c.count)
    // Mapped name
    const mapped = NAME_TO_GEO[c.name]
    if (mapped) geoLookup.set(mapped, (geoLookup.get(mapped) || 0) + c.count)
  }

  const maxCount = countries[0]?.count || 1
  const totalSuperstars = countries.reduce((s, c) => s + c.count, 0)
  const displayCount = expanded ? countries.length : Math.min(20, countries.length)
  const displayed = countries.slice(0, displayCount)

  // Color scale
  const getColor = (count: number) => {
    if (count === 0) return '#10141e'
    const ratio = Math.log(count + 1) / Math.log(maxCount + 1)
    if (ratio > 0.7) return '#c7a05a'
    if (ratio > 0.4) return '#8b6d2e'
    if (ratio > 0.2) return '#5a4520'
    return '#2d2213'
  }

  return (
    <div>
      {/* Stats header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FlagImg country={hovered.name} size={24} />
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wider">Global reach</p>
            <p className="text-text-white font-bold">
              <span className="text-neon-blue font-mono">{totalSuperstars.toLocaleString()}</span> superstars
              from <span className="text-neon-blue font-mono">{countries.length}</span> countries
            </p>
          </div>
        </div>
      </div>

      {/* ===== INTERACTIVE MAP ===== */}
      {mapReady && (
        <div className="relative rounded-xl overflow-hidden border border-border-subtle/20 bg-bg-secondary/30 mb-6" style={{ minHeight: 280 }}>
          <ComposableMap
            projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}
            style={{ width: '100%', height: 'auto' }}
          >
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }: any) =>
                  geographies.map((geo: any) => {
                    const geoName = geo.properties.name
                    const count = geoLookup.get(geoName) || 0
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={(e: any) => {
                          if (count > 0) setTooltip({ name: geoName, count, x: e.clientX, y: e.clientY })
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        style={{
                          default: { fill: getColor(count), stroke: '#1e293b', strokeWidth: 0.4, outline: 'none' },
                          hover: { fill: count > 0 ? '#e8d5a0' : '#1a1f2e', stroke: '#c7a05a', strokeWidth: 0.6, outline: 'none', cursor: count > 0 ? 'pointer' : 'default' },
                          pressed: { fill: '#c7a05a', outline: 'none' },
                        }}
                      />
                    )
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-[100] px-3 py-2 rounded-lg bg-bg-primary/95 border border-neon-blue/30 shadow-xl text-sm pointer-events-none backdrop-blur-sm"
              style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
            >
              <span className="text-text-white font-bold">{tooltip.name}</span>
              <span className="text-neon-blue font-mono ml-2">{tooltip.count}</span>
              <span className="text-text-secondary text-xs ml-1">superstars</span>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[9px] text-text-secondary bg-bg-primary/80 px-2 py-1 rounded-md backdrop-blur-sm">
            <span>Fewer</span>
            <div className="flex gap-0.5">
              {['#2d2213', '#5a4520', '#8b6d2e', '#c7a05a'].map(c => (
                <div key={c} className="w-3 h-2 rounded-sm" style={{ background: c }} />
              ))}
            </div>
            <span>More</span>
          </div>
        </div>
      )}

      {/* ===== COUNTRY LIST ===== */}
      <div className="space-y-1.5">
        {displayed.map((c, idx) => {
          const pct = (c.count / maxCount) * 100
          return (
            <Link key={c.name} href={`/superstars/wrestlers?country=${encodeURIComponent(c.name)}`}
              className="group flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent hover:border-border-subtle/20 hover:bg-bg-secondary/30 transition-all">
              <span className="text-[10px] text-text-secondary font-mono w-5 text-right shrink-0">{idx + 1}.</span>
              <span className="shrink-0 w-7 flex items-center justify-center"><FlagImg country={c.name} size={20} /></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm text-text-white font-medium truncate group-hover:text-neon-blue transition-colors">{c.name}</span>
                  <span className="text-xs text-neon-blue font-mono font-bold shrink-0 ml-2">{c.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-tertiary/80 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${pct}%`, background: idx === 0 ? 'linear-gradient(90deg,#c7a05a,#e8d5a0)' : idx < 3 ? 'linear-gradient(90deg,#c7a05a90,#c7a05a)' : 'linear-gradient(90deg,#c7a05a40,#c7a05a70)' }} />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {countries.length > 20 && (
        <div className="text-center mt-4">
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-neon-blue hover:text-neon-blue/80 transition-colors">
            {expanded ? `Show top 20 ▲` : `Show all ${countries.length} countries ▼`}
          </button>
        </div>
      )}
    </div>
  )
}
