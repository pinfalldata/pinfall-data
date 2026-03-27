'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


interface Championship { id: number; name: string; slug: string; image_url: string | null; status: string; introduced_date: string | null; retired_date: string | null; brand: string | null; sort_order: number; description_md: string | null; current_holder: any | null; current_reign_start: string | null }
interface Era { id: number; name: string; slug: string; start_year: number; end_year: number | null }

function formatDate(d: string | null) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

/* ===== Superstar autocomplete ===== */
function SSrch({ value, onSel, onClr }: { value: string; onSel: (id: string, n: string) => void; onClr: () => void }) {
  const [q, setQ] = useState('')
  const [res, setRes] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const db = useRef<NodeJS.Timeout>()
  const cRef = useRef<HTMLDivElement>(null)
  useEffect(() => { const h = (e: MouseEvent) => {
  const t = useTranslations()
 if (cRef.current && !cRef.current.contains(e.target as Node)) setOpen(false) }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h) }, [])
  const search = (v: string) => {
    setQ(v); if (v.length < 2) { setRes([]); setOpen(false); return }
    clearTimeout(db.current)
    db.current = setTimeout(async () => {
      try { const r = await fetch(`/api/search-superstars?q=${encodeURIComponent(v)}`); const d = await r.json(); setRes(d.results || []); setOpen(true) } catch { setRes([]) }
    }, 300)
  }
  return (
    <div ref={cRef} className="relative flex-1 w-full sm:max-w-xs">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      <input type="text" value={q} onChange={e => search(e.target.value)} onFocus={() => res.length > 0 && setOpen(true)} placeholder="Filter by superstar..."
        className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-8 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none transition-colors" />
      {value && <button onClick={() => { onClr(); setQ(''); setRes([]); setOpen(false) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-white z-10"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
      {open && res.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-bg-secondary border border-border-subtle/40 rounded-xl overflow-hidden shadow-xl z-50 max-h-48 overflow-y-auto">
          {res.map((s: any) => (
            <button key={s.id} onClick={() => { onSel(String(s.id), s.name); setQ(s.name); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-white hover:bg-bg-tertiary transition-colors text-left">
              {s.photo_url && <div className="w-6 h-6 rounded-full overflow-hidden shrink-0"><Image src={s.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /></div>}
              <span className="truncate">{s.name}</span>
              {s.matchedVia && <span className="text-[10px] text-text-secondary ml-auto shrink-0">({s.matchedVia})</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function TitleVaultPage() {
  const t = useTranslations()
  const [championships, setChampionships] = useState<Championship[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'retired'>('all')
  const [search, setSearch] = useState('')
  const [superstarId, setSuperstarId] = useState('')
  const [superstarName, setSuperstarName] = useState('')
  const [filteredBySuper, setFilteredBySuper] = useState<number[] | null>(null)
  const [eras, setEras] = useState<Era[]>([])
  const [selectedEra, setSelectedEra] = useState('')
  const [gender, setGender] = useState('')
  const [genderFilteredIds, setGenderFilteredIds] = useState<number[] | null>(null)

  useEffect(() => {
    fetch('/api/championship-list-all').then(r => r.json()).then(d => setChampionships(d.championships || [])).catch(() => {}).finally(() => setLoading(false))
    fetch('/api/eras').then(r => r.json()).then(d => setEras(d.eras || [])).catch(() => {})
  }, [])

  // Superstar filter
  useEffect(() => {
    if (!superstarId) { setFilteredBySuper(null); return }
    fetch(`/api/championship-list-all?superstarId=${superstarId}`).then(r => r.json()).then(d => { if (d.filteredIds) setFilteredBySuper(d.filteredIds) }).catch(() => {})
  }, [superstarId])

  // Gender filter
  useEffect(() => {
    if (!gender) { setGenderFilteredIds(null); return }
    fetch(`/api/championship-list-all?gender=${gender}`).then(r => r.json()).then(d => { if (d.genderFilteredIds) setGenderFilteredIds(d.genderFilteredIds) }).catch(() => {})
  }, [gender])

  const sorted = useMemo(() => {
    let list = [...championships]
    if (filter === 'active') list = list.filter(c => c.status === 'active')
    if (filter === 'retired') list = list.filter(c => c.status === 'retired')
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    if (filteredBySuper !== null) list = list.filter(c => filteredBySuper.includes(c.id))
    if (genderFilteredIds !== null) list = list.filter(c => genderFilteredIds.includes(c.id))
    if (selectedEra) {
      const era = eras.find(e => String(e.id) === selectedEra)
      if (era) {
        list = list.filter(c => {
          if (!c.introduced_date) return true
          const introY = new Date(c.introduced_date + 'T00:00:00').getFullYear()
          const retiredY = c.retired_date ? new Date(c.retired_date + 'T00:00:00').getFullYear() : new Date().getFullYear()
          const eraEnd = era.end_year || new Date().getFullYear()
          return introY <= eraEnd && retiredY >= era.start_year
        })
      }
    }
    list.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1
      if (a.status !== 'active' && b.status === 'active') return 1
      const aD = a.introduced_date || '9999'; const bD = b.introduced_date || '9999'
      return aD.localeCompare(bD)
    })
    return list
  }, [championships, filter, search, filteredBySuper, genderFilteredIds, selectedEra, eras])

  const activeList = sorted.filter(c => c.status === 'active')
  const retiredList = sorted.filter(c => c.status !== 'active')
  const hasFilters = !!(search || superstarId || selectedEra || gender || filter !== 'all')

  return (
    <div className="relative min-h-screen">
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20champions/qffuupl2lpdd1.jpeg" alt={t('champions.titleVault.title')} fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <nav className="hidden sm:flex items-center gap-2 text-xs text-text-secondary mb-3"><Link href="/champions" className="hover:text-neon-blue transition-colors">Champions</Link><span className="text-border-subtle">/</span><span className="text-neon-blue">{t('champions.titleVault.title')}</span></nav>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">The <span className="text-neon-blue">Title Vault</span></h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">Every championship in WWE history — past and present.</p>
        </div>
      </section>

      {/* ===== FILTERS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap">
            {/* Championship search */}
            <div className="relative flex-1 w-full sm:max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search championship..." value={search} onChange={e => setSearch(e.target.value)}
                className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none transition-colors" />
            </div>
            {/* Superstar autocomplete */}
            <SSrch value={superstarName} onSel={(id, n) => { setSuperstarId(id); setSuperstarName(n) }} onClr={() => { setSuperstarId(''); setSuperstarName('') }} />
            {/* Era dropdown */}
            <select value={selectedEra} onChange={e => setSelectedEra(e.target.value)}
              className="bg-bg-tertiary border border-border-subtle/30 rounded-xl px-4 py-2.5 text-xs text-text-white focus:border-neon-blue/50 focus:outline-none transition-colors appearance-none cursor-pointer min-w-[140px]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
              <option value="">{t('common.allEras')}</option>
              {eras.map(era => <option key={era.id} value={String(era.id)}>{era.name}</option>)}
            </select>
            {/* Gender filter */}
            <select value={gender} onChange={e => setGender(e.target.value)}
              className="bg-bg-tertiary border border-border-subtle/30 rounded-xl px-4 py-2.5 text-xs text-text-white focus:border-neon-blue/50 focus:outline-none transition-colors appearance-none cursor-pointer min-w-[120px]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23666' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px', paddingRight: '32px' }}>
              <option value="">{t('common.allGenders')}</option>
              <option value="male">Men&apos;s Titles</option>
              <option value="female">Women&apos;s Titles</option>
            </select>
            {/* Status pills */}
            <div className="flex items-center gap-1">
              {(['all', 'active', 'retired'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${filter === f ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>
                  {f === 'all' ? t('common.all') : f === 'active' ? '🟢 Active' : '🔴 Retired'}
                </button>
              ))}
            </div>
          </div>
          {hasFilters && (
            <div className="flex justify-end"><button onClick={() => { setSearch(''); setSuperstarId(''); setSuperstarName(''); setSelectedEra(''); setGender(''); setFilter('all') }} className="text-xs text-neon-pink hover:text-neon-pink/80 flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>Clear all filters</button></div>
          )}
        </div>
      </section>

      {/* ===== CHAMPIONSHIP GRID ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
        ) : (
          <>
            {activeList.length > 0 && (
              <div className="mb-10">
                {(filter === 'all' || !filter) && <div className="flex items-center gap-3 mb-5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" /><h2 className="font-display text-lg font-bold text-text-white uppercase tracking-wide">Active Championships</h2><span className="text-text-secondary text-xs">({activeList.length})</span></div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{activeList.map(c => <ChampCard key={c.id} c={c} />)}</div>
              </div>
            )}
            {retiredList.length > 0 && (
              <div>
                {(filter === 'all' || !filter) && <div className="flex items-center gap-3 mb-5"><h2 className="font-display text-lg font-bold text-text-white uppercase tracking-wide">Retired Championships</h2><span className="text-text-secondary text-xs">({retiredList.length})</span></div>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{retiredList.map(c => <ChampCard key={c.id} c={c} />)}</div>
              </div>
            )}
            {sorted.length === 0 && <p className="text-center text-text-secondary py-16">No championships found.</p>}
          </>
        )}
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">The <span className="text-neon-blue">Title Vault</span> — Every WWE Championship</h2>
          <p className="text-text-secondary text-sm leading-relaxed">Browse the complete collection of every championship in WWE history. Filter by era, superstar, or status to find any title from the Golden Era to the modern day. Click on any championship to explore its full history, every reign, and detailed statistics on Pinfall Data.</p>
        </div>
      </section>
    </div>
  )
}

function ChampCard({ c }: { c: Championship }) {
  const t = useTranslations()
  return (
    <Link href={`/champions/${c.slug}`} className="group relative rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 overflow-hidden transition-all hover:border-neon-blue/30 hover:shadow-lg hover:shadow-neon-blue/5">
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative h-36 flex items-center justify-center bg-gradient-to-b from-bg-tertiary/40 to-transparent p-4">
        {c.image_url ? <Image src={c.image_url} alt={c.name} width={280} height={180} className="max-h-full w-auto object-contain group-hover:scale-105 transition-transform duration-300" /> : <span className="text-4xl opacity-20">🏆</span>}
        {c.status === 'active' && <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">{t('common.active')}</span></div>}
      </div>
      <div className="p-4">
        <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors">{c.name}</h3>
        {c.brand && <p className="text-[10px] text-text-secondary mt-0.5 uppercase tracking-wider">{c.brand}</p>}
        <div className="flex items-center gap-2 mt-2 text-[10px] text-text-secondary">
          {c.introduced_date && <span>Est. {formatDate(c.introduced_date)}</span>}
          {c.retired_date && <><span className="text-text-secondary/30">•</span><span>Retired {formatDate(c.retired_date)}</span></>}
        </div>
      </div>
    </Link>
  )
}
