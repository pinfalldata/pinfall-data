'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const TROPHY_IMG = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Hall%20Of%20Fame/year%20end%20awards.webp'

export default function TabYearEndAwards({ superstar }: { superstar: any }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/year-end-list?superstarId=${superstar.id}`)
      .then(r => r.json())
      .then(d => setItems(d.items || []))
      .catch(() => {}).finally(() => setLoading(false))
  }, [superstar.id])

  if (loading) return <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-bg-secondary/30 animate-pulse" />)}</div>
  if (items.length === 0) return <div className="text-center py-16"><p className="text-text-secondary">No Year-End Awards found.</p></div>

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0"><Image src={TROPHY_IMG} alt="Year-End Award" fill className="object-contain drop-shadow-[0_0_15px_rgba(199,160,90,0.3)]" sizes="80px" unoptimized /></div>
        <div><h2 className="font-display text-xl sm:text-2xl font-bold text-text-white">Year-End Awards</h2><p className="text-sm text-text-secondary">{items.length} award{items.length !== 1 ? 's' : ''} won</p></div>
      </div>
      <div className="space-y-3">
        {items.map((item: any) => (
          <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 hover:border-neon-blue/20 transition-all">
            <div className="relative w-12 h-12 shrink-0"><Image src={TROPHY_IMG} alt="" fill className="object-contain drop-shadow-[0_0_6px_rgba(199,160,90,0.2)]" sizes="48px" unoptimized /></div>
            <div className="flex-1 min-w-0">
              <p className="text-neon-blue text-[11px] font-bold uppercase tracking-wider mb-0.5">{item.category}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-display font-bold text-text-white">{item.year}</span>
                {item.source && <span className="text-[10px] text-text-secondary/60 px-1.5 py-0.5 rounded bg-bg-tertiary/40 border border-border-subtle/15">{item.source}</span>}
              </div>
              {item.notes && <p className="text-xs text-text-secondary mt-1 line-clamp-2">{item.notes}</p>}
            </div>
            <span className="text-2xl font-display font-bold text-neon-blue shrink-0">{item.year}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center"><Link href="/hall-of-fame/year-end-awards" className="text-xs text-neon-blue hover:underline">Browse All Year-End Awards →</Link></div>
    </div>
  )
}
