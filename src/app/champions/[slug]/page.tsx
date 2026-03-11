'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'

function formatDate(d: string | null) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
function daysSince(dateStr: string | null) { if (!dateStr) return 0; return Math.floor((new Date().getTime() - new Date(dateStr + 'T00:00:00').getTime()) / 86400000) }

type TabKey = 'history' | 'stats'
type SortKey = 'date' | 'longest' | 'shortest'

export default function ChampionshipDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [champ, setChamp] = useState<any>(null)
  const [reigns, setReigns] = useState<any[]>([])
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
  const [searchName, setSearchName] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('date')

  const fetchData = useCallback(async (p: number) => {
    setLoading(true)
    try { const r = await fetch(`/api/championship-detail?slug=${slug}&page=${p}`); const d = await r.json(); if (d.championship) setChamp(d.championship); setReigns(d.reigns || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 1); setPage(d.page || 1); setPrevChamp(d.prevChamp || null); setNextChamp(d.nextChamp || null) } catch {}
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchData(1) }, [fetchData])
  const fetchStats = useCallback(async () => { setStatsLoading(true); try { const r = await fetch(`/api/championship-stats?slug=${slug}`); const d = await r.json(); setStats(d.stats || null) } catch {} setStatsLoading(false) }, [slug])
  useEffect(() => { if (activeTab === 'stats' && !stats) fetchStats() }, [activeTab, stats, fetchStats])
  const goPage = (n: number) => { if (n < 1 || n > totalPages) return; fetchData(n); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const sortedReigns = useMemo(() => {
    let f = reigns.filter(r => !searchName || r.superstar?.name?.toLowerCase().includes(searchName.toLowerCase()))
    if (sortBy === 'longest') f = [...f].sort((a, b) => (b.days_held || daysSince(b.won_date)) - (a.days_held || daysSince(a.won_date)))
    if (sortBy === 'shortest') f = [...f].sort((a, b) => (a.days_held || daysSince(a.won_date)) - (b.days_held || daysSince(b.won_date)))
    return f
  }, [reigns, searchName, sortBy])

  return (
    <div className="relative min-h-screen">
      {/* HERO */}
      <section className="relative w-full h-[280px] sm:h-[360px] lg:h-[420px] overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-black">
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" style={{ maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)', WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[150px] opacity-15 pointer-events-none bg-neon-blue" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          {champ?.image_url && <div className="relative mb-4"><div className="absolute -inset-4 rounded-2xl opacity-30 blur-2xl pointer-events-none bg-neon-blue" /><Image src={champ.image_url} alt={champ?.name || ''} width={400} height={260} className="relative max-h-[140px] sm:max-h-[180px] lg:max-h-[220px] w-auto object-contain drop-shadow-2xl" priority /></div>}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-text-white text-center tracking-tight mb-1">{champ?.name || <span className="bg-bg-secondary/50 rounded w-60 h-10 inline-block animate-pulse" />}</h1>
          {champ?.brand && <span className="text-sm text-neon-blue font-medium">{champ.brand}</span>}
        </div>
        {prevChamp && <Link href={`/champions/${prevChamp.slug}`} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-primary/80 border border-border-subtle/30 backdrop-blur-sm hover:border-neon-blue/30 transition-all group"><svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg><div className="hidden sm:block"><p className="text-[9px] text-text-secondary uppercase">Previous</p><p className="text-xs text-text-white font-medium truncate max-w-[120px]">{prevChamp.name}</p></div></Link>}
        {nextChamp && <Link href={`/champions/${nextChamp.slug}`} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-primary/80 border border-border-subtle/30 backdrop-blur-sm hover:border-neon-blue/30 transition-all group"><div className="hidden sm:block text-right"><p className="text-[9px] text-text-secondary uppercase">Next</p><p className="text-xs text-text-white font-medium truncate max-w-[120px]">{nextChamp.name}</p></div><svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></Link>}
      </section>

      {/* INFO BAR */}
      {champ && <section className="bg-bg-secondary/30 border-y border-border-subtle/20"><div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4"><div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm">
        <div className="text-center"><span className="block text-[10px] text-text-secondary uppercase tracking-wider">Status</span><span className={`font-bold ${champ.status === 'active' ? 'text-emerald-400' : 'text-red-400'}`}>{champ.status === 'active' ? '🟢 Active' : '🔴 Retired'}</span></div>
        {champ.introduced_date && <div className="text-center"><span className="block text-[10px] text-text-secondary uppercase tracking-wider">Introduced</span><span className="text-text-white font-semibold">{formatDate(champ.introduced_date)}</span></div>}
        {champ.retired_date && <div className="text-center"><span className="block text-[10px] text-text-secondary uppercase tracking-wider">Retired</span><span className="text-text-white font-semibold">{formatDate(champ.retired_date)}</span></div>}
        <div className="text-center"><span className="block text-[10px] text-text-secondary uppercase tracking-wider">Total Reigns</span><span className="text-neon-blue font-bold text-lg">{total}</span></div>
      </div></div></section>}

      {champ?.description_md && <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6"><p className="text-text-secondary text-sm leading-relaxed max-w-3xl mx-auto text-center">{champ.description_md}</p></section>}

      {/* TABS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6"><div className="flex items-center gap-2">
        {(['history', 'stats'] as TabKey[]).map(tab => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 rounded-xl text-sm font-medium border whitespace-nowrap transition-all ${activeTab === tab ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>{tab === 'history' ? '📜 Title History' : '📊 Statistics'}</button>)}
      </div></section>

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
            <div className="relative flex-1 w-full sm:max-w-xs"><svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg><input type="text" placeholder="Search champion..." value={searchName} onChange={e => setSearchName(e.target.value)} className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none transition-colors" /></div>
            <div className="flex items-center gap-1">{([{ key: 'date' as SortKey, label: 'By Date' }, { key: 'longest' as SortKey, label: 'Longest' }, { key: 'shortest' as SortKey, label: 'Shortest' }]).map(s => <button key={s.key} onClick={() => setSortBy(s.key)} className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${sortBy === s.key ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>{s.label}</button>)}</div>
          </div>

          {loading ? <div className="space-y-4">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
          : reigns.length === 0 ? <p className="text-center text-text-secondary py-16">No reign history found.</p>
          : <>
            <div className="hidden lg:grid lg:grid-cols-[60px_minmax(180px,1.5fr)_130px_130px_100px_80px] gap-4 px-5 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-2"><span className="text-center">#</span><span>Champion</span><span>Won</span><span>Lost</span><span>Days</span><span></span></div>
            <div className="space-y-1">{sortedReigns.map((r: any) => {
              const days = r.days_held || (r.lost_date ? 0 : daysSince(r.won_date))
              const isOpen = expandedReign === r.id
              return <div key={r.id} className="rounded-xl border border-border-subtle/10 overflow-hidden transition-all hover:border-border-subtle/30">
                <button onClick={() => setExpandedReign(isOpen ? null : r.id)} className="w-full text-left">
                  <div className="hidden lg:grid lg:grid-cols-[60px_minmax(180px,1.5fr)_130px_130px_100px_80px] gap-4 items-center px-5 py-3 hover:bg-bg-secondary/20 transition-all">
                    <span className="text-center text-xs text-neon-blue font-bold">{r.reign_number || '—'}</span>
                    <div className="flex items-center gap-3 min-w-0"><div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neon-blue/20 shrink-0 bg-bg-tertiary">{r.superstar?.photo_url ? <Image src={r.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="40px" /> : <div className="w-full h-full flex items-center justify-center text-lg opacity-20">👤</div>}</div><Link href={`/superstars/${r.superstar?.slug}`} className="text-sm text-text-white font-semibold hover:text-neon-blue transition-colors truncate" onClick={e => e.stopPropagation()}>{r.superstar?.name}</Link></div>
                    <div><span className="text-xs text-text-white font-mono">{formatDate(r.won_date)}</span>{r.won_at_show && <p className="text-[10px] text-text-secondary truncate">{r.won_at_show.name}</p>}</div>
                    <div><span className="text-xs text-text-secondary font-mono">{r.lost_date ? formatDate(r.lost_date) : 'Current'}</span>{r.lost_at_show && <p className="text-[10px] text-text-secondary truncate">{r.lost_at_show.name}</p>}</div>
                    <span className={`text-sm font-bold ${!r.lost_date ? 'text-neon-blue' : 'text-text-white'}`}>{days.toLocaleString()}</span>
                    <div className="flex items-center justify-end gap-1">{r.defenses?.length > 0 && <span className="text-[9px] text-text-secondary">{r.defenses.length}</span>}<svg className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                  </div>
                  <div className="lg:hidden flex items-center gap-3 px-4 py-3 hover:bg-bg-secondary/20"><span className="text-xs text-neon-blue font-bold w-6 text-center shrink-0">{r.reign_number || '—'}</span><div className="relative w-10 h-10 rounded-lg overflow-hidden border border-neon-blue/20 shrink-0 bg-bg-tertiary">{r.superstar?.photo_url ? <Image src={r.superstar.photo_url} alt="" fill className="object-cover object-top" sizes="40px" /> : <div className="w-full h-full" />}</div><div className="flex-1 min-w-0"><p className="text-sm text-text-white font-semibold truncate">{r.superstar?.name}</p><div className="flex items-center gap-2 mt-0.5"><span className="text-[10px] text-text-secondary font-mono">{formatDate(r.won_date)}</span><span className="text-[10px] text-text-secondary">→</span><span className="text-[10px] text-text-secondary font-mono">{r.lost_date ? formatDate(r.lost_date) : 'Current'}</span></div></div><span className={`text-xs font-bold shrink-0 ${!r.lost_date ? 'text-neon-blue' : 'text-text-secondary'}`}>{days}d</span><svg className={`w-4 h-4 text-text-secondary transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                </button>
                {isOpen && r.defenses?.length > 0 && <div className="bg-bg-secondary/20 border-t border-border-subtle/10 px-4 sm:px-6 py-4 animate-fade-in">
                  <p className="text-[10px] text-neon-blue uppercase tracking-wider font-bold mb-3">Title Matches During Reign</p>
                  <div className="hidden lg:grid lg:grid-cols-[95px_130px_minmax(200px,2.5fr)_80px_60px] gap-3 px-3 py-1 text-[9px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/10 mb-1"><span>Date</span><span>Match Type</span><span>Participants</span><span>Status</span><span>Rating</span></div>
                  <div className="space-y-0.5">{r.defenses.map((m: any) => <Link key={m.id} href={`/shows/${m.show?.slug}/matches/${m.slug}`} className="group block hover:bg-bg-secondary/30 rounded-lg transition-all">
                    <div className="hidden lg:grid lg:grid-cols-[95px_130px_minmax(200px,2.5fr)_80px_60px] gap-3 items-center px-3 py-2.5">
                      <span className="text-[11px] text-text-secondary font-mono">{formatDate(m.date)}</span>
                      <span className="text-xs text-neon-blue font-semibold uppercase truncate">{m.match_type?.name || 'Match'}</span>
                      <div className="flex items-center gap-1.5 min-w-0">{(m.teams || []).map((t: any, i: number) => <span key={i} className="flex items-center gap-1 shrink-0">{i > 0 && <span className="text-[10px] text-neon-blue font-bold mx-0.5">vs</span>}<div className="flex -space-x-1.5 shrink-0">{t.members?.slice(0, 2).map((p: any) => <div key={p.id} className={`w-6 h-6 rounded-full overflow-hidden border-2 shrink-0 ${t.is_winner ? 'border-emerald-500/40' : 'border-bg-primary'}`}>{p.photo_url ? <Image src={p.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}</div>)}</div><span className={`text-[11px] truncate max-w-[100px] ${t.is_winner ? 'text-emerald-400 font-semibold' : 'text-text-secondary'}`}>{t.members?.map((p: any) => p.name).join(', ')}</span></span>)}</div>
                      {m.is_title_change ? <span className="text-[9px] px-1.5 py-0.5 rounded bg-neon-blue/15 border border-neon-blue/25 text-neon-blue font-bold">TITLE CHANGE</span> : <span className="text-[9px] text-text-secondary/50">Successful Defense</span>}
                      <div className="flex justify-center">{m.rating ? <StarRating rating={m.rating} size="xs" /> : <span className="text-[10px] text-text-secondary/30">—</span>}</div>
                    </div>
                    <div className="lg:hidden px-3 py-2.5"><div className="flex items-center gap-2 mb-1"><span className="text-xs text-neon-blue font-semibold uppercase shrink-0">{m.match_type?.name || 'Match'}</span><span className="text-sm text-text-white truncate">{(m.teams || []).map((t: any) => t.members?.map((p: any) => p.name).join(', ')).join(' vs ')}</span></div><div className="flex items-center gap-2 text-[11px] text-text-secondary"><span className="font-mono">{formatDate(m.date)}</span>{m.is_title_change && <span className="text-[9px] px-1.5 py-0.5 rounded bg-neon-blue/15 text-neon-blue font-bold">TC</span>}{m.rating && <StarRating rating={m.rating} size="xs" />}</div></div>
                  </Link>)}</div>
                </div>}
              </div>
            })}</div>
            {totalPages > 1 && <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20"><p className="text-xs text-text-secondary">Page {page}/{totalPages} — {total} reigns</p><div className="flex gap-1"><button onClick={() => goPage(page-1)} disabled={page===1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button><button onClick={() => goPage(page+1)} disabled={page===totalPages} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button></div></div>}
          </>}
        </section>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        {statsLoading || !stats ? <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
        : <div className="space-y-8">
          {/* Key stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[{ l: 'Total Reigns', v: stats.totalReigns }, { l: 'Title Changes', v: stats.titleChanges }, { l: 'Unique Champions', v: stats.uniqueChampions }, { l: 'Avg Reign', v: `${stats.avgReignDays}d` }, { l: 'Median Reign', v: `${stats.medianReignDays}d` }, { l: 'Total Days Defended', v: stats.totalDaysDefended?.toLocaleString() }, { l: 'Title Matches', v: stats.totalTitleMatches }, { l: 'Change Rate', v: `${stats.titleChangePercentage}%` }, { l: 'Avg Match Rating', v: stats.avgRating || '—' }, { l: 'Vacated', v: `${stats.vacatedCount}x` }].map((s, i) => <div key={i} className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-4 text-center"><span className="block text-[10px] text-text-secondary uppercase tracking-wider mb-1">{s.l}</span><span className="block text-xl font-bold font-display text-neon-blue">{s.v}</span></div>)}
          </div>

          {/* Reign distribution */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center"><span className="block text-[10px] text-text-secondary uppercase mb-1">Reigns 1+ Year</span><span className="block text-xl font-bold text-emerald-400">{stats.reignsOver365}</span></div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center"><span className="block text-[10px] text-text-secondary uppercase mb-1">Reigns 100+ Days</span><span className="block text-xl font-bold text-emerald-400">{stats.reignsOver100}</span></div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center"><span className="block text-[10px] text-text-secondary uppercase mb-1">Reigns &lt; 30 Days</span><span className="block text-xl font-bold text-red-400">{stats.reignsUnder30}</span></div>
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center"><span className="block text-[10px] text-text-secondary uppercase mb-1">Reigns &lt; 1 Day</span><span className="block text-xl font-bold text-red-400">{stats.reignsUnder1}</span></div>
          </div>

          {/* Longest & Shortest + First Champ & Current */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.longestReign && <RecordCard title="Longest Reign" superstar={stats.longestReign.superstar} stat={`${stats.longestReign.days?.toLocaleString()} days`} sub={`${formatDate(stats.longestReign.won_date)} — ${formatDate(stats.longestReign.lost_date)}`} accent="neon-blue" />}
            {stats.shortestReign && <RecordCard title="Shortest Reign" superstar={stats.shortestReign.superstar} stat={`${stats.shortestReign.days?.toLocaleString()} days`} sub={`${formatDate(stats.shortestReign.won_date)} — ${formatDate(stats.shortestReign.lost_date)}`} accent="neon-pink" />}
            {stats.firstChamp && <RecordCard title="First Champion" superstar={stats.firstChamp.superstar} stat={formatDate(stats.firstChamp.won_date)} accent="neon-blue" />}
            {stats.currentChamp && <RecordCard title="Current Champion" superstar={stats.currentChamp.superstar} stat={`${stats.currentChamp.days?.toLocaleString()} days`} sub={`Since ${formatDate(stats.currentChamp.won_date)}`} accent="emerald" />}
          </div>

          {/* Most reigns + most days */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.mostReigns?.length > 0 && <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6"><h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Most Reigns</h3><div className="space-y-3">{stats.mostReigns.map((m: any, i: number) => <RankRow key={m.superstar?.id} i={i} s={m.superstar} v={`${m.count}x`} />)}</div></div>}
            {stats.mostCombinedDays?.length > 0 && <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6"><h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Most Combined Days</h3><div className="space-y-3">{stats.mostCombinedDays.map((m: any, i: number) => <RankRow key={m.superstar?.id} i={i} s={m.superstar} v={`${m.days.toLocaleString()}d`} />)}</div></div>}
          </div>

          {/* By decade + top match types + by country + top venues */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.byDecade?.length > 0 && <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6"><h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">By Decade</h3><div className="space-y-2">{stats.byDecade.map((d: any) => { const max = Math.max(...stats.byDecade.map((x: any) => x.count)); return <div key={d.decade} className="flex items-center gap-2"><span className="text-xs text-text-secondary w-10 font-mono">{d.decade}</span><div className="flex-1 h-2.5 rounded-full bg-bg-tertiary/50 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-neon-blue/60 to-neon-blue" style={{ width: `${(d.count / max) * 100}%` }} /></div><span className="text-xs text-neon-blue font-bold w-8 text-right">{d.count}</span></div> })}</div></div>}
            {stats.topMatchTypes?.length > 0 && <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6"><h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Top Match Types</h3><div className="grid grid-cols-1 gap-2">{stats.topMatchTypes.slice(0,8).map((mt: any, i: number) => <Link key={mt.id} href={`/matches/stipulations/${mt.slug}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg-tertiary/30 transition-all"><span className="w-5 h-5 rounded bg-neon-blue/10 flex items-center justify-center text-[9px] text-neon-blue font-bold">{i+1}</span><span className="text-xs text-text-white flex-1 truncate">{mt.name}</span><span className="text-xs text-neon-blue font-bold">{mt.count}</span></Link>)}</div></div>}
            {stats.byCountry?.length > 0 && <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6"><h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Champions by Country</h3><div className="space-y-2">{stats.byCountry.map((c: any, i: number) => <div key={c.country} className="flex items-center gap-2"><span className="text-xs text-text-secondary w-5 text-center">{i+1}</span><span className="text-xs text-text-white flex-1 truncate">{c.country}</span><span className="text-xs text-neon-blue font-bold">{c.count} reign{c.count !== 1 ? 's' : ''}</span></div>)}</div></div>}
            {stats.topVenues?.length > 0 && <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6"><h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Top Title Change Venues</h3><div className="space-y-2">{stats.topVenues.map((v: any, i: number) => <div key={v.venue} className="flex items-center gap-2"><span className="text-xs text-text-secondary w-5 text-center">{i+1}</span><span className="text-xs text-text-white flex-1 truncate">{v.venue}</span><span className="text-xs text-neon-blue font-bold">{v.count}</span></div>)}</div></div>}
          </div>
        </div>}
      </section>}

      {/* SEO */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8"><div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-text-white mb-3"><span className="text-neon-blue">{champ?.name || 'Championship'}</span> — Complete Title History</h2><p className="text-text-secondary text-sm leading-relaxed">This page contains the complete history of the {champ?.name || 'championship'}, including every reign, title change, defense, and detailed statistics on Pinfall Data.</p></div></section>
    </div>
  )
}

function RecordCard({ title, superstar, stat, sub, accent }: { title: string; superstar: any; stat: string; sub?: string; accent: string }) {
  const c = accent === 'neon-blue' ? 'border-neon-blue/20 from-neon-blue/5' : accent === 'neon-pink' ? 'border-neon-pink/20 from-neon-pink/5' : 'border-emerald-500/20 from-emerald-500/5'
  const tc = accent === 'neon-blue' ? 'text-neon-blue' : accent === 'neon-pink' ? 'text-neon-pink' : 'text-emerald-400'
  return <div className={`rounded-2xl border ${c} bg-gradient-to-br to-transparent p-5`}>
    <p className={`text-[10px] ${tc} uppercase tracking-wider font-bold mb-3`}>{title}</p>
    <div className="flex items-center gap-3">
      <div className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 ${c} shrink-0 bg-bg-tertiary`}>{superstar?.photo_url ? <Image src={superstar.photo_url} alt="" fill className="object-cover object-top" sizes="48px" /> : <div className="w-full h-full flex items-center justify-center text-lg opacity-20">👤</div>}</div>
      <div><Link href={`/superstars/${superstar?.slug}`} className={`text-sm text-text-white font-bold hover:${tc} transition-colors`}>{superstar?.name}</Link><p className={`${tc} font-bold text-lg`}>{stat}</p>{sub && <p className="text-[10px] text-text-secondary">{sub}</p>}</div>
    </div>
  </div>
}

function RankRow({ i, s, v }: { i: number; s: any; v: string }) {
  return <div className="flex items-center gap-3"><span className="w-6 h-6 rounded-lg bg-neon-blue/10 flex items-center justify-center text-[10px] text-neon-blue font-bold shrink-0">{i+1}</span><div className="relative w-8 h-8 rounded-lg overflow-hidden border border-border-subtle/20 shrink-0 bg-bg-tertiary">{s?.photo_url ? <Image src={s.photo_url} alt="" fill className="object-cover object-top" sizes="32px" /> : <div className="w-full h-full" />}</div><Link href={`/superstars/${s?.slug}`} className="text-sm text-text-white font-medium hover:text-neon-blue flex-1 truncate">{s?.name}</Link><span className="text-sm text-neon-blue font-bold">{v}</span></div>
}
