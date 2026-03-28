'use client'

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


/* ══════════════════════════════════════════════════
   SHARED DATA CONTEXT — single API call
   ══════════════════════════════════════════════════ */
const HomepageDataCtx = createContext<any>(null)

export function HomepageDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>(null)
  useEffect(() => {
    const now = new Date()
    const m = now.getMonth() + 1
    const d = now.getDate()
    fetch(`/api/homepage-data?month=${m}&day=${d}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d) })
      .catch(() => {})
  }, [])
  return <HomepageDataCtx.Provider value={data}>{children}</HomepageDataCtx.Provider>
}

function useHomepageData() { return useContext(HomepageDataCtx) }

/* ══════════════════════════════════════════════════
   INFINITE SCROLL HOOK (CSS translateX — works on mobile)
   ══════════════════════════════════════════════════ */
function useInfiniteScroll(speed: number = 0.5) {
  const containerRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const animRef = useRef<number | null>(null)
  const isPaused = useRef(false)
  const halfWidth = useRef(0)

  const measure = useCallback(() => {
    const el = containerRef.current
    if (el) halfWidth.current = el.scrollWidth / 2
  }, [])

  const animate = useCallback(() => {
    if (!isPaused.current && halfWidth.current > 0) {
      offsetRef.current += speed
      if (offsetRef.current >= halfWidth.current) offsetRef.current = 0
      const el = containerRef.current
      if (el) el.style.transform = `translateX(-${offsetRef.current}px)`
    }
    animRef.current = requestAnimationFrame(animate)
  }, [speed])

  const start = useCallback(() => { measure(); animRef.current = requestAnimationFrame(animate) }, [measure, animate])
  const stop = useCallback(() => { if (animRef.current) cancelAnimationFrame(animRef.current) }, [])
  const pause = useCallback(() => { isPaused.current = true }, [])
  const resume = useCallback(() => { isPaused.current = false }, [])
  const resumeDelayed = useCallback((ms = 2000) => { setTimeout(() => { isPaused.current = false }, ms) }, [])

  return { containerRef, start, stop, pause, resume, resumeDelayed }
}

/* ══════════════════════════════════════════════════
   WWE LOGOS CAROUSEL
   ══════════════════════════════════════════════════ */
export function WweLogosCarousel() {
  const t = useTranslations()
  const [logos, setLogos] = useState<any[]>([])
  const { containerRef, start, stop, pause, resume, resumeDelayed } = useInfiniteScroll(0.5)

  useEffect(() => { fetch('/api/wwe-logos').then(r => r.json()).then(d => setLogos(d.logos || [])).catch(() => {}) }, [])

  useEffect(() => {
    if (logos.length === 0) return
    const t = setTimeout(start, 150)
    return () => { clearTimeout(t); stop() }
  }, [logos, start, stop])

  if (logos.length === 0) return null
  const display = [...logos, ...logos]

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      <h2 className="font-display text-xl lg:text-2xl font-bold text-text-white mb-5">
        {t('home.sections.wweLogos')}
      </h2>
      <div className="overflow-hidden" onMouseEnter={pause} onMouseLeave={resume}
        onTouchStart={pause} onTouchEnd={() => resumeDelayed(2500)}>
        <div ref={containerRef} className="flex gap-6 will-change-transform" style={{ width: 'max-content' }}>
          {display.map((logo, i) => (
            <div key={`${logo.id}-${i}`} className="shrink-0 flex flex-col items-center gap-2 group cursor-default">
              <div className="w-32 h-24 sm:w-40 sm:h-28 rounded-xl border border-border-subtle/20 bg-bg-secondary/20 flex items-center justify-center p-4 group-hover:border-neon-blue/30 transition-all">
                <Image src={logo.image_url} alt={logo.name} width={140} height={100} className="max-w-full max-h-full object-contain" unoptimized />
              </div>
              <div className="text-center">
                <span className="text-[10px] text-text-secondary font-mono block">{logo.start_year}–{logo.end_year || t('common.now')}</span>
                {logo.name && <span className="text-[9px] text-text-secondary/60 block truncate max-w-[140px]">{logo.name}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   🎂 BORN TODAY
   ★ h-full to match On This Day height
   ★ No career matches count
   ★ Full birth date + bigger photo
   ══════════════════════════════════════════════════ */
function BirthdayBlock({ birthdays }: { birthdays: any[] }) {
  const t = useTranslations()
  const [idx, setIdx] = useState(0)
  if (!birthdays || birthdays.length === 0) return null
  const star = birthdays[idx]
  const today = new Date()
  const age = star.birth_year ? today.getFullYear() - star.birth_year : null
  const fullBirthDate = star.birth_date
    ? new Date(star.birth_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div className="rounded-2xl border border-neon-pink/20 bg-gradient-to-br from-neon-pink/5 via-bg-secondary/20 to-transparent overflow-hidden h-full flex flex-col justify-between">
      {/* Header */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-neon-pink flex items-center gap-1.5">
          <span className="text-base">🎂</span> {t('home.sections.bornToday')}
        </h3>
        {birthdays.length > 1 && (
          <span className="text-[10px] text-text-secondary font-mono">{idx + 1}/{birthdays.length}</span>
        )}
      </div>

      {/* Photo — centered, bigger */}
      <div className="px-4 pt-3 flex justify-center flex-1 items-center">
        <Link href={`/superstars/${star.slug}`} className="group">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-neon-pink/20 group-hover:border-neon-pink/50 transition-all shadow-lg">
            {star.photo_url ? (
              <Image src={star.photo_url} alt={star.name} width={128} height={128} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-bg-tertiary/30 flex items-center justify-center">
                <span className="text-4xl opacity-30">🎂</span>
              </div>
            )}
          </div>
        </Link>
      </div>

      {/* Info — centered below photo */}
      <div className="px-4 pt-2 pb-1 text-center">
        <Link href={`/superstars/${star.slug}`} className="text-sm font-bold text-text-white hover:text-neon-pink transition-colors inline-block">
          {star.name}
        </Link>
        {fullBirthDate && (
          <p className="text-xs text-text-secondary mt-1">
            <span className="text-neon-pink font-mono font-bold">{fullBirthDate}</span>
          </p>
        )}
        {age && (
          <p className="text-[11px] text-text-secondary/70 mt-0.5">{age} years old</p>
        )}
      </div>

      {/* Navigation arrows */}
      {birthdays.length > 1 && (
        <div className="px-4 py-3 flex items-center justify-center gap-2">
          <button onClick={() => setIdx(i => (i - 1 + birthdays.length) % birthdays.length)}
            className="w-7 h-7 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-pink hover:border-neon-pink/30 transition-all">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex gap-1">
            {birthdays.slice(0, 10).map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5 bg-neon-pink' : 'w-1.5 h-1.5 bg-border-subtle/50 hover:bg-text-secondary/40'}`} />
            ))}
          </div>
          <button onClick={() => setIdx(i => (i + 1) % birthdays.length)}
            className="w-7 h-7 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-pink hover:border-neon-pink/30 transition-all">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}

export function BirthdayStandalone() {
  const data = useHomepageData()
  if (!data || !data.birthdays || data.birthdays.length === 0) return <div />
  return <BirthdayBlock birthdays={data.birthdays} />
}

/* ══════════════════════════════════════════════════
   PARTICIPANTS VS — groups by team_number
   ══════════════════════════════════════════════════ */
function ParticipantsVs({ participants }: { participants: any[] }) {
  if (!participants || participants.length === 0) return null
  const teams: Record<number, any[]> = {}
  for (const p of participants) {
    const tn = p.team_number ?? 0
    if (!teams[tn]) teams[tn] = []
    teams[tn].push(p)
  }
  const teamKeys = Object.keys(teams).sort((a, b) => Number(a) - Number(b))

  if (teamKeys.length <= 1) {
    return (
      <div className="flex -space-x-2 shrink-0">
        {participants.slice(0, 6).map((p: any, i: number) => (
          <div key={i} className="w-8 h-8 rounded-full overflow-hidden border-2 border-bg-primary">
            {p.superstar?.photo_url ? <Image src={p.superstar.photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" unoptimized /> : <div className="w-full h-full bg-bg-tertiary" />}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 shrink-0 flex-wrap">
      {teamKeys.map((tk, tIdx) => (
        <div key={tk} className="flex items-center gap-1">
          {tIdx > 0 && <span className="text-[9px] font-bold text-neon-blue/70 mx-0.5">vs</span>}
          <div className="flex -space-x-1.5">
            {teams[Number(tk)].slice(0, 3).map((p: any, i: number) => (
              <div key={i} className="w-7 h-7 rounded-full overflow-hidden border-2 border-bg-primary">
                {p.superstar?.photo_url ? <Image src={p.superstar.photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" unoptimized /> : <div className="w-full h-full bg-bg-tertiary" />}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   RECENT MATCHES — with VS
   ══════════════════════════════════════════════════ */
function RecentMatchesBlock({ matches }: { matches: any[] }) {
  const t = useTranslations()
  if (!matches || matches.length === 0) return null
  return (
    <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden">
      <div className="px-5 pt-5"><h3 className="font-display text-base font-bold text-text-white flex items-center gap-2"><span className="text-neon-blue">🤼</span> {t('home.sections.latestMatches')}</h3></div>
      <div className="p-4 space-y-2">
        {matches.map((m: any) => {
          const href = m.show?.slug && m.slug ? `/shows/${m.show.slug}/matches/${m.slug}` : '#'
          return (
            <Link key={m.id} href={href} className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-tertiary/20 border border-border-subtle/15 hover:border-neon-blue/20 transition-all group">
              <ParticipantsVs participants={m.participants} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-white font-medium truncate group-hover:text-neon-blue transition-colors">{m.match_type?.name || 'Match'}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {m.show?.show_series?.logo_url && <div className="w-3.5 h-3.5 rounded overflow-hidden shrink-0"><Image src={m.show.show_series.logo_url} alt="" width={14} height={14} className="object-contain" unoptimized /></div>}
                  <span className="text-[10px] text-text-secondary truncate">{m.show?.name}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-text-secondary">{m.date ? new Date(m.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                {m.rating && <span className="block text-[10px] text-yellow-400 font-mono">{m.rating}★</span>}
              </div>
            </Link>
          )
        })}
      </div>
      <div className="px-5 pb-4"><Link href="/matches/search" className="text-xs text-neon-blue hover:text-neon-blue/80 font-medium">{t('home.sections.browseAllMatches')}</Link></div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   RECENT SEGMENTS
   ══════════════════════════════════════════════════ */
function RecentSegmentsBlock({ segments }: { segments: any[] }) {
  const t = useTranslations()
  if (!segments || segments.length === 0) return null
  return (
    <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden">
      <div className="px-5 pt-5"><h3 className="font-display text-base font-bold text-text-white flex items-center gap-2"><span className="text-neon-pink">🎤</span> {t('home.sections.latestSegments')}</h3></div>
      <div className="p-4 space-y-2">
        {segments.map((s: any) => {
          const href = s.show?.slug && s.slug ? `/shows/${s.show.slug}/segments/${s.slug}` : '#'
          const parts = (s.participants || []).slice(0, 4)
          return (
            <Link key={s.id} href={href} className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-tertiary/20 border border-border-subtle/15 hover:border-neon-pink/20 transition-all group">
              <div className="flex -space-x-2 shrink-0">
                {parts.map((p: any, i: number) => (
                  <div key={i} className="w-8 h-8 rounded-full overflow-hidden border-2 border-bg-primary">
                    {p.superstar?.photo_url ? <Image src={p.superstar.photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" unoptimized /> : <div className="w-full h-full bg-bg-tertiary" />}
                  </div>
                ))}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-white font-medium truncate group-hover:text-neon-pink transition-colors">{s.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {s.show?.show_series?.logo_url && <div className="w-3.5 h-3.5 rounded overflow-hidden shrink-0"><Image src={s.show.show_series.logo_url} alt="" width={14} height={14} className="object-contain" unoptimized /></div>}
                  <span className="text-[10px] text-text-secondary truncate">{s.show?.name}</span>
                </div>
              </div>
              <span className="text-[10px] text-text-secondary shrink-0">{s.show?.date ? new Date(s.show.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
            </Link>
          )
        })}
      </div>
      <div className="px-5 pb-4"><Link href="/matches/segments" className="text-xs text-neon-pink hover:text-neon-pink/80 font-medium">{t('home.sections.browseAllSegments')}</Link></div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   🏆 BELT CAROUSEL — 3:2 ratio, shimmer, translateX
   ══════════════════════════════════════════════════ */
function BeltCarousel({ championships }: { championships: any[] }) {
  const t = useTranslations()
  const { containerRef, start, stop, pause, resume, resumeDelayed } = useInfiniteScroll(0.4)

  useEffect(() => {
    if (championships.length === 0) return
    const t = setTimeout(start, 150)
    return () => { clearTimeout(t); stop() }
  }, [championships, start, stop])

  if (championships.length === 0) return null
  const display = [...championships, ...championships]

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
      <h2 className="font-display text-lg font-bold text-text-white mb-4 text-center">
        {t('home.sections.championshipTitles')}
      </h2>
      <div className="overflow-hidden" onMouseEnter={pause} onMouseLeave={resume}
        onTouchStart={pause} onTouchEnd={() => resumeDelayed(2500)}>
        <div ref={containerRef} className="flex gap-5 will-change-transform" style={{ width: 'max-content' }}>
          {display.map((c, i) => (
            <Link key={`belt-${c.id}-${i}`} href={`/champions/${c.slug}`} className="shrink-0 group" title={c.name}>
              <div className="relative w-36 h-24 sm:w-48 sm:h-32 rounded-xl border border-border-subtle/20 bg-bg-secondary/10 flex items-center justify-center px-4 py-3 group-hover:border-neon-blue/40 group-hover:bg-neon-blue/5 transition-all overflow-hidden">
                {c.image_url ? (
                  <Image src={c.image_url} alt={c.name} width={180} height={120} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" unoptimized />
                ) : (
                  <span className="text-3xl opacity-30">🏆</span>
                )}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0" style={{
                    background: 'linear-gradient(105deg, transparent 40%, rgba(199,160,90,0.08) 45%, rgba(199,160,90,0.18) 50%, rgba(199,160,90,0.08) 55%, transparent 60%)',
                    backgroundSize: '200% 100%',
                    animation: 'belt-shimmer 1.5s ease-in-out infinite',
                  }} />
                </div>
              </div>
              <p className="text-[9px] text-text-secondary/60 text-center mt-1.5 truncate max-w-[180px] group-hover:text-neon-blue/60 transition-colors">{c.name}</p>
            </Link>
          ))}
        </div>
      </div>
      <style jsx>{`@keyframes belt-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   MASTER: Sections 5-6
   ★ NO Spotlight Cards, NO HOF/Slammy
   ══════════════════════════════════════════════════ */
export function HomeExtraSections() {
  const data = useHomepageData()
  if (!data) return null

  return (
    <>
      {(data.recentMatches?.length > 0 || data.recentSegments?.length > 0) && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentMatchesBlock matches={data.recentMatches} />
            <RecentSegmentsBlock segments={data.recentSegments} />
          </div>
        </section>
      )}
      {data.championships?.length > 0 && <BeltCarousel championships={data.championships} />}
    </>
  )
}
