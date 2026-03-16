'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

function formatDate(d: string | null) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

function StatCard({ label, value, color = 'text-neon-blue', sub }: { label: string; value: string | number; color?: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-4 sm:p-5 text-center">
      <span className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">{label}</span>
      <span className={`block text-xl sm:text-2xl font-bold font-display ${color}`}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
      {sub && <span className="block text-[10px] text-text-secondary mt-0.5">{sub}</span>}
    </div>
  )
}

function RankRow({ i, superstar, stat, statLabel }: { i: number; superstar: any; stat: string | number; statLabel?: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-7 h-7 rounded-lg bg-neon-blue/10 flex items-center justify-center text-[11px] text-neon-blue font-bold shrink-0">{i + 1}</span>
      <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-border-subtle/20 shrink-0 bg-bg-tertiary">
        {superstar?.photo_url ? <Image src={superstar.photo_url} alt="" fill className="object-cover object-top" sizes="36px" /> : <div className="w-full h-full flex items-center justify-center text-sm opacity-20">👤</div>}
      </div>
      <Link href={`/superstars/${superstar?.slug}`} className="text-sm text-text-white font-medium hover:text-neon-blue transition-colors flex-1 truncate">{superstar?.name}</Link>
      <span className="text-sm text-neon-blue font-bold shrink-0">{typeof stat === 'number' ? stat.toLocaleString() : stat}{statLabel ? ` ${statLabel}` : ''}</span>
    </div>
  )
}

export default function ByTheNumbersPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/champions-global-stats').then(r => r.json()).then(d => setStats(d.stats || null)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const o = stats?.overview
  const m = stats?.male
  const f = stats?.female
  const tag = stats?.tagTeam
  const rec = stats?.records
  const rank = stats?.rankings

  return (
    <div className="relative min-h-screen">
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20champions/WWE-New-titles-1_2026-03-11_13_28_40.220684.jpg.png" alt="By The Numbers" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <nav className="hidden sm:flex items-center gap-2 text-xs text-text-secondary mb-3"><Link href="/champions" className="hover:text-neon-blue transition-colors">Champions</Link><span className="text-border-subtle">/</span><span className="text-neon-blue">By The Numbers</span></nav>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">By The <span className="text-neon-blue">Numbers</span></h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">Global championship statistics, records, and data breakdowns.</p>
        </div>
      </section>

      {loading || !stats ? (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
        </section>
      ) : (
        <>
          {/* ===== OVERVIEW ===== */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 lg:py-12">
            <h2 className="font-display text-xl font-bold text-text-white mb-6 flex items-center gap-3">
              <div className="w-1 h-6 rounded-full bg-neon-blue" />Global Overview
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard label="Championships" value={o.totalChampionships} sub={`${o.activeChampionships} active / ${o.retiredChampionships} retired`} />
              <StatCard label="Total Reigns" value={o.totalReigns} />
              <StatCard label="Unique Champions" value={o.uniqueChampions} />
              <StatCard label="Avg Reign" value={`${o.avgReignDays}d`} />
              <StatCard label="Title Matches" value={o.totalTitleMatches} sub={`${o.totalTitleChanges} title changes`} />
            </div>
          </section>

          {/* ===== MEN / WOMEN SPLIT ===== */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Men */}
              <div className="rounded-2xl border border-neon-blue/20 bg-gradient-to-br from-neon-blue/5 to-transparent p-6">
                <h3 className="font-display text-lg font-bold text-neon-blue mb-4 flex items-center gap-2">👔 Men&apos;s Division</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{m.reigns.toLocaleString()}</span><span className="text-[10px] text-text-secondary uppercase">Reigns</span></div>
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{m.uniqueChampions}</span><span className="text-[10px] text-text-secondary uppercase">Champions</span></div>
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{m.totalDays.toLocaleString()}</span><span className="text-[10px] text-text-secondary uppercase">Total Days</span></div>
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{m.avgDays}d</span><span className="text-[10px] text-text-secondary uppercase">Avg Reign</span></div>
                </div>
              </div>
              {/* Women */}
              <div className="rounded-2xl border border-neon-pink/20 bg-gradient-to-br from-neon-pink/5 to-transparent p-6">
                <h3 className="font-display text-lg font-bold text-neon-pink mb-4 flex items-center gap-2">👑 Women&apos;s Division</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{f.reigns.toLocaleString()}</span><span className="text-[10px] text-text-secondary uppercase">Reigns</span></div>
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{f.uniqueChampions}</span><span className="text-[10px] text-text-secondary uppercase">Champions</span></div>
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{f.totalDays.toLocaleString()}</span><span className="text-[10px] text-text-secondary uppercase">Total Days</span></div>
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{f.avgDays}d</span><span className="text-[10px] text-text-secondary uppercase">Avg Reign</span></div>
                </div>
                {rank.mostDecoratedFemale?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-neon-pink/10 space-y-2">
                    <p className="text-[10px] text-neon-pink uppercase tracking-wider font-bold">Most Decorated Women</p>
                    {rank.mostDecoratedFemale.slice(0, 3).map((h: any, i: number) => <RankRow key={h.superstar.id} i={i} superstar={h.superstar} stat={`${h.totalReigns}x`} />)}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ===== TAG TEAM DIVISION ===== */}
          {tag && tag.reigns > 0 && (
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-8">
              <div className="rounded-2xl border border-neon-blue/15 bg-gradient-to-br from-neon-blue/5 via-transparent to-neon-pink/5 p-6">
                <h3 className="font-display text-lg font-bold text-neon-blue mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Tag Team Division
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{tag.championships}</span><span className="text-[10px] text-text-secondary uppercase">Tag Titles</span></div>
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{tag.reigns}</span><span className="text-[10px] text-text-secondary uppercase">Team Reigns</span></div>
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{tag.uniqueTeams}</span><span className="text-[10px] text-text-secondary uppercase">Unique Teams</span></div>
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{tag.totalDays.toLocaleString()}</span><span className="text-[10px] text-text-secondary uppercase">Total Days</span></div>
                  <div className="text-center"><span className="block text-2xl font-bold text-text-white font-display">{tag.avgDays}d</span><span className="text-[10px] text-text-secondary uppercase">Avg Reign</span></div>
                </div>

                {/* Longest tag team reign */}
                {tag.longestReign && (
                  <div className="rounded-xl border border-neon-blue/15 bg-bg-primary/30 p-4 mb-4">
                    <p className="text-[10px] text-neon-blue uppercase tracking-wider font-bold mb-2">Longest Tag Team Reign</p>
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neon-blue/30 shrink-0 bg-bg-tertiary">
                        {tag.longestReign.superstars?.[0]?.photo_url ? <Image src={tag.longestReign.superstars[0].photo_url} alt="" fill className="object-cover object-top" sizes="40px" /> : <div className="w-full h-full flex items-center justify-center text-sm opacity-20">👤</div>}
                      </div>
                      {tag.longestReign.superstars?.length > 1 && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neon-blue/30 shrink-0 bg-bg-tertiary -ml-5">
                          {tag.longestReign.superstars[1]?.photo_url ? <Image src={tag.longestReign.superstars[1].photo_url} alt="" fill className="object-cover object-top" sizes="40px" /> : <div className="w-full h-full flex items-center justify-center text-sm opacity-20">👤</div>}
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-text-white font-bold">{tag.longestReign.teamName}</p>
                        <p className="text-neon-blue font-bold">{tag.longestReign.days?.toLocaleString()} days</p>
                        {tag.longestReign.championship && <p className="text-[10px] text-text-secondary">{tag.longestReign.championship}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Top tag teams rankings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tag.topByReigns?.length > 0 && (
                    <div className="rounded-xl border border-border-subtle/15 bg-bg-primary/20 p-4">
                      <p className="text-[10px] text-neon-blue uppercase tracking-wider font-bold mb-3">Most Tag Team Reigns</p>
                      <div className="space-y-2.5">
                        {tag.topByReigns.map((t: any, i: number) => (
                          <div key={t.superstar.id} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-neon-blue/10 flex items-center justify-center text-[9px] text-neon-blue font-bold shrink-0">{i + 1}</span>
                            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-border-subtle/20 shrink-0 bg-bg-tertiary">
                              {t.superstar?.photo_url ? <Image src={t.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="28px" /> : <div className="w-full h-full" />}
                            </div>
                            <span className="text-xs text-text-white flex-1 truncate">{t.superstar?.name}</span>
                            <span className="text-xs text-neon-blue font-bold shrink-0">{t.totalReigns}x</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {tag.topByDays?.length > 0 && (
                    <div className="rounded-xl border border-border-subtle/15 bg-bg-primary/20 p-4">
                      <p className="text-[10px] text-neon-blue uppercase tracking-wider font-bold mb-3">Most Combined Days</p>
                      <div className="space-y-2.5">
                        {tag.topByDays.map((t: any, i: number) => (
                          <div key={t.superstar.id} className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-neon-blue/10 flex items-center justify-center text-[9px] text-neon-blue font-bold shrink-0">{i + 1}</span>
                            <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-border-subtle/20 shrink-0 bg-bg-tertiary">
                              {t.superstar?.photo_url ? <Image src={t.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="28px" /> : <div className="w-full h-full" />}
                            </div>
                            <span className="text-xs text-text-white flex-1 truncate">{t.superstar?.name}</span>
                            <span className="text-xs text-neon-blue font-bold shrink-0">{t.days.toLocaleString()}d</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ===== RECORDS ===== */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-8">
            <h2 className="font-display text-xl font-bold text-text-white mb-6 flex items-center gap-3"><div className="w-1 h-6 rounded-full bg-neon-blue" />All-Time Records</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rec.longestReign && (
                <div className="rounded-2xl border border-neon-blue/20 bg-bg-secondary/15 p-5">
                  <p className="text-[10px] text-neon-blue uppercase tracking-wider font-bold mb-3">Longest Single Reign</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-neon-blue/30 shrink-0 bg-bg-tertiary">{rec.longestReign.superstar?.photo_url ? <Image src={rec.longestReign.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="48px" /> : <div className="w-full h-full flex items-center justify-center text-lg opacity-20">👤</div>}</div>
                    <div><Link href={`/superstars/${rec.longestReign.superstar?.slug}`} className="text-sm text-text-white font-bold hover:text-neon-blue">{rec.longestReign.superstar?.name}</Link><p className="text-neon-blue font-bold text-lg">{rec.longestReign.days?.toLocaleString()} days</p><p className="text-[10px] text-text-secondary">{rec.championship} • {formatDate(rec.longestReign.won_date)}</p></div>
                  </div>
                </div>
              )}
              {rec.shortestReign && (
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-5">
                  <p className="text-[10px] text-neon-pink uppercase tracking-wider font-bold mb-3">Shortest Single Reign</p>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border-2 border-neon-pink/20 shrink-0 bg-bg-tertiary">{rec.shortestReign.superstar?.photo_url ? <Image src={rec.shortestReign.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="48px" /> : <div className="w-full h-full flex items-center justify-center text-lg opacity-20">👤</div>}</div>
                    <div><Link href={`/superstars/${rec.shortestReign.superstar?.slug}`} className="text-sm text-text-white font-bold hover:text-neon-pink">{rec.shortestReign.superstar?.name}</Link><p className="text-neon-pink font-bold text-lg">{rec.shortestReign.days?.toLocaleString()} days</p><p className="text-[10px] text-text-secondary">{rec.shortestReign.championship} • {formatDate(rec.shortestReign.won_date)}</p></div>
                  </div>
                </div>
              )}
              {rec.mostChangesChampionship && (
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-5">
                  <p className="text-[10px] text-neon-blue uppercase tracking-wider font-bold mb-3">Most Title Changes</p>
                  <div className="flex items-center gap-3">
                    {rec.mostChangesChampionship.image_url && <div className="relative w-16 h-10 shrink-0"><Image src={rec.mostChangesChampionship.image_url} alt="" fill className="object-contain" sizes="64px" /></div>}
                    <div><Link href={`/champions/${rec.mostChangesChampionship.slug}`} className="text-sm text-text-white font-bold hover:text-neon-blue">{rec.mostChangesChampionship.name}</Link><p className="text-neon-blue font-bold text-lg">{rec.mostChangesChampionship.changes} changes</p></div>
                  </div>
                </div>
              )}
            </div>
            {/* Reign distribution */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <StatCard label="Reigns 1+ Year" value={rec.reignsOver365} color="text-emerald-400" />
              <StatCard label="Reigns 1000+ Days" value={rec.reignsOver1000} color="text-emerald-400" />
              <StatCard label="Reigns < 30 Days" value={rec.reignsUnder30} color="text-red-400" />
              <StatCard label="Reigns < 1 Day" value={rec.reignsUnder1} color="text-red-400" />
            </div>
          </section>

          {/* ===== RANKINGS ===== */}
          <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-8">
            <h2 className="font-display text-xl font-bold text-text-white mb-6 flex items-center gap-3"><div className="w-1 h-6 rounded-full bg-neon-blue" />Rankings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rank.mostDecorated?.length > 0 && (
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                  <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Most Different Titles Won</h3>
                  <div className="space-y-3">{rank.mostDecorated.map((h: any, i: number) => <RankRow key={h.superstar.id} i={i} superstar={h.superstar} stat={`${h.uniqueTitles} titles`} />)}</div>
                </div>
              )}
              {rank.mostTotalReigns?.length > 0 && (
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                  <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Most Total Championship Reigns</h3>
                  <div className="space-y-3">{rank.mostTotalReigns.map((h: any, i: number) => <RankRow key={h.superstar.id} i={i} superstar={h.superstar} stat={`${h.totalReigns}x`} />)}</div>
                </div>
              )}
              {rank.mostCombinedDays?.length > 0 && (
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                  <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Most Combined Days as Champion</h3>
                  <div className="space-y-3">{rank.mostCombinedDays.map((h: any, i: number) => <RankRow key={h.superstar.id} i={i} superstar={h.superstar} stat={h.days} statLabel="days" />)}</div>
                </div>
              )}
            </div>
          </section>

          {/* ===== BY DECADE ===== */}
          {stats.byDecade?.length > 0 && (
            <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-8">
              <h2 className="font-display text-xl font-bold text-text-white mb-6 flex items-center gap-3"><div className="w-1 h-6 rounded-full bg-neon-blue" />Title Changes by Decade</h2>
              <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                <div className="space-y-3">
                  {stats.byDecade.map((d: any) => {
                    const max = Math.max(...stats.byDecade.map((x: any) => x.count))
                    return (
                      <div key={d.decade} className="flex items-center gap-3">
                        <span className="text-xs text-text-secondary w-12 shrink-0 font-mono">{d.decade}</span>
                        <div className="flex-1 h-3 rounded-full bg-bg-tertiary/50 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-neon-blue/60 to-neon-blue" style={{ width: `${(d.count / max) * 100}%` }} /></div>
                        <span className="text-xs text-neon-blue font-bold w-12 text-right">{d.count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">By The <span className="text-neon-blue">Numbers</span> — Complete WWE Championship Analytics</h2>
          <p className="text-text-secondary text-sm leading-relaxed">The most comprehensive championship data analysis in WWE history. Global statistics across all titles, broken down by gender, era, and performance. Rankings for the most decorated superstars, longest reigns, and every record in the book — only on Pinfall Data.</p>
        </div>
      </section>
    </div>
  )
}
