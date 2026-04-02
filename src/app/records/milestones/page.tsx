'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


const HERO = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/wwesiege_2026-03-21_16_54_30.597250.png.png'

const TABS = [
  { id: 'eras', label: '🏛️ Era Comparison' },
  { id: 'decades', label: '📅 By Decade' },
  { id: 'yearly', label: '📊 Year by Year' },
]

export default function MilestonesPage() {
  const t = useTranslations()

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('eras')

  useEffect(() => { fetch('/api/records-milestones').then(r => r.json()).then(d => setData(d)).catch(() => {}).finally(() => setLoading(false)) }, [])

  return (
    <div className="relative">
      <Hero img={HERO} t1="Historical" t2="Milestones" sub="70+ years of WWE history visualized — era by era, decade by decade, year by year." />
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <TabBar tabs={TABS} active={tab} set={setTab} />

        {loading ? <Skel /> : !data ? <Empty /> : (
          <>
            {/* Peak Year Highlight */}
            {data.peakYear && tab === 'yearly' && (
              <div className="mb-6 rounded-2xl border border-neon-blue/20 bg-neon-blue/5 p-5 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-neon-blue/15 flex items-center justify-center text-2xl shrink-0">🏆</div>
                <div>
                  <p className="text-[10px] text-neon-blue uppercase tracking-widest font-bold mb-0.5">Peak Year — Most Matches Recorded</p>
                  <p className="text-2xl font-display font-bold text-text-white">{data.peakYear.year} — <span className="text-neon-blue">{data.peakYear.matches.toLocaleString()} matches</span></p>
                  <p className="text-xs text-text-secondary">{data.peakYear.title_changes} title changes{data.peakYear.avg_rating ? ` · Avg rating: ${data.peakYear.avg_rating}★` : ''}</p>
                </div>
              </div>
            )}

            {/* ERA COMPARISON */}
            {tab === 'eras' && data.eraStats && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.eraStats.map((era: any) => (
                  <div key={era.id} className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-5 hover:border-neon-blue/20 transition-all">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">🏛️</span>
                      <div>
                        <h3 className="font-display text-sm font-bold text-text-white">{era.name}</h3>
                        <p className="text-[10px] text-text-secondary">{era.start_year} — {era.end_year || t('common.present')}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <StatBox label={t('home.stats.matches')} value={era.total_matches.toLocaleString()} />
                      <StatBox label={t('home.stats.shows')} value={era.total_shows.toLocaleString()} />
                      <StatBox label={t('home.stats.titleChanges')} value={era.total_title_changes.toLocaleString()} />
                      <StatBox label="Avg Rating" value={era.avg_rating ? `${era.avg_rating}★` : '—'} />
                    </div>
                    {era.total_attendance > 0 && (
                      <div className="mt-3 pt-3 border-t border-border-subtle/15">
                        <p className="text-[10px] text-text-secondary uppercase tracking-wider">Total Attendance</p>
                        <p className="text-lg font-display font-bold text-neon-blue">{era.total_attendance.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* DECADE STATS */}
            {tab === 'decades' && data.decadeStats && (
              <div className="mt-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {data.decadeStats.map((d: any) => (
                    <div key={d.decade} className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-5 text-center hover:border-neon-blue/20 transition-all">
                      <h3 className="font-display text-xl font-bold text-neon-blue mb-3">{d.decade}</h3>
                      <div className="space-y-2">
                        <div><p className="text-xl font-bold text-text-white">{d.matches.toLocaleString()}</p><p className="text-[10px] text-text-secondary uppercase">{t('home.stats.matches')}</p></div>
                        <div><p className="text-lg font-bold text-text-white">{d.shows.toLocaleString()}</p><p className="text-[10px] text-text-secondary uppercase">{t('home.stats.shows')}</p></div>
                        {d.attendance > 0 && <div><p className="text-lg font-bold text-text-white">{d.attendance.toLocaleString()}</p><p className="text-[10px] text-text-secondary uppercase">{t('shows.detail.attendance')}</p></div>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Visual bar chart for decades */}
                <div className="mt-8 rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-5">
                  <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Matches by Decade</h3>
                  <div className="space-y-3">
                    {data.decadeStats.map((d: any) => {
                      const maxMatches = Math.max(...data.decadeStats.map((x: any) => x.matches))
                      const pct = maxMatches > 0 ? (d.matches / maxMatches) * 100 : 0
                      return (
                        <div key={d.decade} className="flex items-center gap-3">
                          <span className="text-xs text-text-white font-bold w-12">{d.decade}</span>
                          <div className="flex-1 h-6 rounded-full bg-bg-tertiary/50 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-neon-blue/60 to-neon-blue transition-all flex items-center justify-end pr-2" style={{ width: `${pct}%` }}>
                              {pct > 15 && <span className="text-[9px] text-black font-bold">{d.matches.toLocaleString()}</span>}
                            </div>
                          </div>
                          {pct <= 15 && <span className="text-[10px] text-text-secondary font-mono w-16 text-right">{d.matches.toLocaleString()}</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* YEAR BY YEAR */}
            {tab === 'yearly' && data.matchesPerYear && (
              <div className="mt-6">
                {/* Summary bar chart — last 30 years */}
                <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-5 mb-6">
                  <h3 className="text-sm font-bold text-neon-blue uppercase tracking-wider mb-4">Matches Per Year (Last 30 Years)</h3>
                  <div className="flex items-end gap-[2px] h-40 sm:h-52">
                    {data.matchesPerYear.slice(-30).map((y: any) => {
                      const maxM = Math.max(...data.matchesPerYear.slice(-30).map((x: any) => x.matches))
                      const h = maxM > 0 ? (y.matches / maxM) * 100 : 0
                      return (
                        <div key={y.year} className="flex-1 flex flex-col items-center justify-end group relative">
                          <div className="w-full rounded-t bg-gradient-to-t from-neon-blue/70 to-neon-blue/40 transition-all group-hover:from-neon-blue group-hover:to-neon-blue/60" style={{ height: `${h}%`, minHeight: '2px' }} />
                          <span className="text-[7px] sm:text-[8px] text-text-secondary/60 mt-1 -rotate-45 origin-top-left">{y.year}</span>
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full mb-1 hidden group-hover:block bg-bg-secondary border border-border-subtle/40 rounded-lg p-2 text-[10px] text-text-white shadow-xl z-10 whitespace-nowrap">
                            <p className="font-bold text-neon-blue">{y.year}</p>
                            <p>{y.matches.toLocaleString()} matches</p>
                            <p>{y.title_changes} title changes</p>
                            {y.avg_rating && <p>Avg: {y.avg_rating}★</p>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Full year table */}
                <div className="hidden lg:grid lg:grid-cols-[80px_1fr_120px_120px_100px] gap-3 px-4 pb-2 text-[10px] text-text-secondary uppercase tracking-wider font-medium border-b border-border-subtle/20">
                  <span>{t('matches.search.year')}</span><span>{t('home.stats.matches')}</span><span>{t('home.stats.titleChanges')}</span><span>Avg Rating</span><span className="text-right">Bar</span>
                </div>
                <div className="space-y-0.5 mt-1 max-h-[600px] overflow-y-auto">
                  {[...data.matchesPerYear].reverse().map((y: any) => {
                    const maxM = Math.max(...data.matchesPerYear.map((x: any) => x.matches))
                    const pct = maxM > 0 ? (y.matches / maxM) * 100 : 0
                    return (
                      <div key={y.year} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-bg-secondary/30 transition-all">
                        <span className="text-sm text-neon-blue font-bold font-mono w-12">{y.year}</span>
                        <span className="text-sm text-text-white font-medium w-24">{y.matches.toLocaleString()}</span>
                        <span className="text-xs text-text-secondary w-24">{y.title_changes} changes</span>
                        <span className="text-xs text-yellow-400 w-20">{y.avg_rating ? `${y.avg_rating}★` : '—'}</span>
                        <div className="flex-1 h-3 rounded-full bg-bg-tertiary/50 overflow-hidden">
                          <div className="h-full rounded-full bg-neon-blue/50" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </section>
      <SeoBlock t={t('records.milestones')} p="The complete statistical history of WWE, decade by decade, era by era. Track the growth of professional wrestling from the 1950s to today through matches, shows, attendance, and championship data." />
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-bg-tertiary/30 p-2.5 text-center">
      <p className="text-sm font-bold text-text-white">{value}</p>
      <p className="text-[9px] text-text-secondary uppercase tracking-wider">{label}</p>
    </div>
  )
}

function Hero({ img, t1, t2, sub }: any) {
  return (
    <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] overflow-hidden">
      <Image src={img} alt={`${t1} ${t2}`} fill priority sizes="100vw" quality={100} className="object-cover object-[50%_30%]" />
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
function Skel() { return <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-bg-secondary/30 animate-pulse" />)}</div> }
function Empty() { return <div className="text-center py-20"><p className="text-text-secondary">No data available</p></div> }
function SeoBlock({ t, p }: { t: string; p: string }) { return <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8"><div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-text-white mb-3">About <span className="text-neon-blue">{t}</span></h2><p className="text-text-secondary text-sm leading-relaxed">{p}</p></div></section> }
