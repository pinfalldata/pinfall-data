'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


const HERO = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/Jeri-Show_2026-03-21_16_54_31.480723.jpg.png'
const TABS = [
  { id: 'mostMatchesTogether', label: '💪 Most Matches Together' },
  { id: 'bestWinRate', label: '📈 Best Win Rate' },
  { id: 'longestPartnership', label: '⏳ Longest Partnership' },
  { id: 'largestStables', label: '🏛️ Largest Stables' },
]

export default function TagTeamRecordsPage() {
  const t = useTranslations()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('mostMatchesTogether')

  useEffect(() => { fetch('/api/records-tag-teams').then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false)) }, [])

  const list = data?.[tab] || []
  const isStable = tab === 'largestStables'

  const fmtVal = (item: any): string => {
    if (tab === 'mostMatchesTogether') return `${item.matches} matches (${item.wins}W)`
    if (tab === 'bestWinRate') return `${item.win_rate}% (${item.matches} matches)`
    if (tab === 'longestPartnership') return `${item.duration_years} years`
    if (tab === 'largestStables') return `${item.member_count} members`
    return ''
  }

  return (
    <div className="relative">
      <Hero img={HERO} t1="Tag Team & Stable" t2="Records" sub="The most dominant teams and factions in WWE history — partnerships, win rates, and faction power." />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <TabBar tabs={TABS} active={tab} set={setTab} />
        {loading ? <Skel /> : list.length === 0 ? <Empty /> : (
          <div className="mt-6 space-y-1">
            {list.map((item: any, i: number) => (
              <Link key={item.id} href={isStable ? `/tag-teams/stables/${item.slug}` : `/tag-teams/teams/${item.slug}`}
                className="group flex items-center gap-3 px-4 py-4 rounded-lg border border-transparent hover:bg-bg-secondary/40 hover:border-border-subtle/20 transition-all">
                {/* Rank */}
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/25' : 'bg-bg-tertiary/50 text-text-secondary border border-border-subtle/20'}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                </span>

                {/* Team/Stable photo — show BOTH member photos for tag teams */}
                {isStable ? (
                  /* Stable: team photo or member grid */
                  <div className="flex -space-x-2 shrink-0">
                    {item.members?.slice(0, 5).map((m: any) => (
                      <div key={m.id} className="w-9 h-9 rounded-full overflow-hidden border-2 border-bg-primary bg-bg-tertiary">
                        {m.photo_url ? <Image src={m.photo_url} alt={m.name} width={36} height={36} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>}
                      </div>
                    ))}
                    {(item.members?.length || 0) > 5 && (
                      <div className="w-9 h-9 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[9px] text-text-secondary font-bold">+{item.members.length - 5}</div>
                    )}
                  </div>
                ) : (
                  /* Tag Team: show BOTH members side by side with clear separation */
                  <div className="flex items-center gap-1 shrink-0">
                    {item.members?.slice(0, 2).map((m: any, mi: number) => (
                      <div key={m.id} className="flex flex-col items-center">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 border-neon-blue/20 bg-bg-tertiary">
                          {m.photo_url ? <Image src={m.photo_url} alt={m.name} width={44} height={44} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">👤</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Name + members names */}
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-text-white font-bold group-hover:text-neon-blue transition-colors truncate block">{item.name}</span>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-text-secondary">
                    {!isStable && item.members?.slice(0, 2).map((m: any, mi: number) => (
                      <span key={m.id}>{mi > 0 && <span className="text-neon-blue mx-0.5">&</span>}{m.name}</span>
                    ))}
                    {isStable && <span>{item.members?.slice(0, 3).map((m: any) => m.name).join(', ')}{(item.members?.length || 0) > 3 ? ` +${item.members.length - 3}` : ''}</span>}
                    {item.is_active && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-bold ml-1">{t('common.active')}</span>}
                  </div>
                </div>

                {/* Value */}
                <span className="text-sm text-neon-blue font-bold font-mono shrink-0">{fmtVal(item)}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
      <SeoBlock t="Tag Team & Stable Records" p="Every WWE tag team and stable record. Most matches together, best win rates, longest-running partnerships, and the most dominant factions in wrestling history. All stats computed from real match data." />
    </div>
  )
}

function Hero({ img, t1, t2, sub }: any) {
  return (
    <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] overflow-hidden">
      <Image src={img} alt={`${t1} ${t2}`} fill priority sizes="100vw" quality={100} className="object-cover object-[50%_25%]" />
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
