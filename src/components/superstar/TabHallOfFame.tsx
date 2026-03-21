'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const GOLD = '#d4af37'
const ROYAL_BLUE = '#1a3a7a'

export default function TabHallOfFame({ superstar }: { superstar: any }) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/hof-list?search=${encodeURIComponent(superstar.name)}`)
      .then(r => r.json())
      .then(d => {
        // Find exact match by superstar_id
        const match = (d.items || []).find((i: any) => i.superstar_id === superstar.id)
        setData(match || (d.items || [])[0] || null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [superstar.id, superstar.name])

  if (loading) return (
    <div className="max-w-3xl mx-auto">
      <div className="h-64 rounded-2xl animate-pulse" style={{ background: `${ROYAL_BLUE}20` }} />
    </div>
  )

  if (!data) return <div className="text-center py-16"><p className="text-text-secondary">No Hall of Fame data found.</p></div>

  return (
    <div className="max-w-3xl mx-auto">
      {/* Royal card */}
      <div className="relative rounded-2xl overflow-hidden border" style={{ borderColor: `${GOLD}30`, background: `linear-gradient(135deg, ${ROYAL_BLUE}15, #050507 50%, ${GOLD}05)` }}>
        {/* Gold shimmer top line */}
        <div className="h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}60, ${GOLD}, ${GOLD}60, transparent)`, backgroundSize: '200% 100%', animation: 'hof-sweep 4s ease-in-out infinite' }} />

        {/* Sparkle bg */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 15% 30%, ${GOLD}30 0%, transparent 50%), radial-gradient(circle at 85% 70%, ${GOLD}20 0%, transparent 40%)` }} />

        <div className="relative p-6 sm:p-8">
          {/* Header — Hall of Fame badge */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: `${GOLD}20`, border: `1px solid ${GOLD}30` }}>
              🏛️
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold" style={{ color: GOLD }}>WWE Hall of Fame</h2>
              <p className="text-sm" style={{ color: '#8899aa' }}>Class of {data.induction_year}</p>
            </div>
            {data.class && (
              <span className="ml-auto text-[10px] px-3 py-1 rounded-full font-bold" style={{ background: `${ROYAL_BLUE}50`, color: '#b0c4de', border: `1px solid ${ROYAL_BLUE}70` }}>
                {data.class}
              </span>
            )}
          </div>

          {/* Image + Description side by side on desktop */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Image */}
            {data.image_url && (
              <div className="relative w-full lg:w-64 h-64 lg:h-80 rounded-xl overflow-hidden border shrink-0" style={{ borderColor: `${GOLD}25` }}>
                <Image src={data.image_url} alt={data.inductee_name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 256px" unoptimized />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${ROYAL_BLUE}30, transparent)` }} />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-display text-2xl font-bold text-text-white mb-1">{data.inductee_name}</h3>
              <p className="text-lg font-display mb-4" style={{ color: GOLD }}>Inducted in {data.induction_year}</p>

              {data.inducted_by && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: `${GOLD}08`, border: `1px solid ${GOLD}15` }}>
                  <span className="text-sm" style={{ color: '#8899aa' }}>Inducted by</span>
                  <span className="text-sm font-bold text-text-white">{data.inducted_by}</span>
                </div>
              )}

              {data.description && (
                <div className="mb-4">
                  <p className="text-sm leading-relaxed" style={{ color: '#b0b8c8' }}>{data.description}</p>
                </div>
              )}

              {/* Video — embedded if exists */}
              {data.speech_video_url && (
                <div className="mt-4">
                  <p className="text-[10px] uppercase tracking-widest font-bold mb-2" style={{ color: GOLD }}>🎬 Induction Speech</p>
                  <div className="relative rounded-xl overflow-hidden border" style={{ borderColor: `${GOLD}20`, paddingBottom: '56.25%' }}>
                    <iframe
                      src={data.speech_video_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Induction Speech"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom — link to HOF page */}
          <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: `${GOLD}15` }}>
            <Link href="/hall-of-fame/inductees" className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: GOLD }}>
              ← Browse All Hall of Fame Inductees
            </Link>
            <span className="text-[10px]" style={{ color: '#556677' }}>Year {data.induction_year}{data.class ? ` · ${data.class}` : ''}</span>
          </div>
        </div>

        {/* Bottom gold line */}
        <div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}40, ${GOLD}60, ${GOLD}40, transparent)` }} />
      </div>

      <style jsx>{`
        @keyframes hof-sweep {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}
