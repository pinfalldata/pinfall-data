'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function daysSince(dateStr: string | null) {
  if (!dateStr) return 0
  return Math.floor((new Date().getTime() - new Date(dateStr + 'T00:00:00').getTime()) / 86400000)
}

type TabKey = 'history' | 'stats'

export default function ChampionshipDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [champ, setChamp] = useState<any>(null)
  const [reigns, setReigns] = useState<any[]>([])
  const [holders, setHolders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [prevChamp, setPrevChamp] = useState<any>(null)
  const [nextChamp, setNextChamp] = useState<any>(null)
  const [expandedReign, setExpandedReign] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('history')
  const [stats, setStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchName, setSearchName] = useState('')

  const fetchData = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const r = await fetch(`/api/championship-detail?slug=${slug}&page=${p}`)
      const d = await r.json()
      if (d.championship) setChamp(d.championship)
      setReigns(d.reigns || [])
      setHolders(d.holders || [])
      setTotal(d.total || 0)
      setTotalPages(d.totalPages || 1)
      setPage(d.page || 1)
      setPrevChamp(d.prevChamp || null)
      setNextChamp(d.nextChamp || null)
    } catch {}
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchData(1) }, [fetchData])

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const r = await fetch(`/api/championship-stats?slug=${slug}`)
      const d = await r.json()
      setStats(d.stats || null)
    } catch {}
    setStatsLoading(false)
  }, [slug])

  useEffect(() => {
    if (activeTab === 'stats' && !stats) fetchStats()
  }, [activeTab, stats, fetchStats])

  const goPage = (n: number) => {
    if (n < 1 || n > totalPages) return
    fetchData(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredHolders = holders.filter(h => {
    if (searchName && !h.name.toLowerCase().includes(searchName.toLowerCase())) return false
    return true
  })

  return (
    <div className="relative min-h-screen">
      {/* ===== HERO ===== */}
      <section className="relative w-full h-[280px] sm:h-[360px] lg:h-[420px] overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-60" />

        {/* Grid bg */}
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none"
          style={{ maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[150px] opacity-15 pointer-events-none bg-yellow-500" />

        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          {/* Belt image */}
          {champ?.image_url && (
            <div className="relative mb-4">
              <div className="absolute -inset-4 rounded-2xl opacity-30 blur-2xl pointer-events-none bg-yellow-500" />
              <Image src={champ.image_url} alt={champ?.name || ''} width={400} height={260}
                className="relative max-h-[140px] sm:max-h-[180px] lg:max-h-[220px] w-auto object-contain drop-shadow-2xl" priority />
            </div>
          )}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-text-white text-center tracking-tight mb-1">
            {champ?.name || <span className="bg-bg-secondary/50 rounded w-60 h-10 inline-block animate-pulse" />}
          </h1>
          {champ?.brand && <span className="text-sm text-yellow-400 font-medium">{champ.brand}</span>}
        </div>

        {/* Nav arrows */}
        {prevChamp && (
          <Link href={`/champions/${prevChamp.slug}`}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-primary/80 border border-border-subtle/30 backdrop-blur-sm hover:border-yellow-500/30 transition-all group">
            <svg className="w-4 h-4 text-text-secondary group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <div className="hidden sm:block"><p className="text-[9px] text-text-secondary uppercase tracking-wider">Previous</p><p className="text-xs text-text-white font-medium truncate max-w-[120px]">{prevChamp.name}</p></div>
          </Link>
        )}
        {nextChamp && (
          <Link href={`/champions/${nextChamp.slug}`}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-primary/80 border border-border-subtle/30 backdrop-blur-sm hover:border-yellow-500/30 transition-all group">
            <div className="hidden sm:block text-right"><p className="text-[9px] text-text-secondary uppercase tracking-wider">Next</p><p className="text-xs text-text-white font-medium truncate max-w-[120px]">{nextChamp.name}</p></div>
            <svg className="w-4 h-4 text-text-secondary group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        )}
      </section>

      {/* ===== INFO BAR ===== */}
      {champ && (
        <section className="bg-bg-secondary/30 border-y border-border-subtle/20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
              <div className="text-center">
                <span className="block text-[10px] text-text-secondary uppercase tracking-wider">Status</span>
                <span className={`font-bold ${champ.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>{champ.status === 'active' ? '🟢 Active' : '🔴 Retired'}</span>
              </div>
              {champ.introduced_date && (
                <div className="text-center">
                  <span className="block text-[10px] text-text-secondary uppercase tracking-wider">Introduced</span>
                  <span className="text-text-white font-semibold">{formatDate(champ.introduced_date)}</span>
                </div>
              )}
              {champ.retired_date && (
                <div className="text-center">
                  <span className="block text-[10px] text-text-secondary uppercase tracking-wider">Retired</span>
                  <span className="text-text-white font-semibold">{formatDate(champ.retired_date)}</span>
                </div>
              )}
              <div className="text-center">
                <span className="block text-[10px] text-text-secondary uppercase tracking-wider">Total Reigns</span>
                <span className="text-yellow-400 font-bold text-lg">{total}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Description */}
      {champ?.description_md && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6">
          <p className="text-text-secondary text-sm leading-relaxed max-w-3xl mx-auto text-center">{champ.description_md}</p>
        </section>
      )}

      {/* ===== TABS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6">
        <div className="flex items-center gap-2">
          {(['history', 'stats'] as TabKey[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium border whitespace-nowrap transition-all ${activeTab === tab ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'}`}>
              {tab === 'history' ? '📜 Title History' : '📊 Statistics'}
            </button>
          ))}
        </div>
      </section>

      {/* ===== HISTORY TAB ===== */}
      {activeTab === 'history' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search champion..." value={searchName} onChange={e => setSearchName(e.target.value)}
                className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-yellow-500/50 focus:outline-none transition-colors" />
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
          ) : reigns.length === 0 ? (
            <p className="text-center text-text-secondary py-16">No reign history found.</p>
          ) : (
            <>
              {/* Desktop header */}
              <div className="hidden lg:grid lg:grid-cols-[60px_minmax(180px,1.5fr)_130px_130px_100px_80px] gap-4 px-5 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-2">
                <span className="text-center">#</span><span>Champion</span><span>Won</span><span>Lost</span><span>Days</span><span></span>
              </div>

              <div className="space-y-1">
                {reigns.filter(r => {
                  if (!searchName) return true
                  return r.superstar?.name?.toLowerCase().includes(searchName.toLowerCase())
                }).map((r: any) => {
                  const days = r.days_held || (r.lost_date ? 0 : daysSince(r.won_date))
                  const isOpen = expandedReign === r.id
                  return (
                    <div key={r.id} className="rounded-xl border border-border-subtle/10 overflow-hidden transition-all hover:border-border-subtle/30">
                      {/* Row */}
                      <button onClick={() => setExpandedReign(isOpen ? null : r.id)}
                        className="w-full text-left">
                        {/* Desktop */}
                        <div className="hidden lg:grid lg:grid-cols-[60px_minmax(180px,1.5fr)_130px_130px_100px_80px] gap-4 items-center px-5 py-3 hover:bg-bg-secondary/20 transition-all">
                          <span className="text-center text-xs text-yellow-400 font-bold">{r.reign_number || '—'}</span>
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-yellow-500/20 shrink-0 bg-bg-tertiary">
                              {r.superstar?.photo_url ? (
                                <Image src={r.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="40px" />
                              ) : <div className="w-full h-full flex items-center justify-center text-lg opacity-20">👤</div>}
                            </div>
                            <Link href={`/superstars/${r.superstar?.slug}`} className="text-sm text-text-white font-semibold hover:text-yellow-400 transition-colors truncate"
                              onClick={e => e.stopPropagation()}>
                              {r.superstar?.name}
                            </Link>
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs text-text-white font-mono">{formatDate(r.won_date)}</span>
                            {r.won_at_show && <p className="text-[10px] text-text-secondary truncate">{r.won_at_show.name}</p>}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs text-text-secondary font-mono">{r.lost_date ? formatDate(r.lost_date) : 'Current'}</span>
                            {r.lost_at_show && <p className="text-[10px] text-text-secondary truncate">{r.lost_at_show.name}</p>}
                          </div>
                          <span className={`text-sm font-bold ${!r.lost_date ? 'text-yellow-400' : 'text-text-white'}`}>{days.toLocaleString()}</span>
                          <div className="flex items-center justify-end gap-1">
                            {r.defenses?.length > 0 && <span className="text-[9px] text-text-secondary">{r.defenses.length} match{r.defenses.length !== 1 ? 'es' : ''}</span>}
                            <svg className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                        {/* Mobile */}
                        <div className="lg:hidden flex items-center gap-3 px-4 py-3 hover:bg-bg-secondary/20 transition-all">
                          <span className="text-xs text-yellow-400 font-bold w-6 text-center shrink-0">{r.reign_number || '—'}</span>
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-yellow-500/20 shrink-0 bg-bg-tertiary">
                            {r.superstar?.photo_url ? <Image src={r.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="40px" /> : <div className="w-full h-full flex items-center justify-center text-lg opacity-20">👤</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-text-white font-semibold truncate">{r.superstar?.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-text-secondary font-mono">{formatDate(r.won_date)}</span>
                              <span className="text-[10px] text-text-secondary">→</span>
                              <span className="text-[10px] text-text-secondary font-mono">{r.lost_date ? formatDate(r.lost_date) : 'Current'}</span>
                            </div>
                          </div>
                          <span className={`text-xs font-bold shrink-0 ${!r.lost_date ? 'text-yellow-400' : 'text-text-secondary'}`}>{days}d</span>
                          <svg className={`w-4 h-4 text-text-secondary transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                      </button>

                      {/* Expanded: title defenses */}
                      {isOpen && r.defenses?.length > 0 && (
                        <div className="bg-bg-secondary/20 border-t border-border-subtle/10 px-4 sm:px-8 py-4 animate-fade-in">
                          <p className="text-[10px] text-yellow-400 uppercase tracking-wider font-bold mb-3">Title Matches During Reign</p>
                          <div className="space-y-1">
                            {r.defenses.map((m: any) => (
                              <Link key={m.id} href={`/shows/${m.show?.slug}/matches/${m.slug}`}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-secondary/30 transition-all group">
                                <span className="text-[11px] text-text-secondary font-mono shrink-0">{formatDate(m.date)}</span>
                                <span className="text-xs text-neon-blue font-semibold uppercase shrink-0">{m.match_type?.name || 'Match'}</span>
                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                  {(m.teams || []).map((t: any, i: number) => (
                                    <span key={i} className="flex items-center gap-0.5 shrink-0">
                                      {i > 0 && <span className="text-[10px] text-neon-blue font-bold mx-0.5">vs</span>}
                                      {t.members?.slice(0, 2).map((p: any) => (
                                        <div key={p.id} className={`w-6 h-6 rounded-full overflow-hidden border-2 shrink-0 ${t.is_winner ? 'border-emerald-500/40' : 'border-bg-primary'}`}>
                                          {p.photo_url ? <Image src={p.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}
                                        </div>
                                      ))}
                                      <span className={`text-[11px] truncate max-w-[80px] hidden sm:inline ${t.is_winner ? 'text-emerald-400 font-semibold' : 'text-text-secondary'}`}>
                                        {t.members?.map((p: any) => p.name).join(', ')}
                                      </span>
                                    </span>
                                  ))}
                                </div>
                                {m.is_title_change && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 font-bold shrink-0">TITLE CHANGE</span>}
                                {m.rating && <div className="shrink-0 hidden sm:block"><StarRating rating={m.rating} size="xs" /></div>}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
                  <p className="text-xs text-text-secondary">Page {page} of {totalPages} — {total} reigns</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => goPage(page - 1)} disabled={page === 1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => goPage(page + 1)} disabled={page === totalPages} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ===== STATS TAB ===== */}
      {activeTab === 'stats' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          {statsLoading || !stats ? (
            <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
          ) : (
            <div className="space-y-8">
              {/* Key stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                {[
                  { label: 'Total Reigns', value: stats.totalReigns, color: 'text-yellow-400' },
                  { label: 'Title Changes', value: stats.titleChanges, color: 'text-text-white' },
                  { label: 'Unique Champions', value: stats.uniqueChampions, color: 'text-neon-blue' },
                  { label: 'Avg Reign', value: `${stats.avgReignDays}d`, color: 'text-text-white' },
                  { label: 'Title Matches', value: stats.totalTitleMatches, color: 'text-yellow-400' },
                  { label: 'Change Matches', value: stats.titleChangeMatches, color: 'text-text-white' },
                  { label: 'Change Rate', value: `${stats.titleChangePercentage}%`, color: 'text-neon-blue' },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-4 text-center">
                    <span className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">{s.label}</span>
                    <span className={`block text-xl font-bold font-display ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>

              {/* Longest & Shortest reign */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.longestReign && (
                  <div className="rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent p-6">
                    <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">Longest Reign</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-yellow-500/30 shrink-0 bg-bg-tertiary">
                        {stats.longestReign.superstar?.photo_url ? <Image src={stats.longestReign.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="56px" /> : <div className="w-full h-full flex items-center justify-center text-xl opacity-20">👤</div>}
                      </div>
                      <div>
                        <Link href={`/superstars/${stats.longestReign.superstar?.slug}`} className="text-base text-text-white font-bold hover:text-yellow-400 transition-colors">{stats.longestReign.superstar?.name}</Link>
                        <p className="text-yellow-400 font-bold text-lg">{stats.longestReign.days?.toLocaleString()} days</p>
                        <p className="text-[11px] text-text-secondary">{formatDate(stats.longestReign.won_date)} — {formatDate(stats.longestReign.lost_date)}</p>
                      </div>
                    </div>
                  </div>
                )}
                {stats.shortestReign && (
                  <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                    <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-3">Shortest Reign</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-neon-blue/20 shrink-0 bg-bg-tertiary">
                        {stats.shortestReign.superstar?.photo_url ? <Image src={stats.shortestReign.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="56px" /> : <div className="w-full h-full flex items-center justify-center text-xl opacity-20">👤</div>}
                      </div>
                      <div>
                        <Link href={`/superstars/${stats.shortestReign.superstar?.slug}`} className="text-base text-text-white font-bold hover:text-neon-blue transition-colors">{stats.shortestReign.superstar?.name}</Link>
                        <p className="text-neon-blue font-bold text-lg">{stats.shortestReign.days?.toLocaleString()} days</p>
                        <p className="text-[11px] text-text-secondary">{formatDate(stats.shortestReign.won_date)} — {formatDate(stats.shortestReign.lost_date)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Most reigns */}
              {stats.mostReigns?.length > 0 && (
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                  <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-4">Most Reigns</h3>
                  <div className="space-y-3">
                    {stats.mostReigns.map((m: any, i: number) => (
                      <div key={m.superstar?.id || i} className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-yellow-500/10 flex items-center justify-center text-[10px] text-yellow-400 font-bold shrink-0">{i + 1}</span>
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border-subtle/20 shrink-0 bg-bg-tertiary">
                          {m.superstar?.photo_url ? <Image src={m.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="32px" /> : <div className="w-full h-full flex items-center justify-center text-sm opacity-20">👤</div>}
                        </div>
                        <Link href={`/superstars/${m.superstar?.slug}`} className="text-sm text-text-white font-medium hover:text-yellow-400 transition-colors flex-1 truncate">{m.superstar?.name}</Link>
                        <span className="text-sm text-yellow-400 font-bold">{m.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Most combined days */}
              {stats.mostCombinedDays?.length > 0 && (
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                  <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-4">Most Combined Days as Champion</h3>
                  <div className="space-y-3">
                    {stats.mostCombinedDays.map((m: any, i: number) => {
                      const maxDays = stats.mostCombinedDays[0]?.days || 1
                      return (
                        <div key={m.superstar?.id || i} className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-yellow-500/10 flex items-center justify-center text-[10px] text-yellow-400 font-bold shrink-0">{i + 1}</span>
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border-subtle/20 shrink-0 bg-bg-tertiary">
                            {m.superstar?.photo_url ? <Image src={m.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="32px" /> : <div className="w-full h-full flex items-center justify-center text-sm opacity-20">👤</div>}
                          </div>
                          <Link href={`/superstars/${m.superstar?.slug}`} className="text-sm text-text-white font-medium hover:text-yellow-400 transition-colors w-36 truncate shrink-0">{m.superstar?.name}</Link>
                          <div className="flex-1 h-2 rounded-full bg-bg-tertiary/50 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-yellow-500/60 to-yellow-500 transition-all" style={{ width: `${(m.days / maxDays) * 100}%` }} />
                          </div>
                          <span className="text-xs text-text-secondary font-mono w-20 text-right">{m.days.toLocaleString()}d</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* By decade */}
              {stats.byDecade?.length > 0 && (
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6">
                  <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-4">Title Changes by Decade</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {stats.byDecade.map((d: any) => (
                      <div key={d.decade} className="rounded-xl border border-border-subtle/10 bg-bg-tertiary/20 p-3 text-center">
                        <span className="text-xs text-text-secondary">{d.decade}</span>
                        <span className="block text-lg text-yellow-400 font-bold font-display mt-0.5">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ===== SEO ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            <span className="text-yellow-400">{champ?.name || 'Championship'}</span> — Complete Title History
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            This page contains the complete history of the {champ?.name || 'championship'}, including every reign,
            title change, defense, and detailed statistics. Browse champions, their reign lengths, and title match
            results throughout the history of this prestigious title on Pinfall Data.
          </p>
        </div>
      </section>
    </div>
  )
}
