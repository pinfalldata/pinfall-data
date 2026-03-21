'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

function fmtDate(d: string) { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function ObjectDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'matches' | 'superstars'>('matches')

  useEffect(() => {
    if (!slug) return
    fetch(`/api/object-detail?slug=${slug}`).then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-20"><div className="h-64 rounded-2xl bg-bg-secondary/30 animate-pulse" /></div>
  if (!data || data.error) return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-20 text-center">
      <span className="text-5xl block mb-4 opacity-20">🪑</span><p className="text-text-secondary text-lg">Object not found</p>
      <Link href="/matches/objects" className="text-neon-blue text-sm mt-2 inline-block hover:underline">← Back to Objects</Link>
    </div>
  )

  const obj = data.object
  const matches = data.matches || []
  const superstars = data.superstars || []

  return (
    <div className="relative">
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-8 pb-4">
        <Link href="/matches/objects" className="text-[10px] text-text-secondary uppercase tracking-widest hover:text-neon-blue transition-colors">← Objects Used</Link>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="relative w-full lg:w-80 aspect-square rounded-2xl overflow-hidden border border-border-subtle/20 bg-bg-tertiary/30 shrink-0">
            {obj.image_url ? <Image src={obj.image_url} alt={obj.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 320px" unoptimized /> : <div className="w-full h-full flex items-center justify-center"><span className="text-6xl opacity-20">🪑</span></div>}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white mb-3">{obj.name}</h1>
            {obj.description && <p className="text-text-secondary text-sm sm:text-base leading-relaxed mb-4">{obj.description}</p>}
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-3 rounded-xl border border-border-subtle/20 bg-bg-secondary/15 text-center"><p className="text-2xl font-display font-bold text-neon-blue">{data.total_uses}</p><p className="text-[10px] text-text-secondary uppercase tracking-wider">Total Uses</p></div>
              <div className="px-4 py-3 rounded-xl border border-border-subtle/20 bg-bg-secondary/15 text-center"><p className="text-2xl font-display font-bold text-neon-blue">{matches.filter((u: any) => u.match).length}</p><p className="text-[10px] text-text-secondary uppercase tracking-wider">Matches</p></div>
              <div className="px-4 py-3 rounded-xl border border-border-subtle/20 bg-bg-secondary/15 text-center"><p className="text-2xl font-display font-bold text-neon-blue">{matches.filter((u: any) => u.segment && !u.match).length}</p><p className="text-[10px] text-text-secondary uppercase tracking-wider">Segments</p></div>
              <div className="px-4 py-3 rounded-xl border border-border-subtle/20 bg-bg-secondary/15 text-center"><p className="text-2xl font-display font-bold text-neon-blue">{superstars.length}</p><p className="text-[10px] text-text-secondary uppercase tracking-wider">Superstars</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-12">
        <div className="flex items-center gap-1 border-b border-border-subtle/20 mb-6">
          <button onClick={() => setTab('matches')} className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${tab === 'matches' ? 'border-neon-blue text-neon-blue' : 'border-transparent text-text-secondary hover:text-text-white'}`}>Matches & Segments ({matches.length})</button>
          <button onClick={() => setTab('superstars')} className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${tab === 'superstars' ? 'border-neon-blue text-neon-blue' : 'border-transparent text-text-secondary hover:text-text-white'}`}>Superstars ({superstars.length})</button>
        </div>

        {tab === 'matches' ? (
          <div className="space-y-1">
            {matches.length === 0 ? <p className="text-text-secondary text-center py-10">No data available.</p> : matches.map((u: any) => {
              const isSegment = !!u.segment && !u.match
              const href = u.match ? `/shows/${u.match.show_slug}/matches/${u.match.slug}` : u.segment ? `/shows/${u.segment.show_slug}/segments/${u.segment.slug}` : '#'

              return (
                <Link key={u.id} href={href} className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-secondary/40 transition-all border border-transparent hover:border-border-subtle/20">
                  {/* Used by photo */}
                  {u.used_by && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-neon-blue/20 bg-bg-tertiary shrink-0">
                      {u.used_by.photo_url ? <Image src={u.used_by.photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">👤</div>}
                    </div>
                  )}

                  {/* Match participants */}
                  {u.match?.participants && u.match.participants.length > 0 && (
                    <div className="flex -space-x-1.5 shrink-0">
                      {u.match.participants.slice(0, 4).map((p: any) => (
                        <div key={p.id} className={`w-7 h-7 rounded-full overflow-hidden border-2 bg-bg-tertiary ${p.is_winner ? 'border-emerald-500/40' : 'border-bg-primary'}`}>
                          {p.photo_url ? <Image src={p.photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[9px]">👤</div>}
                        </div>
                      ))}
                      {u.match.participants.length > 4 && <div className="w-7 h-7 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[8px] text-text-secondary">+{u.match.participants.length - 4}</div>}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    {u.match ? (
                      <>
                        <span className="text-sm text-text-white group-hover:text-neon-blue transition-colors truncate block">
                          {u.match.participants?.map((p: any) => p.name).join(' vs ') || u.match.match_type || 'Match'}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-text-secondary flex-wrap">
                          <span>{u.match.show_name}</span>
                          {u.match.match_type && <span className="text-neon-blue uppercase font-semibold">{u.match.match_type}</span>}
                          {u.used_by && <span>Used by <span className="text-text-white">{u.used_by.name}</span></span>}
                        </div>
                      </>
                    ) : u.segment ? (
                      <>
                        <span className="text-sm text-text-white group-hover:text-neon-blue transition-colors truncate block">{u.segment.title}</span>
                        <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                          <span>{u.segment.show_name}</span>
                          <span className="text-purple-400 uppercase font-semibold">{u.segment.category}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold">SEGMENT</span>
                          {u.used_by && <span>Used by <span className="text-text-white">{u.used_by.name}</span></span>}
                        </div>
                      </>
                    ) : <span className="text-xs text-text-secondary">Details unavailable</span>}
                    {u.notes && <p className="text-[10px] text-text-secondary/60 mt-0.5">{u.notes}</p>}
                  </div>
                  {u.match?.date && <span className="text-[10px] text-text-secondary font-mono shrink-0">{fmtDate(u.match.date)}</span>}
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {superstars.length === 0 ? <p className="text-text-secondary text-center py-10">No data available.</p> : superstars.map((s: any, i: number) => {
              const maxCount = superstars[0]?.count || 1
              const pct = (s.count / maxCount) * 100
              return (
                <Link key={s.id} href={`/superstars/${s.slug}`} className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-secondary/40 transition-all border border-transparent hover:border-border-subtle/20">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/25' : 'bg-bg-tertiary/50 text-text-secondary border border-border-subtle/20'}`}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</span>
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-border-subtle/30 bg-bg-tertiary shrink-0">{s.photo_url ? <Image src={s.photo_url} alt="" width={36} height={36} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">👤</div>}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-text-white font-medium group-hover:text-neon-blue transition-colors block truncate">{s.name}</span>
                    <div className="w-full h-1.5 rounded-full bg-bg-tertiary/50 overflow-hidden mt-1"><div className="h-full rounded-full bg-neon-blue/60 transition-all" style={{ width: `${pct}%` }} /></div>
                  </div>
                  <span className="text-sm text-neon-blue font-bold font-mono shrink-0">{s.count}x</span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
