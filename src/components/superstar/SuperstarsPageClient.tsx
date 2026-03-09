'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SuperstarsWorldMap from './SuperstarsWorldMap'

/* ============================================================
   ROLE CATEGORIES
   ============================================================ */
const CATEGORIES = [
  {
    key: 'wrestler',
    label: 'Wrestlers',
    href: '/superstars/wrestlers',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/wrestler.webp',
    description: 'In-ring competitors across every era',
    icon: '💪',
  },
  {
    key: 'manager',
    label: 'Managers',
    href: '/superstars/managers',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/manager.webp',
    description: 'The masterminds behind the superstars',
    icon: '🎩',
  },
  {
    key: 'commentator',
    label: 'Commentators',
    href: '/superstars/commentators',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/commentator.webp',
    description: 'The voices of WWE programming',
    icon: '🎙️',
  },
  {
    key: 'ring_announcer',
    label: 'Ring Announcers',
    href: '/superstars/ring-announcers',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/Ring%20Announcer.webp',
    description: 'Introducing the competitors to the world',
    icon: '📢',
  },
  {
    key: 'referee',
    label: 'Referees',
    href: '/superstars/referees',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/referee.webp',
    description: 'Keepers of the rules inside the ring',
    icon: '🦓',
  },
  {
    key: 'interviewer',
    label: 'Interviewers',
    href: '/superstars/interviewers',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/Interviewer.webp',
    description: 'Getting the stories behind the action',
    icon: '🎤',
  },
  {
    key: 'general_manager',
    label: 'General Managers',
    href: '/superstars/general-managers',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/general%20manager.webp',
    description: 'The authority figures running the show',
    icon: '👔',
  },
  {
    key: 'executive',
    label: 'Executives',
    href: '/superstars/executives',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/Executives.webp',
    description: 'The power players behind the curtain',
    icon: '🏛️',
  },
]

/* ============================================================
   RANDOM SUPERSTAR TYPE
   ============================================================ */
interface RandomSuperstar {
  id: number
  name: string
  slug: string
  photo_url: string
  role: string | null
  status: string | null
  billed_from: string | null
  current_brand: string | null
  total_matches: number | null
  win_count: number | null
  loss_count: number | null
  total_reigns: number | null
  description: string
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function SuperstarsPageClient() {
  const [randomStar, setRandomStar] = useState<RandomSuperstar | null>(null)
  const [loadingStar, setLoadingStar] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadRandom = useCallback(async () => {
    setLoadingStar(true)
    try {
      // Cache-bust with timestamp to always get a fresh result
      const r = await fetch(`/api/random-superstar-detail?t=${Date.now()}`, { cache: 'no-store' })
      const d = await r.json()
      if (d.superstar) setRandomStar(d.superstar)
    } catch { /* ignore */ }
    finally { setLoadingStar(false); setHasLoaded(true) }
  }, [])

  const roleLabel = (role: string | null) => {
    if (!role) return 'Superstar'
    return role.charAt(0).toUpperCase() + role.slice(1).replace(/_/g, ' ')
  }

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ===== HERO IMAGE — same style as /matches ===== */}
      <section className="relative w-full h-[240px] sm:h-[320px] lg:h-[400px] xl:h-[440px] overflow-hidden">
        <Image
          src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/wwe-wrestlemania-38-WM38_Overall_Master_Frame_Final_2-copy.webp"
          alt="WWE Superstars"
          fill
          priority
          sizes="100vw"
          unoptimized
          quality={100}
          className="object-cover object-center"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        {/* Gold line bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />

        {/* Title overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 sm:pb-10 lg:pb-12 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            <span className="text-neon-blue">WWE</span> Superstars
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            Explore the full roster of every WWE personality — wrestlers, managers, commentators, referees, and more across every era.
          </p>
        </div>
      </section>

      {/* ===== CATEGORY BUTTONS GRID ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className="group relative overflow-hidden rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm transition-all duration-300 hover:border-neon-blue/40 hover:shadow-neon-blue hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* Gold accent line top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/0 to-transparent group-hover:via-neon-blue/60 transition-all duration-500 z-10" />

              <div className="flex items-center gap-4 p-4 sm:p-5">
                {/* Avatar image — square */}
                <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 border-border-subtle/30 group-hover:border-neon-blue/40 transition-all shrink-0 bg-bg-tertiary">
                  <Image
                    src={cat.image}
                    alt={cat.label}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 640px) 64px, (max-width: 1024px) 72px, 80px"
                    unoptimized
                  />
                  {/* Shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{cat.icon}</span>
                    <h3 className="font-display text-base sm:text-lg font-bold text-text-white group-hover:text-neon-blue transition-colors truncate">
                      {cat.label}
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-text-secondary leading-snug line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-tertiary/50 group-hover:bg-neon-blue/10 border border-border-subtle/20 group-hover:border-neon-blue/30 transition-all shrink-0">
                  <svg
                    className="w-4 h-4 text-text-secondary group-hover:text-neon-blue transition-all group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Bottom glow on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-neon-blue/0 to-transparent group-hover:from-neon-blue/5 transition-all duration-500" />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== NEON SEPARATOR ===== */}
      <div className="neon-line max-w-5xl mx-auto" />

      {/* ===== RANDOM SUPERSTAR SECTION ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-white mb-2">
            <span className="text-neon-blue">Random</span> Superstar
          </h2>
          <p className="text-text-secondary text-sm sm:text-base max-w-lg mx-auto">
            Discover a superstar at random. Click the button to explore someone new!
          </p>
        </div>

        {/* Random superstar card area */}
        <div className="max-w-xl mx-auto">
          {!hasLoaded ? (
            /* Initial state — invite to click */
            <div className="text-center py-8">
              <button
                onClick={loadRandom}
                disabled={loadingStar}
                className="inline-flex items-center gap-3 px-7 py-3.5 rounded-2xl border-2 border-neon-blue/40 bg-neon-blue/10 text-neon-blue font-display font-bold text-base sm:text-lg hover:bg-neon-blue/20 hover:border-neon-blue/60 hover:shadow-neon-blue transition-all active:scale-95 disabled:opacity-60"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loadingStar ? 'Loading…' : 'Roll the Dice!'}
              </button>
            </div>
          ) : loadingStar ? (
            /* Loading skeleton */
            <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/40 p-6 animate-pulse">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-bg-tertiary shrink-0" />
                <div className="flex-1 w-full space-y-3">
                  <div className="h-6 bg-bg-tertiary rounded w-2/3 mx-auto sm:mx-0" />
                  <div className="h-4 bg-bg-tertiary rounded w-1/2 mx-auto sm:mx-0" />
                  <div className="h-4 bg-bg-tertiary rounded w-full" />
                </div>
              </div>
            </div>
          ) : randomStar ? (
            /* Superstar card */
            <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm overflow-hidden animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-0">
                {/* Photo — SQUARE */}
                <Link
                  href={`/superstars/${randomStar.slug}`}
                  className="relative shrink-0 group"
                >
                  <div className="relative w-44 h-44 sm:w-48 sm:h-48">
                    <Image
                      src={randomStar.photo_url}
                      alt={randomStar.name}
                      fill
                      className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      sizes="192px"
                      unoptimized
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 p-5 sm:p-6 text-center sm:text-left w-full">
                  <Link href={`/superstars/${randomStar.slug}`} className="group">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-text-white group-hover:text-neon-blue transition-colors">
                      {randomStar.name}
                    </h3>
                  </Link>

                  {/* Role badge */}
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-medium">
                      {roleLabel(randomStar.role)}
                    </span>
                    {randomStar.status && randomStar.status !== 'active' && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        randomStar.status === 'retired'
                          ? 'bg-text-secondary/10 border border-text-secondary/20 text-text-secondary'
                          : randomStar.status === 'deceased'
                          ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                          : 'bg-bg-tertiary text-text-secondary'
                      }`}>
                        {randomStar.status.charAt(0).toUpperCase() + randomStar.status.slice(1)}
                      </span>
                    )}
                    {randomStar.current_brand && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-tertiary border border-border-subtle/30 text-text-secondary">
                        {randomStar.current_brand}
                      </span>
                    )}
                  </div>

                  {/* Quick description */}
                  {randomStar.description && (
                    <p className="text-sm text-text-secondary mt-3 leading-relaxed">
                      {randomStar.description}
                    </p>
                  )}

                  {/* Stats row */}
                  {(randomStar.total_matches ?? 0) > 0 && (
                    <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
                      {randomStar.win_count != null && (
                        <div className="text-center">
                          <span className="block text-lg font-bold text-emerald-400 font-mono">{randomStar.win_count}</span>
                          <span className="text-[9px] uppercase tracking-wider text-text-secondary">Wins</span>
                        </div>
                      )}
                      {randomStar.loss_count != null && (
                        <div className="text-center">
                          <span className="block text-lg font-bold text-red-400 font-mono">{randomStar.loss_count}</span>
                          <span className="text-[9px] uppercase tracking-wider text-text-secondary">Losses</span>
                        </div>
                      )}
                      {(randomStar.total_reigns ?? 0) > 0 && (
                        <div className="text-center">
                          <span className="block text-lg font-bold text-yellow-400 font-mono">{randomStar.total_reigns}</span>
                          <span className="text-[9px] uppercase tracking-wider text-text-secondary">Reigns</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-5">
                    <Link
                      href={`/superstars/${randomStar.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neon-blue/30 bg-neon-blue/10 text-neon-blue text-sm font-medium hover:bg-neon-blue/20 transition-all"
                    >
                      View Profile
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <button
                      onClick={loadRandom}
                      disabled={loadingStar}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border-subtle/30 bg-bg-tertiary/50 text-text-secondary text-sm font-medium hover:text-text-white hover:bg-bg-tertiary hover:border-border-subtle/50 transition-all disabled:opacity-50"
                    >
                      <svg className={`w-4 h-4 ${loadingStar ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      New Superstar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Error state */
            <div className="text-center py-8">
              <p className="text-text-secondary mb-3">Could not load a random superstar.</p>
              <button
                onClick={loadRandom}
                className="text-sm text-neon-blue hover:underline"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ===== WORLD MAP SECTION ===== */}
      <div className="neon-line max-w-5xl mx-auto" />

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-white mb-2">
            Superstars <span className="text-neon-blue">Around the World</span>
          </h2>
          <p className="text-text-secondary text-sm sm:text-base max-w-lg mx-auto">
            Discover where WWE superstars come from. Click any country to browse its wrestlers.
          </p>
        </div>

        <div className="max-w-3xl mx-auto rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 backdrop-blur-sm p-5 sm:p-6">
          <SuperstarsWorldMap />
        </div>
      </section>

      {/* ===== SEO CONTENT ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            About the <span className="text-neon-blue">WWE Superstars</span> Database
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-3">
            The most comprehensive WWE roster database ever assembled. Browse thousands of superstars organized by role
            — from in-ring competitors and legendary managers to the commentators, referees, and authority figures who defined
            every era of professional wrestling.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            Each profile includes complete career statistics, match history, championship reigns, entrance themes,
            rivalries, and more. Whether you&apos;re looking for a specific wrestler from the Attitude Era or researching
            every WWE General Manager in history, you&apos;ll find it here on Pinfall Data.
          </p>
        </div>
      </section>
    </div>
  )
}
