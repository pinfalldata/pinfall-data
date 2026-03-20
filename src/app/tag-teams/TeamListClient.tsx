'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Props { type: 'tag_team' | 'stable'; title: string; subtitle: string; heroImage: string }

function fmt(d: string | null) { if (!d) return ''; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) }

export default function TeamListClient({ type, title, subtitle, heroImage }: Props) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const endpoint = type === 'tag_team' ? '/api/tag-teams-list' : '/api/stables-list'
  const basePath = type === 'tag_team' ? '/tag-teams/teams' : '/tag-teams/stables'

  const fetchData = useCallback(async (p: number) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p) })
    if (search) params.set('search', search)
    if (activeFilter) params.set('active', activeFilter)
    try {
      const r = await fetch(`${endpoint}?${params}`)
      const d = await r.json()
      setItems(d.teams || d.stables || [])
      setTotal(d.total || 0)
      setTotalPages(d.totalPages || 0)
      setPage(d.page || 1)
    } catch {}
    setLoading(false)
  }, [endpoint, search, activeFilter])

  useEffect(() => { fetchData(1) }, [fetchData])

  const goPage = (n: number) => { fetchData(n); scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  return (
    <div className="min-h-screen bg-bg-primary" ref={scrollRef}>
      {/* HERO */}
      <section className="relative w-full h-[260px] sm:h-[360px] lg:h-[440px] xl:h-[500px] overflow-hidden">
        <Image src={heroImage} alt={title} fill priority sizes="100vw" quality={100} unoptimized className="object-cover" style={{ objectPosition: 'center 25%' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/20 via-transparent to-bg-primary/20" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <nav className="hidden sm:flex items-center gap-2 text-xs text-text-secondary mb-3">
            <Link href="/tag-teams" className="hover:text-neon-blue transition-colors">Tag Teams & Stables</Link>
            <span className="text-border-subtle">/</span>
            <span className="text-neon-blue">{title}</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            {title.split(' ').map((w, i, a) => i === a.length - 1 ? <span key={i} className="text-neon-blue">{w}</span> : <span key={i}>{w} </span>)}
          </h1>
          <p className="text-text-secondary text-sm sm:text-base text-center max-w-2xl">{subtitle}</p>
        </div>
      </section>

      {/* FILTERS */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder={`Search ${type === 'tag_team' ? 'tag teams' : 'stables'}...`} value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="w-full bg-bg-tertiary border border-border-subtle/30 rounded-xl pl-10 pr-4 py-2.5 text-xs text-text-white placeholder-text-secondary focus:border-neon-blue/50 focus:outline-none" />
          </div>
          <div className="flex items-center gap-1.5">
            {['', 'true', 'false'].map(v => (
              <button key={v} onClick={() => { setActiveFilter(v); setPage(1) }}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${activeFilter === v ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>
                {v === '' ? 'All' : v === 'true' ? '🟢 Active' : '⚪ Inactive'}
              </button>
            ))}
          </div>
        </div>
        <p className="text-text-secondary text-xs mt-3">{loading ? 'Loading...' : `${total} ${type === 'tag_team' ? 'tag team' : 'stable'}${total !== 1 ? 's' : ''}`}</p>
      </section>

      {/* GRID */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => <div key={i} className="h-56 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20"><p className="text-text-secondary text-lg">None found</p></div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(item => <TeamCard key={item.id} item={item} basePath={basePath} />)}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
                <p className="text-xs text-text-secondary">Page {page} of {totalPages}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => goPage(page - 1)} disabled={page === 1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                  <button onClick={() => goPage(page + 1)} disabled={page >= totalPages} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary disabled:opacity-30"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* SEO */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3"><span className="text-neon-blue">{title}</span> — Complete Database</h2>
          <p className="text-text-secondary text-sm leading-relaxed">Browse every {title.toLowerCase()} with rosters, match records, statistics and more on Pinfall Data.</p>
        </div>
      </section>
    </div>
  )
}

function TeamCard({ item, basePath }: { item: any; basePath: string }) {
  const members = (item.members || []).map((m: any) => m.superstar).filter(Boolean)
  return (
    <Link href={`${basePath}/${item.slug}`} className="group relative flex flex-col rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 hover:bg-bg-secondary/25 card-glow">
      <div className="relative h-40 sm:h-44 overflow-hidden bg-bg-tertiary/30">
        {item.photo_url ? (
          <Image src={item.photo_url} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><span className="text-5xl opacity-15">👥</span></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 via-transparent to-transparent" />

        {/* Member photos stacked */}
        {members.length > 0 && (
          <div className="absolute bottom-2 left-2 flex -space-x-1.5">
            {members.slice(0, 5).map((s: any) => (
              <div key={s.id} className="w-7 h-7 rounded-full overflow-hidden border-2 border-bg-primary bg-bg-tertiary shrink-0">
                {s.photo_url ? <Image src={s.photo_url} alt={s.name} width={28} height={28} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[8px]">👤</div>}
              </div>
            ))}
            {members.length > 5 && <div className="w-7 h-7 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[9px] text-text-secondary font-bold">+{members.length - 5}</div>}
          </div>
        )}

        {/* Status + date */}
        <div className="absolute top-2 right-2 flex items-center gap-1">
          {item.is_active && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
          {item.formed_date && <span className="text-[9px] text-text-secondary/80 font-mono bg-bg-primary/70 backdrop-blur-sm px-1.5 py-0.5 rounded">{fmt(item.formed_date)}</span>}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors">{item.name}</h3>
        {item.formed_date && (
          <p className="text-[10px] text-text-secondary mt-1">
            {fmt(item.formed_date)} — {item.split_date ? fmt(item.split_date) : 'Present'}
          </p>
        )}
        <div className="mt-auto pt-3 flex items-center justify-between">
          <span className="text-[10px] text-text-secondary">{members.length} member{members.length !== 1 ? 's' : ''}</span>
          <span className="text-[10px] text-neon-blue font-medium group-hover:translate-x-1 transition-transform">View →</span>
        </div>
      </div>
    </Link>
  )
}
