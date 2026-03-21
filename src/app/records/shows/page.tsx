'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

const HERO = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/20190405_WM35_show_hosts--86e5ca0f3c9f636c79cfceb29ae5b165_2026-03-21_16_54_31.187272.jpg.png'
const TABS = [
  { id: 'highestAttendance', label: '👥 Highest Attendance' },
  { id: 'mostMatchesPerCard', label: '💪 Most Matches Per Card' },
  { id: 'mostTitleChanges', label: '🔄 Most Title Changes' },
  { id: 'mostProlificSeries', label: '📺 Most Prolific Series' },
  { id: 'showsByCountry', label: '🌍 Shows by Country' },
]

function fmtDate(d: string) { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function ShowRecordsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('highestAttendance')

  useEffect(() => { fetch('/api/records-shows').then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false)) }, [])

  const list = data?.[tab] || []

  return (
    <div className="relative">
      <Hero img={HERO} t1="Show & Event" t2="Records" sub="The biggest crowds, the longest cards, and the most prolific shows in WWE history." />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <TabBar tabs={TABS} active={tab} set={setTab} />
        {loading ? <Skel /> : list.length === 0 ? <Empty /> : (
          <div className="mt-6 space-y-1">
            {tab === 'showsByCountry' ? (
              /* Country grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((item: any, i: number) => (
                  <div key={item.country} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border-subtle/20 bg-bg-secondary/15 hover:border-neon-blue/20 transition-all">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/25' : 'bg-bg-tertiary/50 text-text-secondary border border-border-subtle/20'}`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </span>
                    <span className="text-sm text-text-white font-medium flex-1">{item.country}</span>
                    <span className="text-sm text-neon-blue font-bold font-mono">{item.count.toLocaleString()} shows</span>
                  </div>
                ))}
              </div>
            ) : tab === 'mostProlificSeries' ? (
              list.map((item: any, i: number) => (
                <Link key={item.id} href={`/matches/shows/${item.slug}`}
                  className="group flex items-center gap-3 px-4 py-3.5 rounded-lg hover:bg-bg-secondary/40 transition-all border border-transparent hover:border-border-subtle/20">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/25' : 'bg-bg-tertiary/50 text-text-secondary border border-border-subtle/20'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  {item.logo_url && <div className="w-8 h-8 shrink-0 rounded overflow-hidden"><Image src={item.logo_url} alt="" width={32} height={32} className="w-full h-full object-contain" /></div>}
                  <span className="text-sm text-text-white font-medium group-hover:text-neon-blue transition-colors flex-1 truncate">{item.name}</span>
                  <span className="text-sm text-neon-blue font-bold font-mono">{item.episode_count.toLocaleString()} episodes</span>
                </Link>
              ))
            ) : (
              list.map((item: any, i: number) => (
                <Link key={item.id} href={`/shows/${item.slug}`}
                  className="group flex items-center gap-3 px-4 py-3.5 rounded-lg hover:bg-bg-secondary/40 transition-all border border-transparent hover:border-border-subtle/20">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/25' : 'bg-bg-tertiary/50 text-text-secondary border border-border-subtle/20'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-text-white font-medium group-hover:text-neon-blue transition-colors truncate block">{item.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-text-secondary">
                      {item.date && <span className="font-mono">{fmtDate(item.date)}</span>}
                      {item.venue && <span>{item.venue}</span>}
                      {item.city && <span>{item.city}, {item.country}</span>}
                      {item.series && <span className="text-neon-blue">{item.series}</span>}
                    </div>
                  </div>
                  <span className="text-sm text-neon-blue font-bold font-mono shrink-0">
                    {tab === 'highestAttendance' && `${item.attendance?.toLocaleString()}`}
                    {tab === 'mostMatchesPerCard' && `${item.match_count} matches`}
                    {tab === 'mostTitleChanges' && `${item.title_changes} changes`}
                  </span>
                </Link>
              ))
            )}
          </div>
        )}
      </section>
      <SeoBlock t="Show & Event Records" p="The biggest events in WWE history ranked by attendance, match count, title changes, and global reach. Every stat computed from our complete show database." />
    </div>
  )
}

function Hero({ img, t1, t2, sub }: any) {
  return (
    <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] overflow-hidden">
      <Image src={img} alt={`${t1} ${t2}`} fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-[50%_30%]" />
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
function TabBar({ tabs, active, set }: any) { return <div className="flex items-center gap-1 overflow-x-auto pb-3 scrollbar-hide border-b border-border-subtle/20 mb-2">{tabs.map((t: any) => <button key={t.id} onClick={() => set(t.id)} className={`px-4 py-2.5 rounded-xl text-xs font-medium border whitespace-nowrap transition-all ${active === t.id ? 'bg-neon-blue/15 border-neon-blue/30 text-neon-blue' : 'bg-bg-secondary/30 border-border-subtle/20 text-text-secondary hover:text-text-white'}`}>{t.label}</button>)}</div> }
function Skel() { return <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-bg-secondary/30 animate-pulse" />)}</div> }
function Empty() { return <div className="text-center py-20"><p className="text-text-secondary">No records available</p></div> }
function SeoBlock({ t, p }: { t: string; p: string }) { return <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8"><div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-text-white mb-3">About <span className="text-neon-blue">{t}</span></h2><p className="text-text-secondary text-sm leading-relaxed">{p}</p></div></section> }
