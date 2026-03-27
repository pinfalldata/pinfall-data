'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useTranslations } from 'next-intl'


/* ============================================================
   TYPES
   ============================================================ */
interface HistoryYear {
  id: number; year: number; title: string; summary: string | null
  cover_image_url: string | null; color_accent: string | null
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
   SCROLL REVEAL
   ============================================================ */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  )
}

function RevealScale({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-30px' })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.92 }} animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }} transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}>
      {children}
    </motion.div>
  )
}

function getYouTubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?#]+)/)
  return m ? m[1] : null
}

function getLabel(year: number) { return year === 1952 ? 'Pre-1953' : String(year) }

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function HistoryPageClient() {
  const t = useTranslations()

  const [years, setYears] = useState<HistoryYear[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number | null>(null)
  const [yearDetail, setYearDetail] = useState<YearDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const selectorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/history-timeline')
      .then(r => r.json())
      .then(d => setYears(d.years || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // Close selector on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) setSelectorOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const loadYear = useCallback(async (year: number) => {
    if (selectedYear === year) return
    setSelectedYear(year)
    setSelectorOpen(false)
    setDetailLoading(true)
    try {
      const r = await fetch(`/api/history-year?year=${year}`)
      const d = await r.json()
      setYearDetail(d)
    } catch { setYearDetail(null) }
    setDetailLoading(false)
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 150)
  }, [selectedYear])

  // Scroll active year into view
  useEffect(() => {
    if (selectedYear && timelineRef.current) {
      const btn = timelineRef.current.querySelector(`[data-year="${selectedYear}"]`) as HTMLElement
      if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [selectedYear])

  // Prev / Next helpers
  const currentIdx = years.findIndex(y => y.year === selectedYear)
  const prevYear = currentIdx > 0 ? years[currentIdx - 1] : null
  const nextYear = currentIdx >= 0 && currentIdx < years.length - 1 ? years[currentIdx + 1] : null

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ===== HERO ===== */}
      <section className="relative w-full h-[280px] sm:h-[380px] lg:h-[460px] overflow-hidden">
        <Image
          src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20History%20En%20tete/image__15__2026-03-16_22_26_56.926494.jpg.png"
          alt=t('history.title')
          fill priority sizes="100vw" quality={100} unoptimized
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-bg-primary/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-12 lg:pb-16 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-text-white text-center tracking-tight mb-4 sm:mb-5"
          >
            WWE <span className="text-neon-blue">History</span>
          </motion.h1>

          {/* Description — line by line */}
          <div className="text-center">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="text-text-secondary text-sm sm:text-base lg:text-lg">
              From the boxing clubs of Harlem to a global entertainment empire.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
              className="text-neon-blue/80 text-xs sm:text-sm lg:text-base font-medium mt-1 tracking-wide">
              Every year. Every revolution.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ===== PREMIUM TIMELINE STRIP — sticky, gold/silver shimmer ===== */}
      <section className="sticky top-0 z-40">
        {/* Background with subtle shimmer */}
        <div className="relative bg-[#07080c]/95 backdrop-blur-2xl border-b border-neon-blue/15 overflow-hidden">
          {/* Gold shimmer line at top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] neon-line-animated" />

          <div className="max-w-[1440px] mx-auto relative">
            <div
              ref={timelineRef}
              className="flex items-center overflow-x-auto scrollbar-hide py-3 sm:py-3.5 px-3 sm:px-6 gap-0.5 sm:gap-1"
              style={{ scrollBehavior: 'smooth' }}
            >
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="w-16 h-10 rounded-lg bg-bg-secondary/20 animate-pulse shrink-0" />
                ))
              ) : (
                years.map((y) => {
                  const isActive = selectedYear === y.year
                  return (
                    <button
                      key={y.id}
                      data-year={y.year}
                      onClick={() => loadYear(y.year)}
                      className={`relative shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg font-display font-bold tracking-wider transition-all duration-300 whitespace-nowrap ${
                        isActive
                          ? 'text-[#07080c] text-sm sm:text-base'
                          : 'text-text-secondary/50 text-xs sm:text-sm hover:text-neon-blue/80'
                      }`}
                      style={isActive ? {
                        background: 'linear-gradient(135deg, #e8d5a0 0%, #c7a05a 40%, #a07830 70%, #c7a05a 100%)',
                        boxShadow: '0 0 20px rgba(199, 160, 90, 0.3), 0 2px 8px rgba(0,0,0,0.4)',
                      } : undefined}
                    >
                      {getLabel(y.year)}

                      {/* Active indicator arrow */}
                      {isActive && (
                        <motion.div
                          layoutId="tl-arrow"
                          className="absolute -bottom-[11px] left-1/2 -translate-x-1/2"
                          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                        >
                          <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[7px] border-transparent" style={{ borderTopColor: '#c7a05a' }} />
                        </motion.div>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Fade edges for scroll hint */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#07080c] to-transparent pointer-events-none z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#07080c] to-transparent pointer-events-none z-10" />
          </div>

          {/* Silver shimmer line at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neon-pink/20 to-transparent" />
        </div>
      </section>

      {/* ===== YEAR CONTENT ===== */}
      <div ref={contentRef}>
        <AnimatePresence mode="wait">
          {selectedYear && (
            <motion.div key={selectedYear} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {detailLoading ? (
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-8">
                  <div className="h-16 w-48 rounded-xl bg-bg-secondary/30 animate-pulse" />
                  <div className="h-6 w-full max-w-xl rounded bg-bg-secondary/20 animate-pulse" />
                  <div className="h-80 rounded-2xl bg-bg-secondary/20 animate-pulse" />
                </div>
              ) : yearDetail?.year ? (
                <>
                  {/* YEAR HERO */}
                  <section className="relative py-16 sm:py-24 lg:py-32 overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[200px] opacity-[0.06] pointer-events-none bg-neon-blue" />
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
                      <Reveal>
                        <span className="font-display text-7xl sm:text-8xl lg:text-9xl font-bold text-neon-blue/15 select-none">
                          {getLabel(yearDetail.year.year)}
                        </span>
                      </Reveal>
                      <Reveal delay={0.1}>
                        <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-text-white -mt-6 sm:-mt-8 lg:-mt-10 relative z-10">
                          {yearDetail.year.title}
                        </h2>
                      </Reveal>
                      {yearDetail.year.summary && (
                        <Reveal delay={0.2}>
                          <p className="text-text-secondary text-base sm:text-lg leading-relaxed mt-6 max-w-2xl mx-auto">
                            {yearDetail.year.summary}
                          </p>
                        </Reveal>
                      )}
                      <Reveal delay={0.3}><div className="neon-line max-w-xs mx-auto mt-10" /></Reveal>
                    </div>
                  </section>

                  {/* CONTENT BLOCKS */}
                  {yearDetail.blocks.length > 0 && (
                    <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
                      <div className="space-y-16 sm:space-y-24">
                        {yearDetail.blocks.map((block, idx) => (
                          <BlockRenderer key={block.id} block={block} index={idx} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* EVENTS */}
                  {yearDetail.events && yearDetail.events.length > 0 && (
                    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
                      <Reveal>
                        <h3 className="font-display text-xl font-bold text-text-white mb-8 flex items-center gap-3">
                          <div className="w-1 h-6 rounded-full bg-neon-blue" />Key Events
                        </h3>
                      </Reveal>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {yearDetail.events.map((evt: any, i: number) => (
                          <Reveal key={evt.id} delay={i * 0.08}>
                            <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 backdrop-blur-sm overflow-hidden group">
                              {evt.image_url && (
                                <div className="relative h-36 overflow-hidden">
                                  <Image src={evt.image_url} alt={evt.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="400px" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 to-transparent" />
                                </div>
                              )}
                              <div className="p-5">
                                <h4 className="font-display text-sm font-bold text-text-white mb-1.5">{evt.title}</h4>
                                {evt.description_md && <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{evt.description_md}</p>}
                                {evt.date && <p className="text-[10px] text-neon-blue mt-2.5 font-mono">{new Date(evt.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>}
                              </div>
                            </div>
                          </Reveal>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* STATS AT BOTTOM */}
                  {yearDetail.stats && (yearDetail.stats.matches > 0 || yearDetail.stats.shows > 0) && (
                    <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-8">
                      <Reveal>
                        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
                          <h3 className="text-[10px] text-neon-blue uppercase tracking-widest font-bold mb-5">
                            {getLabel(yearDetail.year.year)} in Numbers
                          </h3>
                          <div className="flex flex-wrap items-center gap-8 sm:gap-12">
                            {yearDetail.stats.shows > 0 && <div><span className="block text-3xl sm:text-4xl font-bold text-text-white font-display">{yearDetail.stats.shows.toLocaleString()}</span><span className="text-xs text-text-secondary">{t('home.stats.shows')}</span></div>}
                            {yearDetail.stats.matches > 0 && <div><span className="block text-3xl sm:text-4xl font-bold text-text-white font-display">{yearDetail.stats.matches.toLocaleString()}</span><span className="text-xs text-text-secondary">{t('home.stats.matches')}</span></div>}
                            {yearDetail.stats.titleChanges > 0 && <div><span className="block text-3xl sm:text-4xl font-bold text-neon-blue font-display">{yearDetail.stats.titleChanges}</span><span className="text-xs text-text-secondary">{t('home.stats.titleChanges')}</span></div>}
                          </div>
                        </div>
                      </Reveal>
                    </section>
                  )}

                  {/* Empty state */}
                  {yearDetail.blocks.length === 0 && yearDetail.events.length === 0 && (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12">
                      <Reveal>
                        <div className="text-center py-20 rounded-2xl border border-border-subtle/15 bg-bg-secondary/5">
                          <span className="text-5xl opacity-15 block mb-4">📖</span>
                          <p className="text-text-secondary">Content for {getLabel(yearDetail.year.year)} is coming soon.</p>
                        </div>
                      </Reveal>
                    </div>
                  )}

                  {/* ===== PREV / NEXT NAVIGATION ===== */}
                  <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
                    <div className="neon-line mb-10" />
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      {/* PREV */}
                      {prevYear ? (
                        <button
                          onClick={() => loadYear(prevYear.year)}
                          className="group relative rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 overflow-hidden text-left transition-all duration-300 hover:border-neon-blue/25 hover:bg-bg-secondary/20"
                        >
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/0 to-transparent group-hover:via-neon-blue/40 transition-all duration-500" />
                          <div className="p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-2">
                              <svg className="w-4 h-4 text-text-secondary group-hover:text-neon-blue transition-colors group-hover:-translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              <span className="text-[10px] text-text-secondary uppercase tracking-wider">Previous</span>
                            </div>
                            <span className="font-display text-2xl sm:text-3xl font-bold text-neon-blue/80 group-hover:text-neon-blue transition-colors">
                              {getLabel(prevYear.year)}
                            </span>
                            <p className="text-xs sm:text-sm text-text-secondary mt-1 line-clamp-1 group-hover:text-text-white/70 transition-colors">
                              {prevYear.title}
                            </p>
                          </div>
                        </button>
                      ) : (
                        <div />
                      )}

                      {/* NEXT */}
                      {nextYear ? (
                        <button
                          onClick={() => loadYear(nextYear.year)}
                          className="group relative rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 overflow-hidden text-right transition-all duration-300 hover:border-neon-blue/25 hover:bg-bg-secondary/20"
                        >
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/0 to-transparent group-hover:via-neon-blue/40 transition-all duration-500" />
                          <div className="p-4 sm:p-6">
                            <div className="flex items-center justify-end gap-2 mb-2">
                              <span className="text-[10px] text-text-secondary uppercase tracking-wider">Next</span>
                              <svg className="w-4 h-4 text-text-secondary group-hover:text-neon-blue transition-colors group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                            <span className="font-display text-2xl sm:text-3xl font-bold text-neon-blue/80 group-hover:text-neon-blue transition-colors">
                              {getLabel(nextYear.year)}
                            </span>
                            <p className="text-xs sm:text-sm text-text-secondary mt-1 line-clamp-1 group-hover:text-text-white/70 transition-colors">
                              {nextYear.title}
                            </p>
                          </div>
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                  </section>
                </>
              ) : (
                <div className="text-center py-20"><p className="text-text-secondary">Year not found.</p></div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== EMPTY STATE — Before selection ===== */}
      {!selectedYear && !loading && years.length > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          {/* Year selector dropdown */}
          <Reveal>
            <div ref={selectorRef} className="relative inline-block mb-10">
              <button
                onClick={() => setSelectorOpen(!selectorOpen)}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl border border-neon-blue/25 bg-bg-secondary/30 backdrop-blur-sm text-sm font-medium text-text-white hover:border-neon-blue/40 hover:bg-bg-secondary/40 transition-all"
              >
                <svg className="w-4 h-4 text-neon-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Jump to a year
                <svg className={`w-4 h-4 text-text-secondary transition-transform ${selectorOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {selectorOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 max-h-72 overflow-y-auto rounded-xl border border-border-subtle/30 bg-[#0a0d14]/95 backdrop-blur-xl shadow-2xl shadow-black/50 z-50"
                  >
                    <div className="py-1">
                      {years.map(y => (
                        <button
                          key={y.id}
                          onClick={() => loadYear(y.year)}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-neon-blue/10 transition-colors flex items-center justify-between gap-2"
                        >
                          <span className="font-display font-bold text-text-white">{getLabel(y.year)}</span>
                          <span className="text-[10px] text-text-secondary truncate max-w-[120px]">{y.title}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <span className="text-6xl opacity-20 block mb-6">📜</span>
            </motion.div>
          </Reveal>
          <Reveal delay={0.2}>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-text-white mb-3">Choose a year to begin</h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Select any year from the timeline above — or use the selector — to explore the events and moments that defined each chapter of WWE history.
            </p>
          </Reveal>
        </section>
      )}

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            The Complete <span className="text-neon-blue">{t('history.title')}</span> Timeline
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Explore over 70 years of professional wrestling history — from the Capitol Wrestling Corporation in 1953
            to the Netflix era of today. Every pivotal moment documented with images, videos, and detailed narratives.
            The most comprehensive WWE timeline ever built, only on Pinfall Data.
          </p>
        </div>
      </section>
    </div>
  )
}

/* ============================================================
   BLOCK RENDERER
   ============================================================ */
function BlockRenderer({ block }: { block: ContentBlock; index: number }) {
  if (block.block_type === 'text') {
    return (
      <Reveal>
        <div className="max-w-3xl mx-auto">
          {block.title && <h3 className="font-display text-xl sm:text-2xl font-bold text-text-white mb-4">{block.title}</h3>}
          <div className="text-text-secondary text-sm sm:text-base leading-[1.85] whitespace-pre-line">{block.content_md}</div>
        </div>
      </Reveal>
    )
  }

  if (block.block_type === 'milestone') {
    return (
      <Reveal>
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-neon-blue via-neon-blue/60 to-neon-blue/20" />
          <div className="pl-6 sm:pl-8">
            <div className="rounded-2xl border border-neon-blue/10 bg-bg-secondary/20 backdrop-blur-sm overflow-hidden">
              {block.image_url && (
                <RevealScale delay={0.1}>
                  <div className="relative w-full h-48 sm:h-56 overflow-hidden group">
                    <Image src={block.image_url} alt={block.title || ''} fill className="object-cover group-hover:scale-[1.04] transition-transform duration-[1.2s] ease-out" sizes="800px" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/70 via-transparent to-transparent" />
                  </div>
                </RevealScale>
              )}
              <div className="p-5 sm:p-7">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-2 h-2 rounded-full bg-neon-blue shrink-0" />
                  <h3 className="font-display text-lg sm:text-xl font-bold text-neon-blue">{block.title}</h3>
                </div>
                <div className="text-text-secondary text-sm sm:text-base leading-[1.85] whitespace-pre-line">{block.content_md}</div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    )
  }

  if (block.block_type === 'image' && block.image_url) {
    return (
      <RevealScale>
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden group">
            <div className="relative w-full h-56 sm:h-72 lg:h-80">
              <Image src={block.image_url} alt={block.image_caption || ''} fill className="object-cover group-hover:scale-[1.03] transition-transform duration-[1.5s] ease-out" sizes="(max-width:768px) 100vw, 800px" />
            </div>
            <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.3)] pointer-events-none rounded-2xl" />
          </div>
          {block.image_caption && <p className="text-center text-xs text-text-secondary/50 mt-3 italic">{block.image_caption}</p>}
        </div>
      </RevealScale>
    )
  }

  if (block.block_type === 'video' && block.video_url) {
    const ytId = getYouTubeId(block.video_url)
    return (
      <Reveal>
        <div className="max-w-3xl mx-auto">
          {block.title && <h3 className="font-display text-base sm:text-lg font-bold text-text-white mb-4">{block.title}</h3>}
          <div className="relative rounded-2xl overflow-hidden border border-border-subtle/20" style={{ paddingBottom: '56.25%' }}>
            {ytId ? (
              <iframe src={`https://www.youtube.com/embed/${ytId}`} className="absolute inset-0 w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            ) : (
              <video src={block.video_url} controls className="absolute inset-0 w-full h-full object-cover" />
            )}
          </div>
        </div>
      </Reveal>
    )
  }

  if (block.block_type === 'quote') {
    return (
      <Reveal>
        <div className="max-w-2xl mx-auto py-4">
          <div className="relative text-center">
            <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl text-neon-blue/10 font-serif select-none leading-none">&ldquo;</span>
            <blockquote className="text-text-white text-base sm:text-lg lg:text-xl italic leading-relaxed font-body relative z-10 pt-4">{block.content_md}</blockquote>
            {block.title && <p className="text-neon-blue text-sm font-medium mt-4">— {block.title}</p>}
          </div>
        </div>
      </Reveal>
    )
  }

  if (block.block_type === 'gallery' && block.image_url) {
    let images: string[] = []
    try { images = JSON.parse(block.image_url) } catch { images = [block.image_url] }
    return (
      <Reveal>
        <div className="max-w-3xl mx-auto">
          {block.title && <h3 className="font-display text-base font-bold text-text-white mb-4">{block.title}</h3>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map((img, i) => (
              <RevealScale key={i} delay={i * 0.1}>
                <div className="relative rounded-xl overflow-hidden group aspect-video">
                  <Image src={img} alt="" fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="300px" />
                </div>
              </RevealScale>
            ))}
          </div>
        </div>
      </Reveal>
    )
  }

  return null
}
