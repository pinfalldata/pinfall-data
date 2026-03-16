'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

/* ============================================================
   TYPES
   ============================================================ */
interface HistoryYear {
  id: number; year: number; title: string; summary: string | null
  cover_image_url: string | null; color_accent: string | null
  era: { id: number; name: string; slug: string; start_year: number; end_year: number | null; image_url: string | null } | null
}

interface Era {
  id: number; name: string; slug: string; start_year: number; end_year: number | null; image_url: string | null
}

interface ContentBlock {
  id: number; sort_order: number; block_type: string
  title: string | null; content_md: string | null
  image_url: string | null; image_caption: string | null; video_url: string | null
}

interface YearDetail {
  year: HistoryYear; blocks: ContentBlock[]
  events: any[]; stats: { matches: number; shows: number; titleChanges: number }
}

/* ============================================================
   HELPERS
   ============================================================ */
function getYouTubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/)
  return m ? m[1] : null
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function HistoryPageClient() {
  const [years, setYears] = useState<HistoryYear[]>([])
  const [eras, setEras] = useState<Era[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [yearDetail, setYearDetail] = useState<YearDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const timelineRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Load timeline data
  useEffect(() => {
    fetch('/api/history-timeline')
      .then(r => r.json())
      .then(d => { setYears(d.years || []); setEras(d.eras || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Load year detail
  const loadYear = useCallback(async (year: number) => {
    if (selectedYear === year) { setSelectedYear(null); setYearDetail(null); return }
    setSelectedYear(year)
    setDetailLoading(true)
    try {
      const r = await fetch(`/api/history-year?year=${year}`)
      const d = await r.json()
      setYearDetail(d)
    } catch { setYearDetail(null) }
    setDetailLoading(false)
    // Scroll to content on mobile
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, [selectedYear])

  // Group years by era
  const getEraForYear = (year: number) => {
    return eras.find(e => year >= e.start_year && (!e.end_year || year <= e.end_year))
  }

  // Get era color
  const getEraColor = (era: Era | undefined) => {
    if (!era) return 'rgba(199, 160, 90, 0.5)'
    const colors: Record<string, string> = {
      'golden': '#c7a05a', 'new-generation': '#c0c0c0', 'attitude': '#ef4444',
      'ruthless-aggression': '#3b82f6', 'pg': '#22c55e', 'reality': '#8b5cf6',
      'new': '#f59e0b', 'netflix': '#e50914',
    }
    return colors[era.slug] || '#c7a05a'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-20">
          <div className="space-y-6">
            <div className="h-12 w-64 mx-auto rounded-xl bg-bg-secondary/30 animate-pulse" />
            <div className="h-4 w-96 mx-auto rounded bg-bg-secondary/20 animate-pulse" />
            <div className="h-[400px] rounded-2xl bg-bg-secondary/20 animate-pulse mt-12" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary overflow-hidden">

      {/* ===== HERO ===== */}
      <section className="relative w-full h-[260px] sm:h-[340px] lg:h-[420px] overflow-hidden">
        {/* Animated background with grid */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-bg-primary to-zinc-900" />
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        {/* Central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[180px] opacity-10 pointer-events-none bg-neon-blue" />
        {/* Animated gold line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        {/* Floating year numbers decorative */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {[1953, 1972, 1985, 1997, 2001, 2014, 2024].map((y, i) => (
            <motion.span
              key={y}
              className="absolute font-display text-neon-blue/[0.04] font-bold"
              style={{
                fontSize: `${60 + i * 15}px`,
                left: `${5 + i * 13}%`,
                top: `${10 + (i % 3) * 25}%`,
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
            >
              {y}
            </motion.span>
          ))}
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-10 lg:pb-14 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-text-white text-center tracking-tight mb-3"
          >
            WWE <span className="text-neon-blue">History</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl"
          >
            From 1953 to today — every era, every revolution, every moment that shaped sports entertainment.
          </motion.p>
        </div>
      </section>

      {/* ===== ERA LEGEND ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {eras.map(era => (
            <div key={era.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-bg-secondary/30 border border-border-subtle/20">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getEraColor(era) }} />
              <span className="text-[10px] sm:text-xs text-text-secondary whitespace-nowrap">{era.name}</span>
              <span className="text-[9px] text-text-secondary/50">{era.start_year}–{era.end_year || 'now'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TIMELINE — HORIZONTAL ON DESKTOP, VERTICAL ON MOBILE ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* HORIZONTAL SCROLLABLE TIMELINE (sm+) */}
        <div ref={timelineRef} className="hidden sm:block relative">
          <div className="overflow-x-auto scrollbar-hide pb-4">
            <div className="relative" style={{ minWidth: `${Math.max(years.length * 90, 800)}px` }}>
              {/* Main timeline line */}
              <div className="absolute top-[28px] left-0 right-0 h-[2px] bg-gradient-to-r from-neon-blue/20 via-neon-blue/40 to-neon-blue/20" />

              {/* Year nodes */}
              <div className="flex items-start">
                {years.map((y, idx) => {
                  const era = getEraForYear(y.year)
                  const eraColor = getEraColor(era)
                  const isSelected = selectedYear === y.year
                  const isFirstOfEra = idx === 0 || getEraForYear(years[idx - 1]?.year)?.id !== era?.id

                  return (
                    <div key={y.id} className="flex flex-col items-center relative" style={{ minWidth: '80px', flex: '0 0 auto' }}>
                      {/* Era label */}
                      {isFirstOfEra && era && (
                        <div className="absolute -top-6 left-0 whitespace-nowrap">
                          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: eraColor }}>{era.name}</span>
                        </div>
                      )}

                      {/* Dot */}
                      <button
                        onClick={() => loadYear(y.year)}
                        className={`relative z-10 w-[18px] h-[18px] rounded-full border-[3px] transition-all duration-300 cursor-pointer hover:scale-125 ${
                          isSelected ? 'scale-150' : ''
                        }`}
                        style={{
                          borderColor: eraColor,
                          backgroundColor: isSelected ? eraColor : '#050507',
                          boxShadow: isSelected ? `0 0 15px ${eraColor}60, 0 0 30px ${eraColor}20` : 'none',
                        }}
                        title={`${y.year} — ${y.title}`}
                      />

                      {/* Year label */}
                      <span className={`mt-2 text-xs font-mono transition-all duration-300 ${
                        isSelected ? 'text-neon-blue font-bold text-sm' : 'text-text-secondary'
                      }`}>{y.year}</span>

                      {/* Title preview */}
                      <span className={`mt-0.5 text-[9px] text-center leading-tight max-w-[80px] transition-all duration-300 ${
                        isSelected ? 'text-text-white' : 'text-text-secondary/50'
                      }`}>{y.title.length > 30 ? y.title.slice(0, 28) + '…' : y.title}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* VERTICAL TIMELINE (mobile) */}
        <div className="sm:hidden">
          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-[14px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-neon-blue/30 via-neon-blue/20 to-neon-blue/10" />

            <div className="space-y-1">
              {years.map(y => {
                const era = getEraForYear(y.year)
                const eraColor = getEraColor(era)
                const isSelected = selectedYear === y.year

                return (
                  <button
                    key={y.id}
                    onClick={() => loadYear(y.year)}
                    className={`relative w-full text-left py-2.5 pr-3 pl-4 rounded-xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-bg-secondary/40 border border-neon-blue/20'
                        : 'border border-transparent hover:bg-bg-secondary/20'
                    }`}
                  >
                    {/* Dot on timeline */}
                    <div
                      className={`absolute left-[-22px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all ${isSelected ? 'scale-150' : ''}`}
                      style={{
                        borderColor: eraColor,
                        backgroundColor: isSelected ? eraColor : '#050507',
                        boxShadow: isSelected ? `0 0 10px ${eraColor}50` : 'none',
                      }}
                    />

                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-sm font-bold shrink-0 ${isSelected ? 'text-neon-blue' : 'text-text-secondary'}`}>{y.year}</span>
                      <span className={`text-xs truncate ${isSelected ? 'text-text-white' : 'text-text-secondary/70'}`}>{y.title}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== YEAR DETAIL PANEL ===== */}
      <div ref={contentRef}>
        <AnimatePresence mode="wait">
          {selectedYear && (
            <motion.section
              key={selectedYear}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-16"
            >
              {detailLoading ? (
                <div className="space-y-6 py-8">
                  <div className="h-12 w-80 rounded-xl bg-bg-secondary/30 animate-pulse" />
                  <div className="h-4 w-full max-w-2xl rounded bg-bg-secondary/20 animate-pulse" />
                  <div className="h-64 rounded-2xl bg-bg-secondary/20 animate-pulse" />
                </div>
              ) : yearDetail?.year ? (
                <div>
                  {/* Year header with glassmorphism */}
                  <div className="relative rounded-2xl overflow-hidden mb-8">
                    {/* Glass background */}
                    <div className="absolute inset-0 bg-bg-secondary/30 backdrop-blur-xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-blue/3" />
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/60 to-transparent" />

                    <div className="relative p-6 sm:p-8 lg:p-10">
                      <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-10">
                        {/* Cover image */}
                        {yearDetail.year.cover_image_url && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="relative w-full lg:w-80 h-48 sm:h-56 lg:h-52 rounded-xl overflow-hidden shrink-0 group"
                          >
                            <Image
                              src={yearDetail.year.cover_image_url}
                              alt={`${yearDetail.year.year}`}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-700"
                              sizes="(max-width: 1024px) 100vw, 320px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 to-transparent" />
                          </motion.div>
                        )}

                        {/* Year info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-3">
                            <motion.span
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-neon-blue/90"
                            >
                              {yearDetail.year.year}
                            </motion.span>
                            {yearDetail.year.era && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-neon-blue/10 border border-neon-blue/20 text-neon-blue">
                                {yearDetail.year.era.name}
                              </span>
                            )}
                          </div>

                          <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-text-white mb-3"
                          >
                            {yearDetail.year.title}
                          </motion.h2>

                          {yearDetail.year.summary && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.2 }}
                              className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-2xl"
                            >
                              {yearDetail.year.summary}
                            </motion.p>
                          )}

                          {/* Year quick stats */}
                          {yearDetail.stats && (yearDetail.stats.matches > 0 || yearDetail.stats.shows > 0) && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                              className="flex items-center gap-4 sm:gap-6 mt-5 pt-4 border-t border-border-subtle/20"
                            >
                              {yearDetail.stats.shows > 0 && (
                                <div className="text-center">
                                  <span className="block text-lg sm:text-xl font-bold text-text-white font-display">{yearDetail.stats.shows.toLocaleString()}</span>
                                  <span className="text-[9px] text-text-secondary uppercase tracking-wider">Shows</span>
                                </div>
                              )}
                              {yearDetail.stats.matches > 0 && (
                                <div className="text-center">
                                  <span className="block text-lg sm:text-xl font-bold text-text-white font-display">{yearDetail.stats.matches.toLocaleString()}</span>
                                  <span className="text-[9px] text-text-secondary uppercase tracking-wider">Matches</span>
                                </div>
                              )}
                              {yearDetail.stats.titleChanges > 0 && (
                                <div className="text-center">
                                  <span className="block text-lg sm:text-xl font-bold text-neon-blue font-display">{yearDetail.stats.titleChanges}</span>
                                  <span className="text-[9px] text-text-secondary uppercase tracking-wider">Title Changes</span>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content blocks */}
                  {yearDetail.blocks.length > 0 && (
                    <div className="space-y-6">
                      {yearDetail.blocks.map((block, idx) => (
                        <ContentBlockCard key={block.id} block={block} index={idx} />
                      ))}
                    </div>
                  )}

                  {/* WWE History Events for this year */}
                  {yearDetail.events && yearDetail.events.length > 0 && (
                    <div className="mt-8">
                      <h3 className="font-display text-lg font-bold text-text-white mb-4 flex items-center gap-3">
                        <div className="w-1 h-5 rounded-full bg-neon-blue" />
                        Key Events of {yearDetail.year.year}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {yearDetail.events.map((evt: any, i: number) => (
                          <motion.div
                            key={evt.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            className="rounded-xl border border-border-subtle/20 bg-bg-secondary/20 backdrop-blur-sm overflow-hidden"
                          >
                            {evt.image_url && (
                              <div className="relative h-32 overflow-hidden group">
                                <Image src={evt.image_url} alt={evt.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="400px" />
                                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 to-transparent" />
                              </div>
                            )}
                            <div className="p-4">
                              <h4 className="font-display text-sm font-bold text-text-white mb-1">{evt.title}</h4>
                              {evt.description_md && <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{evt.description_md}</p>}
                              {evt.date && <p className="text-[10px] text-neon-blue mt-2 font-mono">{new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {yearDetail.blocks.length === 0 && yearDetail.events.length === 0 && (
                    <div className="text-center py-12 rounded-2xl border border-border-subtle/20 bg-bg-secondary/10">
                      <span className="text-4xl opacity-20 block mb-3">📖</span>
                      <p className="text-text-secondary text-sm">Content for {yearDetail.year.year} coming soon.</p>
                      <p className="text-text-secondary/50 text-xs mt-1">Check back later as we continue building the complete WWE history.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-text-secondary">Year not found in the database.</p>
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </div>

      {/* ===== PROMPT TO SELECT ===== */}
      {!selectedYear && years.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pb-20"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex flex-col items-center"
          >
            <span className="text-text-secondary/40 text-sm mb-2">Select a year to explore</span>
            <svg className="w-6 h-6 text-neon-blue/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </motion.div>
        </motion.div>
      )}

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            The Complete <span className="text-neon-blue">WWE History</span> Timeline
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Explore over 70 years of professional wrestling history — from the Capitol Wrestling Corporation in 1953
            to the Netflix era of today. Every era, every pivotal moment, every revolution documented with images,
            videos, and detailed narratives. The most comprehensive WWE timeline ever built, only on Pinfall Data.
          </p>
        </div>
      </section>
    </div>
  )
}

/* ============================================================
   CONTENT BLOCK — Renders different block types with animations
   ============================================================ */
function ContentBlockCard({ block, index }: { block: ContentBlock; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4 }}
    >
      {/* TEXT BLOCK */}
      {block.block_type === 'text' && (
        <div className="max-w-3xl">
          {block.title && <h3 className="font-display text-base sm:text-lg font-bold text-text-white mb-2">{block.title}</h3>}
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed whitespace-pre-line">{block.content_md}</p>
        </div>
      )}

      {/* MILESTONE BLOCK */}
      {block.block_type === 'milestone' && (
        <div className="relative rounded-2xl overflow-hidden border border-neon-blue/15">
          <div className="absolute inset-0 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-blue/3" />
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-neon-blue to-neon-blue/30" />
          <div className="relative p-5 sm:p-6 flex flex-col sm:flex-row gap-5">
            {block.image_url && (
              <div className="relative w-full sm:w-48 h-32 sm:h-auto rounded-xl overflow-hidden shrink-0 group">
                <Image src={block.image_url} alt={block.title || ''} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="200px" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded-full bg-neon-blue/15 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-neon-blue" />
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-neon-blue">{block.title}</h3>
              </div>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">{block.content_md}</p>
            </div>
          </div>
        </div>
      )}

      {/* IMAGE BLOCK */}
      {block.block_type === 'image' && block.image_url && (
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden group">
            <div className="relative w-full h-64 sm:h-80">
              <Image src={block.image_url} alt={block.image_caption || ''} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-700" sizes="700px" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {block.image_caption && (
            <p className="text-center text-xs text-text-secondary/60 mt-2 italic">{block.image_caption}</p>
          )}
        </div>
      )}

      {/* VIDEO BLOCK */}
      {block.block_type === 'video' && block.video_url && (
        <div className="max-w-2xl mx-auto">
          {block.title && <h3 className="font-display text-base font-bold text-text-white mb-3">{block.title}</h3>}
          <div className="relative rounded-2xl overflow-hidden border border-border-subtle/20" style={{ paddingBottom: '56.25%' }}>
            {getYouTubeId(block.video_url) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYouTubeId(block.video_url)}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={block.video_url} controls className="absolute inset-0 w-full h-full object-cover" />
            )}
          </div>
        </div>
      )}

      {/* QUOTE BLOCK */}
      {block.block_type === 'quote' && (
        <div className="max-w-2xl mx-auto text-center py-6">
          <div className="text-4xl text-neon-blue/20 mb-2 font-serif">&ldquo;</div>
          <blockquote className="text-text-white text-base sm:text-lg italic leading-relaxed font-body">
            {block.content_md}
          </blockquote>
          {block.title && (
            <p className="text-neon-blue text-sm font-medium mt-3">— {block.title}</p>
          )}
        </div>
      )}

      {/* GALLERY BLOCK */}
      {block.block_type === 'gallery' && block.image_url && (() => {
        let images: string[] = []
        try { images = JSON.parse(block.image_url) } catch { images = [block.image_url] }
        return (
          <div>
            {block.title && <h3 className="font-display text-base font-bold text-text-white mb-3">{block.title}</h3>}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden group aspect-video">
                  <Image src={img} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="300px" />
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </motion.div>
  )
}
