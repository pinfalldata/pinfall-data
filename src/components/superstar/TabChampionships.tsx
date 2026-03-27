'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'
import { useTranslations } from 'next-intl'


function formatDate(d: string | null) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function TabChampionships({ superstar }: { superstar: any }) {
  const t = useTranslations()

  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalReigns, setTotalReigns] = useState(0)
  const [expandedReign, setExpandedReign] = useState<number | null>(null)

  useEffect(() => {
    fetch(`/api/superstar-championships?superstarId=${superstar.id}`)
      .then(r => r.json())
      .then(d => { setData(d.championships || []); setTotalReigns(d.totalReigns || 0) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [superstar.id])

  if (loading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
  if (data.length === 0) return <p className="text-center text-text-secondary py-16">No championship history found.</p>

  const totalDays = data.reduce((sum, item) => sum + (item.total_days || 0), 0)

  return (
    <div>
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 p-4 sm:p-5 rounded-2xl border border-neon-blue/15 bg-gradient-to-r from-neon-blue/5 via-transparent to-neon-blue/5">
        <div className="text-center">
          <span className="block text-2xl sm:text-3xl font-bold text-neon-blue font-display">{data.length}</span>
          <span className="text-[10px] text-text-secondary uppercase tracking-wider">Title{data.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="w-px h-10 bg-border-subtle/30 hidden sm:block" />
        <div className="text-center">
          <span className="block text-2xl sm:text-3xl font-bold text-text-white font-display">{totalReigns}</span>
          <span className="text-[10px] text-text-secondary uppercase tracking-wider">Reign{totalReigns !== 1 ? 's' : ''}</span>
        </div>
        <div className="w-px h-10 bg-border-subtle/30 hidden sm:block" />
        <div className="text-center">
          <span className="block text-2xl sm:text-3xl font-bold text-neon-blue font-display">{totalDays.toLocaleString()}</span>
          <span className="text-[10px] text-text-secondary uppercase tracking-wider">Total Days</span>
        </div>
      </div>

      <div className="space-y-8">
        {data.map((item: any) => {
          const ch = item.championship
          return (
            <div key={ch.id} className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 overflow-hidden">
              {/* ===== CHAMPIONSHIP HEADER — SPECTACULAR BELT DISPLAY ===== */}
              <div className="relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/8 via-transparent to-neon-blue/5 pointer-events-none" />
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/60 to-transparent" />

                <div className="relative p-5 sm:p-7">
                  {/* Belt image — large and prominent */}
                  <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7">
                    <Link href={`/champions/${ch.slug}`} className="shrink-0 group relative">
                      {/* Gold glow behind belt */}
                      <div className="absolute -inset-3 rounded-2xl bg-neon-blue/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      <div className="relative w-40 h-24 sm:w-52 sm:h-32">
                        {ch.image_url ? (
                          <Image
                            src={ch.image_url}
                            alt={ch.name}
                            fill
                            className="object-contain drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
                            sizes="208px"
                          />
                        ) : (
                          <div className="w-full h-full rounded-xl bg-bg-tertiary/50 flex items-center justify-center">
                            <span className="text-4xl opacity-20">🏆</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <Link href={`/champions/${ch.slug}`} className="inline-block">
                        <h3 className="font-display text-lg sm:text-xl font-bold text-text-white hover:text-neon-blue transition-colors">
                          {ch.name}
                        </h3>
                      </Link>
                      {ch.is_tag_team && (
                        <span className="inline-flex items-center gap-1 ml-2 text-[9px] px-2 py-0.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-bold uppercase align-middle">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          TAG TEAM
                        </span>
                      )}

                      {/* Stats row */}
                      <div className="flex items-center justify-center sm:justify-start gap-5 mt-3">
                        <div className="text-center">
                          <span className="text-2xl sm:text-3xl font-bold text-neon-blue font-display">{item.reign_count}x</span>
                          <span className="block text-[9px] text-text-secondary uppercase tracking-wider mt-0.5">Champion</span>
                        </div>
                        <div className="w-px h-10 bg-border-subtle/30" />
                        <div className="text-center">
                          <span className="text-2xl sm:text-3xl font-bold text-text-white font-display">{item.total_days.toLocaleString()}</span>
                          <span className="block text-[9px] text-text-secondary uppercase tracking-wider mt-0.5">Total Days</span>
                        </div>
                        {item.reign_count > 1 && (
                          <>
                            <div className="w-px h-10 bg-border-subtle/30 hidden sm:block" />
                            <div className="text-center hidden sm:block">
                              <span className="text-2xl font-bold text-text-secondary font-display">
                                {Math.round(item.total_days / item.reign_count)}
                              </span>
                              <span className="block text-[9px] text-text-secondary uppercase tracking-wider mt-0.5">Avg Days</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== REIGNS LIST ===== */}
              <div className="divide-y divide-border-subtle/10">
                {item.reigns.map((r: any) => {
                  const days = r.days_held || 0
                  const isOpen = expandedReign === r.id
                  const isCurrent = !r.lost_date

                  return (
                    <div key={r.id}>
                      <button onClick={() => setExpandedReign(isOpen ? null : r.id)} className="w-full text-left">
                        <div className="flex items-center gap-3 sm:gap-4 px-5 py-3.5 hover:bg-bg-secondary/20 transition-all">
                          {/* Reign number */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${isCurrent ? 'bg-neon-blue/15 border border-neon-blue/30 text-neon-blue' : 'bg-bg-tertiary/50 border border-border-subtle/20 text-text-secondary'}`}>
                            #{r.reign_number || '—'}
                          </div>

                          {/* Tag team partner photo + info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-text-white font-mono">{formatDate(r.won_date)}</span>
                              <span className="text-text-secondary text-xs">→</span>
                              <span className={`text-sm font-mono ${isCurrent ? 'text-neon-blue font-semibold' : 'text-text-secondary'}`}>
                                {isCurrent ? 'Current' : formatDate(r.lost_date)}
                              </span>
                            </div>

                            {/* Tag team partner — with photo */}
                            {r.partner && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] text-text-secondary">w/</span>
                                <Link
                                  href={`/superstars/${r.partner.slug}`}
                                  className="inline-flex items-center gap-1.5 group/partner"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-neon-blue/30 shrink-0 bg-bg-tertiary">
                                    {r.partner.photo_url ? (
                                      <Image
                                        src={r.partner.photo_url}
                                        alt={r.partner.name}
                                        fill
                                        className="object-cover object-top"
                                        sizes="24px"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-[8px] opacity-30">👤</div>
                                    )}
                                  </div>
                                  <span className="text-xs text-neon-blue font-medium group-hover/partner:underline">
                                    {r.partner.name}
                                  </span>
                                </Link>
                              </div>
                            )}

                            {/* Show info */}
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-text-secondary">
                              {r.won_at_show && (
                                <span>
                                  Won at{' '}
                                  <Link href={`/shows/${r.won_at_show.slug}`} className="text-neon-blue hover:underline" onClick={e => e.stopPropagation()}>
                                    {r.won_at_show.name}
                                  </Link>
                                </span>
                              )}
                              {r.lost_at_show && (
                                <span>
                                  Lost at{' '}
                                  <Link href={`/shows/${r.lost_at_show.slug}`} className="text-neon-blue hover:underline" onClick={e => e.stopPropagation()}>
                                    {r.lost_at_show.name}
                                  </Link>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Days + expand */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-sm font-bold ${isCurrent ? 'text-neon-blue' : 'text-text-white'}`}>
                              {days.toLocaleString()}d
                            </span>
                            {r.defenses?.length > 0 && (
                              <span className="text-[9px] text-text-secondary bg-bg-tertiary/50 rounded px-1.5 py-0.5">
                                {r.defenses.length} match{r.defenses.length !== 1 ? 'es' : ''}
                              </span>
                            )}
                            <svg className={`w-4 h-4 text-text-secondary transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </button>

                      {/* Expanded defenses */}
                      {isOpen && r.defenses?.length > 0 && (
                        <div className="bg-bg-secondary/20 border-t border-border-subtle/10 px-4 sm:px-6 py-4 animate-fade-in">
                          <p className="text-[10px] text-neon-blue uppercase tracking-wider font-bold mb-3">{t('champions.detail.titleMatches')}</p>
                          <div className="hidden lg:grid lg:grid-cols-[95px_130px_minmax(200px,2.5fr)_80px_60px] gap-3 px-3 py-1 text-[9px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/10 mb-1">
                            <span>{t('shows.detail.date')}</span><span>{t('matches.search.matchType')}</span><span>{t('matches.detail.participants')}</span><span>{t('superstars.info.status')}</span><span>{t('common.rating')}</span>
                          </div>
                          <div className="space-y-0.5">
                            {r.defenses.map((m: any) => (
                              <Link key={m.id} href={`/shows/${m.show?.slug}/matches/${m.slug}`} className="group block hover:bg-bg-secondary/30 rounded-lg transition-all">
                                <div className="hidden lg:grid lg:grid-cols-[95px_130px_minmax(200px,2.5fr)_80px_60px] gap-3 items-center px-3 py-2.5">
                                  <span className="text-[11px] text-text-secondary font-mono">{formatDate(m.date)}</span>
                                  <span className="text-xs text-neon-blue font-semibold uppercase truncate">{m.match_type?.name || 'Match'}</span>
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    {(m.teams || []).map((t: any, i: number) => (
                                      <span key={i} className="flex items-center gap-1 shrink-0">
                                        {i > 0 && <span className="text-[10px] text-neon-blue font-bold mx-0.5">vs</span>}
                                        <div className="flex -space-x-1.5 shrink-0">
                                          {t.members?.slice(0, 2).map((p: any) => (
                                            <div key={p.id} className={`w-6 h-6 rounded-full overflow-hidden border-2 shrink-0 ${t.is_winner ? 'border-emerald-500/40' : 'border-bg-primary'}`}>
                                              {p.photo_url ? <Image src={p.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}
                                            </div>
                                          ))}
                                        </div>
                                        <span className={`text-[11px] truncate max-w-[100px] ${t.is_winner ? 'text-emerald-400 font-semibold' : 'text-text-secondary'}`}>{t.members?.map((p: any) => p.name).join(', ')}</span>
                                      </span>
                                    ))}
                                  </div>
                                  {m.is_title_change ? <span className="text-[9px] px-1.5 py-0.5 rounded bg-neon-blue/15 border border-neon-blue/25 text-neon-blue font-bold">TITLE CHANGE</span> : <span className="text-[9px] text-text-secondary/50">Defense</span>}
                                  <div className="flex justify-center">{m.rating ? <StarRating rating={m.rating} size="xs" /> : <span className="text-[10px] text-text-secondary/30">—</span>}</div>
                                </div>
                                <div className="lg:hidden px-3 py-2.5">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs text-neon-blue font-semibold uppercase shrink-0">{m.match_type?.name || 'Match'}</span>
                                    <span className="text-sm text-text-white truncate">{(m.teams || []).map((t: any) => t.members?.map((p: any) => p.name).join(', ')).join(' vs ')}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-text-secondary">
                                    <span className="font-mono">{formatDate(m.date)}</span>
                                    {m.is_title_change && <span className="text-[9px] px-1.5 py-0.5 rounded bg-neon-blue/15 text-neon-blue font-bold">TC</span>}
                                    {m.rating && <StarRating rating={m.rating} size="xs" />}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
