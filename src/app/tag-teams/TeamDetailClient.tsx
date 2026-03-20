'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ShareButtons } from '@/components/ui/ShareButtons'

type TabKey = 'matches' | 'stats'
interface Props { type: 'tag_team' | 'stable' }

function fmt(d: string | null) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
function fmtShort(d: string | null) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) }

export default function TeamDetailClient({ type }: Props) {
  const params = useParams()
  const slug = params?.slug as string

  const [entity, setEntity] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [matchCount, setMatchCount] = useState(0)
  const [matchPage, setMatchPage] = useState(1)
  const [matchTotalPages, setMatchTotalPages] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [prev, setPrev] = useState<any>(null)
  const [next, setNext] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>('matches')

  const endpoint = type === 'tag_team' ? '/api/tag-team-detail' : '/api/stable-detail'
  const basePath = type === 'tag_team' ? '/tag-teams/teams' : '/tag-teams/stables'
  const label = type === 'tag_team' ? 'Tag Team' : 'Stable'

  const fetchData = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const r = await fetch(`${endpoint}?slug=${slug}&page=${p}`)
      const d = await r.json()
      setEntity(d.team || d.stable || null)
      setMembers(d.members || [])
      setMatches(d.matches || [])
      setMatchCount(d.matchCount || 0)
      setMatchPage(d.matchPage || 1)
      setMatchTotalPages(d.matchTotalPages || 0)
      setStats(d.stats || null)
      setPrev(d.prev || null)
      setNext(d.next || null)
    } catch {}
    setLoading(false)
  }, [endpoint, slug])

  useEffect(() => { fetchData(1) }, [fetchData])

  if (loading) return (
    <div className="min-h-screen bg-bg-primary">
      <div className="h-[300px] bg-bg-secondary/20 animate-pulse" />
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="h-8 w-48 rounded bg-bg-secondary/30 animate-pulse" />
        <div className="h-64 rounded-2xl bg-bg-secondary/20 animate-pulse" />
      </div>
    </div>
  )

  if (!entity) return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><p className="text-text-secondary text-lg">Not found</p></div>

  const memberSuperstars = members.map(m => m.superstar).filter(Boolean)

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-bg-primary" />
        {entity.photo_url && (
          <div className="absolute inset-0 opacity-20">
            <Image src={entity.photo_url} alt="" fill className="object-cover blur-2xl" sizes="100vw" unoptimized />
          </div>
        )}

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
            <Link href="/tag-teams" className="hover:text-neon-blue transition-colors">Tag Teams & Stables</Link>
            <span>/</span>
            <Link href={type === 'tag_team' ? '/tag-teams/teams' : '/tag-teams/stables'} className="hover:text-neon-blue transition-colors">{label}s</Link>
            <span>/</span>
            <span className="text-neon-blue">{entity.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            {/* Photo */}
            {entity.photo_url && (
              <div className="relative w-full lg:w-80 xl:w-96 h-56 sm:h-64 lg:h-auto rounded-2xl overflow-hidden border border-border-subtle/30 shrink-0">
                <Image src={entity.photo_url} alt={entity.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 400px" unoptimized />
                <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.2)]" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-blue/15 border border-neon-blue/30 text-neon-blue font-bold uppercase tracking-wider">{label}</span>
                {entity.is_active ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">Active</span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold">Disbanded</span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-text-white mb-3">{entity.name}</h1>

              {/* Dates */}
              <div className="flex flex-wrap gap-4 text-sm mb-4">
                {entity.formed_date && <div><span className="text-[10px] text-text-secondary uppercase tracking-wider block">Formed</span><span className="text-text-white font-medium">{fmt(entity.formed_date)}</span></div>}
                {entity.split_date && <div><span className="text-[10px] text-text-secondary uppercase tracking-wider block">Split</span><span className="text-text-white font-medium">{fmt(entity.split_date)}</span></div>}
                {stats && <div><span className="text-[10px] text-text-secondary uppercase tracking-wider block">Matches Together</span><span className="text-neon-blue font-bold text-lg">{stats.totalMatches}</span></div>}
                {stats && stats.totalMatches > 0 && <div><span className="text-[10px] text-text-secondary uppercase tracking-wider block">Win Rate</span><span className="text-neon-blue font-bold text-lg">{stats.winRate}%</span></div>}
              </div>

              {entity.description_md && <p className="text-text-secondary text-sm leading-relaxed mb-5">{entity.description_md}</p>}

              {/* Members */}
              <div className="mb-4">
                <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Members</p>
                <div className="flex flex-wrap gap-3">
                  {memberSuperstars.map((s: any) => (
                    <Link key={s.id} href={`/superstars/${s.slug}`} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-secondary/30 border border-border-subtle/20 hover:border-neon-blue/30 transition-all group">
                      <div className="w-8 h-8 rounded-full overflow-hidden border border-border-subtle/30 bg-bg-tertiary shrink-0">
                        {s.photo_url ? <Image src={s.photo_url} alt={s.name} width={32} height={32} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">👤</div>}
                      </div>
                      <span className="text-xs font-medium text-text-white group-hover:text-neon-blue transition-colors">{s.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <ShareButtons title={`${entity.name} — WWE ${label} | Pinfall Data`} />
            </div>
          </div>
        </div>

        <div className="neon-line-animated neon-line-glow h-px" />
      </section>

      {/* ===== TABS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-1 border-b border-border-subtle/20 pt-4">
          {[{ key: 'matches' as TabKey, label: `💪 Matches (${matchCount})` }, { key: 'stats' as TabKey, label: '📊 Statistics' }].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-all ${tab === t.key ? 'border-neon-blue text-neon-blue' : 'border-transparent text-text-secondary hover:text-text-white'}`}>{t.label}</button>
          ))}
        </div>
      </section>

      {/* ===== TAB: MATCHES ===== */}
      {tab === 'matches' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          {matches.length === 0 ? (
            <div className="text-center py-12"><p className="text-text-secondary">No matches found for this {label.toLowerCase()}.</p></div>
          ) : (
            <>
              <div className="space-y-2">
                {matches.map(m => <MatchRow key={m.id} match={m} memberIds={memberSuperstars.map((s: any) => s.id)} />)}
              </div>
              {matchTotalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-border-subtle/20">
                  <p className="text-xs text-text-secondary">Page {matchPage} of {matchTotalPages}</p>
                  <div className="flex gap-1">
                    <button onClick={() => fetchData(matchPage - 1)} disabled={matchPage <= 1} className="px-3 py-1.5 rounded-lg text-xs border border-border-subtle/30 text-text-secondary disabled:opacity-30">Prev</button>
                    <button onClick={() => fetchData(matchPage + 1)} disabled={matchPage >= matchTotalPages} className="px-3 py-1.5 rounded-lg text-xs border border-border-subtle/30 text-text-secondary disabled:opacity-30">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ===== TAB: STATS ===== */}
      {tab === 'stats' && stats && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Matches', value: stats.totalMatches, color: 'text-text-white' },
              { label: 'Wins', value: stats.wins, color: 'text-emerald-400' },
              { label: 'Losses', value: stats.losses, color: 'text-red-400' },
              { label: 'Draws', value: stats.draws, color: 'text-neon-blue' },
              { label: 'Win Rate', value: `${stats.winRate}%`, color: 'text-neon-blue' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-4 sm:p-5 text-center">
                <span className={`block text-2xl sm:text-3xl font-bold font-display ${s.color}`}>{s.value}</span>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>

          {stats.totalMatches > 0 && (
            <div className="mt-6 rounded-2xl border border-border-subtle/20 bg-bg-secondary/15 p-5">
              <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-3">Win/Loss Distribution</p>
              <div className="h-4 rounded-full overflow-hidden bg-bg-tertiary flex">
                {stats.wins > 0 && <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(stats.wins / stats.totalMatches) * 100}%` }} />}
                {stats.draws > 0 && <div className="h-full bg-neon-blue transition-all" style={{ width: `${(stats.draws / stats.totalMatches) * 100}%` }} />}
                {stats.losses > 0 && <div className="h-full bg-red-500 transition-all" style={{ width: `${(stats.losses / stats.totalMatches) * 100}%` }} />}
              </div>
              <div className="flex items-center gap-4 mt-2 text-[10px] text-text-secondary">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Wins ({stats.wins})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-neon-blue" /> Draws ({stats.draws})</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Losses ({stats.losses})</span>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ===== PREV/NEXT ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="neon-line mb-8" />
        <div className="grid grid-cols-2 gap-4">
          {prev ? (
            <Link href={`${basePath}/${prev.slug}`} className="group rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-4 sm:p-5 hover:border-neon-blue/25 transition-all">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider flex items-center gap-1"><svg className="w-3 h-3 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Previous</span>
              <span className="font-display text-lg font-bold text-text-white group-hover:text-neon-blue transition-colors block mt-1 truncate">{prev.name}</span>
            </Link>
          ) : <div />}
          {next ? (
            <Link href={`${basePath}/${next.slug}`} className="group rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-4 sm:p-5 text-right hover:border-neon-blue/25 transition-all">
              <span className="text-[10px] text-text-secondary uppercase tracking-wider flex items-center gap-1 justify-end">Next <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></span>
              <span className="font-display text-lg font-bold text-text-white group-hover:text-neon-blue transition-colors block mt-1 truncate">{next.name}</span>
            </Link>
          ) : <div />}
        </div>
      </section>
    </div>
  )
}

/* ===== Match Row — like championship history expanded ===== */
function MatchRow({ match, memberIds }: { match: any; memberIds: number[] }) {
  const show = match.show
  const participants = match.participants || []
  const teams = new Map<number, any[]>()
  for (const p of participants) {
    const tn = p.team_number || 0
    if (!teams.has(tn)) teams.set(tn, [])
    teams.get(tn)!.push(p)
  }
  const teamEntries = Array.from(teams.entries()).sort((a, b) => a[0] - b[0])
  const isWin = participants.find((p: any) => memberIds.includes(p.superstar?.id) && p.is_winner)

  return (
    <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 px-4 py-3 rounded-xl border transition-all ${isWin ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-border-subtle/15 bg-bg-secondary/10 hover:bg-bg-secondary/20'}`}>
      {/* Date */}
      <div className="shrink-0 w-20">
        <span className="text-[10px] text-text-secondary font-mono">{match.date ? fmt(match.date) : show?.date ? fmt(show.date) : '—'}</span>
      </div>

      {/* Result badge */}
      <div className="shrink-0">
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${isWin ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {isWin ? 'W' : 'L'}
        </span>
      </div>

      {/* Teams */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          {teamEntries.map(([tn, parts], ti) => (
            <span key={tn} className="flex items-center gap-1 flex-wrap">
              {ti > 0 && <span className="text-text-secondary text-xs mx-1">vs</span>}
              {parts.map((p: any, pi: number) => (
                <span key={p.id} className="flex items-center gap-0.5">
                  {pi > 0 && <span className="text-text-secondary text-[10px]">&amp;</span>}
                  {p.superstar?.photo_url && <div className="w-5 h-5 rounded-full overflow-hidden shrink-0"><Image src={p.superstar.photo_url} alt="" width={20} height={20} className="w-full h-full object-cover" /></div>}
                  <Link href={`/superstars/${p.superstar?.slug}`} className={`text-xs hover:underline ${memberIds.includes(p.superstar?.id) ? 'text-neon-blue font-bold' : 'text-text-white'}`}>{p.superstar?.name}</Link>
                </span>
              ))}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-text-secondary">{match.match_type?.name}</span>
          {match.championship && <span className="text-[10px] text-neon-blue">🏆 {match.championship.name}</span>}
          {match.is_title_change && <span className="text-[9px] px-1 py-0.5 rounded bg-neon-blue/15 text-neon-blue font-bold">TITLE CHANGE</span>}
        </div>
      </div>

      {/* Show + Rating */}
      <div className="shrink-0 text-right hidden sm:block">
        {show && <Link href={`/shows/${show.slug}`} className="text-[10px] text-text-secondary hover:text-neon-blue transition-colors block">{show.name}</Link>}
        {match.rating && <span className="text-[10px] text-neon-blue font-mono">★ {match.rating}</span>}
      </div>
    </div>
  )
}
