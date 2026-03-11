'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'

function formatDate(d: string | null) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function TabChampionships({ superstar }: { superstar: any }) {
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

  if (loading) return <div className="space-y-6">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
  if (data.length === 0) return <p className="text-center text-text-secondary py-16">No championship history found.</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-text-secondary text-sm">{data.length} championship{data.length !== 1 ? 's' : ''} — {totalReigns} total reign{totalReigns !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-6">
        {data.map((item: any) => {
          const ch = item.championship
          return (
            <div key={ch.id} className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 overflow-hidden">
              {/* Championship header */}
              <div className="p-5 sm:p-6 flex items-center gap-4 sm:gap-6 border-b border-border-subtle/10">
                <Link href={`/champions/${ch.slug}`} className="shrink-0 group">
                  <div className="relative w-24 h-16 sm:w-32 sm:h-20">
                    {ch.image_url ? (
                      <Image src={ch.image_url} alt={ch.name} fill className="object-contain group-hover:scale-105 transition-transform" sizes="128px" />
                    ) : (
                      <div className="w-full h-full rounded-lg bg-bg-tertiary/50 flex items-center justify-center"><span className="text-2xl opacity-20">🏆</span></div>
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/champions/${ch.slug}`} className="font-display text-base sm:text-lg font-bold text-text-white hover:text-neon-blue transition-colors">
                    {ch.name}
                  </Link>
                  {ch.is_tag_team && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-bold">TAG TEAM</span>}
                  <div className="flex items-center gap-4 mt-1.5">
                    <div className="text-center">
                      <span className="text-lg sm:text-xl font-bold text-neon-blue font-display">{item.reign_count}x</span>
                      <span className="text-[10px] text-text-secondary ml-1">champion</span>
                    </div>
                    <div className="w-px h-6 bg-border-subtle/30" />
                    <div className="text-center">
                      <span className="text-lg sm:text-xl font-bold text-text-white font-display">{item.total_days.toLocaleString()}</span>
                      <span className="text-[10px] text-text-secondary ml-1">total days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reigns list */}
              <div className="divide-y divide-border-subtle/10">
                {item.reigns.map((r: any) => {
                  const days = r.days_held || 0
                  const isOpen = expandedReign === r.id
                  return (
                    <div key={r.id}>
                      <button onClick={() => setExpandedReign(isOpen ? null : r.id)} className="w-full text-left">
                        <div className="flex items-center gap-3 sm:gap-4 px-5 py-3 hover:bg-bg-secondary/20 transition-all">
                          <span className="text-xs text-neon-blue font-bold w-6 text-center shrink-0">#{r.reign_number || '—'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm text-text-white font-mono">{formatDate(r.won_date)}</span>
                              <span className="text-text-secondary text-xs">→</span>
                              <span className="text-sm text-text-secondary font-mono">{r.lost_date ? formatDate(r.lost_date) : 'Current'}</span>
                              {r.partner && (
                                <span className="text-[10px] text-text-secondary flex items-center gap-1">
                                  w/ <Link href={`/superstars/${r.partner.slug}`} className="text-neon-blue hover:underline" onClick={e => e.stopPropagation()}>{r.partner.name}</Link>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-0.5 text-[11px] text-text-secondary">
                              {r.won_at_show && <span>Won at <Link href={`/shows/${r.won_at_show.slug}`} className="text-neon-blue hover:underline" onClick={e => e.stopPropagation()}>{r.won_at_show.name}</Link></span>}
                              {r.lost_at_show && <span>Lost at <Link href={`/shows/${r.lost_at_show.slug}`} className="text-neon-blue hover:underline" onClick={e => e.stopPropagation()}>{r.lost_at_show.name}</Link></span>}
                            </div>
                          </div>
                          <span className={`text-sm font-bold shrink-0 ${!r.lost_date ? 'text-neon-blue' : 'text-text-white'}`}>{days.toLocaleString()}d</span>
                          {r.defenses?.length > 0 && <span className="text-[9px] text-text-secondary shrink-0">{r.defenses.length}</span>}
                          <svg className={`w-4 h-4 text-text-secondary transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </button>

                      {isOpen && r.defenses?.length > 0 && (
                        <div className="bg-bg-secondary/20 border-t border-border-subtle/10 px-4 sm:px-6 py-4 animate-fade-in">
                          <p className="text-[10px] text-neon-blue uppercase tracking-wider font-bold mb-3">Title Matches</p>
                          <div className="hidden lg:grid lg:grid-cols-[95px_130px_minmax(200px,2.5fr)_80px_60px] gap-3 px-3 py-1 text-[9px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/10 mb-1">
                            <span>Date</span><span>Match Type</span><span>Participants</span><span>Status</span><span>Rating</span>
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
