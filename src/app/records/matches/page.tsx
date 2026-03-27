'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


const HERO = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/EZxXlPqXYAESmVQ_2026-03-21_16_54_31.604686.jpg.png'
const TABS = [
  { id: 'highestRated', label: '⭐ Highest Rated' },
  { id: 'longestMatches', label: '⏱️ Longest Matches' },
  { id: 'shortestMatches', label: '⚡ Shortest Matches' },
  { id: 'mostParticipants', label: '👥 Most Participants' },
  { id: 'youngest', label: '🌟 Youngest Competitor' },
  { id: 'oldest', label: '🎖️ Oldest Competitor' },
]

function fmtDur(s: number) { const h = Math.floor(s / 3600); const m = Math.floor((s % 3600) / 60); const sec = s % 60; return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s` }
function fmtDate(d: string) { return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }

export default function MatchRecordsPage() {
  const t = useTranslations()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('highestRated')

  useEffect(() => { fetch('/api/records-matches').then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false)) }, [])

  const list = data?.[tab] || []
  const isMatch = ['highestRated', 'longestMatches', 'shortestMatches', 'mostParticipants'].includes(tab)

  return (
    <div className="relative">
      <Hero img={HERO} t1="Match" t2="Records" sub="The greatest, longest, shortest, and most extreme matches in WWE history." />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <TabBar tabs={TABS} active={tab} set={setTab} />
        {loading ? <Skel /> : list.length === 0 ? <Empty /> : (
          <div className="mt-6 space-y-1">
            {list.map((item: any, i: number) => {
              const matchHref = item.show_slug && item.slug ? `/shows/${item.show_slug}/matches/${item.slug}` : null
              const superstarHref = item.slug ? `/superstars/${item.slug}` : null

              return (
                <div key={i} className="rounded-lg border border-transparent hover:bg-bg-secondary/40 hover:border-border-subtle/20 transition-all">
                  {isMatch ? (
                    <Link href={matchHref || '#'} className="group flex items-center gap-3 px-4 py-3.5">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/25' : 'bg-bg-tertiary/50 text-text-secondary border border-border-subtle/20'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </span>

                      {/* Participant photos */}
                      {item.participants && item.participants.length > 0 && (
                        <div className="flex -space-x-1.5 shrink-0">
                          {item.participants.slice(0, 5).map((p: any) => (
                            <div key={p.id} className={`w-8 h-8 rounded-full overflow-hidden border-2 bg-bg-tertiary ${p.is_winner ? 'border-emerald-500/40' : 'border-bg-primary'}`}>
                              {p.photo_url ? <Image src={p.photo_url} alt="" width={32} height={32} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-[10px]">👤</div>}
                            </div>
                          ))}
                          {item.participant_count > 5 && <div className="w-8 h-8 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[8px] text-text-secondary">+{item.participant_count - 5}</div>}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm text-text-white font-medium group-hover:text-neon-blue transition-colors truncate">
                            {item.participants?.map((p: any) => p.name).join(' vs ') || item.match_type || 'Match'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-text-secondary flex-wrap">
                          {item.show_name && <span>{item.show_name}</span>}
                          {item.date && <span className="font-mono">{fmtDate(item.date)}</span>}
                          {item.match_type && <span className="text-neon-blue uppercase font-semibold">{item.match_type}</span>}
                          {item.championship && <span className="text-yellow-400">🏆 {item.championship}</span>}
                        </div>
                      </div>
                      <span className="text-sm text-neon-blue font-bold font-mono shrink-0">
                        {tab === 'highestRated' && `${item.rating}★`}
                        {(tab === 'longestMatches' || tab === 'shortestMatches') && fmtDur(item.duration_seconds)}
                        {tab === 'mostParticipants' && `${item.participant_count} wrestlers`}
                      </span>
                    </Link>
                  ) : (
                    <Link href={superstarHref || '#'} className="group flex items-center gap-3 px-4 py-3.5">
                      <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'bg-neon-blue/15 text-neon-blue border border-neon-blue/25' : 'bg-bg-tertiary/50 text-text-secondary border border-border-subtle/20'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                      </span>
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-border-subtle/30 shrink-0 bg-bg-tertiary">
                        {item.photo_url ? <Image src={item.photo_url} alt="" width={40} height={40} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm">👤</div>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm text-text-white font-medium group-hover:text-neon-blue transition-colors truncate block">{item.name}</span>
                        {item.date && <span className="text-[10px] text-text-secondary font-mono">{fmtDate(item.date)}</span>}
                      </div>
                      <span className="text-sm text-neon-blue font-bold font-mono shrink-0">{item.age} years old</span>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
      <SeoBlock t=t('records.matches') p="Every WWE match record computed from 100,000+ matches. Highest rated all-time, longest and shortest bouts, youngest and oldest competitors to ever step in a WWE ring." />
    </div>
  )
}

function Hero({ img, t1, t2, sub }: any) {
  return (
    <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] overflow-hidden">
      <Image src={img} alt={`${t1} ${t2}`} fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-[50%_25%]" />
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
