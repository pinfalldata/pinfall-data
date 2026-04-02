'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


const HERO = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/GkFq_JhWIAAesrf__1__2026-03-21_16_54_31.720281.jpg.png'
const TABS = [
  { id: 'longestReign', label: '👑 Longest Reign' },
  { id: 'shortestReign', label: '⚡ Shortest Reign' },
  { id: 'mostReignsOverall', label: '🏆 Most Reigns' },
  { id: 'mostCombinedDays', label: '📅 Most Combined Days' },
  { id: 'mostDifferentTitles', label: '🎯 Most Different Titles' },
  { id: 'currentReigns', label: '🔴 Current Champions' },
  { id: 'youngestChampion', label: '🌟 Youngest Champion' },
  { id: 'oldestChampion', label: '🎖️ Oldest Champion' },
]

export default function ChampionshipRecordsPage() {
  const t = useTranslations()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('longestReign')

  useEffect(() => { fetch('/api/records-championships').then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false)) }, [])

  const list = data?.[tab] || []

  const fmtVal = (item: any): string => {
    if (tab === 'longestReign' || tab === 'shortestReign') return `${item.days?.toLocaleString()} days`
    if (tab === 'mostReignsOverall') return `${item.reigns}x`
    if (tab === 'mostCombinedDays') return `${item.total_days?.toLocaleString()} days`
    if (tab === 'mostDifferentTitles') return `${item.unique_titles} titles`
    if (tab === 'currentReigns') return `${item.days?.toLocaleString()} days`
    if (tab === 'youngestChampion' || tab === 'oldestChampion') return `${item.age_years} years old`
    return ''
  }

  return (
    <div className="relative">
      <Hero img={HERO} t1="Championship" t2="Records" sub="Every WWE title record — from legendary reigns to record-breaking milestones." />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <TabBar tabs={TABS} active={tab} set={setTab} />
        {loading ? <Skel /> : list.length === 0 ? <Empty /> : (
          <div className="mt-6">
            <div className="hidden lg:grid lg:grid-cols-[50px_1fr_1fr_200px] gap-3 px-4 pb-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20">
              <span>#</span><span>Superstar</span><span>Championship</span><span className="text-right">{t('records.record')}</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {list.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-bg-secondary/40 transition-all">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/25' : 'bg-bg-tertiary/50 text-text-secondary border border-border-subtle/20'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  {item.superstar && (
                    <Link href={`/superstars/${item.superstar.slug}`} className="flex items-center gap-2 flex-1 min-w-0 group">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-border-subtle/30 shrink-0 bg-bg-tertiary">
                        {item.superstar.photo_url ? <Image src={item.superstar.photo_url} alt="" width={36} height={36} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">👤</div>}
                      </div>
                      <span className="text-sm text-text-white font-medium group-hover:text-neon-blue transition-colors truncate">{item.superstar.name}</span>
                    </Link>
                  )}
                  {item.championship && (
                    <Link href={`/champions/${item.championship.slug}`} className="flex items-center gap-2 flex-1 min-w-0 group">
                      {item.championship.image_url && <div className="w-8 h-6 shrink-0"><Image src={item.championship.image_url} alt="" width={32} height={24} className="w-full h-full object-contain" /></div>}
                      <span className="text-xs text-yellow-400 font-medium truncate group-hover:underline">{item.championship.name}</span>
                    </Link>
                  )}
                  {!item.championship && <div className="flex-1" />}
                  <span className="text-sm text-neon-blue font-bold font-mono shrink-0">{fmtVal(item)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
      <SeoBlock t={t('records.championships')} p="Complete WWE championship record book. Every title reign analyzed — longest, shortest, most reigns, youngest and oldest champions. Data from 70+ years of championship history." />
    </div>
  )
}

function Hero({ img, t1, t2, sub }: any) {
  return (
    <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] overflow-hidden">
      <Image src={img} alt={`${t1} ${t2}`} fill priority sizes="100vw" quality={100} className="object-cover object-center lg:object-[50%_10%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
        <Link href="/records" className="text-[10px] text-text-secondary uppercase tracking-widest mb-2 hover:text-neon-blue transition-colors">← Records & Statistics</Link>
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">{t1} <span className="text-neon-blue">{t2}</span></h1>
        <p className="text-text-secondary text-sm sm:text-base text-center max-w-2xl">{sub}</p>
      </div>
    </section>
  )
}
function TabBar({ tabs, active, set }: any) {
  return <div className="flex items-center gap-1 overflow-x-auto pb-3 scrollbar-hide border-b border-border-subtle/20 mb-2">{tabs.map((t: any) => <button key={t.id} onClick={() => set(t.id)} className={`px-4 py-2.5 rounded-xl text-xs font-medium border whitespace-nowrap transition-all ${active === t.id ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>{t.label}</button>)}</div>
}
function Skel() { return <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-bg-secondary/30 animate-pulse" />)}</div> }
function Empty() { return <div className="text-center py-20"><p className="text-text-secondary">No records available</p></div> }
function SeoBlock({ t, p }: { t: string; p: string }) {
  return <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8"><div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-text-white mb-3">About <span className="text-neon-blue">{t}</span></h2><p className="text-text-secondary text-sm leading-relaxed">{p}</p></div></section>
}
