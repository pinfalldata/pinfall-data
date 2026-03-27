'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


function fmtDate(d: string | null) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function TabTagTeams({ superstar }: { superstar: any }) {
  const t = useTranslations()

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/superstar-tag-teams?superstarId=${superstar.id}&type=tag_team`)
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [superstar.id])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-bg-secondary/30 animate-pulse" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary">No tag teams found for this superstar.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((team) => (
        <Link
          key={team.id}
          href={`/tag-teams/teams/${team.slug}`}
          className="group rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 overflow-hidden transition-all hover:border-neon-blue/30 hover:translate-y-[-2px] card-glow"
        >
          {/* Team photo or member photos */}
          <div className="relative h-40 bg-bg-tertiary/30 overflow-hidden">
            {team.photo_url ? (
              <Image src={team.photo_url} alt={team.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="400px" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center gap-3 p-4">
                {team.members?.slice(0, 3).map((m: any) => (
                  <div key={m.id} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border-subtle/30 bg-bg-tertiary shrink-0">
                    {m.photo_url ? (
                      <Image src={m.photo_url} alt={m.name} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg opacity-30">👤</div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/20 to-transparent" />

            {/* Active/Disbanded badge */}
            <div className="absolute top-2 right-2">
              {team.is_active ? (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">{t('common.active')}</span>
              ) : (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold">Disbanded</span>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-neon-blue/10 border border-neon-blue/20 text-neon-blue font-bold uppercase">Tag Team</span>
            </div>
            <h3 className="font-display text-sm font-bold text-text-white group-hover:text-neon-blue transition-colors truncate mt-1">
              {team.name}
            </h3>

            {/* Members */}
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex -space-x-1.5">
                {team.members?.slice(0, 4).map((m: any) => (
                  <div key={m.id} className="w-6 h-6 rounded-full overflow-hidden border border-bg-primary bg-bg-tertiary">
                    {m.photo_url ? (
                      <Image src={m.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full bg-bg-tertiary" />}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-text-secondary truncate">
                {team.members?.map((m: any) => m.name).join(' & ')}
              </span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-3 mt-2 text-[10px] text-text-secondary">
              {team.formed_date && <span>Formed: {fmtDate(team.formed_date)}</span>}
              {team.split_date && <span>Split: {fmtDate(team.split_date)}</span>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
