'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

function fmtDate(d: string) { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function TabObjectsUsed({ superstar }: { superstar: any }) {
  const [objects, setObjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetch(`/api/superstar-objects?superstarId=${superstar.id}`)
      .then(r => r.json())
      .then(d => setObjects(d.objects || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [superstar.id])

  if (loading) return <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
  if (objects.length === 0) return <div className="text-center py-16"><p className="text-text-secondary">No objects used data found.</p></div>

  const toggle = (id: number) => {
    setExpanded(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {objects.map((obj: any) => {
        const isOpen = expanded.has(obj.id)
        return (
          <div key={obj.id} className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden">
            {/* Header — object image + name + count — click to expand */}
            <button onClick={() => toggle(obj.id)} className="w-full flex items-center gap-4 p-4 hover:bg-bg-secondary/30 transition-all text-left">
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-border-subtle/20 bg-bg-tertiary/30 shrink-0">
                {obj.image_url ? <Image src={obj.image_url} alt={obj.name} fill className="object-cover" sizes="64px" /> : <div className="w-full h-full flex items-center justify-center text-xl">🪑</div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display text-base sm:text-lg font-bold text-text-white">{obj.name}</h3>
                <p className="text-xs text-text-secondary">Used in {obj.usage_count} match{obj.usage_count !== 1 ? 'es' : ''}</p>
              </div>
              <span className="text-lg font-display font-bold text-neon-blue shrink-0">x{obj.usage_count}</span>
              <svg className={`w-5 h-5 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded — match/segment list */}
            {isOpen && (
              <div className="border-t border-border-subtle/15 px-4 pb-4">
                <div className="space-y-1 mt-3">
                  {obj.usages.map((u: any) => {
                    const isSegment = !!u.segment && !u.match
                    const href = u.match
                      ? `/shows/${u.match.show_slug}/matches/${u.match.slug}`
                      : u.segment
                        ? `/shows/${u.segment.show_slug}/segments/${u.segment.slug}`
                        : '#'

                    return (
                      <Link key={u.id} href={href} className="group flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-bg-tertiary/30 transition-all">
                        {/* Participant photos (matches only) */}
                        {u.match?.participants && u.match.participants.length > 0 && (
                          <div className="flex -space-x-1.5 shrink-0">
                            {u.match.participants.slice(0, 4).map((p: any) => (
                              <div key={p.id} className="w-7 h-7 rounded-full overflow-hidden border border-bg-primary bg-bg-tertiary">
                                {p.photo_url ? <Image src={p.photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[9px]">👤</div>}
                              </div>
                            ))}
                            {u.match.participants.length > 4 && <div className="w-7 h-7 rounded-full bg-bg-tertiary border border-bg-primary flex items-center justify-center text-[8px] text-text-secondary">+{u.match.participants.length - 4}</div>}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          {u.match ? (
                            <>
                              <span className="text-sm text-text-white group-hover:text-neon-blue transition-colors truncate block">
                                {u.match.participants?.map((p: any) => p.name).join(' vs ') || u.match.match_type || 'Match'}
                              </span>
                              <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                                <span>{u.match.show_name}</span>
                                {u.match.match_type && <span className="text-neon-blue uppercase font-semibold">{u.match.match_type}</span>}
                              </div>
                            </>
                          ) : u.segment ? (
                            <>
                              <span className="text-sm text-text-white group-hover:text-neon-blue transition-colors truncate block">{u.segment.title}</span>
                              <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                                <span>{u.segment.show_name}</span>
                                <span className="text-purple-400 uppercase font-semibold">{u.segment.category}</span>
                                <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold">SEGMENT</span>
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-text-secondary">Details unavailable</span>
                          )}
                          {u.notes && <p className="text-[10px] text-text-secondary/60 mt-0.5">{u.notes}</p>}
                        </div>
                        {u.match?.date && <span className="text-[10px] text-text-secondary font-mono shrink-0">{fmtDate(u.match.date)}</span>}
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
