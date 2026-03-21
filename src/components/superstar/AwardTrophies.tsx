'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const SLAMMY_IMG = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Hall%20Of%20Fame/slammy.webp'
const YEAREND_IMG = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Hall%20Of%20Fame/year%20end%20awards.webp'

/**
 * Displays award trophies on superstar profile.
 * Shows small trophy image + count badge if the superstar has won awards.
 */
export function AwardTrophies({ superstarId }: { superstarId: number }) {
  const [data, setData] = useState<{ slammy: number; yearEnd: number } | null>(null)

  useEffect(() => {
    if (!superstarId) return
    fetch(`/api/superstar-awards?superstarId=${superstarId}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
  }, [superstarId])

  if (!data || (data.slammy === 0 && data.yearEnd === 0)) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {data.slammy > 0 && (
        <Link href="/hall-of-fame/slammy-awards" className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all" title={`${data.slammy} Slammy Award${data.slammy > 1 ? 's' : ''}`}>
          <div className="relative w-7 h-7 shrink-0">
            <Image src={SLAMMY_IMG} alt="Slammy Award" fill className="object-contain drop-shadow-[0_0_4px_rgba(234,179,8,0.3)]" sizes="28px" unoptimized />
          </div>
          {data.slammy > 1 && (
            <span className="text-[10px] font-bold text-yellow-400">x{data.slammy}</span>
          )}
        </Link>
      )}
      {data.yearEnd > 0 && (
        <Link href="/hall-of-fame/year-end-awards" className="group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neon-blue/10 border border-neon-blue/20 hover:border-neon-blue/40 transition-all" title={`${data.yearEnd} Year-End Award${data.yearEnd > 1 ? 's' : ''}`}>
          <div className="relative w-7 h-7 shrink-0">
            <Image src={YEAREND_IMG} alt="Year-End Award" fill className="object-contain drop-shadow-[0_0_4px_rgba(199,160,90,0.3)]" sizes="28px" unoptimized />
          </div>
          {data.yearEnd > 1 && (
            <span className="text-[10px] font-bold text-neon-blue">x{data.yearEnd}</span>
          )}
        </Link>
      )}
    </div>
  )
}
