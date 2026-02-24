'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'
import { formatDateShort, getResultLabel, isBattleRoyalType } from '@/lib/utils'

// ============================================================
// TYPES
// ============================================================
interface MatchData {
  id: number
  slug: string
  date: string
  duration_seconds: number | null
  rating: number | null
  result_type: string | null
  is_title_change: boolean
  card_position: string | null
  is_dark_match: boolean
  match_type: { id: number; name: string; slug: string } | null
  championship: { id: number; name: string; slug: string; image_url: string | null } | null
  show: {
    id: number; name: string; slug: string; city: string | null; country: string | null
    show_series: { id: number; name: string; short_name: string | null; logo_url: string | null } | null
  } | null
  matchResult: 'win' | 'loss' | 'draw'
  teammates: { id: number; name: string; slug: string; photo_url: string | null }[]
  opponents: { id: number; name: string; slug: string; photo_url: string | null }[]
  managers: { id: number; name: string }[]
  participantCount: number
}

interface Filters {
  year: string
  month: string
  opponentId: string
  opponentName: string
  teammateId: string
  teammateName: string
  showSeriesId: string
  matchTypeId: string
  minRating: string
  country: string
  city: string
  championshipOnly: boolean
  result: string
  resultType: string
}

interface FilterOptions {
  matchTypes: { id: number; name: string; slug: string; match_count?: number }[]
  showSeries: { id: number; name: string; short_name: string | null; slug: string }[]
}

const MATCHES_PER_PAGE = 50

const defaultFilters: Filters = {
  year: '', month: '', opponentId: '', opponentName: '',
  teammateId: '', teammateName: '',
  showSeriesId: '', matchTypeId: '', minRating: '',
  country: '', city: '', championshipOnly: false, result: '', resultType: '',
}

// Fixed year range for the site
const SITE_START_YEAR = 1953
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - SITE_START_YEAR + 1 }, (_, i) => CURRENT_YEAR - i)

const RESULT_TYPE_OPTIONS = [
  { value: 'pinfall', label: 'Pinfall' },
  { value: 'submission', label: 'Submission' },
  { value: 'dq', label: 'Disqualification' },
  { value: 'count_out', label: 'Count Out' },
  { value: 'ko', label: 'Knockout' },
  { value: 'referee_stoppage', label: 'Referee Stoppage' },
  { value: 'escape', label: 'Escape' },
  { value: 'retrieve', label: 'Retrieve' },
  { value: 'last_elimination', label: 'Last Elimination' },
  { value: 'forfeit', label: 'Forfeit' },
  { value: 'no_contest', label: 'No Contest' },
  { value: 'time_limit_draw', label: 'Time Limit Draw' },
  { value: 'other', label: 'Other' },
]

// ============================================================
// MAIN COMPONENT
// ============================================================
export function TabMatches({ superstar }: { superstar: any }) {
  const [matches, setMatches] = useState<MatchData[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({ matchTypes: [], showSeries: [] })
  // Desktop/tablet: filters visible by default. Mobile: hidden
  const [showFilters, setShowFilters] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Detect mobile for initial filter state
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      setShowFilters(false)
    }
  }, [])

  // Fetch filter options once
  useEffect(() => {
    fetch('/api/match-filters')
      .then(r => r.json())
      .then(data => setFilterOptions(data))
      .catch(() => {})
  }, [])

  // Fetch matches
  const fetchMatches = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      superstarId: String(superstar.id),
      page: String(page),
      limit: String(MATCHES_PER_PAGE),
    })

    if (filters.year) params.set('year', filters.year)
    if (filters.year && filters.month) params.set('month', filters.month)
    if (filters.opponentId) params.set('opponentId', filters.opponentId)
    if (filters.teammateId) params.set('teammateId', filters.teammateId)
    if (filters.showSeriesId) params.set('showSeriesId', filters.showSeriesId)
    if (filters.matchTypeId) params.set('matchTypeId', filters.matchTypeId)
    if (filters.minRating) params.set('minRating', filters.minRating)
    if (filters.country) params.set('country', filters.country)
    if (filters.city) params.set('city', filters.city)
    if (filters.championshipOnly) params.set('championshipOnly', 'true')
    if (filters.result) params.set('result', filters.result)
    if (filters.resultType) params.set('resultType', filters.resultType)

    try {
      const res = await fetch(`/api/superstar-matches?${params.toString()}`)
      const data = await res.json()
      setMatches(data.matches || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 0)
    } catch {
      setMatches([])
      setTotal(0)
      setTotalPages(0)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [superstar.id, page, filters])

  useEffect(() => { fetchMatches() }, [fetchMatches])

  const updateFilter = (key: keyof Filters, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const resetFilters = () => { setFilters(defaultFilters); setPage(1) }

  const hasActiveFilters = Object.entries(filters).some(([, val]) => val !== '' && val !== false)

  const goToPage = (p: number) => {
    setPage(p)
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const activeFilterCount = Object.entries(filters).filter(([, val]) => val !== '' && val !== false).length

  return (
    <div ref={scrollRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="font-display text-lg font-bold text-text-white uppercase tracking-wider">
            Match History
          </h3>
          <p className="text-text-secondary text-sm mt-0.5">
            {loading && !initialLoad ? 'Searching...' : `${total} match${total !== 1 ? 'es' : ''} found`}
          </p>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters
              ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
              : 'bg-bg-secondary/50 border-border-subtle/30 text-text-secondary hover:text-text-white hover:border-border-subtle/60'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-neon-blue text-[10px] text-black font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* ============================================================ */}
      {/* FILTERS PANEL */}
      {/* ============================================================ */}
      {showFilters && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

            {/* Year */}
            <FilterSelect
              label="Year"
              value={filters.year}
              onChange={(v) => updateFilter('year', v)}
              options={YEARS.map(y => ({ value: String(y), label: String(y) }))}
              placeholder="All years"
            />

            {/* Month — only if year selected */}
            {filters.year && (
              <FilterSelect
                label="Month"
                value={filters.month}
                onChange={(v) => updateFilter('month', v)}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: String(i + 1),
                  label: new Date(2000, i).toLocaleString('en-US', { month: 'long' }),
                }))}
                placeholder="All months"
              />
            )}

            {/* Promotion — full name */}
            <FilterSelect
              label="Promotion"
              value={filters.showSeriesId}
              onChange={(v) => updateFilter('showSeriesId', v)}
              options={filterOptions.showSeries.map(s => ({
                value: String(s.id),
                label: s.name,
              }))}
              placeholder="All promotions"
            />

            {/* Match Type — sorted by most used */}
            <FilterSelect
              label="Match Type"
              value={filters.matchTypeId}
              onChange={(v) => updateFilter('matchTypeId', v)}
              options={filterOptions.matchTypes.map(t => ({
                value: String(t.id),
                label: t.name,
              }))}
              placeholder="All types"
            />

            {/* Min Rating — 0 to 10 */}
            <FilterSelect
              label="Min. Rating"
              value={filters.minRating}
              onChange={(v) => updateFilter('minRating', v)}
              options={Array.from({ length: 11 }, (_, i) => ({
                value: String(i),
                label: `${i}+/10`,
              }))}
              placeholder="Any rating"
            />

            {/* Result */}
            <FilterSelect
              label="Result"
              value={filters.result}
              onChange={(v) => updateFilter('result', v)}
              options={[
                { value: 'win', label: 'Wins' },
                { value: 'loss', label: 'Losses' },
                { value: 'draw', label: 'Draws / No Contest' },
              ]}
              placeholder="All results"
            />

            {/* Result Type (how) */}
            <FilterSelect
              label="Finish Type"
              value={filters.resultType}
              onChange={(v) => updateFilter('resultType', v)}
              options={RESULT_TYPE_OPTIONS}
              placeholder="Any finish"
            />

            {/* Country */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">Country</label>
              <input
                type="text"
                value={filters.country}
                onChange={(e) => updateFilter('country', e.target.value)}
                placeholder="e.g. United States"
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50 transition-colors"
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                placeholder="e.g. New York"
                className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50 transition-colors"
              />
            </div>

            {/* Opponent search */}
            <SuperstarSearch
              label="Opponent"
              placeholder="Search opponent..."
              value={filters.opponentName}
              onSelect={(id, name) => {
                updateFilter('opponentId', id)
                setFilters(prev => ({ ...prev, opponentName: name }))
              }}
              onClear={() => {
                updateFilter('opponentId', '')
                setFilters(prev => ({ ...prev, opponentName: '' }))
              }}
            />

            {/* Teammate search */}
            <SuperstarSearch
              label="Teammate"
              placeholder="Search teammate..."
              value={filters.teammateName}
              onSelect={(id, name) => {
                updateFilter('teammateId', id)
                setFilters(prev => ({ ...prev, teammateName: name }))
              }}
              onClear={() => {
                updateFilter('teammateId', '')
                setFilters(prev => ({ ...prev, teammateName: '' }))
              }}
            />
          </div>

          {/* Championship toggle + Reset */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border-subtle/20">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div
                className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${
                  filters.championshipOnly ? 'bg-yellow-500/40' : 'bg-bg-tertiary'
                }`}
                onClick={() => updateFilter('championshipOnly', !filters.championshipOnly)}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                    filters.championshipOnly ? 'translate-x-[18px] bg-yellow-400' : 'translate-x-[2px] bg-text-secondary'
                  }`}
                />
              </div>
              <span className="text-xs text-text-secondary group-hover:text-text-white transition-colors">
                🏆 Championship matches only
              </span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-neon-pink hover:text-neon-pink/80 transition-colors flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MATCH LIST */}
      {/* ============================================================ */}
      {initialLoad ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary text-lg">No matches found</p>
          {hasActiveFilters && (
            <button onClick={resetFilters} className="mt-3 text-sm text-neon-blue hover:underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table header */}
          <div className="hidden lg:grid lg:grid-cols-[95px_minmax(140px,1.2fr)_150px_minmax(200px,2.5fr)_110px_55px_56px] gap-3 px-4 pb-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20">
            <span>Date</span>
            <span>Show</span>
            <span>Type</span>
            <span>Match</span>
            <span>Title</span>
            <span className="text-center">Rating</span>
            <span className="text-center">Result</span>
          </div>

          {/* Loading overlay */}
          <div className={`space-y-0.5 mt-0.5 transition-opacity duration-200 ${loading && !initialLoad ? 'opacity-50' : 'opacity-100'}`}>
            {matches.map((match, idx) => (
              <MatchRow
                key={match.id}
                match={match}
                superstarId={superstar.id}
                index={idx}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} total={total} onPageChange={goToPage} />
          )}
        </>
      )}
    </div>
  )
}

// ============================================================
// MATCH ROW
// ============================================================
function MatchRow({ match, superstarId, index }: {
  match: MatchData; superstarId: number; index: number
}) {
  const isManyParticipants = match.participantCount > 10
  const isBR = isBattleRoyalType(match.match_type?.name || null)
  const showDetails = !isManyParticipants && !isBR

  const resultColor = match.matchResult === 'win'
    ? 'text-emerald-400' : match.matchResult === 'loss'
      ? 'text-red-400' : 'text-yellow-400'

  const resultBg = match.matchResult === 'win'
    ? 'bg-emerald-500/10 border-emerald-500/20' : match.matchResult === 'loss'
      ? 'bg-red-500/10 border-red-500/20' : 'bg-yellow-500/10 border-yellow-500/20'

  const resultLabel = match.matchResult === 'win' ? 'W' : match.matchResult === 'loss' ? 'L' : 'D'

  const hasTeammates = match.teammates.length > 0

  // Build "with X vs Y" string
  const teammateStr = hasTeammates
    ? match.teammates.map(t => t.name).join(', ')
    : ''
  const opponentStr = showDetails
    ? match.opponents.map(o => o.name).join(', ')
    : `${match.participantCount} participants`

  return (
    <Link href={`/shows/${match.show?.slug}/matches/${match.slug}`} className="block group">
      {/* ——— DESKTOP ——— */}
      <div className="hidden lg:grid lg:grid-cols-[95px_minmax(140px,1.2fr)_150px_minmax(200px,2.5fr)_110px_55px_56px] gap-3 items-center px-4 py-3 rounded-lg border border-transparent transition-all duration-150 hover:bg-bg-secondary/40 hover:border-border-subtle/20">
        {/* Date */}
        <span className="text-xs text-text-secondary font-mono whitespace-nowrap">
          {match.date ? formatDateShort(match.date) : '—'}
        </span>

        {/* Show */}
        <div className="flex items-center gap-2 min-w-0">
          {match.show?.show_series?.logo_url && (
            <div className="w-5 h-5 rounded overflow-hidden shrink-0">
              <Image src={match.show.show_series.logo_url} alt="" width={20} height={20} className="w-full h-full object-contain" />
            </div>
          )}
          <span className="text-sm text-text-white truncate">{match.show?.name || '—'}</span>
        </div>

        {/* Match Type */}
        <span className="text-xs text-neon-blue font-semibold truncate uppercase">
          {match.match_type?.name || 'Match'}
        </span>

        {/* Match details: with Teammate(s) vs Opponents */}
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {/* Teammates */}
          {hasTeammates && showDetails && (
            <>
              <span className="text-[11px] text-text-secondary italic shrink-0">w/</span>
              <div className="flex items-center gap-1 shrink-0">
                {match.teammates.slice(0, 2).map(t => (
                  <div key={t.id} className="flex items-center gap-0.5 shrink-0">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-bg-primary">
                      {t.photo_url ? (
                        <Image src={t.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" />
                      ) : <div className="w-full h-full bg-bg-tertiary" />}
                    </div>
                  </div>
                ))}
              </div>
              <span className="text-xs text-text-white truncate max-w-[120px] shrink-0">
                {match.teammates.map(t => t.name).join(', ')}
              </span>
            </>
          )}

          {/* VS */}
          <span className="text-[11px] text-neon-blue font-bold mx-1 shrink-0">vs</span>

          {/* Opponents */}
          {showDetails ? (
            <>
              <div className="flex -space-x-1.5 shrink-0">
                {match.opponents.slice(0, 3).map(o => (
                  <div key={o.id} className="w-6 h-6 rounded-full overflow-hidden border border-bg-primary">
                    {o.photo_url ? (
                      <Image src={o.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full bg-bg-tertiary" />}
                  </div>
                ))}
                {match.opponents.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-bg-tertiary border border-bg-primary flex items-center justify-center text-[8px] text-text-secondary">
                    +{match.opponents.length - 3}
                  </div>
                )}
              </div>
              <span className="text-xs text-text-white truncate ml-1">
                {opponentStr}
              </span>
            </>
          ) : (
            <span className="text-xs text-text-secondary italic truncate">{opponentStr}</span>
          )}
        </div>

        {/* Championship */}
        <div className="flex items-center gap-1.5 min-w-0">
          {match.championship ? (
            <>
              {match.championship.image_url && (
                <div className="w-7 h-5 shrink-0">
                  <Image src={match.championship.image_url} alt="" width={28} height={20} className="w-full h-full object-contain" />
                </div>
              )}
              <span className="text-[10px] text-yellow-400 font-medium truncate">{match.championship.name}</span>
            </>
          ) : (
            <span className="text-[10px] text-text-secondary/30">—</span>
          )}
        </div>

        {/* Rating */}
        <div className="flex justify-center">
          {match.rating ? <StarRating rating={match.rating} size="xs" /> : <span className="text-[10px] text-text-secondary/30">—</span>}
        </div>

        {/* Result */}
        <div className="flex justify-center">
          <span className={`text-xs font-bold px-2.5 py-1 rounded border ${resultBg} ${resultColor}`}>
            {resultLabel}
          </span>
        </div>
      </div>

      {/* ——— MOBILE / TABLET ——— */}
      <div className="lg:hidden flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent transition-all hover:bg-bg-secondary/40 hover:border-border-subtle/20">
        {/* Result badge */}
        <div className={`w-9 h-9 rounded-lg border ${resultBg} flex items-center justify-center shrink-0`}>
          <span className={`text-xs font-bold ${resultColor}`}>{resultLabel}</span>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Teammates + VS + Opponents */}
            <span className="text-sm text-text-white font-medium truncate">
              {hasTeammates && showDetails ? `w/ ${teammateStr} ` : ''}
              {showDetails ? `vs ${opponentStr}` : match.match_type?.name || 'Match'}
            </span>
            {match.championship && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold shrink-0">
                🏆
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] text-text-secondary truncate">{match.show?.name}</span>
            <span className="text-[10px] text-text-secondary/50">•</span>
            <span className="text-[10px] text-text-secondary font-mono">{match.date ? formatDateShort(match.date) : ''}</span>
          </div>
        </div>

        {/* Rating */}
        {match.rating ? (
          <div className="shrink-0"><StarRating rating={match.rating} size="xs" /></div>
        ) : null}

        {/* Arrow */}
        <svg className="w-4 h-4 text-text-secondary/30 group-hover:text-text-secondary group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  )
}

// ============================================================
// PAGINATION
// ============================================================
function Pagination({ page, totalPages, total, onPageChange }: {
  page: number; totalPages: number; total: number; onPageChange: (p: number) => void
}) {
  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('ellipsis')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
      if (page < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
      <p className="text-xs text-text-secondary">
        Page {page} of {totalPages} — {total} match{total !== 1 ? 'es' : ''} total
      </p>
      <div className="flex items-center gap-1">
        <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
          className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white hover:border-border-subtle/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        {getVisiblePages().map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span>
          ) : (
            <button key={p} onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                p === page ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue' : 'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'
              }`}>{p}</button>
          )
        )}
        <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages}
          className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white hover:border-border-subtle/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  )
}

// ============================================================
// FILTER SELECT
// ============================================================
function FilterSelect({ label, value, onChange, options, placeholder }: {
  label: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]; placeholder: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 8px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '16px',
          paddingRight: '32px',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

// ============================================================
// SUPERSTAR SEARCH (Autocomplete) — Reused for opponent & teammate
// ============================================================
function SuperstarSearch({ label, placeholder, value, onSelect, onClear }: {
  label: string; placeholder: string; value: string
  onSelect: (id: string, name: string) => void; onClear: () => void
}) {
  const [query, setQuery] = useState(value)
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (q: string) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); setOpen(false); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-superstars?q=${encodeURIComponent(q)}`)
        const data = await res.json()
        setResults(data.results || [])
        setOpen(true)
      } catch { setResults([]) }
    }, 300)
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-1 relative">
      <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-8 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white placeholder:text-text-secondary/50 focus:outline-none focus:border-neon-blue/50 transition-colors"
        />
        {value && (
          <button onClick={() => { onClear(); setQuery(''); setResults([]); setOpen(false) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-white">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border-subtle/40 rounded-xl overflow-hidden shadow-xl z-50 max-h-48 overflow-y-auto">
          {results.map((s: any) => (
            <button key={s.id}
              onClick={() => { onSelect(String(s.id), s.name); setQuery(s.name); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-white hover:bg-bg-tertiary transition-colors text-left">
              {s.photo_url && (
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0">
                  <Image src={s.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="min-w-0">
                <span className="truncate block">{s.name}</span>
                {s.matchedVia && (
                  <span className="text-[10px] text-text-secondary truncate block">aka "{s.matchedVia}"</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
