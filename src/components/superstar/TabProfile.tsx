import Link from 'next/link'
import { formatDate, formatDateShort } from '@/lib/utils'

export function TabProfile({ superstar }: { superstar: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* LEFT COLUMN: Bio + History */}
      <div className="lg:col-span-2 space-y-6">
        {superstar.bio_md && (
          <Card title="Biography">
            <p className="text-text-primary leading-relaxed whitespace-pre-line">{superstar.bio_md}</p>
          </Card>
        )}

        {superstar.aliases?.length > 0 && (
          <Card title="Ring Names">
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

        {superstar.careerBreaks?.length > 0 && (
          <Card title="Career Breaks">
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
          <Card title="Draft History">
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

      {/* RIGHT COLUMN: Info cards */}
      <div className="space-y-6">
        {superstar.eras?.length > 0 && (
          <Card title="Eras">
            <div className="flex flex-wrap gap-2">
              {superstar.eras.map((e: any) => (
                <span key={e.id} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${e.is_primary ? 'bg-neon-blue/15 text-neon-blue border-neon-blue/30' : 'bg-bg-tertiary text-text-secondary border-border-subtle/50'}`}>
                  {e.eras?.name || `Era ${e.era_id}`}
                  {e.is_primary && <span className="ml-1 text-[10px] opacity-60">★</span>}
                </span>
              ))}
            </div>
          </Card>
        )}

        {superstar.families?.length > 0 && (
          <Card title="Family in WWE">
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
          <Card title="Trained By">
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

        {/* Roles detail (if multiple) */}
        {superstar.roles?.length > 1 && (
          <Card title="Roles">
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

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5 sm:p-6 border border-border-subtle/50">
      <h3 className="font-display text-base font-bold text-text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-neon-blue rounded-full" />
        {title}
      </h3>
      {children}
    </div>
  )
}
