'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { StarRating } from '@/components/ui/StarRating'
import { formatDateShort } from '@/lib/utils'

const PER = 50
const NOW_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: NOW_YEAR - 1953 + 1 }, (_, i) => NOW_YEAR - i)

const segmentIcons: Record<string, string> = {
  in_ring_segment: '🎤', backstage: '🚪', interference: '⚡', ceremony: '🏆',
  authority: '👔', psychology: '🧠', props_spectacle: '🎪', medical_injury: '🏥',
  musical: '🎵', fan_engagement: '📣', broadcast: '📺', digital: '💻',
  interview: '🎙️', promo: '📢', entrance: '🎵', video_package: '📹',
  announcement: '📣', other: '📋',
}

const SEGMENT_CATS = [
  'in_ring_segment','backstage','interference','ceremony','authority','psychology',
  'props_spectacle','medical_injury','musical','fan_engagement','broadcast','digital',
  'interview','promo','entrance','video_package','announcement','other',
]

/* ============================================================ */
export default function TabRoleData({ superstar, tab }: { superstar: any; tab: string }) {
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState('')
  const [showSeriesId, setShowSeriesId] = useState('')
  const [category, setCategory] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const isTenure = tab === 'gmTenures' || tab === 'execTenures'

  const fetchData = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ superstarId: String(superstar.id), tab, page: String(page) })
    if (year) p.set('year', year)
    if (showSeriesId) p.set('showSeriesId', showSeriesId)
    if (category) p.set('category', category)
    try {
      const r = await fetch(`/api/superstar-tab?${p}`)
      const d = await r.json()
      setItems(d.items || []); setTotal(d.total || 0); setTotalPages(d.totalPages || 0)
    } catch { setItems([]); setTotal(0) }
    finally { setLoading(false) }
  }, [superstar.id, tab, page, year, showSeriesId, category])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1); setYear(''); setShowSeriesId(''); setCategory('') }, [tab])

  const goP = (n: number) => { setPage(n); ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  return (
    <div ref={ref}>
      {/* Filters (not for tenures) */}
      {!isTenure && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <FSel value={year} set={v => { setYear(v); setPage(1) }} opts={YEARS.map(y => ({ value: String(y), label: String(y) }))} ph="Year" />
          {tab === 'segments' && (
            <FSel value={category} set={v => { setCategory(v); setPage(1) }}
              opts={SEGMENT_CATS.map(c => ({ value: c, label: `${segmentIcons[c] || ''} ${c.replace(/_/g, ' ')}` }))} ph="Category" />
          )}
          <span className="text-xs text-text-secondary ml-auto">{loading ? 'Loading…' : `${total} result${total !== 1 ? 's' : ''}`}</span>
        </div>
      )}

      {/* Items */}
      {loading && items.length === 0 ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-bg-secondary/30 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <p className="text-center text-text-secondary py-12">No data found.</p>
      ) : (
        <>
          <div className={`space-y-1 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
            {items.map((item, i) => (
              <div key={item.id || i}>
                {tab === 'segments' && <SegmentRow item={item} />}
                {tab === 'managed' && <ManagedRow item={item} showSlug={superstar.show?.slug} />}
                {(tab === 'commentated' || tab === 'matchCommentated') && <ShowRow item={item} label={tab === 'matchCommentated' ? 'Guest commented' : 'Commented'} />}
                {tab === 'ringAnnounced' && <ShowRow item={item} label="Announced" />}
                {(tab === 'refereed' || tab === 'guestRefereed') && <MatchRow item={item} />}
                {tab === 'interviewed' && <InterviewRow item={item} />}
                {tab === 'gmTenures' && <GMRow item={item} />}
                {tab === 'execTenures' && <ExecRow item={item} />}
              </div>
            ))}
          </div>
          {totalPages > 1 && <Pag page={page} tp={totalPages} total={total} go={goP} />}
        </>
      )}
    </div>
  )
}

/* ============================================================ ROW RENDERERS */

function SegmentRow({ item }: { item: any }) {
  const icon = segmentIcons[item.category] || '📋'
  const catLabel = item.category?.replace(/_/g, ' ') || ''
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg-secondary/30 transition-all">
      <span className="text-xs text-text-secondary font-mono w-[72px] shrink-0">{item.show_date ? formatDateShort(item.show_date) : '—'}</span>
      {item.show_logo && <div className="w-5 h-5 shrink-0"><Image src={item.show_logo} alt="" width={20} height={20} className="w-full h-full object-contain" /></div>}
      <Link href={`/shows/${item.show_slug}`} className="text-xs text-text-white hover:text-neon-blue truncate max-w-[120px] shrink-0">{item.show_name || '—'}</Link>
      <span className="text-xs shrink-0" title={catLabel}>{icon}</span>
      <span className="text-xs text-neon-blue font-medium truncate flex-1">{item.title}</span>
      {/* Participants (other) */}
      <div className="hidden sm:flex -space-x-1.5 shrink-0">
        {(item.participants || []).slice(0, 4).map((p: any) => (
          <Link key={p.id} href={`/superstars/${p.slug}`} className="w-6 h-6 rounded-full overflow-hidden border border-bg-primary" title={p.name}>
            {p.photo_url ? <Image src={p.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}
          </Link>
        ))}
        {(item.participants || []).length > 4 && <span className="w-6 h-6 rounded-full bg-bg-tertiary border border-bg-primary flex items-center justify-center text-[8px] text-text-secondary">+{item.participants.length - 4}</span>}
      </div>
    </div>
  )
}

function ManagedRow({ item }: { item: any }) {
  return (
    <div className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-bg-secondary/30 transition-all">
      <span className="text-xs text-text-secondary font-mono w-[72px] shrink-0">{item.date ? formatDateShort(item.date) : '—'}</span>
      {item.show_logo && <div className="w-5 h-5 shrink-0"><Image src={item.show_logo} alt="" width={20} height={20} className="w-full h-full object-contain" /></div>}
      <span className="text-xs text-text-white truncate max-w-[100px] shrink-0">{item.show_name || '—'}</span>
      <span className="text-[10px] text-neon-blue font-semibold uppercase shrink-0">{item.match_type?.name || 'Match'}</span>
      {/* Managed for */}
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-[9px] text-text-secondary">🎩</span>
        {(item.managed_for || []).slice(0, 3).map((p: any) => (
          <Link key={p.id} href={`/superstars/${p.slug}`} className="flex items-center gap-1 hover:text-neon-blue">
            {p.photo_url && <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"><Image src={p.photo_url} alt="" width={20} height={20} className="w-full h-full object-cover" /></div>}
            <span className="text-[11px] text-text-white truncate max-w-[80px]">{p.name}</span>
          </Link>
        ))}
      </div>
      <span className="text-[10px] text-neon-blue mx-1 shrink-0">vs</span>
      {/* Opponents */}
      <div className="hidden sm:flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
        {(item.opponents || []).slice(0, 3).map((p: any) => (
          <span key={p.id} className="text-[11px] text-text-secondary truncate">{p.name}</span>
        ))}
      </div>
      <div className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${item.is_win ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
        {item.is_win ? 'W' : 'L'}
      </div>
      {item.rating && <div className="shrink-0"><StarRating rating={item.rating} size="xs" /></div>}
    </div>
  )
}

function ShowRow({ item, label }: { item: any; label: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg-secondary/30 transition-all">
      <span className="text-xs text-text-secondary font-mono w-[72px] shrink-0">{item.show_date ? formatDateShort(item.show_date) : '—'}</span>
      {item.show_logo && <div className="w-5 h-5 shrink-0"><Image src={item.show_logo} alt="" width={20} height={20} className="w-full h-full object-contain" /></div>}
      <Link href={`/shows/${item.show_slug}`} className="text-sm text-text-white hover:text-neon-blue truncate flex-1">{item.show_name || '—'}</Link>
      {/* Co-commentators */}
      {item.co_commentators && item.co_commentators.length > 0 && (
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-text-secondary">with</span>
          {item.co_commentators.slice(0, 3).map((p: any) => (
            <Link key={p.id} href={`/superstars/${p.slug}`} className="flex items-center gap-1 hover:text-neon-blue">
              {p.photo_url && <div className="w-5 h-5 rounded-full overflow-hidden"><Image src={p.photo_url} alt="" width={20} height={20} className="w-full h-full object-cover" /></div>}
              <span className="text-[11px] text-text-secondary hover:text-neon-blue">{p.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function MatchRow({ item }: { item: any }) {
  const teams = item.teams || []
  return (
    <div className="flex items-center gap-2 px-3 py-3 rounded-xl hover:bg-bg-secondary/30 transition-all">
      <span className="text-xs text-text-secondary font-mono w-[72px] shrink-0">{item.date ? formatDateShort(item.date) : '—'}</span>
      {item.show_logo && <div className="w-5 h-5 shrink-0"><Image src={item.show_logo} alt="" width={20} height={20} className="w-full h-full object-contain" /></div>}
      <span className="text-xs text-text-white truncate max-w-[100px] shrink-0">{item.show_name || '—'}</span>
      <span className="text-[10px] text-neon-blue font-semibold uppercase shrink-0">{item.match_type?.name || 'Match'}</span>
      <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
        {teams.map((t: any, i: number) => (
          <span key={i} className="flex items-center gap-1 shrink-0">
            {i > 0 && <span className="text-[10px] text-neon-blue font-bold mx-0.5">vs</span>}
            <div className="flex -space-x-1 shrink-0">
              {t.members.slice(0, 3).map((p: any) => (
                <div key={p.id} className={`w-6 h-6 rounded-full overflow-hidden border-2 ${t.is_winner ? 'border-emerald-500/40' : 'border-bg-primary'}`}>
                  {p.photo_url ? <Image src={p.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}
                </div>
              ))}
            </div>
            <span className={`text-[11px] truncate max-w-[100px] ${t.is_winner ? 'text-emerald-400 font-semibold' : 'text-text-secondary'}`}>
              {t.members.map((p: any) => p.name).join(', ')}
            </span>
          </span>
        ))}
      </div>
      {item.rating && <div className="shrink-0"><StarRating rating={item.rating} size="xs" /></div>}
    </div>
  )
}

function InterviewRow({ item }: { item: any }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-bg-secondary/30 transition-all">
      <span className="text-xs text-text-secondary font-mono w-[72px] shrink-0">{item.show_date ? formatDateShort(item.show_date) : '—'}</span>
      {item.show_logo && <div className="w-5 h-5 shrink-0"><Image src={item.show_logo} alt="" width={20} height={20} className="w-full h-full object-contain" /></div>}
      <Link href={`/shows/${item.show_slug}`} className="text-xs text-text-white hover:text-neon-blue truncate max-w-[120px] shrink-0">{item.show_name || '—'}</Link>
      <span className="text-xs text-neon-blue truncate flex-1">{item.title}</span>
      {(item.interviewees || []).length > 0 && (
        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-text-secondary">with</span>
          {item.interviewees.slice(0, 3).map((p: any) => (
            <Link key={p.id} href={`/superstars/${p.slug}`} className="flex items-center gap-1">
              {p.photo_url && <div className="w-5 h-5 rounded-full overflow-hidden"><Image src={p.photo_url} alt="" width={20} height={20} className="w-full h-full object-cover" /></div>}
              <span className="text-[11px] text-text-secondary hover:text-neon-blue">{p.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function GMRow({ item }: { item: any }) {
  const dur = formatDuration(item.start_date, item.end_date)
  return (
    <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/20 p-5 sm:p-6 mb-4">
      <div className="flex items-start gap-4">
        {item.show_series?.logo_url && (
          <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-bg-tertiary border border-border-subtle/20 p-1">
            <Image src={item.show_series.logo_url} alt="" width={48} height={48} className="w-full h-full object-contain" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-base sm:text-lg font-bold text-text-white">
            {item.title || 'General Manager'}
            {item.brand_name && <span className="text-neon-blue ml-2">— {item.brand_name}</span>}
          </h3>
          <p className="text-xs text-text-secondary mt-1">
            {item.start_date} → {item.end_date || 'Present'}
            <span className="text-neon-blue ml-2">({dur})</span>
          </p>
          {item.description && <p className="text-sm text-text-secondary mt-3 leading-relaxed">{item.description}</p>}
        </div>
      </div>
    </div>
  )
}

function ExecRow({ item }: { item: any }) {
  const dur = formatDuration(item.start_date, item.end_date)
  return (
    <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/20 p-5 sm:p-6 mb-4">
      <div className="flex-1">
        <h3 className="font-display text-base sm:text-lg font-bold text-text-white">{item.title || 'Executive'}</h3>
        <p className="text-xs text-text-secondary mt-1">
          {item.start_date} → {item.end_date || 'Present'}
          <span className="text-neon-blue ml-2">({dur})</span>
        </p>
        {item.description && <p className="text-sm text-text-secondary mt-3 leading-relaxed">{item.description}</p>}
      </div>
    </div>
  )
}

/* ============================================================ HELPERS */
function formatDuration(start: string | null, end: string | null): string {
  if (!start) return ''
  const s = new Date(start + 'T00:00:00')
  const e = end ? new Date(end + 'T00:00:00') : new Date()
  const diffMs = e.getTime() - s.getTime()
  const days = Math.floor(diffMs / 86400000)
  if (days < 31) return `${days} day${days !== 1 ? 's' : ''}`
  const months = Math.floor(days / 30.44)
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''}`
  const years = Math.floor(months / 12)
  const remMonths = months % 12
  return remMonths > 0 ? `${years}y ${remMonths}m` : `${years} year${years !== 1 ? 's' : ''}`
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
      <p className="text-xs text-text-secondary">Page {page}/{tp} — {total} results</p>
      <div className="flex items-center gap-1">
        <button onClick={() => go(page - 1)} disabled={page === 1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        {vis().map((p, i) => p === 'e' ? <span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span> :
          <button key={p} onClick={() => go(p as number)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue' : 'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{p}</button>)}
        <button onClick={() => go(page + 1)} disabled={page === tp} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
      </div>
    </div>
  )
}

function FSel({ value, set, opts, ph }: { value: string; set: (v: string) => void; opts: { value: string; label: string }[]; ph: string }) {
  return (
    <select value={value} onChange={e => set(e.target.value)}
      className="px-3 py-1.5 rounded-lg bg-bg-secondary/50 border border-border-subtle/30 text-xs text-text-white focus:outline-none focus:border-neon-blue/50 transition-colors appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 6px center', backgroundRepeat: 'no-repeat', backgroundSize: '14px', paddingRight: '26px' }}>
      <option value="">{ph}</option>
      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}
