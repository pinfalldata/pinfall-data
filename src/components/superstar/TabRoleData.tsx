'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'
import { formatDateShort } from '@/lib/utils'

const PER = 50
const NOW_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: NOW_YEAR - 1953 + 1 }, (_, i) => NOW_YEAR - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2000, i).toLocaleString('en-US', { month: 'long' }) }))

const segIcons: Record<string, string> = {
  in_ring_segment:'🎤',backstage:'🚪',interference:'⚡',ceremony:'🏆',authority:'👔',psychology:'🧠',
  props_spectacle:'🎪',medical_injury:'🏥',musical:'🎵',fan_engagement:'📣',broadcast:'📺',digital:'💻',
  interview:'🎙️',promo:'📢',entrance:'🎵',video_package:'📹',announcement:'📣',other:'📋',
}
const SEG_CATS = Object.keys(segIcons)

export default function TabRoleData({ superstar, tab }: { superstar: any; tab: string }) {
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [showSeriesId, setShowSeriesId] = useState('')
  const [category, setCategory] = useState('')
  const [result, setResult] = useState('')
  const [showFilters, setShowFilters] = useState(true)
  const [filterOpts, setFilterOpts] = useState<any>(null)
  const ref = useRef<HTMLDivElement>(null)

  const isTenure = tab === 'gmTenures' || tab === 'execTenures'
  const hasMonth = !!year
  const hasPromo = !isTenure
  const hasCat = tab === 'segments'
  const hasResult = tab === 'managed'

  // Load filter options (show series)
  useEffect(() => {
    if (!isTenure) {
      fetch('/api/match-search-filters').then(r => r.json()).then(d => setFilterOpts(d)).catch(() => {})
    }
  }, [isTenure])

  const fetchData = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ superstarId: String(superstar.id), tab, page: String(page) })
    if (year) p.set('year', year)
    if (year && month) p.set('month', month)
    if (showSeriesId) p.set('showSeriesId', showSeriesId)
    if (category) p.set('category', category)
    if (result) p.set('result', result)
    try {
      const r = await fetch(`/api/superstar-tab?${p}`)
      const d = await r.json()
      setItems(d.items || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 0)
    } catch { setItems([]); setTotal(0) }
    finally { setLoading(false) }
  }, [superstar.id, tab, page, year, month, showSeriesId, category, result])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1); setYear(''); setMonth(''); setShowSeriesId(''); setCategory(''); setResult('') }, [tab])

  const goP = (n: number) => { setPage(n); ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const hasF = !!(year || showSeriesId || category || result)
  const fCount = [year, showSeriesId, category, result].filter(Boolean).length

  return (
    <div ref={ref}>
      {/* ===== FILTER BAR — same as Matches ===== */}
      {!isTenure && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-text-secondary text-sm">{loading ? 'Loading…' : `${total.toLocaleString()} result${total !== 1 ? 's' : ''}`}</p>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/50 border-border-subtle/30 text-text-secondary hover:text-text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              {showFilters ? 'Hide Filters' : 'Filters'}{fCount > 0 && <span className="w-5 h-5 rounded-full bg-neon-blue text-[10px] text-black font-bold flex items-center justify-center">{fCount}</span>}
            </button>
          </div>
          {showFilters && (
            <div className="mb-5 p-4 rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <Sel label="Year" v={year} set={v => { setYear(v); setMonth(''); setPage(1) }} opts={YEARS.map(y => ({ value: String(y), label: String(y) }))} ph="All years" />
                {hasMonth && <Sel label="Month" v={month} set={v => { setMonth(v); setPage(1) }} opts={MONTHS} ph="All months" />}
                {hasPromo && filterOpts?.showSeries && <Sel label="Promotion" v={showSeriesId} set={v => { setShowSeriesId(v); setPage(1) }} opts={(filterOpts.showSeries || []).map((s: any) => ({ value: String(s.id), label: s.name }))} ph="All promotions" />}
                {hasCat && <Sel label="Category" v={category} set={v => { setCategory(v); setPage(1) }} opts={SEG_CATS.map(c => ({ value: c, label: `${segIcons[c]} ${c.replace(/_/g, ' ')}` }))} ph="All categories" />}
                {hasResult && <Sel label="Result" v={result} set={v => { setResult(v); setPage(1) }} opts={[{ value: 'win', label: 'Win' }, { value: 'loss', label: 'Loss' }, { value: 'draw', label: 'Draw' }]} ph="All results" />}
              </div>
              {hasF && (
                <div className="flex justify-end mt-3 pt-2 border-t border-border-subtle/20">
                  <button onClick={() => { setYear(''); setMonth(''); setShowSeriesId(''); setCategory(''); setResult(''); setPage(1) }} className="text-xs text-neon-pink hover:text-neon-pink/80 transition-colors flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Clear
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===== ITEMS ===== */}
      {loading && items.length === 0 ? (
        <div className="space-y-1">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-[52px] rounded-lg bg-bg-secondary/30 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-center text-text-secondary py-16">No data found for this tab.</p>
      ) : (
        <>
          <div className={`transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
            {items.map((item, i) => {
              if (tab === 'segments') return <SegRow key={item.id || i} d={item} showSlug={superstar.slug} />
              if (tab === 'managed') return <MgrMatchRow key={item.id || i} d={item} />
              if (tab === 'commentated' || tab === 'matchCommentated') return <ShowRow key={item.id || i} d={item} />
              if (tab === 'ringAnnounced') return <ShowRow key={item.id || i} d={item} />
              if (tab === 'refereed' || tab === 'guestRefereed') return <RefMatchRow key={item.id || i} d={item} />
              if (tab === 'interviewed') return <IntRow key={item.id || i} d={item} />
              if (tab === 'gmTenures') return <GMCard key={item.id || i} d={item} />
              if (tab === 'execTenures') return <ExecCard key={item.id || i} d={item} />
              return null
            })}
          </div>
          {totalPages > 1 && <Pag page={page} tp={totalPages} total={total} go={goP} />}
        </>
      )}
    </div>
  )
}

/* ============================================================ ROW COMPONENTS — h-[52px] like matches ============================================================ */

function SegRow({ d, showSlug }: { d: any; showSlug: string }) {
  const icon = segIcons[d.category] || '📋'
  return (
    <Link href={`/shows/${d.show_slug}/segments/${d.slug}`} className="flex items-center gap-2 px-3 h-[52px] rounded-lg hover:bg-bg-secondary/30 transition-all group">
      <span className="text-xs text-text-secondary font-mono w-[68px] shrink-0">{d.show_date ? formatDateShort(d.show_date) : '—'}</span>
      {d.show_logo && <Img src={d.show_logo} sz={18} />}
      <span className="text-xs text-text-white truncate max-w-[90px] shrink-0">{d.show_name || '—'}</span>
      <span className="text-sm shrink-0">{icon}</span>
      <span className="text-xs text-neon-blue font-medium truncate flex-1 group-hover:underline">{d.title}</span>
      <div className="hidden sm:flex -space-x-1.5 shrink-0">
        {(d.participants || []).slice(0, 4).map((p: any) => <Avatar key={p.id} p={p} />)}
        {(d.participants || []).length > 4 && <Overflow n={d.participants.length - 4} />}
      </div>
    </Link>
  )
}

function MgrMatchRow({ d }: { d: any }) {
  return (
    <Link href={`/shows/${d.show_slug}/matches/${d.slug}`} className="flex items-center gap-2 px-3 h-[52px] rounded-lg hover:bg-bg-secondary/30 transition-all group">
      <span className="text-xs text-text-secondary font-mono w-[68px] shrink-0">{d.date ? formatDateShort(d.date) : '—'}</span>
      {d.show_logo && <Img src={d.show_logo} sz={18} />}
      <span className="text-[10px] text-neon-blue font-semibold uppercase shrink-0 max-w-[80px] truncate">{d.match_type?.name || 'Match'}</span>
      <div className="flex items-center gap-1 shrink-0"><span className="text-[9px]">🎩</span>
        {(d.managed_for || []).slice(0, 2).map((p: any) => <span key={p.id} className="flex items-center gap-0.5"><Avatar p={p} /><span className="text-[11px] text-text-white truncate max-w-[60px]">{p.name}</span></span>)}
      </div>
      <span className="text-[10px] text-neon-blue mx-0.5 shrink-0">vs</span>
      <div className="hidden sm:flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
        {(d.opponents || []).slice(0, 2).map((p: any) => <span key={p.id} className="text-[11px] text-text-secondary truncate">{p.name}</span>)}
      </div>
      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${d.matchResult === 'win' ? 'text-emerald-400 bg-emerald-500/10' : d.matchResult === 'draw' ? 'text-yellow-400 bg-yellow-500/10' : 'text-red-400 bg-red-500/10'}`}>
        {d.matchResult === 'win' ? 'W' : d.matchResult === 'draw' ? 'D' : 'L'}
      </span>
      {d.rating && <div className="shrink-0"><StarRating rating={d.rating} size="xs" /></div>}
    </Link>
  )
}

function ShowRow({ d }: { d: any }) {
  return (
    <Link href={`/shows/${d.show_slug}`} className="flex items-center gap-3 px-3 h-[52px] rounded-lg hover:bg-bg-secondary/30 transition-all group">
      <span className="text-xs text-text-secondary font-mono w-[68px] shrink-0">{d.show_date ? formatDateShort(d.show_date) : '—'}</span>
      {d.show_logo && <Img src={d.show_logo} sz={18} />}
      <span className="text-sm text-text-white truncate flex-1 group-hover:text-neon-blue">{d.show_name || '—'}</span>
      {d.co_commentators && d.co_commentators.length > 0 && (
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-text-secondary">with</span>
          {d.co_commentators.slice(0, 3).map((p: any) => <span key={p.id} className="flex items-center gap-1"><Avatar p={p} /><span className="text-[11px] text-text-secondary">{p.name}</span></span>)}
        </div>
      )}
    </Link>
  )
}

function RefMatchRow({ d }: { d: any }) {
  const teams = d.teams || []
  return (
    <Link href={`/shows/${d.show_slug}/matches/${d.slug}`} className="flex items-center gap-2 px-3 h-[52px] rounded-lg hover:bg-bg-secondary/30 transition-all group">
      <span className="text-xs text-text-secondary font-mono w-[68px] shrink-0">{d.date ? formatDateShort(d.date) : '—'}</span>
      {d.show_logo && <Img src={d.show_logo} sz={18} />}
      <span className="text-[10px] text-neon-blue font-semibold uppercase shrink-0 max-w-[80px] truncate">{d.match_type?.name || 'Match'}</span>
      <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
        {teams.map((t: any, i: number) => (
          <span key={i} className="flex items-center gap-1 shrink-0">
            {i > 0 && <span className="text-[10px] text-neon-blue font-bold mx-0.5">vs</span>}
            <div className="flex -space-x-1 shrink-0">{t.members.slice(0, 3).map((p: any) => <Avatar key={p.id} p={p} win={t.is_winner} />)}</div>
            <span className={`text-[11px] truncate max-w-[90px] ${t.is_winner ? 'text-emerald-400 font-semibold' : 'text-text-secondary'}`}>{t.members.map((p: any) => p.name).join(', ')}</span>
          </span>
        ))}
      </div>
      {d.rating && <div className="shrink-0"><StarRating rating={d.rating} size="xs" /></div>}
    </Link>
  )
}

function IntRow({ d }: { d: any }) {
  return (
    <Link href={`/shows/${d.show_slug}/segments/${d.slug}`} className="flex items-center gap-3 px-3 h-[52px] rounded-lg hover:bg-bg-secondary/30 transition-all group">
      <span className="text-xs text-text-secondary font-mono w-[68px] shrink-0">{d.show_date ? formatDateShort(d.show_date) : '—'}</span>
      {d.show_logo && <Img src={d.show_logo} sz={18} />}
      <span className="text-xs text-neon-blue truncate flex-1 group-hover:underline">{d.title}</span>
      {(d.interviewees || []).length > 0 && (
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-text-secondary">with</span>
          {d.interviewees.slice(0, 3).map((p: any) => <span key={p.id} className="flex items-center gap-1"><Avatar p={p} /><span className="text-[11px] text-text-secondary">{p.name}</span></span>)}
        </div>
      )}
    </Link>
  )
}

/* ============================================================ GM & EXECUTIVE CARDS — premium design ============================================================ */

function GMCard({ d }: { d: any }) {
  return (
    <div className="relative rounded-2xl border border-border-subtle/20 bg-gradient-to-br from-bg-secondary/40 via-bg-secondary/20 to-transparent overflow-hidden mb-5">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />
      <div className="p-5 sm:p-7 flex items-start gap-5">
        {d.photo_url ? (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-neon-blue/20 shrink-0 bg-bg-tertiary">
            <Image src={d.photo_url} alt="" fill className="object-cover object-top" sizes="96px" unoptimized />
          </div>
        ) : d.show_series?.logo_url ? (
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-bg-tertiary border border-border-subtle/20 p-2 flex items-center justify-center">
            <Image src={d.show_series.logo_url} alt="" width={64} height={64} className="w-full h-full object-contain" />
          </div>
        ) : null}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-display text-lg sm:text-xl font-bold text-neon-blue">{d.title || 'General Manager'}</h3>
            {d.brand_name && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-medium">{d.brand_name}</span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1.5 flex items-center gap-2">
            <span className="font-mono">{d.start_date}</span>
            <span className="text-border-subtle">→</span>
            <span className="font-mono">{d.end_date || 'Present'}</span>
            <span className="text-neon-blue text-xs font-bold ml-1">({fmtDur(d.start_date, d.end_date)})</span>
          </p>
          {d.description && <p className="text-sm text-text-secondary/80 mt-3 leading-relaxed">{d.description}</p>}
          {d.notes && !d.description && <p className="text-xs text-text-secondary/50 mt-2 italic">{d.notes}</p>}
        </div>
      </div>
    </div>
  )
}

function ExecCard({ d }: { d: any }) {
  return (
    <div className="relative rounded-2xl border border-border-subtle/20 bg-gradient-to-br from-bg-secondary/40 via-bg-secondary/20 to-transparent overflow-hidden mb-5">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/40 to-transparent" />
      <div className="p-5 sm:p-7 flex items-start gap-5">
        {d.photo_url && (
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-yellow-500/20 shrink-0 bg-bg-tertiary">
            <Image src={d.photo_url} alt="" fill className="object-cover object-top" sizes="96px" unoptimized />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg sm:text-xl font-bold text-text-white">
            {d.title || 'Executive'}
          </h3>
          <p className="text-sm text-text-secondary mt-1.5 flex items-center gap-2">
            <span className="font-mono">{d.start_date}</span>
            <span className="text-border-subtle">→</span>
            <span className="font-mono">{d.end_date || 'Present'}</span>
            <span className="text-yellow-400 text-xs font-bold ml-1">({fmtDur(d.start_date, d.end_date)})</span>
          </p>
          {d.description && <p className="text-sm text-text-secondary/80 mt-3 leading-relaxed">{d.description}</p>}
          {d.notes && !d.description && <p className="text-xs text-text-secondary/50 mt-2 italic">{d.notes}</p>}
        </div>
      </div>
    </div>
  )
}

/* ============================================================ SHARED HELPERS ============================================================ */

function Avatar({ p, win }: { p: any; win?: boolean }) {
  return (
    <div className={`w-6 h-6 rounded-full overflow-hidden border-2 shrink-0 ${win ? 'border-emerald-500/40' : 'border-bg-primary'}`}>
      {p.photo_url ? <Image src={p.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}
    </div>
  )
}
function Img({ src, sz }: { src: string; sz: number }) {
  return <div className={`shrink-0`} style={{ width: sz, height: sz }}><Image src={src} alt="" width={sz} height={sz} className="w-full h-full object-contain" /></div>
}
function Overflow({ n }: { n: number }) {
  return <div className="w-6 h-6 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[8px] text-text-secondary">+{n}</div>
}

function fmtDur(start: string | null, end: string | null): string {
  if (!start) return ''
  const s = new Date(start + 'T00:00:00'), e = end ? new Date(end + 'T00:00:00') : new Date()
  const days = Math.floor((e.getTime() - s.getTime()) / 86400000)
  if (days < 31) return `${days}d`
  const months = Math.floor(days / 30.44)
  if (months < 12) return `${months}mo`
  const y = Math.floor(months / 12), rm = months % 12
  return rm > 0 ? `${y}y ${rm}mo` : `${y}y`
}

function Sel({ label, v, set, opts, ph }: { label: string; v: string; set: (v: string) => void; opts: { value: string; label: string }[]; ph: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">{label}</label>
      <select value={v} onChange={e => set(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
        <option value="">{ph}</option>
        {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function Pag({ page, tp, total, go }: { page: number; tp: number; total: number; go: (n: number) => void }) {
  const vis = () => {
    const p: (number | 'e')[] = []
    if (tp <= 7) { for (let i = 1; i <= tp; i++) p.push(i) }
    else { p.push(1); if (page > 3) p.push('e'); for (let i = Math.max(2, page - 1); i <= Math.min(tp - 1, page + 1); i++) p.push(i); if (page < tp - 2) p.push('e'); p.push(tp) }
    return p
  }
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
      <p className="text-xs text-text-secondary">Page {page}/{tp} — {total.toLocaleString()} results</p>
      <div className="flex items-center gap-1">
        <button onClick={() => go(page - 1)} disabled={page === 1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        {vis().map((p, i) => p === 'e' ? <span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span> :
          <button key={p} onClick={() => go(p as number)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue' : 'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{p}</button>)}
        <button onClick={() => go(page + 1)} disabled={page === tp} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
      </div>
    </div>
  )
}
