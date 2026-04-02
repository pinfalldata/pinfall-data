'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HERO = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/whatistheexcel-2-e1455555433890_2026-03-22_10_41_26.754419.jpg.png'
const COLORS = ['#c7a05a', '#3b82f6', '#ef4444', '#22c55e']

interface SuperstarResult { id: number; name: string; slug: string; photo_url: string | null }
interface ComparedStar {
  id: number; name: string; slug: string; photo_url: string | null
  age: number | null; height_cm: number | null; weight_kg: number | null
  debut_date: string | null; status: string; current_brand: string | null
  total_matches: number; wins: number; losses: number; draws: number; win_rate: number
  career_years: number | null; title_reigns: number; championship_days: number
  omg_moments: number; tag_teams: number; segments: number
  hall_of_fame: number; slammy_awards: number; year_end_awards: number
  [key: string]: any
}

const STAT_ROWS: { key: string; label: string; format?: (v: any) => string; higher?: boolean }[] = [
  { key: 'total_matches', label: 'Total Matches', higher: true },
  { key: 'wins', label: 'Wins', higher: true },
  { key: 'losses', label: 'Losses', higher: false },
  { key: 'draws', label: 'Draws' },
  { key: 'win_rate', label: 'Win Rate', format: v => `${v}%`, higher: true },
  { key: 'title_reigns', label: 'Championship Reigns', higher: true },
  { key: 'championship_days', label: 'Days as Champion', format: v => v?.toLocaleString(), higher: true },
  { key: 'career_years', label: 'Career Length', format: v => v ? `${v} yrs` : '—', higher: true },
  { key: 'height_cm', label: 'Height', format: v => v ? `${v} cm` : '—', higher: true },
  { key: 'weight_kg', label: 'Weight', format: v => v ? `${v} kg` : '—', higher: true },
  { key: 'age', label: 'Age', format: v => v ? `${v}` : '—' },
  { key: 'omg_moments', label: 'OMG Moments', higher: true },
  { key: 'segments', label: 'Segments', higher: true },
  { key: 'tag_teams', label: 'Tag Teams', higher: true },
  { key: 'hall_of_fame', label: 'Hall of Fame', higher: true },
  { key: 'slammy_awards', label: 'Slammy Awards', higher: true },
  { key: 'year_end_awards', label: 'Year-End Awards', higher: true },
]

export default function ComparePage() {
  const [selected, setSelected] = useState<SuperstarResult[]>([])
  const [compared, setCompared] = useState<ComparedStar[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SuperstarResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)
  const fetchRef = useRef(0) // abort guard

  // ★ CORE FIX: explicit fetch function, no useEffect
  const fetchComparison = useCallback(async (stars: SuperstarResult[]) => {
    if (stars.length < 2) {
      setCompared([])
      setError(null)
      return
    }
    const ticket = ++fetchRef.current
    setLoading(true)
    setError(null)
    try {
      const ids = stars.map(s => s.id).join(',')
      const r = await fetch(`/api/superstar-compare?ids=${ids}`)
      if (ticket !== fetchRef.current) return // stale
      if (!r.ok) {
        setError(`Server error (${r.status})`)
        setLoading(false)
        return
      }
      const d = await r.json()
      if (ticket !== fetchRef.current) return // stale
      const arr = d.superstars || d.data || []
      if (arr.length >= 2) {
        // Keep the selection order
        const map = new Map(arr.map((s: ComparedStar) => [s.id, s]))
        const ordered = stars.map(s => map.get(s.id)).filter(Boolean) as ComparedStar[]
        setCompared(ordered)
        setError(null)
      } else {
        setCompared([])
        const debugStr = d.debug ? ` | Debug: ${JSON.stringify(d.debug)}` : ''
        setError(`API returned ${arr.length} superstar(s) instead of ${stars.length}.${debugStr}`)
        console.warn('[Compare] API response:', d)
        console.warn('[Compare] URL called:', `/api/superstar-compare?ids=${stars.map(s => s.id).join(',')}`)
      }
    } catch (e: any) {
      if (ticket === fetchRef.current) {
        setError(e?.message || 'Network error')
        setCompared([])
        console.error('[Compare] Fetch error:', e)
      }
    }
    if (ticket === fetchRef.current) setLoading(false)
  }, [])

  // Search superstars
  const doSearch = (q: string) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); setShowDropdown(false); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/superstar-search?q=${encodeURIComponent(q)}&limit=8`)
        const d = await r.json()
        const existing = new Set(selected.map(s => s.id))
        setResults((d.results || []).filter((s: any) => !existing.has(s.id)))
        setShowDropdown(true)
      } catch { }
    }, 250)
  }

  // ★ addStar now explicitly triggers comparison
  const addStar = (s: SuperstarResult) => {
    if (selected.length >= 4 || selected.find(x => x.id === s.id)) return
    const newSelected = [...selected, s]
    setSelected(newSelected)
    setQuery(''); setResults([]); setShowDropdown(false)
    inputRef.current?.focus()
    fetchComparison(newSelected)
  }

  // ★ removeStar now explicitly triggers comparison (or clears)
  const removeStar = (id: number) => {
    const newSelected = selected.filter(s => s.id !== id)
    setSelected(newSelected)
    if (newSelected.length >= 2) {
      // Filter compared locally (instant), then re-fetch for fresh data
      setCompared(prev => prev.filter(s => s.id !== id))
    } else {
      setCompared([])
    }
    fetchComparison(newSelected)
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.search-zone')) setShowDropdown(false)
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] overflow-hidden">
        <Image src={HERO} alt="Superstar Comparator" fill priority sizes="100vw" quality={100} className="object-cover object-center lg:object-[50%_25%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <Link href="/superstars" className="text-[10px] text-text-secondary uppercase tracking-widest mb-2 hover:text-neon-blue transition-colors">← Superstars</Link>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">Superstar <span className="text-neon-blue">Comparator</span></h1>
          <p className="text-text-secondary text-sm sm:text-base text-center max-w-2xl">Select 2 to 4 superstars and compare their careers side by side.</p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        {/* Selection bar */}
        <div className="p-5 rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 backdrop-blur-sm mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {selected.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-bg-secondary/40" style={{ borderColor: `${COLORS[i]}40` }}>
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 bg-bg-tertiary" style={{ borderColor: COLORS[i] }}>
                  {s.photo_url ? <Image src={s.photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">👤</div>}
                </div>
                <span className="text-sm text-text-white font-medium">{s.name}</span>
                <button onClick={() => removeStar(s.id)} className="text-text-secondary hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            {selected.length < 4 && (
              <div className="relative flex-1 min-w-[200px] search-zone">
                <input ref={inputRef} type="text" value={query}
                  onChange={e => doSearch(e.target.value)}
                  onFocus={() => { if (results.length > 0) setShowDropdown(true) }}
                  placeholder={selected.length === 0 ? 'Search first superstar…' : `Add superstar (${4 - selected.length} remaining)…`}
                  className="w-full px-4 py-2.5 rounded-xl bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50" />
                {showDropdown && results.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 rounded-xl border border-border-subtle/40 bg-bg-secondary/95 backdrop-blur-md shadow-xl max-h-64 overflow-y-auto search-zone">
                    {results.map(s => (
                      <button key={s.id} onClick={() => addStar(s)} className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-bg-tertiary/50 transition-colors text-left">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-border-subtle/30 bg-bg-tertiary shrink-0">
                          {s.photo_url ? <Image src={s.photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">👤</div>}
                        </div>
                        <span className="text-sm text-text-white">{s.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-[10px] text-text-secondary">
            {selected.length === 0 ? 'Start typing to search and add superstars' : selected.length === 1 ? 'Add at least one more superstar to compare' : `Comparing ${selected.length} superstars — ${STAT_ROWS.length} stats`}
          </p>
        </div>

        {/* Comparison table */}
        {loading ? (
          <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-bg-secondary/30 animate-pulse" />)}</div>
        ) : error ? (
          /* ★ Error state with retry + debug info */
          <div className="text-center py-16">
            <span className="text-4xl block mb-3">⚠️</span>
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <p className="text-text-secondary/60 text-xs mb-2">
              Try opening this URL directly to test the API:
            </p>
            <a
              href={`/api/superstar-compare?ids=${selected.map(s => s.id).join(',')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-blue text-xs underline mb-4 block font-mono"
            >
              /api/superstar-compare?ids={selected.map(s => s.id).join(',')}
            </a>
            <button
              onClick={() => fetchComparison(selected)}
              className="px-5 py-2 rounded-xl bg-neon-blue/15 border border-neon-blue/30 text-neon-blue text-sm font-medium hover:bg-neon-blue/25 transition-all"
            >
              Retry comparison
            </button>
          </div>
        ) : compared.length >= 2 ? (
          <div className="rounded-2xl border border-border-subtle/20 overflow-x-auto">
            {/* Header row */}
            <div className="grid gap-0 min-w-[600px]" style={{ gridTemplateColumns: `160px repeat(${compared.length}, 1fr)` }}>
              <div className="p-4 bg-bg-secondary/30 border-b border-r border-border-subtle/20" />
              {compared.map((s, i) => (
                <Link key={s.id} href={`/superstars/${s.slug}`} className="group p-4 bg-bg-secondary/30 border-b border-r border-border-subtle/20 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 shrink-0" style={{ borderColor: COLORS[i] }}>
                    {s.photo_url ? <Image src={s.photo_url} alt="" width={80} height={80} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary flex items-center justify-center text-2xl">👤</div>}
                  </div>
                  <span className="text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors text-center">{s.name}</span>
                  {s.current_brand && <span className="text-[9px] px-2 py-0.5 rounded-full bg-bg-tertiary border border-border-subtle/20 text-text-secondary">{s.current_brand}</span>}
                  <span className="text-[10px] text-text-secondary capitalize">{s.status}</span>
                </Link>
              ))}
            </div>

            {/* Stat rows */}
            {STAT_ROWS.map((row, ri) => {
              const vals = compared.map(s => typeof s[row.key] === 'number' ? s[row.key] as number : 0)
              const maxVal = Math.max(...vals.filter(v => v > 0))

              return (
                <div key={row.key} className="grid gap-0 min-w-[600px]" style={{ gridTemplateColumns: `160px repeat(${compared.length}, 1fr)` }}>
                  <div className={`px-4 py-3 border-b border-r border-border-subtle/10 flex items-center ${ri % 2 === 0 ? 'bg-bg-secondary/10' : ''}`}>
                    <span className="text-xs text-text-secondary font-medium">{row.label}</span>
                  </div>
                  {compared.map((s, i) => {
                    const rawVal = s[row.key]
                    const numVal = typeof rawVal === 'number' ? rawVal : 0
                    const isMax = row.higher !== undefined && numVal > 0 && numVal === maxVal && vals.filter(v => v === maxVal).length === 1
                    const barPct = maxVal > 0 ? (numVal / maxVal) * 100 : 0
                    const display = row.format ? row.format(rawVal) : (typeof rawVal === 'number' ? rawVal.toLocaleString() : rawVal || '—')

                    return (
                      <div key={s.id} className={`px-4 py-3 border-b border-r border-border-subtle/10 ${ri % 2 === 0 ? 'bg-bg-secondary/10' : ''}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-bold font-mono ${isMax ? 'text-neon-blue' : 'text-text-white'}`}>{display}</span>
                          {isMax && row.higher && <span className="text-[8px] px-1 py-0.5 rounded bg-neon-blue/15 text-neon-blue font-bold">BEST</span>}
                        </div>
                        {typeof rawVal === 'number' && maxVal > 0 && (
                          <div className="w-full h-1.5 rounded-full bg-bg-tertiary/50 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${barPct}%`, backgroundColor: COLORS[i] }} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ) : selected.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4 opacity-20">⚖️</span>
            <p className="text-text-secondary text-lg mb-2">No superstars selected</p>
            <p className="text-text-secondary/60 text-sm">Start typing above to search and add superstars to compare.</p>
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="text-4xl block mb-3 opacity-30">⚖️</span>
            <p className="text-text-secondary">Select at least one more superstar to compare.</p>
          </div>
        )}
      </section>

      {/* SEO */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">About the <span className="text-neon-blue">Superstar Comparator</span></h2>
          <p className="text-text-secondary text-sm leading-relaxed">Compare up to 4 WWE superstars side by side across 17 key statistics. Win rates, championship reigns, career length, physical attributes, awards — all computed from our database of 100,000+ matches.</p>
        </div>
      </section>
    </div>
  )
}
