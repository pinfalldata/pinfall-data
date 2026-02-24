'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Show {
  id: number
  name: string
  slug: string
  date: string
  show_series: { id: number; name: string; short_name: string | null; logo_url: string | null } | null
}

interface ShowSeries {
  id: number
  name: string
  short_name: string | null
  logo_url: string | null
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function ShowCalendar() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [shows, setShows] = useState<Show[]>([])
  const [allSeries, setAllSeries] = useState<ShowSeries[]>([])
  const [selectedSeries, setSelectedSeries] = useState<Set<number>>(new Set()) // empty = all
  const [loading, setLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)

  const fetchShows = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      year: String(year),
      month: String(month),
    })
    if (selectedSeries.size > 0) {
      params.set('showSeriesIds', Array.from(selectedSeries).join(','))
    }
    try {
      const res = await fetch(`/api/calendar-shows?${params}`)
      const data = await res.json()
      setShows(data.shows || [])
      if (data.showSeries && allSeries.length === 0) {
        setAllSeries(data.showSeries)
      }
    } catch {
      setShows([])
    }
    setLoading(false)
  }, [year, month, selectedSeries])

  useEffect(() => { fetchShows() }, [fetchShows])

  // Calendar grid
  const { daysInMonth, startDayOfWeek } = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    let dow = firstDay.getDay()
    dow = dow === 0 ? 6 : dow - 1 // Monday = 0
    return { daysInMonth: lastDay.getDate(), startDayOfWeek: dow }
  }, [year, month])

  // Group shows by day
  const showsByDay = useMemo(() => {
    const map = new Map<number, Show[]>()
    shows.forEach(s => {
      const day = parseInt(s.date.split('-')[2])
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(s)
    })
    return map
  }, [shows])

  const navigate = (dir: -1 | 1) => {
    let m = month + dir
    let y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    setMonth(m)
    setYear(y)
  }

  const toggleSeries = (id: number) => {
    setSelectedSeries(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Year presets
  const yearOptions = Array.from({ length: new Date().getFullYear() - 1953 + 1 }, (_, i) => new Date().getFullYear() - i)

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
      <h2 className="font-display text-2xl lg:text-3xl font-bold text-text-white mb-6 text-center">
        <span className="text-neon-blue">Show</span> Calendar
      </h2>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>

          <select value={month} onChange={e => setMonth(parseInt(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-subtle/30 text-sm text-text-white font-medium appearance-none cursor-pointer focus:outline-none focus:border-neon-blue/40">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>

          <select value={year} onChange={e => setYear(parseInt(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-bg-secondary border border-border-subtle/30 text-sm text-text-white font-mono appearance-none cursor-pointer focus:outline-none focus:border-neon-blue/40">
            {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <button onClick={() => navigate(1)}
            className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <button onClick={() => setFilterOpen(!filterOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            filterOpen || selectedSeries.size > 0
              ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue'
              : 'bg-bg-secondary border-border-subtle/30 text-text-secondary hover:text-text-white'
          }`}>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
          Filter Shows
          {selectedSeries.size > 0 && (
            <span className="w-4 h-4 rounded-full bg-neon-blue text-[9px] text-black font-bold flex items-center justify-center">{selectedSeries.size}</span>
          )}
        </button>
      </div>

      {/* Series filter panel */}
      {filterOpen && allSeries.length > 0 && (
        <div className="mb-4 p-3 rounded-xl border border-border-subtle/30 bg-bg-secondary/30 flex flex-wrap gap-2 animate-fade-in">
          {selectedSeries.size > 0 && (
            <button onClick={() => setSelectedSeries(new Set())}
              className="text-[10px] text-neon-blue hover:underline px-2 py-1">
              Clear all
            </button>
          )}
          {allSeries.map(s => {
            const active = selectedSeries.has(s.id)
            return (
              <button key={s.id} onClick={() => toggleSeries(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                  active
                    ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue'
                    : 'bg-bg-tertiary/50 border-border-subtle/30 text-text-secondary hover:text-text-white hover:border-border-subtle/50'
                }`}>
                {s.logo_url && (
                  <div className="w-4 h-4 rounded overflow-hidden shrink-0">
                    <Image src={s.logo_url} alt="" width={16} height={16} className="w-full h-full object-contain" />
                  </div>
                )}
                {s.short_name || s.name}
              </button>
            )
          })}
        </div>
      )}

      {/* Calendar grid */}
      <div className={`rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 overflow-hidden transition-opacity duration-200 ${loading ? 'opacity-50' : ''}`}>
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border-subtle/20">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-[10px] text-text-secondary uppercase tracking-wider font-medium">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] border-b border-r border-border-subtle/10 bg-bg-primary/20" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dayShows = showsByDay.get(day) || []
            const isToday = year === now.getFullYear() && month === now.getMonth() + 1 && day === now.getDate()

            return (
              <div
                key={day}
                className={`relative min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] border-b border-r border-border-subtle/10 p-1 sm:p-1.5 ${
                  isToday ? 'bg-neon-blue/5' : 'hover:bg-bg-secondary/20'
                } transition-colors`}
              >
                {/* Day number */}
                <span className={`text-[10px] sm:text-xs font-mono ${
                  isToday ? 'text-neon-blue font-bold' : 'text-text-secondary'
                }`}>
                  {day}
                </span>

                {/* Shows */}
                <div className="mt-0.5 space-y-0.5 overflow-hidden">
                  {dayShows.slice(0, 3).map(show => (
                    <Link
                      key={show.id}
                      href={`/shows/${show.slug}`}
                      className="flex items-center gap-1 px-1 py-0.5 rounded bg-neon-blue/5 hover:bg-neon-blue/15 transition-colors group"
                    >
                      {show.show_series?.logo_url && (
                        <div className="w-3 h-3 rounded shrink-0 overflow-hidden">
                          <Image src={show.show_series.logo_url} alt="" width={12} height={12} className="w-full h-full object-contain" />
                        </div>
                      )}
                      <span className="text-[8px] sm:text-[9px] text-text-white truncate group-hover:text-neon-blue transition-colors">
                        {show.show_series?.short_name || show.name}
                      </span>
                    </Link>
                  ))}
                  {dayShows.length > 3 && (
                    <span className="text-[8px] text-text-secondary pl-1">+{dayShows.length - 3} more</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
