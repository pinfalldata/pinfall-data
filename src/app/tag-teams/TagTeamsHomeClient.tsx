'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

function fmt(d: string | null) { if (!d) return ''; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) }

export function TagTeamsHomeClient() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchRandom = () => {
    setLoading(true)
    fetch('/api/tag-teams-random')
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchRandom() }, [])

  if (loading) return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-10">
      <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-6 h-52 animate-pulse" />
    </section>
  )

  if (!data?.data) return null

  const item = data.data
  const members = (data.members || []).map((m: any) => m.superstar).filter(Boolean)
  const type = data.type
  const href = type === 'tag_team' ? `/tag-teams/teams/${item.slug}` : `/tag-teams/stables/${item.slug}`
  const label = type === 'tag_team' ? 'Tag Team' : 'Stable'

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-lg font-bold text-text-white flex items-center gap-2">
          <span className="text-neon-blue">🎲</span> Random {label} Spotlight
        </h2>
        <button onClick={fetchRandom} className="text-xs text-neon-blue hover:text-neon-blue/80 transition-colors flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Shuffle
        </button>
      </div>

      <Link href={href} className="group block rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/25 hover:bg-bg-secondary/25">
        <div className="flex flex-col sm:flex-row">
          {/* Photo */}
          {item.photo_url && (
            <div className="relative w-full sm:w-64 lg:w-80 h-48 sm:h-auto shrink-0 overflow-hidden">
              <Image src={item.photo_url} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="320px" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-bg-primary/50 hidden sm:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/60 to-transparent sm:hidden" />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-blue/15 border border-neon-blue/30 text-neon-blue font-bold uppercase tracking-wider">{label}</span>
              {item.is_active && <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">Active</span>}
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-bold text-text-white group-hover:text-neon-blue transition-colors mb-2">{item.name}</h3>

            {(item.formed_date || item.split_date) && (
              <p className="text-xs text-text-secondary mb-3">
                {item.formed_date ? fmt(item.formed_date) : '?'} — {item.split_date ? fmt(item.split_date) : 'Present'}
              </p>
            )}

            {item.description_md && (
              <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">{item.description_md}</p>
            )}

            {/* Member photos */}
            {members.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {members.slice(0, 6).map((s: any) => (
                    <div key={s.id} className="w-8 h-8 rounded-full overflow-hidden border-2 border-bg-primary bg-bg-tertiary shrink-0">
                      {s.photo_url ? <Image src={s.photo_url} alt={s.name} width={32} height={32} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px] text-text-secondary">👤</div>}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-text-secondary">{members.map((s: any) => s.name).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </section>
  )
}
