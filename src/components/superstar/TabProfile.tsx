'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { formatDate, formatDateShort, formatDuration, getRatingColor, getSegmentCategoryIcon } from '@/lib/utils'

export function TabProfile({ superstar, onTabChange }: { superstar: any; onTabChange?: (tabId: string) => void }) {
  const t = useTranslations()
  const [preview, setPreview] = useState<any>(null)

  useEffect(() => {
    fetch(`/api/superstar-profile-preview?superstarId=${superstar.id}`)
      .then(r => r.json())
      .then(d => { if (!d.error) setPreview(d) })
      .catch(() => {})
  }, [superstar.id])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* ═══════ LEFT COLUMN: Bio + Records + Ring Names + Activity ═══════ */}
      <div className="lg:col-span-2 space-y-6">
        {superstar.bio_md && (
          <Card title={t('superstars.profile.biography')}>
            <p className="text-text-primary leading-relaxed whitespace-pre-line">{superstar.bio_md}</p>
          </Card>
        )}

        <RecordsBlocks superstarId={superstar.id} />

        {superstar.aliases?.length > 0 && (
          <Card title={t('superstars.profile.ringNames')}>
            <div className="space-y-2">
              {superstar.aliases.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-border-subtle/20 last:border-b-0">
                  <span className="text-text-white font-medium">{a.alias}</span>
                  <span className="text-text-secondary text-sm">
                    {formatDateShort(a.start_date)} → {a.end_date ? formatDateShort(a.end_date) : 'Present'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ★★★ RECENT ACTIVITY (matches/managed/commentated/etc.) ★★★ */}
        {preview?.recentActivity?.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-border-subtle/30 bg-gradient-to-br from-bg-secondary/20 via-bg-secondary/10 to-transparent">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neon-blue/15 flex items-center justify-center">
                    <span className="text-sm">{preview.primaryRole === 'wrestler' ? '🤼' : preview.primaryRole === 'commentator' ? '🎙️' : preview.primaryRole === 'manager' ? '👔' : preview.primaryRole === 'referee' ? '👨‍⚖️' : '📺'}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-text-white">{preview.activityLabel}</h3>
                </div>
                <button onClick={() => onTabChange?.('matches')}
                  className="text-xs text-neon-blue hover:text-neon-blue/80 font-medium flex items-center gap-1 transition-colors">
                  See all <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              <div className="space-y-2">
                {preview.recentActivity.map((item: any, i: number) => (
                  <MatchPreviewRow key={item.id || i} match={item} superstarId={superstar.id} primaryRole={preview.primaryRole} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ★★★ RECENT SEGMENTS ★★★ */}
        {preview?.recentSegments?.length > 0 && (
          <div className="relative overflow-hidden rounded-2xl border border-border-subtle/30 bg-gradient-to-br from-bg-secondary/20 via-bg-secondary/10 to-transparent">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <span className="text-sm">🎤</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-text-white">{t('superstars.profile.recentSegments')}</h3>
                </div>
                <button onClick={() => onTabChange?.('segments')}
                  className="text-xs text-neon-blue hover:text-neon-blue/80 font-medium flex items-center gap-1 transition-colors">
                  See all <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              <div className="space-y-2">
                {preview.recentSegments.map((seg: any) => (
                  <Link key={seg.id} href={seg.show ? `/shows/${seg.show.slug}/segments/${seg.slug}` : '#'}
                    className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary/20 border border-border-subtle/15 hover:border-neon-blue/20 hover:bg-bg-tertiary/30 transition-all group">
                    <span className="text-lg shrink-0">{getSegmentCategoryIcon(seg.category)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-white font-medium truncate group-hover:text-neon-blue transition-colors">{seg.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {seg.show?.show_series?.logo_url && (
                          <div className="w-4 h-4 rounded overflow-hidden shrink-0">
                            <Image src={seg.show.show_series.logo_url} alt="" width={16} height={16} className="w-full h-full object-contain" unoptimized />
                          </div>
                        )}
                        <span className="text-[11px] text-text-secondary truncate">{seg.show?.name}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-text-secondary shrink-0">{formatDateShort(seg.show?.date)}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Career Breaks + Draft History */}
        {superstar.careerBreaks?.length > 0 && (
          <Card title={t('superstars.profile.careerBreaks')}>
            <div className="space-y-3">
              {superstar.careerBreaks.map((cb: any) => (
                <div key={cb.id} className="rounded-xl bg-bg-tertiary/50 p-4 border border-border-subtle/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${cb.reason === 'injury' ? 'bg-status-danger' : cb.reason === 'other_promotion' ? 'bg-status-warning' : 'bg-text-secondary'}`} />
                    <span className="text-text-white text-sm font-medium capitalize">{cb.reason.replace('_', ' ')}{cb.other_promotion && ` — ${cb.other_promotion}`}</span>
                  </div>
                  <p className="text-text-secondary text-xs">{formatDateShort(cb.start_date)} → {cb.end_date ? formatDateShort(cb.end_date) : 'Present'}</p>
                  {cb.description && <p className="text-text-secondary text-sm mt-2">{cb.description}</p>}
                </div>
              ))}
            </div>
          </Card>
        )}

        {superstar.draftHistory?.length > 0 && (
          <Card title={t('superstars.profile.draftHistory')}>
            <div className="space-y-2">
              {superstar.draftHistory.map((d: any) => (
                <div key={d.id} className="flex items-center gap-3 py-2 border-b border-border-subtle/20 last:border-b-0 flex-wrap">
                  <span className="text-text-secondary text-sm w-28 shrink-0">{formatDateShort(d.draft_date)}</span>
                  {d.from_brand && <span className="text-text-secondary text-sm">{d.from_brand} →</span>}
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${d.to_brand === 'Raw' ? 'bg-red-500/20 text-red-400' : d.to_brand === 'SmackDown' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{d.to_brand}</span>
                  <span className="text-text-secondary text-xs capitalize">{d.draft_type}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* ═══════ RIGHT COLUMN: Info + Preview Widgets ═══════ */}
      <div className="space-y-5">
        {/* Eras */}
        {superstar.eras?.length > 0 && (
          <Card title={t('superstars.profile.eras')}>
            <div className="flex flex-wrap gap-2">
              {superstar.eras.map((e: any) => (
                <span key={e.id} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${e.is_primary ? 'bg-neon-blue/15 text-neon-blue border-neon-blue/30' : 'bg-bg-tertiary text-text-secondary border-border-subtle/50'}`}>
                  {e.eras?.name || `Era ${e.era_id}`}{e.is_primary && <span className="ml-1 text-[10px] opacity-60">★</span>}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* ★★★ STATS WIDGET ★★★ */}
        {preview?.statsPreview && (
          <PreviewWidget title={t('superstars.profile.quickStats')} onSeeMore={() => onTabChange?.('statistics')} icon="📊">
            <div className="grid grid-cols-2 gap-2">
              <StatMini label="Win Rate" value={`${preview.statsPreview.winRate}%`} accent />
              <StatMini label="Total Matches" value={preview.statsPreview.total_matches} />
              <StatMini label="Wins" value={preview.statsPreview.win_count} color="text-green-400" />
              <StatMini label="Losses" value={preview.statsPreview.loss_count} color="text-red-400" />
              {preview.statsPreview.total_reigns > 0 && <StatMini label="Title Reigns" value={preview.statsPreview.total_reigns} accent />}
              {preview.statsPreview.draw_count > 0 && <StatMini label="Draws" value={preview.statsPreview.draw_count} />}
            </div>
          </PreviewWidget>
        )}

        {/* ★★★ FINISHERS WIDGET ★★★ */}
        {preview?.finishersPreview?.length > 0 && (
          <PreviewWidget title={t('superstars.profile.signatureMoves')} onSeeMore={() => onTabChange?.('moves')} icon="💥">
            <div className="space-y-2">
              {preview.finishersPreview.map((f: any) => (
                <div key={f.id} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-blue shrink-0" />
                  <span className="text-sm text-text-white font-medium">{f.name}</span>
                  {f.move_type && <span className="text-[9px] text-text-secondary/60 uppercase ml-auto">{f.move_type}</span>}
                </div>
              ))}
            </div>
          </PreviewWidget>
        )}

        {/* ★★★ OMG MOMENTS WIDGET ★★★ */}
        {preview?.omgPreview?.length > 0 && (
          <PreviewWidget title="⚡ OMG Moments" onSeeMore={() => onTabChange?.('omgMoments')} icon="⚡">
            <div className="space-y-2">
              {preview.omgPreview.map((omg: any) => (
                <div key={omg.id} className="p-2.5 rounded-lg bg-bg-tertiary/30 border border-orange-500/10">
                  <p className="text-xs text-text-white font-medium leading-snug">{omg.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {omg.category && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 font-medium capitalize">{omg.category.replace('_', ' ')}</span>}
                    {omg.show && <span className="text-[10px] text-text-secondary">{omg.show.name}</span>}
                  </div>
                </div>
              ))}
            </div>
          </PreviewWidget>
        )}

        {/* ★★★ TAG TEAM WIDGET ★★★ */}
        {preview?.tagTeamPreview && (
          <PreviewWidget title="🤝 Tag Team" onSeeMore={() => onTabChange?.('tagTeams')} icon="🤝">
            <Link href={`/tag-teams/teams/${preview.tagTeamPreview.slug}`} className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary/30 border border-border-subtle/20 hover:border-neon-blue/20 transition-all group">
              {preview.tagTeamPreview.photo_url ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image src={preview.tagTeamPreview.photo_url} alt="" width={48} height={48} className="w-full h-full object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-neon-blue/10 flex items-center justify-center shrink-0"><span className="text-xl">🤝</span></div>
              )}
              <div>
                <p className="text-sm text-text-white font-bold group-hover:text-neon-blue transition-colors">{preview.tagTeamPreview.name}</p>
              </div>
            </Link>
          </PreviewWidget>
        )}

        {/* ★★★ STABLE WIDGET ★★★ */}
        {preview?.stablePreview && (
          <PreviewWidget title="🛡️ Stable" onSeeMore={() => onTabChange?.('stables')} icon="🛡️">
            <Link href={`/tag-teams/stables/${preview.stablePreview.slug}`} className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary/30 border border-border-subtle/20 hover:border-neon-blue/20 transition-all group">
              {preview.stablePreview.photo_url ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                  <Image src={preview.stablePreview.photo_url} alt="" width={48} height={48} className="w-full h-full object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0"><span className="text-xl">🛡️</span></div>
              )}
              <div>
                <p className="text-sm text-text-white font-bold group-hover:text-neon-blue transition-colors">{preview.stablePreview.name}</p>
              </div>
            </Link>
          </PreviewWidget>
        )}

        {/* ★★★ MEDIA WIDGET ★★★ */}
        {preview?.mediaPreview?.length > 0 && (
          <PreviewWidget title="📸 Media" onSeeMore={() => onTabChange?.('gallery')} icon="📸">
            <div className="grid grid-cols-2 gap-2">
              {preview.mediaPreview.map((m: any) => {
                const isVideo = m.media_type === 'video'
                const ytId = isVideo ? m.url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/)?.[1] : null
                const thumb = m.thumbnail_url || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : m.url)
                return (
                  <div key={m.id} className="relative aspect-video rounded-lg overflow-hidden bg-bg-tertiary/30">
                    {thumb && <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
                      </div>
                    )}
                    {m.title && <div className="absolute bottom-0 inset-x-0 p-1.5 bg-gradient-to-t from-black/80 to-transparent"><p className="text-[9px] text-white truncate">{m.title}</p></div>}
                  </div>
                )
              })}
            </div>
          </PreviewWidget>
        )}

        {/* Family */}
        {superstar.families?.length > 0 && (
          <Card title={t('superstars.profile.familyInWWE')}>
            <div className="space-y-2">
              {superstar.families.map((f: any) => (
                <div key={f.id} className="flex items-center gap-3">
                  <span className="text-text-secondary text-xs capitalize w-20 shrink-0">{f.relation_type.replace('_', ' ')}</span>
                  {f.related?.slug ? (
                    <Link href={`/superstars/${f.related.slug}`} className="text-neon-blue text-sm hover:underline">{f.related.name}</Link>
                  ) : (
                    <span className="text-text-white text-sm">{f.related?.name || 'Unknown'}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {superstar.trainers?.length > 0 && (
          <Card title={t('superstars.profile.trainedBy')}>
            <div className="space-y-1">
              {superstar.trainers.map((t: any) => (
                <div key={t.id}>
                  {t.trainer?.slug ? (
                    <Link href={`/superstars/${t.trainer.slug}`} className="text-neon-blue text-sm hover:underline">{t.trainer.name}</Link>
                  ) : (
                    <span className="text-text-white text-sm">{t.trainer_name || 'Unknown'}</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {superstar.roles?.length > 1 && (
          <Card title={t('superstars.profile.roles')}>
            <div className="space-y-2">
              {superstar.roles.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-1.5 border-b border-border-subtle/20 last:border-b-0">
                  <span className={`capitalize text-sm ${r.is_primary ? 'text-neon-blue font-medium' : 'text-text-white'}`}>{r.role.replace('_', ' ')}</span>
                  {r.start_year && <span className="text-text-secondary text-xs">{r.start_year} — {r.end_year || 'Present'}</span>}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/* MATCH PREVIEW ROW                                       */
/* ═══════════════════════════════════════════════════════ */
function MatchPreviewRow({ match, superstarId, primaryRole }: { match: any; superstarId: number; primaryRole: string }) {
  const showSlug = match.show?.slug
  const matchSlug = match.slug
  const href = showSlug && matchSlug ? `/shows/${showSlug}/matches/${matchSlug}` : showSlug ? `/shows/${showSlug}` : '#'

  const resultColors: Record<string, string> = {
    win: 'bg-green-500/20 text-green-400 border-green-500/30',
    loss: 'bg-red-500/20 text-red-400 border-red-500/30',
    draw: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }

  return (
    <Link href={href} className="flex items-center gap-3 p-3 rounded-xl bg-bg-tertiary/20 border border-border-subtle/15 hover:border-neon-blue/20 hover:bg-bg-tertiary/30 transition-all group">
      {/* Result badge (for wrestlers) */}
      {primaryRole === 'wrestler' && match.matchResult && (
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase border shrink-0 ${resultColors[match.matchResult] || 'bg-bg-tertiary text-text-secondary border-border-subtle/30'}`}>
          {match.matchResult === 'win' ? 'W' : match.matchResult === 'loss' ? 'L' : 'D'}
        </div>
      )}

      {/* Show series logo */}
      {match.show?.show_series?.logo_url && (
        <div className="w-6 h-6 rounded overflow-hidden shrink-0">
          <Image src={match.show.show_series.logo_url} alt="" width={24} height={24} className="w-full h-full object-contain" unoptimized />
        </div>
      )}

      {/* Match info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {match.match_type && <span className="text-xs text-text-white truncate group-hover:text-neon-blue transition-colors">{match.match_type.name}</span>}
          {!match.match_type && match.show && <span className="text-xs text-text-white truncate group-hover:text-neon-blue transition-colors">{match.show.name}</span>}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-text-secondary">{match.show?.name}</span>
          {match.rating && <span className={`text-[11px] font-mono ${getRatingColor(match.rating)}`}>{match.rating}★</span>}
        </div>
      </div>

      {/* Date + duration */}
      <div className="text-right shrink-0">
        <span className="text-[11px] text-text-secondary block">{formatDateShort(match.date)}</span>
        {match.duration_seconds && <span className="text-[10px] text-text-secondary/60">{formatDuration(match.duration_seconds)}</span>}
      </div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════════════ */
/* PREVIEW WIDGET — Glass card with "See more" link        */
/* ═══════════════════════════════════════════════════════ */
function PreviewWidget({ title, onSeeMore, icon, children }: { title: string; onSeeMore: () => void; icon: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-subtle/30 bg-gradient-to-br from-bg-secondary/20 to-transparent overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-text-white flex items-center gap-2">
            <span className="w-1 h-3.5 bg-neon-blue rounded-full" />
            {title}
          </h4>
          <button onClick={onSeeMore} className="text-[10px] text-neon-blue hover:text-neon-blue/80 font-medium flex items-center gap-0.5 transition-colors">
            See more <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/* STAT MINI — Small stat block for the stats widget       */
/* ═══════════════════════════════════════════════════════ */
function StatMini({ label, value, accent, color }: { label: string; value: any; accent?: boolean; color?: string }) {
  return (
    <div className={`p-2.5 rounded-lg text-center ${accent ? 'bg-neon-blue/10 border border-neon-blue/20' : 'bg-bg-tertiary/30 border border-border-subtle/15'}`}>
      <span className="block text-[9px] text-text-secondary uppercase tracking-wider mb-0.5">{label}</span>
      <span className={`block text-base font-bold font-display ${color || (accent ? 'text-neon-blue' : 'text-text-white')}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </span>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════ */
/* GOLDEN RECORDS BLOCKS                                   */
/* ═══════════════════════════════════════════════════════ */
function RecordsBlocks({ superstarId }: { superstarId: number }) {
  const t = useTranslations()
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    fetch(`/api/superstar-records?superstarId=${superstarId}`)
      .then(r => r.json())
      .then(d => setRecords(d.records || []))
      .catch(() => {})
  }, [superstarId])

  if (records.length === 0) return null

  return (
    <div className="space-y-3">
      {records.map((rec, i) => (
        <div key={i} className="relative overflow-hidden rounded-2xl border border-yellow-500/30"
          style={{ background: 'linear-gradient(135deg, rgba(199,160,90,0.08) 0%, rgba(199,160,90,0.03) 50%, rgba(199,160,90,0.08) 100%)' }}>
          <div className="absolute inset-0 opacity-[0.06]" style={{
            background: 'linear-gradient(135deg, transparent 20%, rgba(255,215,0,0.5) 45%, rgba(255,215,0,0.7) 50%, rgba(255,215,0,0.5) 55%, transparent 80%)',
            backgroundSize: '300% 300%', animation: 'belt-shimmer 5s ease-in-out infinite',
          }} />
          <div className="relative flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
            <div className="shrink-0">
              {rec.championshipImage ? (
                <div className="w-14 h-14 sm:w-16 sm:h-16 relative">
                  <Image src={rec.championshipImage} alt="" fill className="object-contain drop-shadow-[0_0_8px_rgba(255,215,0,0.3)]" sizes="64px" unoptimized />
                </div>
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/10 border border-yellow-500/30 flex items-center justify-center">
                  <span className="text-2xl">{rec.icon || '🏆'}</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/25 text-yellow-400 font-bold uppercase tracking-[0.15em]">{t('superstars.profile.recordHolder')}</span>
              </div>
              <h4 className="text-sm sm:text-base font-bold text-yellow-400/90 font-display">{rec.type}</h4>
              {rec.subtitle && <p className="text-xs text-yellow-400/50 mt-0.5">{rec.subtitle}</p>}
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg sm:text-2xl font-bold font-display text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(180deg, #e8d5a0 0%, #c7a05a 50%, #a07830 100%)' }}>
                {rec.value}
              </span>
            </div>
          </div>
          <div className="h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,215,0,0.2) 30%, rgba(255,215,0,0.35) 50%, rgba(255,215,0,0.2) 70%, transparent)' }} />
        </div>
      ))}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6 border border-border-subtle/50">
      <h3 className="font-display text-base font-bold text-text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-neon-blue rounded-full" />{title}
      </h3>
      {children}
    </div>
  )
}
