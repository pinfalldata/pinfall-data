'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ShareButtons } from '@/components/ui/ShareButtons'
import { StarRating } from '@/components/ui/StarRating'
import { useTranslations } from 'next-intl'


type TabKey = 'matches' | 'stats'
interface Props { type: 'tag_team' | 'stable' }

function fmt(d: string | null) { if (!d) return '—'; return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
function fmtShort(d: string | null) { if (!d) return '—'; const dt = new Date(d + 'T00:00:00'); return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}` }

// Group participants by team_number
function buildTeams(participants: any[]): { team_number: number; is_winner: boolean; members: any[] }[] {
  const map = new Map<number, { is_winner: boolean; members: any[] }>()
  for (const p of participants) {
    const tn = p.team_number || 0
    if (!map.has(tn)) map.set(tn, { is_winner: false, members: [] })
    const t = map.get(tn)!
    if (p.is_winner) t.is_winner = true
    t.members.push({
      id: p.superstar?.id,
      name: p.superstar?.name || '?',
      slug: p.superstar?.slug,
      photo_url: p.superstar?.photo_url,
    })
  }
  return Array.from(map.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([tn, data]) => ({ team_number: tn, ...data }))
}

export default function TeamDetailClient({ type }: Props) {
  const t = useTranslations()

  const params = useParams()
  const slug = params?.slug as string

  const [entity, setEntity] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [matchCount, setMatchCount] = useState(0)
  const [matchPage, setMatchPage] = useState(1)
  const [matchTotalPages, setMatchTotalPages] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [championships, setChampionships] = useState<any[]>([])
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
      setChampionships(d.championships || [])
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
  const memberIds = memberSuperstars.map((s: any) => s.id)

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-bg-primary" />
        {entity.photo_url && (
          <div className="absolute inset-0 opacity-20">
            <Image src={entity.photo_url} alt="" fill className="object-cover blur-2xl" sizes="100vw" unoptimized />
          </div>
        )}

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
            <Link href="/tag-teams" className="hover:text-neon-blue transition-colors">{t('tagTeams.title')}</Link>
            <span>/</span>
            <Link href={type === 'tag_team' ? '/tag-teams/teams' : '/tag-teams/stables'} className="hover:text-neon-blue transition-colors">{label}s</Link>
            <span>/</span>
            <span className="text-neon-blue">{entity.name}</span>
          </nav>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
            {entity.photo_url && (
              <div className="relative w-full lg:w-80 xl:w-96 h-56 sm:h-64 lg:h-auto rounded-2xl overflow-hidden border border-border-subtle/30 shrink-0">
                <Image src={entity.photo_url} alt={entity.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 400px" unoptimized />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-blue/15 border border-neon-blue/30 text-neon-blue font-bold uppercase tracking-wider">{label}</span>
                {entity.is_active ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold">{t('common.active')}</span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold">Disbanded</span>
                )}
              </div>

              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-text-white mb-3">{entity.name}</h1>

              <div className="flex flex-wrap gap-4 text-sm mb-4">
                {entity.formed_date && <div><span className="text-[10px] text-text-secondary uppercase tracking-wider block">Formed</span><span className="text-text-white font-medium">{fmt(entity.formed_date)}</span></div>}
                {entity.split_date && <div><span className="text-[10px] text-text-secondary uppercase tracking-wider block">Split</span><span className="text-text-white font-medium">{fmt(entity.split_date)}</span></div>}
                {stats && <div><span className="text-[10px] text-text-secondary uppercase tracking-wider block">Matches Together</span><span className="text-neon-blue font-bold text-lg">{stats.totalMatches}</span></div>}
                {stats && stats.totalMatches > 0 && <div><span className="text-[10px] text-text-secondary uppercase tracking-wider block">{t('common.winRate')}</span><span className="text-neon-blue font-bold text-lg">{stats.winRate}%</span></div>}
              </div>

              {entity.description_md && <p className="text-text-secondary text-sm leading-relaxed mb-5">{entity.description_md}</p>}

              {/* Members */}
              <div className="mb-4">
                <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">{t('tagTeams.members')}</p>
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

              {/* Championships */}
              {championships.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider mb-2">Championship Reigns</p>
                  <div className="flex flex-col gap-2">
                    {championships.map((r: any) => (
                      <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-neon-blue/5 border border-neon-blue/15">
                        {r.championship?.image_url && (
                          <div className="relative w-10 h-10 shrink-0">
                            <Image src={r.championship.image_url} alt={r.championship.name} fill className="object-contain" sizes="40px" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {r.championship?.slug ? (
                            <Link href={`/champions/${r.championship.slug}`} className="text-xs text-neon-blue font-bold hover:underline">{r.championship.name}</Link>
                          ) : (
                            <span className="text-xs text-neon-blue font-bold">{r.championship?.name}</span>
                          )}
                          <p className="text-[10px] text-text-secondary">
                            {r.won_date ? fmt(r.won_date) : '?'} — {r.lost_date ? fmt(r.lost_date) : t('common.present')}
                            {r.days_held ? ` · ${r.days_held} days` : ''}
                            {r.reign_number ? ` · Reign #${r.reign_number}` : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {/* ===== TAB: MATCHES — Match Search style ===== */}
      {tab === 'matches' && (
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
          {matches.length === 0 ? (
            <div className="text-center py-12"><p className="text-text-secondary">No matches found for this {label.toLowerCase()}.</p></div>
          ) : (
            <>
              {/* Desktop header */}
              <div className="hidden lg:grid lg:grid-cols-[90px_minmax(120px,1.2fr)_130px_minmax(250px,3fr)_100px_55px] gap-3 px-4 py-2 text-[10px] text-text-secondary uppercase tracking-wider border-b border-border-subtle/20 mb-1">
                <span>{t('shows.detail.date')}</span><span>Show</span><span>Type</span><span>{t('matches.detail.participants')}</span><span>Title</span><span className="text-center">{t('common.rating')}</span>
              </div>

              {matches.map(m => (
                <MRow key={m.id} match={m} memberIds={memberIds} />
              ))}

              {matchTotalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-border-subtle/20">
                  <p className="text-xs text-text-secondary">Page {matchPage} of {matchTotalPages} — {matchCount} matches</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => fetchData(matchPage - 1)} disabled={matchPage <= 1} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    {getVisiblePages(matchPage, matchTotalPages).map((p, i) =>
                      p === 'e' ? <span key={`e${i}`} className="w-8 text-center text-text-secondary text-xs">…</span> :
                      <button key={p} onClick={() => fetchData(p as number)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${p === matchPage ? 'bg-neon-blue/20 border border-neon-blue/40 text-neon-blue' : 'border border-transparent text-text-secondary hover:text-text-white hover:bg-bg-secondary/50'}`}>{p}</button>
                    )}
                    <button onClick={() => fetchData(matchPage + 1)} disabled={matchPage >= matchTotalPages} className="w-8 h-8 rounded-lg border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
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
              { label: t('common.totalMatches'), value: stats.totalMatches, color: 'text-text-white' },
              { label: t('common.wins'), value: stats.wins, color: 'text-emerald-400' },
              { label: t('common.losses'), value: stats.losses, color: 'text-red-400' },
              { label: t('common.draws'), value: stats.draws, color: 'text-neon-blue' },
              { label: t('common.winRate'), value: `${stats.winRate}%`, color: 'text-neon-blue' },
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
                {stats.wins > 0 && <div className="h-full bg-emerald-500" style={{ width: `${(stats.wins / stats.totalMatches) * 100}%` }} />}
                {stats.draws > 0 && <div className="h-full bg-neon-blue" style={{ width: `${(stats.draws / stats.totalMatches) * 100}%` }} />}
                {stats.losses > 0 && <div className="h-full bg-red-500" style={{ width: `${(stats.losses / stats.totalMatches) * 100}%` }} />}
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

/* ============================================================
   MRow — EXACT match search style
   ============================================================ */
function MRow({ match, memberIds }: { match: any; memberIds: number[] }) {
  const show = match.show
  const teams = buildTeams(match.participants || [])
  const showSlug = show?.slug
  const matchSlug = match.slug
  const href = showSlug && matchSlug ? `/shows/${showSlug}/matches/${matchSlug}` : '#'

  return (
    <Link href={href} className="block group">
      {/* Desktop */}
      <div className="hidden lg:grid lg:grid-cols-[90px_minmax(120px,1.2fr)_130px_minmax(250px,3fr)_100px_55px] gap-3 items-center px-4 py-3.5 rounded-lg border border-transparent transition-all duration-150 hover:bg-bg-secondary/40 hover:border-border-subtle/20">
        <span className="text-xs text-text-secondary font-mono whitespace-nowrap">{match.date ? fmtShort(match.date) : show?.date ? fmtShort(show.date) : '—'}</span>
        <span className="text-sm text-text-white truncate">{show?.name || '—'}</span>
        <span className="text-xs text-neon-blue font-semibold truncate uppercase">{match.match_type?.name || 'Match'}</span>
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          {teams.map((t, i) => (
            <span key={t.team_number} className="flex items-center gap-1 min-w-0 shrink-0">
              {i > 0 && <span className="text-[11px] text-neon-blue font-bold mx-0.5 shrink-0">vs</span>}
              <div className="flex -space-x-1.5 shrink-0">
                {t.members.slice(0, 3).map(p => (
                  <div key={p.id} className={`w-7 h-7 rounded-full overflow-hidden border-2 ${t.is_winner ? 'border-emerald-500/40' : 'border-bg-primary'}`}>
                    {p.photo_url ? <Image src={p.photo_url} alt="" width={28} height={28} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}
                  </div>
                ))}
                {t.members.length > 3 && <div className="w-7 h-7 rounded-full bg-bg-tertiary border-2 border-bg-primary flex items-center justify-center text-[8px] text-text-secondary">+{t.members.length - 3}</div>}
              </div>
              <span className={`text-xs truncate max-w-[140px] ${t.is_winner ? 'text-emerald-400 font-semibold' : 'text-text-white'}`}>
                {t.members.map(p => p.name).join(', ')}
              </span>
              {t.is_winner && <span className="text-[9px] text-emerald-400 font-bold shrink-0">✓</span>}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 min-w-0">
          {match.championship ? <>
            {match.championship.image_url && <div className="w-7 h-5 shrink-0"><Image src={match.championship.image_url} alt="" width={28} height={20} className="w-full h-full object-contain" /></div>}
            <span className="text-[10px] text-yellow-400 font-medium truncate">{match.championship.name}</span>
            {match.is_title_change && <span className="text-[8px] px-1 py-0.5 rounded bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 font-bold shrink-0">NEW!</span>}
          </> : <span className="text-[10px] text-text-secondary/30">—</span>}
        </div>
        <div className="flex justify-center">{match.rating ? <StarRating rating={match.rating} size="xs" /> : <span className="text-[10px] text-text-secondary/30">—</span>}</div>
      </div>

      {/* Mobile */}
      <div className="lg:hidden px-3 py-3.5 rounded-xl border border-transparent transition-all hover:bg-bg-secondary/40 hover:border-border-subtle/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] text-text-secondary truncate flex-1">{show?.name}</span>
          <span className="text-[10px] text-text-secondary font-mono shrink-0">{match.date ? fmtShort(match.date) : ''}</span>
        </div>
        <div className="space-y-1.5">
          {teams.map((t, i) => (
            <div key={t.team_number} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[9px] font-bold border ${t.is_winner ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-bg-tertiary/50 border-border-subtle/20 text-text-secondary/50'}`}>
                {t.is_winner ? 'W' : 'L'}
              </div>
              <div className="flex -space-x-1 shrink-0">
                {t.members.slice(0, 3).map(p => (
                  <div key={p.id} className="w-6 h-6 rounded-full overflow-hidden border border-bg-primary">
                    {p.photo_url ? <Image src={p.photo_url} alt="" width={24} height={24} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-bg-tertiary" />}
                  </div>
                ))}
              </div>
              <span className={`text-xs truncate ${t.is_winner ? 'text-text-white font-medium' : 'text-text-secondary'}`}>{t.members.map(p => p.name).join(', ')}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-[10px] text-neon-blue font-semibold uppercase">{match.match_type?.name || 'Match'}</span>
          {match.championship && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-bold">🏆 {match.championship.name}</span>}
          {match.rating && <div className="ml-auto shrink-0"><StarRating rating={match.rating} size="xs" /></div>}
        </div>
      </div>
    </Link>
  )
}

function getVisiblePages(page: number, tp: number): (number | 'e')[] {
  const p: (number | 'e')[] = []
  if (tp <= 7) { for (let i = 1; i <= tp; i++) p.push(i) }
  else { p.push(1); if (page > 3) p.push('e'); for (let i = Math.max(2, page - 1); i <= Math.min(tp - 1, page + 1); i++) p.push(i); if (page < tp - 2) p.push('e'); p.push(tp) }
  return p
}
