'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'
import { formatDateShort } from '@/lib/utils'
import { useTranslations } from 'next-intl'


const PER = 50
const NOW_Y = new Date().getFullYear()
const YEARS = Array.from({ length: NOW_Y - 1953 + 1 }, (_, i) => NOW_Y - i)
const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(2000, i).toLocaleString('en-US', { month: 'long' }) }))
const segI: Record<string, string> = { in_ring_segment:'🎤',backstage:'🚪',interference:'⚡',ceremony:'🏆',authority:'👔',psychology:'🧠',props_spectacle:'🎪',medical_injury:'🏥',musical:'🎵',fan_engagement:'📣',broadcast:'📺',digital:'💻',interview:'🎙️',promo:'📢',entrance:'🎵',video_package:'📹',announcement:'📣',other:'📋' }
const SCATS = Object.keys(segI)

export default function TabRoleData({ superstar, tab }: { superstar: any; tab: string }) {
  const t = useTranslations()

  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [ssId, setSsId] = useState('')
  const [cat, setCat] = useState('')
  const [result, setResult] = useState('')
  const [showF, setShowF] = useState(true)
  const [fOpts, setFOpts] = useState<any>(null)
  const ref = useRef<HTMLDivElement>(null)
  const isTen = tab === 'gmTenures' || tab === 'execTenures'

  useEffect(() => { if (!isTen) fetch('/api/match-search-filters').then(r => r.json()).then(setFOpts).catch(() => {}) }, [isTen])
  const fetch_ = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ superstarId: String(superstar.id), tab, page: String(page) })
    if (year) p.set('year', year); if (year && month) p.set('month', month)
    if (ssId) p.set('showSeriesId', ssId); if (cat) p.set('category', cat); if (result) p.set('result', result)
    try { const r = await fetch(`/api/superstar-tab?${p}`); const d = await r.json(); setItems(d.items || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 0) }
    catch { setItems([]); setTotal(0) } finally { setLoading(false) }
  }, [superstar.id, tab, page, year, month, ssId, cat, result])
  useEffect(() => { fetch_() }, [fetch_])
  useEffect(() => { setPage(1); setYear(''); setMonth(''); setSsId(''); setCat(''); setResult('') }, [tab])
  const goP = (n: number) => { setPage(n); ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
  const hasF = !!(year || ssId || cat || result), fC = [year, ssId, cat, result].filter(Boolean).length

  return (
    <div ref={ref}>
      {!isTen && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-text-secondary text-sm">{loading ? 'Loading…' : `${total.toLocaleString()} result${total !== 1 ? 's' : ''}`}</p>
            <button onClick={() => setShowF(!showF)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${showF ? 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/50 border-border-subtle/30 text-text-secondary hover:text-text-white'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              {showF ? t('matches.search.hideFilters') : t('matches.search.filters')}{fC > 0 && <span className="w-5 h-5 rounded-full bg-neon-blue text-[10px] text-black font-bold flex items-center justify-center">{fC}</span>}
            </button>
          </div>
          {showF && (
            <div className="mb-5 p-4 rounded-2xl border border-border-subtle/30 bg-bg-secondary/30 backdrop-blur-sm animate-fade-in">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <FS l={t('matches.search.year')} v={year} s={v => { setYear(v); setMonth(''); setPage(1) }} o={YEARS.map(y => ({ v: String(y), l: String(y) }))} p={t('common.allYears')} />
                {year && <FS l="Month" v={month} s={v => { setMonth(v); setPage(1) }} o={MONTHS.map(m => ({ v: m.value, l: m.label }))} p={t('common.allMonths')} />}
                {fOpts?.showSeries && <FS l="Promotion" v={ssId} s={v => { setSsId(v); setPage(1) }} o={(fOpts.showSeries || []).map((s: any) => ({ v: String(s.id), l: s.name }))} p={t('common.allPromotions')} />}
                {tab === 'segments' && <FS l={t('hallOfFame.inductees.category')} v={cat} s={v => { setCat(v); setPage(1) }} o={SCATS.map(c => ({ v: c, l: `${segI[c]} ${c.replace(/_/g, ' ')}` }))} p={t('common.all')} />}
                {tab === 'managed' && <FS l={t('common.result')} v={result} s={v => { setResult(v); setPage(1) }} o={[{ v: 'win', l: 'Win' }, { v: 'loss', l: 'Loss' }, { v: 'draw', l: 'Draw' }]} p={t('common.all')} />}
              </div>
              {hasF && <div className="flex justify-end mt-3 pt-2 border-t border-border-subtle/20"><button onClick={() => { setYear(''); setMonth(''); setSsId(''); setCat(''); setResult(''); setPage(1) }} className="text-xs text-neon-pink hover:text-neon-pink/80 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Clear</button></div>}
            </div>
          )}
        </>
      )}

      {loading && items.length === 0 ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-bg-secondary/30 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-center text-text-secondary py-16">No data found.</p>
      ) : (
        <>
          <div className={`transition-opacity ${loading ? 'opacity-50' : ''}`}>
            {tab === 'managed' && (
              <div className="hidden lg:grid lg:grid-cols-[100px_minmax(120px,1fr)_140px_minmax(180px,2fr)_minmax(160px,1.5fr)_60px_60px] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-1">
                <span>{t('shows.detail.date')}</span><span>Show</span><span>{t('matches.search.matchType')}</span><span>Managed For</span><span>Opponents</span><span>{t('common.result')}</span><span>{t('common.rating')}</span>
              </div>
            )}
            {tab === 'segments' && (
              <div className="hidden lg:grid lg:grid-cols-[100px_minmax(120px,1fr)_40px_minmax(200px,2.5fr)_minmax(140px,1.5fr)] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-1">
                <span>{t('shows.detail.date')}</span><span>Show</span><span></span><span>Segment</span><span>{t('matches.detail.participants')}</span>
              </div>
            )}
            {tab === 'commentated' && (
              <div className="hidden lg:grid lg:grid-cols-[100px_minmax(200px,2fr)_minmax(200px,2fr)] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-1">
                <span>{t('shows.detail.date')}</span><span>Show</span><span>Co-Commentators</span>
              </div>
            )}
            {tab === 'matchCommentated' && (
              <div className="hidden lg:grid lg:grid-cols-[100px_minmax(120px,1fr)_140px_minmax(200px,2.5fr)_minmax(100px,1fr)] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-1">
                <span>{t('shows.detail.date')}</span><span>Show</span><span>{t('matches.search.matchType')}</span><span>Match</span><span>{t('nav.dropdown.commentators')}</span>
              </div>
            )}
            {tab === 'ringAnnounced' && (
              <div className="hidden lg:grid lg:grid-cols-[100px_1fr] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-1">
                <span>{t('shows.detail.date')}</span><span>Show</span>
              </div>
            )}
            {(tab === 'refereed' || tab === 'guestRefereed') && (
              <div className="hidden lg:grid lg:grid-cols-[100px_minmax(120px,1fr)_140px_minmax(200px,2.5fr)_60px] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-1">
                <span>{t('shows.detail.date')}</span><span>Show</span><span>{t('matches.search.matchType')}</span><span>Match</span><span>{t('common.rating')}</span>
              </div>
            )}
            {tab === 'interviewed' && (
              <div className="hidden lg:grid lg:grid-cols-[100px_minmax(120px,1fr)_minmax(200px,2.5fr)_minmax(160px,1.5fr)] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20 mb-1">
                <span>{t('shows.detail.date')}</span><span>Show</span><span>Segment</span><span>{t('matches.detail.participants')}</span>
              </div>
            )}

            <div className="space-y-0.5">
              {items.map((d, i) => {
                const k = d.id || i
                if (tab === 'segments') return <SegR key={k} d={d} />
                if (tab === 'managed') return <MgrR key={k} d={d} />
                if (tab === 'commentated') return <CommR key={k} d={d} />
                if (tab === 'matchCommentated') return <GuestCommR key={k} d={d} />
                if (tab === 'ringAnnounced') return <ShowR key={k} d={d} />
                if (tab === 'refereed' || tab === 'guestRefereed') return <RefR key={k} d={d} />
                if (tab === 'interviewed') return <IntR key={k} d={d} />
                if (tab === 'gmTenures') return <GMC key={k} d={d} />
                if (tab === 'execTenures') return <ExC key={k} d={d} />
                return null
              })}
            </div>
          </div>
          {totalPages > 1 && <Pag page={page} tp={totalPages} total={total} go={goP} />}
        </>
      )}
    </div>
  )
}

/* ======== Helpers ======== */
function D({ v }: { v: string | null }) {
  return <span className="text-xs text-text-secondary font-mono whitespace-nowrap">{v ? formatDateShort(v) : '—'}</span>
}
function Logo({ src }: { src: string }) { return <div className="w-5 h-5 shrink-0 rounded overflow-hidden"><Image src={src} alt="" width={20} height={20} className="w-full h-full object-contain" /></div> }
function Av({ p, w }: { p: any; w?: boolean }) { return <div className={`w-7 h-7 rounded-full overflow-hidden border-2 shrink-0 ${w ? 'border-emerald-500/40' : 'border-bg-primary'}`}>{p.photo_url ? <Image src={p.photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}</div> }
function Ov({ n }: { n: number }) { return <div className="w-7 h-7 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[9px] text-text-secondary shrink-0">+{n}</div> }

/* ======== SEGMENT ROW ======== */
function SegR({ d }: { d: any }) {
  return (
    <Link href={`/shows/${d.show_slug}/segments/${d.slug}`} className="group block transition-all hover:bg-bg-secondary/30 rounded-xl">
      <div className="hidden lg:grid lg:grid-cols-[100px_minmax(120px,1fr)_40px_minmax(200px,2.5fr)_minmax(140px,1.5fr)] gap-3 items-center px-4 py-3 border-b border-border-subtle/10">
        <D v={d.show_date} />
        <div className="flex items-center gap-2 min-w-0">
          {d.show_logo && <Logo src={d.show_logo} />}
          <span className="text-sm text-text-white truncate">{d.show_name}</span>
        </div>
        <span className="text-lg text-center">{segI[d.category] || '📋'}</span>
        <span className="text-sm text-neon-blue font-medium truncate group-hover:underline">{d.title}</span>
        <div className="flex items-center gap-1.5">
          {(d.participants || []).slice(0, 5).map((p: any) => (
            <div key={p.id} className="flex items-center gap-1 shrink-0">
              <Av p={p} />
              <span className="text-xs text-text-secondary hidden xl:inline truncate max-w-[80px]">{p.name}</span>
            </div>
          ))}
          {(d.participants || []).length > 5 && <Ov n={d.participants.length - 5} />}
        </div>
      </div>
      <div className="lg:hidden px-3 py-3 border-b border-border-subtle/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg shrink-0">{segI[d.category] || '📋'}</span>
          <span className="text-sm text-neon-blue font-medium truncate flex-1 group-hover:underline">{d.title}</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-text-secondary">
          {d.show_logo && <Logo src={d.show_logo} />}
          <span className="truncate">{d.show_name}</span>
          <span className="text-text-secondary/30">•</span>
          <span className="font-mono shrink-0">{d.show_date ? formatDateShort(d.show_date) : ''}</span>
        </div>
        {(d.participants || []).length > 0 && (
          <div className="flex items-center gap-1 mt-2">{d.participants.slice(0, 4).map((p: any) => <Av key={p.id} p={p} />)}{d.participants.length > 4 && <Ov n={d.participants.length - 4} />}</div>
        )}
      </div>
    </Link>
  )
}

/* ======== MANAGER ROW ======== */
function MgrR({ d }: { d: any }) {
  return (
    <Link href={`/shows/${d.show_slug}/matches/${d.slug}`} className="group block transition-all hover:bg-bg-secondary/30 rounded-xl">
      <div className="hidden lg:grid lg:grid-cols-[100px_minmax(120px,1fr)_140px_minmax(180px,2fr)_minmax(160px,1.5fr)_60px_60px] gap-3 items-center px-4 py-3 border-b border-border-subtle/10">
        <D v={d.date} />
        <div className="flex items-center gap-2 min-w-0">{d.show_logo && <Logo src={d.show_logo} />}<span className="text-sm text-text-white truncate">{d.show_name || '—'}</span></div>
        <span className="text-xs text-neon-blue font-semibold uppercase truncate">{d.match_type?.name || 'Match'}</span>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[9px] text-yellow-400 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded shrink-0">MGR</span>
          <div className="flex -space-x-1.5 shrink-0">{(d.managed_for || []).slice(0, 3).map((p: any) => <Av key={p.id} p={p} />)}</div>
          <span className="text-sm text-text-white truncate">{(d.managed_for || []).map((p: any) => p.name).join(', ')}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-neon-blue font-bold shrink-0">vs</span>
          <div className="flex -space-x-1.5 shrink-0">{(d.opponents || []).slice(0, 3).map((p: any) => <Av key={p.id} p={p} />)}</div>
          <span className="text-xs text-text-secondary truncate">{(d.opponents || []).map((p: any) => p.name).join(', ')}</span>
        </div>
        <div className="flex justify-center">
          <span className={`text-xs font-bold px-2.5 py-1 rounded border ${d.matchResult === 'win' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : d.matchResult === 'draw' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
            {d.matchResult === 'win' ? 'W' : d.matchResult === 'draw' ? 'D' : 'L'}
          </span>
        </div>
        <div className="flex justify-center">{d.rating ? <StarRating rating={d.rating} size="xs" /> : <span className="text-[10px] text-text-secondary/30">—</span>}</div>
      </div>
      <div className="lg:hidden flex items-center gap-3 px-3 py-3 border-b border-border-subtle/10">
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${d.matchResult === 'win' ? 'border-emerald-500/20 bg-emerald-500/10' : d.matchResult === 'draw' ? 'border-yellow-500/20 bg-yellow-500/10' : 'border-red-500/20 bg-red-500/10'}`}>
          <span className={`text-xs font-bold ${d.matchResult === 'win' ? 'text-emerald-400' : d.matchResult === 'draw' ? 'text-yellow-400' : 'text-red-400'}`}>{d.matchResult === 'win' ? 'W' : d.matchResult === 'draw' ? 'D' : 'L'}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] text-yellow-400 font-bold bg-yellow-500/10 px-1.5 py-0.5 rounded shrink-0">MGR</span>
            <span className="text-sm text-text-white font-medium truncate">{(d.managed_for || []).map((p: any) => p.name).join(', ')} vs {(d.opponents || []).map((p: any) => p.name).join(', ')}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {d.show_logo && <Logo src={d.show_logo} />}
            <span className="text-[11px] text-text-secondary truncate">{d.show_name}</span>
            <span className="text-[10px] text-text-secondary/50">•</span>
            <span className="text-[10px] text-text-secondary font-mono">{d.date ? formatDateShort(d.date) : ''}</span>
          </div>
        </div>
        {d.rating && <div className="shrink-0"><StarRating rating={d.rating} size="xs" /></div>}
      </div>
    </Link>
  )
}

/* ======== COMMENTATOR ROW ======== */
function CommR({ d }: { d: any }) {
  return (
    <Link href={`/shows/${d.show_slug}`} className="group block transition-all hover:bg-bg-secondary/30 rounded-xl">
      <div className="hidden lg:grid lg:grid-cols-[100px_minmax(200px,2fr)_minmax(200px,2fr)] gap-3 items-center px-4 py-3 border-b border-border-subtle/10">
        <D v={d.show_date} />
        <div className="flex items-center gap-2 min-w-0">{d.show_logo && <Logo src={d.show_logo} />}<span className="text-sm text-text-white group-hover:text-neon-blue transition-colors truncate">{d.show_name}</span></div>
        <div className="flex items-center gap-2 min-w-0">
          {d.co_commentators?.length > 0 ? (
            <><span className="text-xs text-text-secondary shrink-0">with</span>
              {d.co_commentators.slice(0, 4).map((p: any) => (
                <div key={p.id} className="flex items-center gap-1 shrink-0"><Av p={p} /><span className="text-xs text-text-secondary truncate max-w-[100px]">{p.name}</span></div>
              ))}{d.co_commentators.length > 4 && <Ov n={d.co_commentators.length - 4} />}</>
          ) : <span className="text-xs text-text-secondary/30">—</span>}
        </div>
      </div>
      <div className="lg:hidden px-3 py-3 border-b border-border-subtle/10">
        <div className="flex items-center gap-2 mb-1">{d.show_logo && <Logo src={d.show_logo} />}<span className="text-sm text-text-white group-hover:text-neon-blue transition-colors truncate flex-1">{d.show_name}</span><span className="text-[10px] text-text-secondary font-mono shrink-0">{d.show_date ? formatDateShort(d.show_date) : ''}</span></div>
        {d.co_commentators?.length > 0 && (
          <div className="flex items-center gap-1.5 mt-1.5"><span className="text-[11px] text-text-secondary">with</span>
            {d.co_commentators.slice(0, 3).map((p: any) => (<div key={p.id} className="flex items-center gap-0.5"><Av p={p} /><span className="text-[11px] text-text-secondary">{p.name}</span></div>))}
          </div>
        )}
      </div>
    </Link>
  )
}

/* ======== GUEST COMMENTARY ROW ======== */
function GuestCommR({ d }: { d: any }) {
  const m = d.match
  return (
    <Link href={m ? `/shows/${d.show_slug}/matches/${m.slug}` : `/shows/${d.show_slug}`} className="group block transition-all hover:bg-bg-secondary/30 rounded-xl">
      <div className="hidden lg:grid lg:grid-cols-[100px_minmax(120px,1fr)_140px_minmax(200px,2.5fr)_minmax(100px,1fr)] gap-3 items-center px-4 py-3 border-b border-border-subtle/10">
        <D v={d.show_date} />
        <div className="flex items-center gap-2 min-w-0">{d.show_logo && <Logo src={d.show_logo} />}<span className="text-sm text-text-white truncate">{d.show_name}</span></div>
        {m ? (
          <>
            <span className="text-xs text-neon-blue font-semibold uppercase truncate">{m.match_type || 'Match'}</span>
            <div className="flex items-center gap-1.5 min-w-0">
              {(m.teams || []).map((t: any, i: number) => (
                <span key={i} className="flex items-center gap-1 shrink-0">
                  {i > 0 && <span className="text-xs text-neon-blue font-bold mx-0.5">vs</span>}
                  <div className="flex -space-x-1.5 shrink-0">{t.members.slice(0, 2).map((p: any) => <Av key={p.id} p={p} w={t.is_winner} />)}</div>
                  <span className={`text-xs truncate max-w-[100px] ${t.is_winner ? 'text-emerald-400 font-semibold' : 'text-text-secondary'}`}>{t.members.map((p: any) => p.name).join(', ')}</span>
                </span>
              ))}
            </div>
          </>
        ) : (<><span className="text-xs text-text-secondary/30">—</span><span className="text-sm text-text-white truncate">{d.show_name}</span></>)}
        <div className="flex items-center gap-1.5 min-w-0">
          {d.official_commentators?.length > 0 ? (<><span className="text-[10px] text-text-secondary">🎧</span>{d.official_commentators.slice(0, 3).map((p: any) => <Av key={p.id} p={p} />)}</>) : <span className="text-xs text-text-secondary/30">—</span>}
        </div>
      </div>
      <div className="lg:hidden px-3 py-3 border-b border-border-subtle/10">
        <div className="flex items-center gap-2 mb-1">
          {m ? (
            <><span className="text-xs text-neon-blue font-semibold uppercase shrink-0">{m.match_type || 'Match'}</span>
              <span className="text-sm text-text-white truncate flex-1">{(m.teams || []).map((t: any) => t.members.map((p: any) => p.name).join(', ')).join(' vs ')}</span></>
          ) : (<span className="text-sm text-text-white truncate flex-1">{d.show_name}</span>)}
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">{d.show_logo && <Logo src={d.show_logo} />}<span className="truncate">{d.show_name}</span><span className="text-text-secondary/30">•</span><span className="font-mono shrink-0">{d.show_date ? formatDateShort(d.show_date) : ''}</span></div>
      </div>
    </Link>
  )
}

/* ======== SHOW ROW (ring announced) ======== */
function ShowR({ d }: { d: any }) {
  return (
    <Link href={`/shows/${d.show_slug}`} className="group block transition-all hover:bg-bg-secondary/30 rounded-xl">
      <div className="hidden lg:grid lg:grid-cols-[100px_1fr] gap-3 items-center px-4 py-3 border-b border-border-subtle/10">
        <D v={d.show_date} />
        <div className="flex items-center gap-2 min-w-0">{d.show_logo && <Logo src={d.show_logo} />}<span className="text-sm text-text-white group-hover:text-neon-blue transition-colors truncate">{d.show_name}</span></div>
      </div>
      <div className="lg:hidden flex items-center gap-2 px-3 py-3 border-b border-border-subtle/10">
        {d.show_logo && <Logo src={d.show_logo} />}
        <span className="text-sm text-text-white group-hover:text-neon-blue transition-colors truncate flex-1">{d.show_name}</span>
        <span className="text-[10px] text-text-secondary font-mono shrink-0">{d.show_date ? formatDateShort(d.show_date) : ''}</span>
      </div>
    </Link>
  )
}

/* ======== REFEREE ROW ======== */
function RefR({ d }: { d: any }) {
  return (
    <Link href={`/shows/${d.show_slug}/matches/${d.slug}`} className="group block transition-all hover:bg-bg-secondary/30 rounded-xl">
      <div className="hidden lg:grid lg:grid-cols-[100px_minmax(120px,1fr)_140px_minmax(200px,2.5fr)_60px] gap-3 items-center px-4 py-3 border-b border-border-subtle/10">
        <D v={d.date} />
        <div className="flex items-center gap-2 min-w-0">{d.show_logo && <Logo src={d.show_logo} />}<span className="text-sm text-text-white truncate">{d.show_name || '—'}</span></div>
        <span className="text-xs text-neon-blue font-semibold uppercase truncate">{d.match_type?.name || 'Match'}</span>
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {(d.teams || []).map((t: any, i: number) => (
            <span key={i} className="flex items-center gap-1 shrink-0">
              {i > 0 && <span className="text-xs text-neon-blue font-bold mx-0.5">vs</span>}
              <div className="flex -space-x-1.5 shrink-0">{t.members.slice(0, 2).map((p: any) => <Av key={p.id} p={p} w={t.is_winner} />)}</div>
              <span className={`text-xs truncate max-w-[100px] ${t.is_winner ? 'text-emerald-400 font-semibold' : 'text-text-secondary'}`}>{t.members.map((p: any) => p.name).join(', ')}</span>
            </span>
          ))}
        </div>
        <div className="flex justify-center">{d.rating ? <StarRating rating={d.rating} size="xs" /> : <span className="text-[10px] text-text-secondary/30">—</span>}</div>
      </div>
      <div className="lg:hidden px-3 py-3 border-b border-border-subtle/10">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className="text-xs text-neon-blue font-semibold uppercase shrink-0">{d.match_type?.name || 'Match'}</span>
          <span className="text-sm text-text-white truncate">{(d.teams || []).map((t: any) => t.members.map((p: any) => p.name).join(', ')).join(' vs ')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          {d.show_logo && <Logo src={d.show_logo} />}<span className="truncate">{d.show_name}</span><span className="text-text-secondary/30">•</span><span className="font-mono shrink-0">{d.date ? formatDateShort(d.date) : ''}</span>
          {d.rating && <><span className="text-text-secondary/30">•</span><StarRating rating={d.rating} size="xs" /></>}
        </div>
      </div>
    </Link>
  )
}

/* ======== INTERVIEWER ROW ======== */
function IntR({ d }: { d: any }) {
  return (
    <Link href={`/shows/${d.show_slug}/segments/${d.slug}`} className="group block transition-all hover:bg-bg-secondary/30 rounded-xl">
      <div className="hidden lg:grid lg:grid-cols-[100px_minmax(120px,1fr)_minmax(200px,2.5fr)_minmax(160px,1.5fr)] gap-3 items-center px-4 py-3 border-b border-border-subtle/10">
        <D v={d.show_date} />
        <div className="flex items-center gap-2 min-w-0">{d.show_logo && <Logo src={d.show_logo} />}<span className="text-sm text-text-white truncate">{d.show_name || '—'}</span></div>
        <span className="text-sm text-neon-blue truncate group-hover:underline">{d.title}</span>
        <div className="flex items-center gap-2 min-w-0">
          {(d.participants || []).length > 0 ? (
            <><span className="text-xs text-text-secondary shrink-0">with</span>
              {d.participants.slice(0, 4).map((p: any) => (
                <div key={p.id} className="flex items-center gap-1 shrink-0"><Av p={p} /><span className="text-xs text-text-secondary hidden xl:inline truncate max-w-[80px]">{p.name}</span></div>
              ))}{d.participants.length > 4 && <Ov n={d.participants.length - 4} />}</>
          ) : <span className="text-xs text-text-secondary/30">—</span>}
        </div>
      </div>
      <div className="lg:hidden px-3 py-3 border-b border-border-subtle/10">
        <div className="flex items-center gap-2 mb-1"><span className="text-sm text-neon-blue truncate flex-1 group-hover:underline">{d.title}</span></div>
        <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">{d.show_logo && <Logo src={d.show_logo} />}<span className="truncate">{d.show_name}</span><span className="text-text-secondary/30">•</span><span className="font-mono shrink-0">{d.show_date ? formatDateShort(d.show_date) : ''}</span></div>
        {(d.participants || []).length > 0 && (
          <div className="flex items-center gap-1 mt-1.5"><span className="text-[11px] text-text-secondary">with</span>
            {d.participants.slice(0, 3).map((p: any) => (<div key={p.id} className="flex items-center gap-0.5"><Av p={p} /><span className="text-[11px] text-text-secondary">{p.name}</span></div>))}
            {d.participants.length > 3 && <Ov n={d.participants.length - 3} />}
          </div>
        )}
      </div>
    </Link>
  )
}

/* ======== GM CARD ======== */
function GMC({ d }: { d: any }) {
  return <div className="relative rounded-2xl border border-border-subtle/20 bg-gradient-to-br from-bg-secondary/50 via-bg-secondary/20 to-transparent overflow-hidden mb-8">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-neon-blue/70 to-transparent" />
    <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
      {d.photo_url ? (
        <div className="relative w-40 h-52 sm:w-48 sm:h-60 rounded-2xl overflow-hidden border-2 border-neon-blue/30 shrink-0 bg-bg-tertiary shadow-neon-blue"><Image src={d.photo_url} alt="" fill className="object-cover object-top" sizes="192px" unoptimized /></div>
      ) : d.show_series?.logo_url ? (
        <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-2xl bg-bg-tertiary/80 border border-border-subtle/30 p-4 flex items-center justify-center"><Image src={d.show_series.logo_url} alt="" width={120} height={120} className="w-full h-full object-contain" /></div>
      ) : null}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start mb-3">
          <h3 className="font-display text-2xl sm:text-4xl font-bold text-neon-blue">{d.title || 'General Manager'}</h3>
          {d.brand_name && <span className="text-sm px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-medium">{d.brand_name}</span>}
        </div>
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <span className="text-base text-text-secondary font-mono">{d.start_date}</span><span className="text-neon-blue text-lg">→</span><span className="text-base text-text-secondary font-mono">{d.end_date || t('common.present')}</span>
          <span className="text-neon-blue text-base font-bold">({fD(d.start_date, d.end_date)})</span>
        </div>
        {d.description && <p className="text-base text-text-secondary/80 mt-5 leading-relaxed max-w-2xl">{d.description}</p>}
        {d.notes && !d.description && <p className="text-sm text-text-secondary/50 mt-4 italic">{d.notes}</p>}
      </div>
    </div>
  </div>
}

/* ======== EXEC CARD ======== */
function ExC({ d }: { d: any }) {
  return <div className="relative rounded-2xl border border-border-subtle/20 bg-gradient-to-br from-bg-secondary/50 via-bg-secondary/20 to-transparent overflow-hidden mb-8">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-yellow-500/60 to-transparent" />
    <div className="p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
      {d.photo_url && (<div className="relative w-40 h-52 sm:w-48 sm:h-60 rounded-2xl overflow-hidden border-2 border-yellow-500/20 shrink-0 bg-bg-tertiary"><Image src={d.photo_url} alt="" fill className="object-cover object-top" sizes="192px" unoptimized /></div>)}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h3 className="font-display text-2xl sm:text-4xl font-bold text-text-white mb-3">{d.title || 'Executive'}</h3>
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <span className="text-base text-text-secondary font-mono">{d.start_date}</span><span className="text-yellow-400 text-lg">→</span><span className="text-base text-text-secondary font-mono">{d.end_date || t('common.present')}</span>
          <span className="text-yellow-400 text-base font-bold">({fD(d.start_date, d.end_date)})</span>
        </div>
        {d.description && <p className="text-base text-text-secondary/80 mt-5 leading-relaxed max-w-2xl">{d.description}</p>}
        {d.notes && !d.description && <p className="text-sm text-text-secondary/50 mt-4 italic">{d.notes}</p>}
      </div>
    </div>
  </div>
}

/* ======== HELPERS ======== */
function fD(s: string|null, e: string|null) { if (!s) return ''; const sd=new Date(s+'T00:00:00'),ed=e?new Date(e+'T00:00:00'):new Date(); const d=Math.floor((ed.getTime()-sd.getTime())/86400000); if(d<31)return `${d}d`; const m=Math.floor(d/30.44); if(m<12)return `${m}mo`; const y=Math.floor(m/12),r=m%12; return r>0?`${y}y ${r}mo`:`${y}y` }

function Pag({page,tp,total,go}:{page:number;tp:number;total:number;go:(n:number)=>void}){
  const vis=()=>{const p:(number|'e')[]=[];if(tp<=7){for(let i=1;i<=tp;i++)p.push(i)}else{p.push(1);if(page>3)p.push('e');for(let i=Math.max(2,page-1);i<=Math.min(tp-1,page+1);i++)p.push(i);if(page<tp-2)p.push('e');p.push(tp)};return p}
  return<div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20"><p className="text-xs text-text-secondary">Page {page}/{tp} — {total} results</p><div className="flex items-center gap-1">
    <button onClick={()=>go(page-1)} disabled={page===1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg></button>
    {vis().map((p,i)=>p==='e'?<span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span>:<button key={p} onClick={()=>go(p as number)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p===page?'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue':'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{p}</button>)}
    <button onClick={()=>go(page+1)} disabled={page===tp} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg></button>
  </div></div>
}

function FS({l,v,s,o,p}:{l:string;v:string;s:(v:string)=>void;o:{v:string;l:string}[];p:string}){
  return<div className="flex flex-col gap-1"><label className="text-[10px] text-text-secondary uppercase tracking-wider font-medium">{l}</label>
    <select value={v} onChange={e=>s(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg-primary border border-border-subtle/40 text-sm text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
      style={{backgroundImage:`url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,backgroundPosition:'right 8px center',backgroundRepeat:'no-repeat',backgroundSize:'16px',paddingRight:'32px'}}>
      <option value="">{p}</option>{o.map(x=><option key={x.v} value={x.v}>{x.l}</option>)}</select></div>
}
