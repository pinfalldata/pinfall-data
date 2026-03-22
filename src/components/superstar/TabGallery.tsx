'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface MediaItem {
  id: string; source: 'match' | 'segment'
  media_type: string; title: string | null
  url: string; thumbnail_url: string | null; date: string | null
  show: { id: number; name: string; slug: string } | null
  match_id: number | null; segment_id: number | null
}

interface Filters { year: string; mediaType: string; showSeriesId: string }

function fmt(d: string | null) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/)
  return m ? m[1] : null
}

function getThumbnail(item: MediaItem): string | null {
  if (item.thumbnail_url) return item.thumbnail_url
  if (item.media_type === 'video') {
    const ytId = getYoutubeId(item.url)
    if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
  }
  if (item.media_type === 'image') return item.url
  return null
}

export default function TabGallery({ superstar }: { superstar: any }) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({ year: '', mediaType: '', showSeriesId: '' })
  const [filterOpts, setFilterOpts] = useState<{ years: string[]; showSeries: { id: number; name: string }[] }>({ years: [], showSeries: [] })
  const [lightbox, setLightbox] = useState<MediaItem | null>(null)

  const fetchGallery = useCallback(async (p: number, f: Filters) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ superstarId: String(superstar.id), page: String(p) })
      if (f.year) params.set('year', f.year)
      if (f.mediaType) params.set('mediaType', f.mediaType)
      if (f.showSeriesId) params.set('showSeriesId', f.showSeriesId)
      const r = await fetch(`/api/superstar-gallery?${params}`)
      const d = await r.json()
      setItems(d.items || [])
      setTotal(d.total || 0)
      setPage(d.page || 1)
      setTotalPages(d.totalPages || 0)
      if (d.filters) setFilterOpts(d.filters)
    } catch {}
    setLoading(false)
  }, [superstar.id])

  useEffect(() => { fetchGallery(1, filters) }, [fetchGallery]) // eslint-disable-line

  const applyFilter = (key: keyof Filters, val: string) => {
    const next = { ...filters, [key]: val }
    setFilters(next)
    fetchGallery(1, next)
  }

  const resetFilters = () => {
    const next: Filters = { year: '', mediaType: '', showSeriesId: '' }
    setFilters(next)
    fetchGallery(1, next)
  }

  const goPage = (p: number) => {
    if (p < 1 || p > totalPages) return
    fetchGallery(p, filters)
    document.getElementById('gallery-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const hasActiveFilters = filters.year || filters.mediaType || filters.showSeriesId

  return (
    <div className="max-w-6xl mx-auto" id="gallery-top">

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex items-center rounded-xl border border-border-subtle/30 overflow-hidden">
          {[{ key: '', label: 'All' }, { key: 'video', label: '🎬 Videos' }, { key: 'image', label: '📸 Photos' }].map(opt => (
            <button key={opt.key} onClick={() => applyFilter('mediaType', opt.key)}
              className={`px-3 py-2 text-xs font-medium transition-all ${filters.mediaType === opt.key ? 'bg-neon-blue/15 text-neon-blue' : 'text-text-secondary hover:text-text-white hover:bg-bg-secondary/30'}`}
            >{opt.label}</button>
          ))}
        </div>

        {filterOpts.years.length > 0 && (
          <select value={filters.year} onChange={e => applyFilter('year', e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg-secondary/30 border border-border-subtle/30 text-xs text-text-white appearance-none cursor-pointer focus:outline-none focus:border-neon-blue/40">
            <option value="">All years</option>
            {filterOpts.years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}

        {filterOpts.showSeries.length > 0 && (
          <select value={filters.showSeriesId} onChange={e => applyFilter('showSeriesId', e.target.value)}
            className="px-3 py-2 rounded-xl bg-bg-secondary/30 border border-border-subtle/30 text-xs text-text-white appearance-none cursor-pointer focus:outline-none focus:border-neon-blue/40">
            <option value="">All shows</option>
            {filterOpts.showSeries.map(s => <option key={s.id} value={String(s.id)}>{s.name}</option>)}
          </select>
        )}

        {hasActiveFilters && (
          <button onClick={resetFilters} className="px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-400/10 transition-colors">Clear filters</button>
        )}

        <span className="text-xs text-text-secondary ml-auto">{loading ? '...' : `${total} media`}</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="aspect-video rounded-xl bg-bg-secondary/30 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-5xl block mb-3 opacity-15">📸</span>
          <p className="text-text-secondary">{hasActiveFilters ? 'No media found with these filters.' : 'No media available yet.'}</p>
          {hasActiveFilters && <button onClick={resetFilters} className="mt-3 text-xs text-neon-blue hover:text-neon-blue/80 transition-colors">Clear all filters</button>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {items.map(item => <GalleryCard key={item.id} item={item} onClick={() => setLightbox(item)} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
          <p className="text-xs text-text-secondary">Page {page} of {totalPages} — {total} media</p>
          <div className="flex items-center gap-1">
            <PagBtn disabled={page === 1} onClick={() => goPage(page - 1)} dir="prev" />
            {getVis(page, totalPages).map((p, i) =>
              p === 'e' ? <span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span> :
              <button key={p} onClick={() => goPage(p as number)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === page ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue' : 'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{p}</button>
            )}
            <PagBtn disabled={page === totalPages} onClick={() => goPage(page + 1)} dir="next" />
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4" onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {(() => {
            const idx = items.findIndex(i => i.id === lightbox.id)
            return <>
              {idx > 0 && <button onClick={e => { e.stopPropagation(); setLightbox(items[idx - 1]) }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>}
              {idx < items.length - 1 && <button onClick={e => { e.stopPropagation(); setLightbox(items[idx + 1]) }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>}
            </>
          })()}

          <div className="max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            {lightbox.media_type === 'video' ? (() => {
              const ytId = getYoutubeId(lightbox.url)
              if (ytId) return <div className="w-full rounded-2xl overflow-hidden bg-black"><div className="relative w-full pt-[56.25%]"><iframe src={`https://www.youtube.com/embed/${ytId}?autoplay=1`} title={lightbox.title || ''} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute inset-0 w-full h-full" /></div></div>
              return <div className="w-full rounded-2xl overflow-hidden bg-black"><video src={lightbox.url} controls autoPlay className="w-full max-h-[75vh]" /></div>
            })() : (
              <div className="rounded-2xl overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lightbox.url} alt={lightbox.title || ''} className="max-w-full max-h-[75vh] object-contain" />
              </div>
            )}
            <div className="mt-4 text-center">
              {lightbox.title && <p className="text-sm font-bold text-white">{lightbox.title}</p>}
              <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
                {lightbox.show && <Link href={`/shows/${lightbox.show.slug}`} onClick={() => setLightbox(null)} className="text-xs text-neon-blue hover:text-neon-blue/80 transition-colors">{lightbox.show.name}</Link>}
                {lightbox.date && <span className="text-xs text-white/40">{fmt(lightbox.date)}</span>}
                <span className="text-[10px] text-white/30 uppercase">{lightbox.source === 'match' ? 'Match' : 'Segment'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */

function GalleryCard({ item, onClick }: { item: MediaItem; onClick: () => void }) {
  const thumb = getThumbnail(item)
  const isVideo = item.media_type === 'video'

  return (
    <button onClick={onClick} className="group relative aspect-video rounded-xl overflow-hidden bg-bg-tertiary/30 border border-border-subtle/15 hover:border-neon-blue/25 transition-all hover:shadow-[0_0_20px_rgba(199,160,90,0.06)] text-left">
      {thumb ? (
        <Image src={thumb} alt={item.title || ''} fill unoptimized sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,16vw" className="object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex items-center justify-center"><span className="text-2xl opacity-15">{isVideo ? '🎬' : '📸'}</span></div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      )}
      <div className="absolute top-1.5 left-1.5">
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${isVideo ? 'bg-red-600/90 text-white' : 'bg-neon-blue/80 text-white'}`}>{isVideo ? 'Video' : 'Photo'}</span>
      </div>
      <div className="absolute top-1.5 right-1.5">
        <span className="text-[8px] px-1.5 py-0.5 rounded bg-black/50 text-white/70 font-medium">{item.source === 'match' ? '🤼' : '🎤'}</span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {item.title && <p className="text-[10px] text-white font-medium truncate">{item.title}</p>}
        <div className="flex items-center gap-1 mt-0.5">
          {item.show && <span className="text-[9px] text-white/60 truncate">{item.show.name}</span>}
          {item.date && <span className="text-[9px] text-white/40 shrink-0">{item.date.slice(0, 4)}</span>}
        </div>
      </div>
    </button>
  )
}

function PagBtn({ disabled, onClick, dir }: { disabled: boolean; onClick: () => void; dir: 'prev' | 'next' }) {
  return (
    <button onClick={onClick} disabled={disabled} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={dir === 'prev' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} /></svg>
    </button>
  )
}

function getVis(page: number, tp: number): (number | 'e')[] {
  const p: (number | 'e')[] = []
  if (tp <= 7) { for (let i = 1; i <= tp; i++) p.push(i) }
  else { p.push(1); if (page > 3) p.push('e'); for (let i = Math.max(2, page - 1); i <= Math.min(tp - 1, page + 1); i++) p.push(i); if (page < tp - 2) p.push('e'); p.push(tp) }
  return p
}
