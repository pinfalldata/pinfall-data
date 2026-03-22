'use client'

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react'
import Image from 'next/image'
import Link from 'next/link'

/* ══════════════════════════════════════════════════
   SHARED DATA CONTEXT — avoids duplicate /api/homepage-data calls
   HomeExtraSections + HomeAfterLegends both used to call the same API independently.
   Now we fetch once and share via context.
   ══════════════════════════════════════════════════ */
const HomepageDataCtx = createContext<any>(null)

export function HomepageDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>(null)
  useEffect(() => {
    fetch('/api/homepage-data')
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d) })
      .catch(() => {})
  }, [])
  return <HomepageDataCtx.Provider value={data}>{children}</HomepageDataCtx.Provider>
}

function useHomepageData() {
  return useContext(HomepageDataCtx)
}

/* ══════════════════════════════════════════════════
   WWE LOGOS CAROUSEL — auto-scrolling like Eras
   ══════════════════════════════════════════════════ */
export function WweLogosCarousel() {
  const [logos, setLogos] = useState<any[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const isPaused = useRef(false)

  useEffect(() => {
    fetch('/api/wwe-logos').then(r => r.json()).then(d => setLogos(d.logos || [])).catch(() => {})
  }, [])

  const animate = useCallback(() => {
    const el = scrollRef.current
    if (el && !isPaused.current) {
      el.scrollLeft += 0.5
      if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0
    }
    animRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    if (logos.length === 0) return
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [logos, animate])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    isPaused.current = true
    scrollRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' })
    setTimeout(() => { isPaused.current = false }, 3000)
  }

  if (logos.length === 0) return null
  const display = [...logos, ...logos]

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-xl lg:text-2xl font-bold text-text-white">
          <span className="text-neon-blue">WWE</span> Through the Years
        </h2>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="w-9 h-9 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue hover:border-neon-blue/30 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => scroll('right')} className="w-9 h-9 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue hover:border-neon-blue/30 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div ref={scrollRef} onMouseEnter={() => { isPaused.current = true }} onMouseLeave={() => { isPaused.current = false }}
        onTouchStart={() => { isPaused.current = true }} onTouchEnd={() => { setTimeout(() => { isPaused.current = false }, 2000) }}
        className="flex gap-6 overflow-x-auto scrollbar-hide py-2">
        {display.map((logo, i) => (
          <div key={`${logo.id}-${i}`} className="shrink-0 flex flex-col items-center gap-2 group cursor-default">
            <div className="w-32 h-24 sm:w-40 sm:h-28 rounded-xl border border-border-subtle/20 bg-bg-secondary/20 flex items-center justify-center p-4 group-hover:border-neon-blue/30 transition-all">
              <Image src={logo.image_url} alt={logo.name} width={140} height={100} className="max-w-full max-h-full object-contain" unoptimized />
            </div>
            <div className="text-center">
              <span className="text-[10px] text-text-secondary font-mono block">{logo.start_year}–{logo.end_year || 'Now'}</span>
              {logo.name && <span className="text-[9px] text-text-secondary/60 block truncate max-w-[140px]">{logo.name}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   🎂 BORN TODAY — photo, name, birth year, arrows
   ══════════════════════════════════════════════════ */
function BirthdayBlock({ birthdays }: { birthdays: any[] }) {
  const [idx, setIdx] = useState(0)
  if (!birthdays || birthdays.length === 0) return null
  const star = birthdays[idx]
  const today = new Date()
  const age = star.birth_year ? today.getFullYear() - star.birth_year : null

  return (
    <div className="rounded-2xl border border-neon-pink/20 bg-gradient-to-br from-neon-pink/5 via-bg-secondary/20 to-transparent overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-neon-pink flex items-center gap-1.5">
          <span className="text-base">🎂</span> Born Today
        </h3>
        {birthdays.length > 1 && (
          <span className="text-[10px] text-text-secondary font-mono">{idx + 1}/{birthdays.length}</span>
        )}
      </div>

      {/* Main content */}
      <div className="p-4 flex items-center gap-4 flex-1">
        <Link href={`/superstars/${star.slug}`} className="shrink-0 group">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-neon-pink/20 group-hover:border-neon-pink/50 transition-all">
            {star.photo_url ? (
              <Image src={star.photo_url} alt={star.name} width={80} height={80} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-bg-tertiary/30 flex items-center justify-center">
                <span className="text-3xl opacity-30">🎂</span>
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/superstars/${star.slug}`} className="text-sm font-bold text-text-white hover:text-neon-pink transition-colors block truncate">
            {star.name}
          </Link>
          {star.birth_year && (
            <p className="text-xs text-text-secondary mt-1">
              Born <span className="text-neon-pink font-mono font-bold">{star.birth_year}</span>
              {age ? <span className="text-text-secondary/60"> · {age} years old</span> : ''}
            </p>
          )}
          {star.total_matches > 0 && (
            <p className="text-[10px] text-text-secondary/50 mt-0.5">{star.total_matches} career matches</p>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {birthdays.length > 1 && (
        <div className="px-4 pb-3 flex items-center justify-center gap-2">
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

/** Standalone Birthday component — fetches via shared context */
export function BirthdayStandalone() {
  const data = useHomepageData()
  if (!data || !data.birthdays || data.birthdays.length === 0) return <div />
  return <BirthdayBlock birthdays={data.birthdays} />
}

/* ══════════════════════════════════════════════════
   RECENT MATCHES
   ══════════════════════════════════════════════════ */
function RecentMatchesBlock({ matches }: { matches: any[] }) {
  if (!matches || matches.length === 0) return null
  return (
    <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden">
      <div className="px-5 pt-5"><h3 className="font-display text-base font-bold text-text-white flex items-center gap-2"><span className="text-neon-blue">🤼</span> Latest Matches</h3></div>
      <div className="p-4 space-y-2">
        {matches.map((m: any) => {
          const href = m.show?.slug && m.slug ? `/shows/${m.show.slug}/matches/${m.slug}` : '#'
          const parts = (m.participants || []).slice(0, 6)
          return (
            <Link key={m.id} href={href} className="flex items-center gap-3 p-2.5 rounded-xl bg-bg-tertiary/20 border border-border-subtle/15 hover:border-neon-blue/20 transition-all group">
              <div className="flex -space-x-2 shrink-0">
                {parts.map((p: any, i: number) => (
                  <div key={i} className="w-8 h-8 rounded-full overflow-hidden border-2 border-bg-primary">
                    {p.superstar?.photo_url ? <Image src={p.superstar.photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" unoptimized /> : <div className="w-full h-full bg-bg-tertiary" />}
                  </div>
                ))}
              </div>
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
      <div className="px-5 pb-4"><Link href="/matches/search" className="text-xs text-neon-blue hover:text-neon-blue/80 font-medium">Browse all matches →</Link></div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   RECENT SEGMENTS
   ══════════════════════════════════════════════════ */
function RecentSegmentsBlock({ segments }: { segments: any[] }) {
  if (!segments || segments.length === 0) return null
  return (
    <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden">
      <div className="px-5 pt-5"><h3 className="font-display text-base font-bold text-text-white flex items-center gap-2"><span className="text-neon-pink">🎤</span> Latest Segments</h3></div>
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
      <div className="px-5 pb-4"><Link href="/matches/segments" className="text-xs text-neon-pink hover:text-neon-pink/80 font-medium">Browse all segments →</Link></div>
    </div>
  )
}

/* ══════════════════════════════════════════════════
   🏆 CHAMPIONSHIP BELT CAROUSEL
   ★ FIX: Auto-scroll with requestAnimationFrame
   Pause on hover + touch. Duplicated array for infinite loop.
   ══════════════════════════════════════════════════ */
function BeltCarousel({ championships }: { championships: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const isPaused = useRef(false)

  const animate = useCallback(() => {
    const el = scrollRef.current
    if (el && !isPaused.current) {
      el.scrollLeft += 0.3
      // Reset to start when we've scrolled past the first copy
      if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0
    }
    animRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    if (championships.length === 0) return
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [championships, animate])

  if (championships.length === 0) return null
  // Duplicate for infinite scroll effect
  const display = [...championships, ...championships]

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
      <h2 className="font-display text-lg font-bold text-text-white mb-4 text-center">
        <span className="text-neon-blue">Championship</span> Titles
      </h2>
      <div ref={scrollRef}
        onMouseEnter={() => { isPaused.current = true }}
        onMouseLeave={() => { isPaused.current = false }}
        onTouchStart={() => { isPaused.current = true }}
        onTouchEnd={() => { setTimeout(() => { isPaused.current = false }, 2000) }}
        className="flex gap-6 overflow-x-auto scrollbar-hide py-3">
        {display.map((c, i) => (
          <Link key={`${c.id}-${i}`} href={`/champions/${c.slug}`} className="shrink-0 group" title={c.name}>
            <div className="w-32 h-16 sm:w-40 sm:h-20 rounded-xl border border-border-subtle/20 bg-bg-secondary/10 flex items-center justify-center px-3 py-2 group-hover:border-neon-blue/40 group-hover:bg-neon-blue/5 transition-all">
              {c.image_url ? (
                <Image src={c.image_url} alt={c.name} width={140} height={70} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-300" unoptimized />
              ) : (
                <span className="text-2xl opacity-30">🏆</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ══════════════════════════════════════════════════
   SPOTLIGHT CARDS — arena, object, tag team, stable
   ★ FIX: Reduced height with aspect-[16/9] + max-h
   ══════════════════════════════════════════════════ */
function SpotlightCards({ arena, object, tagTeam, stable }: { arena: any; object: any; tagTeam: any; stable: any }) {
  const items = [
    arena && { name: arena.name, label: '🏟️ Arena', href: `/arenas/${arena.slug}`, img: arena.image_url, sub: [arena.city, arena.country].filter(Boolean).join(', ') },
    object && { name: object.name, label: '🪑 Object', href: `/matches/objects/${object.slug}`, img: object.image_url, sub: '' },
    tagTeam && { name: tagTeam.name, label: '🤝 Tag Team', href: `/tag-teams/teams/${tagTeam.slug}`, img: tagTeam.photo_url, sub: '' },
    stable && { name: stable.name, label: '🛡️ Stable', href: `/tag-teams/stables/${stable.slug}`, img: stable.photo_url, sub: '' },
  ].filter(Boolean)

  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item: any, i) => (
        <Link key={i} href={item.href} className="group rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden hover:border-neon-blue/30 transition-all">
          {/* ★ FIX: aspect-[2/1] — wider, shorter cards */}
          <div className="relative aspect-[2/1] bg-bg-tertiary/30 overflow-hidden">
            {item.img ? (
              <Image src={item.img} alt={item.name} fill className="object-contain group-hover:scale-105 transition-transform duration-500" sizes="(max-width:1024px) 50vw, 25vw" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><span className="text-4xl opacity-15">{item.label?.slice(0, 2)}</span></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 via-transparent to-transparent" />
            <span className="absolute top-2 left-2 text-[8px] px-1.5 py-0.5 rounded bg-bg-primary/70 backdrop-blur-sm border border-border-subtle/30 text-text-secondary font-bold uppercase">{item.label}</span>
          </div>
          <div className="p-2.5">
            <p className="text-xs font-bold text-text-white group-hover:text-neon-blue transition-colors truncate">{item.name}</p>
            {item.sub && <p className="text-[10px] text-text-secondary mt-0.5 truncate">{item.sub}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   🏛️ HOF + 🏆 SLAMMY — random entries side by side
   ══════════════════════════════════════════════════ */
function HofSlammyRow({ hofEntry, slammyAward }: { hofEntry: any; slammyAward: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {hofEntry?.superstar && (
        <Link href={`/superstars/${hofEntry.superstar.slug}`}
          className="flex items-center gap-4 p-5 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent hover:border-yellow-500/30 transition-all group">
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-yellow-500/30 shrink-0">
            {hofEntry.superstar.photo_url ? (
              <Image src={hofEntry.superstar.photo_url} alt="" width={64} height={64} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-bg-tertiary flex items-center justify-center"><span className="text-2xl">🏛️</span></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] text-yellow-400 font-bold uppercase tracking-wider block">🏛️ Hall of Fame · {hofEntry.year}</span>
            <p className="text-base font-bold text-text-white group-hover:text-yellow-400 transition-colors mt-0.5 truncate">{hofEntry.superstar.name}</p>
            {hofEntry.wing && <span className="text-[11px] text-text-secondary">{hofEntry.wing}</span>}
          </div>
        </Link>
      )}
      {slammyAward?.winner && (
        <Link href={`/superstars/${slammyAward.winner.slug}`}
          className="flex items-center gap-4 p-5 rounded-2xl border border-neon-blue/20 bg-gradient-to-r from-neon-blue/5 to-transparent hover:border-neon-blue/30 transition-all group">
          <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-neon-blue/30 shrink-0">
            {slammyAward.winner.photo_url ? (
              <Image src={slammyAward.winner.photo_url} alt="" width={64} height={64} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-bg-tertiary flex items-center justify-center"><span className="text-2xl">🏆</span></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[9px] text-neon-blue font-bold uppercase tracking-wider block">🏆 Slammy Award · {slammyAward.year}</span>
            <p className="text-base font-bold text-text-white group-hover:text-neon-blue transition-colors mt-0.5 truncate">{slammyAward.winner.name}</p>
            {slammyAward.category && <span className="text-[11px] text-text-secondary">{slammyAward.category}</span>}
          </div>
        </Link>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════
   MASTER: Sections 5-6-7 (between OnThisDay and Calendar)
   Uses shared HomepageData context
   ══════════════════════════════════════════════════ */
export function HomeExtraSections() {
  const data = useHomepageData()
  if (!data) return null

  return (
    <>
      {/* 5. Latest Matches + Latest Segments */}
      {(data.recentMatches?.length > 0 || data.recentSegments?.length > 0) && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentMatchesBlock matches={data.recentMatches} />
            <RecentSegmentsBlock segments={data.recentSegments} />
          </div>
        </section>
      )}

      {/* 6. Championship Belt Carousel */}
      {data.championships?.length > 0 && <BeltCarousel championships={data.championships} />}

      {/* 7. Arena + Object + Tag Team + Stable */}
      {(data.arena || data.object || data.tagTeam || data.stable) && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
          <SpotlightCards arena={data.arena} object={data.object} tagTeam={data.tagTeam} stable={data.stable} />
        </section>
      )}
    </>
  )
}

/* ══════════════════════════════════════════════════
   Section 11: AFTER Hall of Legends — HOF + Slammy
   Uses shared HomepageData context (no double API call)
   ══════════════════════════════════════════════════ */
export function HomeAfterLegends() {
  const data = useHomepageData()
  if (!data) return null

  return (
    <>
      {(data.hofEntry || data.slammyAward) && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 pb-10">
          <HofSlammyRow hofEntry={data.hofEntry} slammyAward={data.slammyAward} />
        </section>
      )}
    </>
  )
}
