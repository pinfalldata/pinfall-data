'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  extreme:   { label: 'Extreme',   color: '#ef4444', icon: '🔥' },
  wtf:       { label: 'WTF',       color: '#a855f7', icon: '🤯' },
  sexy:      { label: 'Sexy',      color: '#ec4899', icon: '💋' },
  return:    { label: 'Return',    color: '#22c55e', icon: '🚀' },
  betrayal:  { label: 'Betrayal',  color: '#f97316', icon: '🗡️' },
  emotional: { label: 'Emotional', color: '#3b82f6', icon: '💎' },
}

const CATEGORY_SLUGS: Record<string, string> = {
  extreme: 'extreme-moments', wtf: 'wtf-moments', sexy: 'sexy-moments',
  return: 'greatest-returns', betrayal: 'greatest-betrayals', emotional: 'most-emotional-moments',
}

function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Build the best link for an OMG moment:
 * - match → /shows/{showSlug}/matches/{matchSlug}
 * - segment → /shows/{showSlug}/segments/{segmentSlug}
 * - show only → /shows/{showSlug}
 * - fallback → /omg-moments/{categorySlug}
 */
function getOMGHref(m: any): string {
  const showSlug = m.show?.slug
  if (showSlug && m.match?.slug) {
    return `/shows/${showSlug}/matches/${m.match.slug}`
  }
  if (showSlug && m.segment?.slug) {
    return `/shows/${showSlug}/segments/${m.segment.slug}`
  }
  if (showSlug) {
    return `/shows/${showSlug}`
  }
  return `/omg-moments/${CATEGORY_SLUGS[m.category] || 'extreme-moments'}`
}

export default function TabOMGMoments({ superstar }: { superstar: any }) {
  const [moments, setMoments] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)

  // Filters
  const [filterYear, setFilterYear] = useState('')
  const [filterCategory, setFilterCategory] = useState('')

  const fetchData = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ superstarId: String(superstar.id), page: String(p) })
      if (filterYear) params.set('year', filterYear)
      if (filterCategory) params.set('category', filterCategory)

      const r = await fetch(`/api/superstar-omg?${params}`)
      const d = await r.json()
      setMoments(d.moments || [])
      setTotal(d.total || 0)
      setPage(d.page || 1)
      setTotalPages(d.totalPages || 0)
    } catch { }
    setLoading(false)
  }, [superstar.id, filterYear, filterCategory])

  useEffect(() => { fetchData(1) }, [fetchData])

  // Build year options from moments
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => String(currentYear - i))

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
          className="text-xs bg-bg-tertiary/50 border border-border-subtle/30 rounded-lg px-3 py-2 text-text-white focus:border-neon-blue/50 focus:outline-none transition-colors">
          <option value="">All Years</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          className="text-xs bg-bg-tertiary/50 border border-border-subtle/30 rounded-lg px-3 py-2 text-text-white focus:border-neon-blue/50 focus:outline-none transition-colors">
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.icon} {v.label}</option>
          ))}
        </select>

        {(filterYear || filterCategory) && (
          <button onClick={() => { setFilterYear(''); setFilterCategory('') }}
            className="text-[10px] px-2 py-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">
            Clear
          </button>
        )}

        <span className="text-xs text-text-secondary ml-auto">{total} moment{total !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-bg-secondary/30 animate-pulse" />
          ))}
        </div>
      ) : moments.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-secondary">No OMG moments found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {moments.map(m => {
            const cat = CATEGORY_CONFIG[m.category] || { label: 'OMG', color: '#c7a05a', icon: '⚡' }
            const href = getOMGHref(m)

            return (
              <Link
                key={m.id}
                href={href}
                className="group block rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-border-subtle/40 hover:translate-y-[-1px]"
              >
                <div className="flex items-center gap-4 px-4 py-3.5">
                  {/* Image */}
                  {m.image_url && (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-border-subtle/20">
                      <Image src={m.image_url} alt="" fill className="object-cover" sizes="64px" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {/* Category + Date */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                        style={{ background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}30` }}
                      >
                        {cat.icon} {cat.label}
                      </span>
                      <span className="text-[10px] text-text-secondary font-mono">{fmtDate(m.date)}</span>
                    </div>

                    {/* Title */}
                    <p className="text-sm text-text-white font-semibold group-hover:text-neon-blue transition-colors truncate">
                      {m.title}
                    </p>

                    {/* Show + link target + Participants */}
                    <div className="flex items-center gap-2 mt-1">
                      {m.show && (
                        <span className="text-[10px] text-text-secondary truncate">{m.show.name}</span>
                      )}
                      {m.match?.slug && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-bold uppercase shrink-0">Match</span>
                      )}
                      {!m.match?.slug && m.segment?.slug && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold uppercase shrink-0">Segment</span>
                      )}
                      {m.participants && m.participants.length > 0 && (
                        <div className="flex items-center -space-x-1.5 shrink-0">
                          {m.participants.slice(0, 4).map((p: any) => (
                            <div key={p.id} className="w-5 h-5 rounded-full overflow-hidden border border-bg-primary bg-bg-tertiary">
                              {p.photo_url ? (
                                <Image src={p.photo_url} alt="" width={20} height={20} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-bg-tertiary" />
                              )}
                            </div>
                          ))}
                          {m.participants.length > 4 && (
                            <span className="text-[8px] text-text-secondary ml-1">+{m.participants.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <svg className="w-4 h-4 text-text-secondary group-hover:translate-x-1 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => fetchData(page - 1)} disabled={page <= 1}
            className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span className="text-xs text-text-secondary">Page {page} / {totalPages}</span>
          <button onClick={() => fetchData(page + 1)} disabled={page >= totalPages}
            className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}
