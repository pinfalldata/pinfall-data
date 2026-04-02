'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface CurrentChampion {
  id: number; name: string; slug: string; image_url: string | null; status: string
  brand: string | null; sort_order: number
  current_holder: { id: number; name: string; slug: string; photo_url: string | null } | null
  current_reign_start: string | null; current_reign_days: number | null; current_reign_number: number | null
}

function daysSince(dateStr: string | null) {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  return Math.floor((now.getTime() - d.getTime()) / 86400000)
}

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const SUB_PAGES = [
  {
    title: 'The Title Vault',
    href: '/champions/the-title-vault',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20champions/cena.webp',
    desc: 'Every championship in WWE history — active and retired.',
    icon: '🏆',
  },
  {
    title: 'Major Accolades',
    href: '/champions/major-accolades',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20champions/flair.webp',
    desc: 'Grand Slams, Triple Crowns, and milestone achievements.',
    icon: '🏅',
  },
  {
    title: 'By The Numbers',
    href: '/champions/by-the-numbers',
    image: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20champions/bruno.webp',
    desc: 'Championship statistics, records, and data breakdowns.',
    icon: '📊',
  },
]

export default function ChampionsPage() {
  const [champs, setChamps] = useState<CurrentChampion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/champions-current')
      .then(r => r.json())
      .then(d => setChamps(d.championships || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const activeWithHolder = champs.filter(c => c.current_holder)

  return (
    <div className="relative min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image
          src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20champions/SHOP_OUR_BIGGEST_SALES_OF_THE_YEAR_1_cc28e654-4926-455a-803a-585337e60e69_2026-03-11_13_24_57.173879.webp.png"
          alt="WWE Champions" fill priority sizes="100vw" quality={100}
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            WWE <span className="text-neon-blue">Champions</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            Every championship, every reign, every title change — the complete history of WWE gold.
          </p>
        </div>
      </section>

      {/* ===== SUB-PAGES — GOLD/SILVER hover like /superstars ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {SUB_PAGES.map((sp) => (
            <Link
              key={sp.href}
              href={sp.href}
              className="group relative overflow-hidden rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm transition-all duration-300 hover:border-neon-blue/25 hover:bg-bg-secondary/40"
            >
              {/* Gold accent line top — matches superstars page */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/0 to-transparent group-hover:via-neon-blue/60 transition-all duration-500 z-10" />

              <div className="flex items-center gap-4 p-4 sm:p-5">
                {/* Square image */}
                <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 border-border-subtle/30 group-hover:border-neon-blue/40 transition-all shrink-0 bg-bg-tertiary">
                  <Image
                    src={sp.image}
                    alt={sp.title}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-110"
                    sizes="80px"
                   
                  />
                  {/* Subtle shine overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 group-hover:via-white/10 group-hover:to-white/5 transition-all duration-500" />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-base sm:text-lg font-bold text-text-white group-hover:text-neon-blue transition-colors truncate">
                    {sp.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-text-secondary leading-snug line-clamp-2">
                    {sp.desc}
                  </p>
                </div>

                {/* Arrow — matches superstars page */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-bg-tertiary/50 group-hover:bg-neon-blue/10 border border-border-subtle/20 group-hover:border-neon-blue/30 transition-all shrink-0">
                  <svg className="w-4 h-4 text-text-secondary group-hover:text-neon-blue transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== CURRENT CHAMPIONS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12 lg:pb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-neon-blue to-neon-blue/40" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-white">
            Current <span className="text-neon-blue">Champions</span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-72 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
          </div>
        ) : activeWithHolder.length === 0 ? (
          <p className="text-center text-text-secondary py-16">No current champions data available.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeWithHolder.map(c => {
              const days = daysSince(c.current_reign_start) || c.current_reign_days || 0
              return (
                <Link key={c.id} href={`/champions/${c.slug}`}
                  className="group relative rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 overflow-hidden transition-all hover:border-neon-blue/30 hover:shadow-lg hover:shadow-neon-blue/5">
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/60 to-transparent" />
                  <div className="relative h-36 sm:h-40 flex items-center justify-center bg-gradient-to-b from-bg-tertiary/40 to-transparent p-4">
                    {c.image_url ? (
                      <Image src={c.image_url} alt={c.name} width={300} height={200}
                        className="max-h-full w-auto object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-28 h-20 rounded-xl bg-bg-tertiary/50 flex items-center justify-center"><span className="text-3xl opacity-30">🏆</span></div>
                    )}
                  </div>
                  <div className="px-5 pt-3 pb-2">
                    <h3 className="font-display text-sm font-bold text-neon-blue uppercase tracking-wider text-center">{c.name}</h3>
                    {c.brand && <p className="text-[10px] text-text-secondary text-center mt-0.5 uppercase tracking-wider">{c.brand}</p>}
                  </div>
                  <div className="px-5 pb-5 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-neon-blue/30 shrink-0 bg-bg-tertiary">
                      {c.current_holder?.photo_url ? (
                        <Image src={c.current_holder.photo_url} alt={c.current_holder.name} fill className="object-cover object-top" sizes="64px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl opacity-20">👤</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors truncate">{c.current_holder?.name}</p>
                      <p className="text-[11px] text-text-secondary mt-0.5">Since {formatDate(c.current_reign_start)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-neon-blue font-bold">{days.toLocaleString()} days</span>
                        {c.current_reign_number && c.current_reign_number > 1 && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-bold">x{c.current_reign_number}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            Complete <span className="text-neon-blue">WWE Championship</span> Database
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            Browse every WWE championship past and present. From the historic WWE Championship to the newest titles,
            explore complete reign histories, title defenses, statistics, and records. Discover who held the gold the longest,
            who won the most titles, and every title change in WWE history on Pinfall Data.
          </p>
        </div>
      </section>
    </div>
  )
}
