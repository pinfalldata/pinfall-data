'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// ═══════════════════════════════════════════════
// WWE LOGOS CAROUSEL (like eras but with logos)
// ═══════════════════════════════════════════════
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
      el.scrollLeft += 0.4
      if (el.scrollLeft >= el.scrollWidth / 2) el.scrollLeft = 0
    }
    animRef.current = requestAnimationFrame(animate)
  }, [])

  useEffect(() => {
    if (logos.length === 0) return
    animRef.current = requestAnimationFrame(animate)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [logos, animate])

  if (logos.length === 0) return null
  const display = [...logos, ...logos]

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      <h2 className="font-display text-xl lg:text-2xl font-bold text-text-white mb-5 text-center">
        <span className="text-neon-blue">WWE</span> Through the Years
      </h2>
      <div ref={scrollRef} onMouseEnter={() => { isPaused.current = true }} onMouseLeave={() => { isPaused.current = false }}
        className="flex gap-6 overflow-x-auto scrollbar-hide py-2">
        {display.map((logo, i) => (
          <div key={`${logo.id}-${i}`} className="shrink-0 flex flex-col items-center gap-2 group cursor-default">
            <div className="w-28 h-20 sm:w-36 sm:h-24 rounded-xl border border-border-subtle/20 bg-bg-secondary/20 flex items-center justify-center p-3 group-hover:border-neon-blue/30 transition-all">
              <Image src={logo.image_url} alt={logo.name} width={120} height={80} className="max-w-full max-h-full object-contain" unoptimized />
            </div>
            <span className="text-[10px] text-text-secondary font-mono">{logo.start_year}–{logo.end_year || 'Now'}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════
// BIRTHDAY BLOCK — "Born on This Day"
// ═══════════════════════════════════════════════
export function BirthdayBlock({ birthdays }: { birthdays: any[] }) {
  const [idx, setIdx] = useState(0)
  if (!birthdays || birthdays.length === 0) return null

  const star = birthdays[idx]
  const today = new Date()
  const age = star.birth_year ? today.getFullYear() - star.birth_year : null

  return (
    <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden h-full">
      <div className="px-4 pt-4 pb-0 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-neon-pink flex items-center gap-1.5">
          <span>🎂</span> Born Today
        </h3>
        <span className="text-[10px] text-text-secondary font-mono">{idx + 1}/{birthdays.length}</span>
      </div>
      <div className="p-4 flex items-center gap-3">
        <Link href={`/superstars/${star.slug}`} className="shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden border border-border-subtle/30">
            {star.photo_url ? (
              <Image src={star.photo_url} alt={star.name} width={64} height={64} className="w-full h-full object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-bg-tertiary/30 flex items-center justify-center"><span className="text-2xl opacity-30">🎂</span></div>
            )}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/superstars/${star.slug}`} className="text-sm font-bold text-text-white hover:text-neon-blue transition-colors block truncate">{star.name}</Link>
          {star.birth_year && <p className="text-xs text-text-secondary">Born {star.birth_year}{age ? ` · ${age} years old` : ''}</p>}
        </div>
      </div>
      {birthdays.length > 1 && (
        <div className="px-4 pb-3 flex items-center justify-center gap-1.5">
          <button onClick={() => setIdx(i => (i - 1 + birthdays.length) % birthdays.length)} className="w-6 h-6 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue transition-all text-xs">‹</button>
          {birthdays.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-neon-pink w-3' : 'bg-border-subtle/50'}`} />
          ))}
          <button onClick={() => setIdx(i => (i + 1) % birthdays.length)} className="w-6 h-6 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue transition-all text-xs">›</button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════
// RECENT MATCHES BLOCK
// ═══════════════════════════════════════════════
export function RecentMatchesBlock({ matches }: { matches: any[] }) {
  if (!matches || matches.length === 0) return null
  return (
    <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden">
      <div className="px-5 pt-5 pb-0">
        <h3 className="font-display text-base font-bold text-text-white flex items-center gap-2"><span className="text-neon-blue">🤼</span> Latest Matches</h3>
      </div>
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
                {(m.participants || []).length > 6 && <div className="w-8 h-8 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[9px] text-text-secondary">+{(m.participants || []).length - 6}</div>}
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

// ═══════════════════════════════════════════════
// RECENT SEGMENTS BLOCK
// ═══════════════════════════════════════════════
export function RecentSegmentsBlock({ segments }: { segments: any[] }) {
  if (!segments || segments.length === 0) return null
  return (
    <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden">
      <div className="px-5 pt-5 pb-0">
        <h3 className="font-display text-base font-bold text-text-white flex items-center gap-2"><span className="text-neon-pink">🎤</span> Latest Segments</h3>
      </div>
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

// ═══════════════════════════════════════════════
// RANDOM SPOTLIGHT CARDS (arena, object, tag team, stable)
// ═══════════════════════════════════════════════
export function SpotlightCards({ arena, object, tagTeam, stable }: { arena: any; object: any; tagTeam: any; stable: any }) {
  const items = [
    arena && { ...arena, label: '🏟️ Arena', href: `/arenas/${arena.slug}`, img: arena.image_url, sub: [arena.city, arena.country].filter(Boolean).join(', ') },
    object && { ...object, label: '🪑 Object', href: `/matches/objects/${object.slug}`, img: object.image_url, sub: '' },
    tagTeam && { ...tagTeam, label: '🤝 Tag Team', href: `/tag-teams/teams/${tagTeam.slug}`, img: tagTeam.photo_url, sub: '' },
    stable && { ...stable, label: '🛡️ Stable', href: `/tag-teams/stables/${stable.slug}`, img: stable.photo_url, sub: '' },
  ].filter(Boolean)

  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item: any, i) => (
        <Link key={i} href={item.href} className="group rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden hover:border-neon-blue/30 transition-all">
          <div className="relative h-28 sm:h-32 bg-bg-tertiary/30 overflow-hidden">
            {item.img ? (
              <Image src={item.img} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><span className="text-3xl opacity-20">{item.label?.slice(0, 2)}</span></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/80 to-transparent" />
            <span className="absolute top-2 left-2 text-[8px] px-1.5 py-0.5 rounded bg-bg-primary/70 backdrop-blur-sm border border-border-subtle/30 text-text-secondary font-bold uppercase">{item.label}</span>
          </div>
          <div className="p-3">
            <p className="text-xs font-bold text-text-white group-hover:text-neon-blue transition-colors truncate">{item.name}</p>
            {item.sub && <p className="text-[10px] text-text-secondary mt-0.5 truncate">{item.sub}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════
// CHAMPIONSHIP BELT CAROUSEL
// ═══════════════════════════════════════════════
export function BeltCarousel({ championships }: { championships: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number | null>(null)
  const isPaused = useRef(false)

  const animate = useCallback(() => {
    const el = scrollRef.current
    if (el && !isPaused.current) {
      el.scrollLeft += 0.3
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
  const display = [...championships, ...championships]

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
      <div ref={scrollRef} onMouseEnter={() => { isPaused.current = true }} onMouseLeave={() => { isPaused.current = false }}
        className="flex gap-4 overflow-x-auto scrollbar-hide py-2">
        {display.map((c, i) => (
          <Link key={`${c.id}-${i}`} href={`/champions/${c.slug}`} className="shrink-0 group">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-border-subtle/20 bg-bg-secondary/10 flex items-center justify-center p-2 group-hover:border-neon-blue/40 group-hover:bg-neon-blue/5 transition-all">
              {c.image_url ? (
                <Image src={c.image_url} alt={c.name} width={80} height={80} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform" unoptimized />
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

// ═══════════════════════════════════════════════
// HOF + SLAMMY ROW
// ═══════════════════════════════════════════════
export function HofSlammyRow({ hofEntry, slammyAward }: { hofEntry: any; slammyAward: any }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {hofEntry && hofEntry.superstar && (
        <Link href={`/superstars/${hofEntry.superstar.slug}`} className="flex items-center gap-4 p-4 rounded-2xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent hover:border-yellow-500/30 transition-all group">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-yellow-500/30 shrink-0">
            {hofEntry.superstar.photo_url ? <Image src={hofEntry.superstar.photo_url} alt="" width={56} height={56} className="w-full h-full object-cover" unoptimized /> : <div className="w-full h-full bg-bg-tertiary flex items-center justify-center"><span className="text-xl">🏛️</span></div>}
          </div>
          <div>
            <span className="text-[9px] text-yellow-400 font-bold uppercase tracking-wider">🏛️ Hall of Fame · {hofEntry.year}</span>
            <p className="text-sm font-bold text-text-white group-hover:text-yellow-400 transition-colors">{hofEntry.superstar.name}</p>
            {hofEntry.wing && <span className="text-[10px] text-text-secondary">{hofEntry.wing}</span>}
          </div>
        </Link>
      )}
      {slammyAward && slammyAward.winner && (
        <Link href={`/superstars/${slammyAward.winner.slug}`} className="flex items-center gap-4 p-4 rounded-2xl border border-neon-blue/20 bg-gradient-to-r from-neon-blue/5 to-transparent hover:border-neon-blue/30 transition-all group">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-neon-blue/30 shrink-0">
            {slammyAward.winner.photo_url ? <Image src={slammyAward.winner.photo_url} alt="" width={56} height={56} className="w-full h-full object-cover" unoptimized /> : <div className="w-full h-full bg-bg-tertiary flex items-center justify-center"><span className="text-xl">🏆</span></div>}
          </div>
          <div>
            <span className="text-[9px] text-neon-blue font-bold uppercase tracking-wider">🏆 Slammy Award · {slammyAward.year}</span>
            <p className="text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors">{slammyAward.winner.name}</p>
            {slammyAward.category && <span className="text-[10px] text-text-secondary">{slammyAward.category}</span>}
          </div>
        </Link>
      )}
    </div>
  )
}

// Standalone birthday component for use alongside OnThisDay in page.tsx
export function BirthdayStandalone() {
  const [birthdays, setBirthdays] = useState<any[]>([])
  useEffect(() => {
    fetch('/api/homepage-data').then(r => r.json()).then(d => { if (!d.error && d.birthdays?.length > 0) setBirthdays(d.birthdays) }).catch(() => {})
  }, [])
  if (birthdays.length === 0) return null
  return <BirthdayBlock birthdays={birthdays} />
}

// ═══════════════════════════════════════════════
// MASTER WRAPPER — fetches data and renders all
// ═══════════════════════════════════════════════
export function HomeExtraSections() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/homepage-data').then(r => r.json()).then(d => { if (!d.error) setData(d) }).catch(() => {})
  }, [])

  if (!data) return null

  return (
    <>
      {/* ★ Row 1: Latest Matches + Latest Segments */}
      {(data.recentMatches?.length > 0 || data.recentSegments?.length > 0) && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentMatchesBlock matches={data.recentMatches} />
            <RecentSegmentsBlock segments={data.recentSegments} />
          </div>
        </section>
      )}

      {/* ★ Row 2: Championship belts carousel */}
      {data.championships?.length > 0 && (
        <BeltCarousel championships={data.championships} />
      )}

      {/* ★ Row 3: Arena + Object + Tag Team + Stable (4 cards) */}
      {(data.arena || data.object || data.tagTeam || data.stable) && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
          <SpotlightCards arena={data.arena} object={data.object} tagTeam={data.tagTeam} stable={data.stable} />
        </section>
      )}
    </>
  )
}

// Separate component for sections AFTER Hall of Legends
export function HomeAfterLegends() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    fetch('/api/homepage-data').then(r => r.json()).then(d => { if (!d.error) setData(d) }).catch(() => {})
  }, [])

  if (!data) return null

  return (
    <>
      {(data.hofEntry || data.slammyAward) && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 pb-8">
          <HofSlammyRow hofEntry={data.hofEntry} slammyAward={data.slammyAward} />
        </section>
      )}
    </>
  )
}
