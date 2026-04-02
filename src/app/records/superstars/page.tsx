'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HERO = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/gettyimages-2147580012-2048x2048-processed_lightpdf.com__2026-03-21_17_29_20.889618.jpg.png'

const TABS = [
  { id: 'mostMatches', label: '💪 Most Matches' },
  { id: 'mostWins', label: '🏆 Most Wins' },
  { id: 'bestWinRate', label: '📈 Best Win Rate' },
  { id: 'mostReigns', label: '👑 Most Reigns' },
  { id: 'mostChampionshipDays', label: '📅 Most Days as Champion' },
  { id: 'mostFiveStar', label: '⭐ Most 5★ Matches' },
  { id: 'longestCareer', label: '⏳ Longest Career' },
]

export default function SuperstarRecordsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('mostMatches')

  useEffect(() => {
    fetch('/api/records-superstars').then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const list = data?.[tab] || []

  return (
    <div className="relative">
      <Hero title="Superstar" highlight="Records" sub="Every individual WWE career record and milestone — from the most matches to the longest careers." img={HERO} />

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-3 scrollbar-hide border-b border-border-subtle/20 mb-6">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium border whitespace-nowrap transition-all ${tab === t.id ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white hover:border-border-subtle/40'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <Skeleton /> : list.length === 0 ? <Empty /> : (
          <>
            {/* Podium — Top 3 */}
            <Podium items={list.slice(0, 3)} tab={tab} />

            {/* Full ranking table */}
            <div className="mt-8">
              <div className="hidden lg:grid lg:grid-cols-[50px_1fr_200px] gap-3 px-4 pb-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20">
                <span>#</span><span>Superstar</span><span className="text-right">{getValueLabel(tab)}</span>
              </div>
              <div className="space-y-0.5 mt-1">
                {list.map((item: any, i: number) => (
                  <Link key={item.id || i} href={`/superstars/${item.slug}`}
                    className="group flex items-center gap-3 px-4 py-3 rounded-lg border border-transparent hover:bg-bg-secondary/40 hover:border-border-subtle/20 transition-all">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/25' : 'bg-bg-tertiary/50 text-text-secondary border border-border-subtle/20'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border-subtle/30 shrink-0 bg-bg-tertiary">
                      {item.photo_url ? <Image src={item.photo_url} alt="" width={40} height={40} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm opacity-30">👤</div>}
                    </div>
                    <span className="text-sm text-text-white font-medium group-hover:text-neon-blue transition-colors flex-1 truncate">{item.name}</span>
                    <span className="text-sm text-neon-blue font-bold font-mono">{formatValue(item, tab)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      <SeoBlock title="Superstar Records" text="The most comprehensive WWE superstar record book ever compiled. Every stat is computed from our database of 100,000+ matches spanning 70+ years of professional wrestling history." />
    </div>
  )
}

/* ============================================================ */
function Hero({ title, highlight, sub, img }: { title: string; highlight: string; sub: string; img: string }) {
  return (
    <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] overflow-hidden">
      <Image src={img} alt={`${title} ${highlight}`} fill priority sizes="100vw" quality={100} className="object-cover object-center lg:object-[50%_30%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
        <Link href="/records" className="text-[10px] text-text-secondary uppercase tracking-widest mb-2 hover:text-neon-blue transition-colors">← Records & Statistics</Link>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
          {title} <span className="text-neon-blue">{highlight}</span>
        </h1>
        <p className="text-text-secondary text-sm sm:text-base text-center max-w-2xl">{sub}</p>
      </div>
    </section>
  )
}

function Podium({ items, tab }: { items: any[]; tab: string }) {
  if (items.length < 3) return null
  const order = [1, 0, 2] // silver, gold, bronze display order
  const heights = ['h-28 sm:h-32', 'h-36 sm:h-44', 'h-24 sm:h-28']
  const medals = ['🥈', '🥇', '🥉']
  const borders = ['border-gray-400/30', 'border-neon-blue/40', 'border-orange-400/30']
  const glows = ['', 'shadow-[0_0_30px_rgba(199,160,90,0.15)]', '']

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-5 max-w-2xl mx-auto">
      {order.map((idx, pos) => {
        const item = items[idx]
        if (!item) return null
        return (
          <Link key={idx} href={`/superstars/${item.slug}`}
            className={`group flex flex-col items-center flex-1 max-w-[180px] ${glows[pos]}`}>
            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 ${borders[pos]} mb-2 group-hover:scale-105 transition-transform`}>
              {item.photo_url ? <Image src={item.photo_url} alt="" fill className="object-cover" sizes="80px" /> : <div className="w-full h-full bg-bg-tertiary flex items-center justify-center text-xl">👤</div>}
            </div>
            <span className="text-2xl mb-1">{medals[pos]}</span>
            <span className="text-xs sm:text-sm text-text-white font-bold text-center truncate w-full group-hover:text-neon-blue transition-colors">{item.name}</span>
            <span className="text-xs text-neon-blue font-mono font-bold mt-0.5">{formatValue(item, tab)}</span>
            <div className={`w-full ${heights[pos]} mt-2 rounded-t-xl bg-gradient-to-t from-neon-blue/10 to-neon-blue/5 border border-b-0 border-neon-blue/15`} />
          </Link>
        )
      })}
    </div>
  )
}

function getValueLabel(tab: string): string {
  const m: Record<string, string> = {
    mostMatches: 'Matches', mostWins: 'Wins', bestWinRate: 'Win Rate',
    mostReigns: 'Reigns', mostChampionshipDays: 'Days', mostFiveStar: '5★ Matches', longestCareer: 'Years',
  }
  return m[tab] || 'Value'
}

function formatValue(item: any, tab: string): string {
  if (tab === 'mostMatches') return item.total_matches?.toLocaleString() || '0'
  if (tab === 'mostWins') return item.wins?.toLocaleString() || '0'
  if (tab === 'bestWinRate') return `${item.win_rate}%`
  if (tab === 'mostReigns') return `${item.reigns}x`
  if (tab === 'mostChampionshipDays') return `${item.days?.toLocaleString()} days`
  if (tab === 'mostFiveStar') return `${item.five_star_matches}`
  if (tab === 'longestCareer') return `${item.career_years} yrs`
  return ''
}

function Skeleton() {
  return <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-bg-secondary/30 animate-pulse" />)}</div>
}
function Empty() {
  return <div className="text-center py-20"><p className="text-text-secondary text-lg">No records available</p></div>
}
function SeoBlock({ title, text }: { title: string; text: string }) {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-text-white mb-3">About <span className="text-neon-blue">{title}</span></h2>
        <p className="text-text-secondary text-sm leading-relaxed">{text}</p>
      </div>
    </section>
  )
}
