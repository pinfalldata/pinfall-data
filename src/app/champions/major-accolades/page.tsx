'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


function formatDate(d: string | null) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function MajorAccoladesPage() {
  const t = useTranslations()

  const [tournaments, setTournaments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/tournaments-list').then(r => r.json()).then(d => setTournaments(d.tournaments || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="relative min-h-screen">
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20champions/IMG_20221213_102348-01.webp" alt={t('champions.majorAccolades.title')} fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <nav className="hidden sm:flex items-center gap-2 text-xs text-text-secondary mb-3"><Link href="/champions" className="hover:text-neon-blue transition-colors">Champions</Link><span className="text-border-subtle">/</span><span className="text-neon-blue">{t('champions.majorAccolades.title')}</span></nav>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">Major <span className="text-neon-blue">Accolades</span></h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">Grand Slams, Triple Crowns, milestone achievements, and tournament victories.</p>
        </div>
      </section>

      {/* ===== TOURNAMENTS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-neon-blue to-neon-blue/40" />
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-text-white">🏆 <span className="text-neon-blue">Tournaments</span></h2>
          {!loading && <span className="text-text-secondary text-sm">({tournaments.length})</span>}
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
        ) : tournaments.length === 0 ? (
          <p className="text-center text-text-secondary py-16">No tournament data found.</p>
        ) : (
          <>
            {/* Desktop header */}
            <div className="hidden lg:grid lg:grid-cols-[100px_minmax(180px,1.5fr)_minmax(180px,1.5fr)_minmax(160px,1.2fr)_50px] gap-4 px-5 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-2">
              <span>{t('shows.detail.date')}</span><span>Tournament</span><span>Show</span><span>{t('common.winner')}</span><span></span>
            </div>

            <div className="space-y-1">
              {tournaments.map((t: any) => {
                const isOpen = expanded === t.id
                return (
                  <div key={t.id} className="rounded-xl border border-border-subtle/10 overflow-hidden transition-all hover:border-border-subtle/30">
                    <button onClick={() => setExpanded(isOpen ? null : t.id)} className="w-full text-left">
                      {/* Desktop */}
                      <div className="hidden lg:grid lg:grid-cols-[100px_minmax(180px,1.5fr)_minmax(180px,1.5fr)_minmax(160px,1.2fr)_50px] gap-4 items-center px-5 py-3 hover:bg-bg-secondary/20 transition-all">
                        <span className="text-xs text-text-secondary font-mono">{t.date ? formatDate(t.date) : t.year}</span>
                        <div className="flex items-center gap-3 min-w-0">
                          {t.image_url && <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neon-blue/20 shrink-0 bg-bg-tertiary"><Image src={t.image_url} alt="" fill className="object-cover" sizes="40px" /></div>}
                          <span className="text-sm text-neon-blue font-semibold truncate">{t.name}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          {t.show ? (
                            <Link href={`/shows/${t.show.slug}`} className="text-sm text-text-white hover:text-neon-blue transition-colors truncate" onClick={e => e.stopPropagation()}>{t.show.name}</Link>
                          ) : <span className="text-xs text-text-secondary/30">—</span>}
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          {t.winner ? (
                            <>
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-neon-blue/20 shrink-0 bg-bg-tertiary">
                                {t.winner.photo_url ? <Image src={t.winner.photo_url} alt="" fill className="object-cover object-top" sizes="32px" /> : <div className="w-full h-full flex items-center justify-center text-sm opacity-20">👤</div>}
                              </div>
                              <Link href={`/superstars/${t.winner.slug}`} className="text-sm text-text-white font-medium hover:text-neon-blue transition-colors truncate" onClick={e => e.stopPropagation()}>{t.winner.name}</Link>
                            </>
                          ) : <span className="text-xs text-text-secondary/30">—</span>}
                        </div>
                        <div className="flex justify-end">
                          <svg className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </div>
                      {/* Mobile */}
                      <div className="lg:hidden flex items-center gap-3 px-4 py-3 hover:bg-bg-secondary/20 transition-all">
                        {t.image_url && <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-neon-blue/20 shrink-0 bg-bg-tertiary"><Image src={t.image_url} alt="" fill className="object-cover" sizes="48px" /></div>}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neon-blue font-semibold truncate">{t.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-text-secondary font-mono">{t.date ? formatDate(t.date) : t.year}</span>
                            {t.winner && <><span className="text-[10px] text-text-secondary/30">•</span><span className="text-[11px] text-text-white truncate">{t.winner.name}</span></>}
                          </div>
                        </div>
                        <svg className={`w-4 h-4 text-text-secondary transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </button>

                    {/* Expanded details */}
                    {isOpen && (
                      <div className="bg-bg-secondary/20 border-t border-border-subtle/10 px-5 sm:px-8 py-5 animate-fade-in">
                        <div className="flex flex-col sm:flex-row gap-5">
                          {t.image_url && (
                            <div className="relative w-full sm:w-48 h-32 sm:h-32 rounded-xl overflow-hidden border border-border-subtle/20 shrink-0 bg-bg-tertiary">
                              <Image src={t.image_url} alt={t.name} fill className="object-cover" sizes="192px" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display text-lg font-bold text-text-white mb-2">{t.name} <span className="text-neon-blue">({t.year})</span></h3>
                            {t.show && (
                              <p className="text-sm text-text-secondary mb-1">
                                Show: <Link href={`/shows/${t.show.slug}`} className="text-neon-blue hover:underline">{t.show.name}</Link>
                                {t.show.venue && <span className="text-text-secondary/50"> — {t.show.venue}, {t.show.city}</span>}
                              </p>
                            )}
                            {t.winner && (
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm text-text-secondary">Winner:</span>
                                <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-neon-blue/20 shrink-0 bg-bg-tertiary">
                                  {t.winner.photo_url ? <Image src={t.winner.photo_url} alt="" fill className="object-cover object-top" sizes="32px" /> : <div className="w-full h-full flex items-center justify-center text-sm opacity-20">👤</div>}
                                </div>
                                <Link href={`/superstars/${t.winner.slug}`} className="text-sm text-neon-blue font-semibold hover:underline">{t.winner.name}</Link>
                              </div>
                            )}
                            {t.description_md && <p className="text-sm text-text-secondary leading-relaxed">{t.description_md}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">Major <span className="text-neon-blue">Accolades</span> — WWE Achievement Tracker</h2>
          <p className="text-text-secondary text-sm leading-relaxed">Browse every major achievement, tournament victory, and milestone in WWE history. From King of the Ring to tournament championships, explore the complete record of accomplishments on Pinfall Data.</p>
        </div>
      </section>
    </div>
  )
}
