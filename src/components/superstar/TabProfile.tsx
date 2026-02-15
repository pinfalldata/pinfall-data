import Link from 'next/link'
import { formatDate, formatDateShort } from '@/lib/utils'

interface TabProfileProps {
  superstar: any
}

export function TabProfile({ superstar }: TabProfileProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Left column: Bio + Details */}
      <div className="lg:col-span-2 space-y-6">
        {/* Biography */}
        {superstar.bio_md && (
          <Section title="Biography">
            <p className="text-text-primary leading-relaxed whitespace-pre-line">
              {superstar.bio_md}
            </p>
          </Section>
        )}

        {/* Aliases / Ring name history */}
        {superstar.aliases?.length > 0 && (
          <Section title="Ring Names">
            <div className="space-y-2">
              {superstar.aliases.map((alias: any) => (
                <div key={alias.id} className="flex items-center justify-between py-2 border-b border-border-subtle/30 last:border-b-0">
                  <span className="text-text-white font-medium">{alias.alias}</span>
                  <span className="text-text-secondary text-sm">
                    {formatDateShort(alias.start_date)}
                    {' → '}
                    {alias.end_date ? formatDateShort(alias.end_date) : 'Present'}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Career breaks */}
        {superstar.careerBreaks?.length > 0 && (
          <Section title="Career Breaks">
            <div className="space-y-3">
              {superstar.careerBreaks.map((cb: any) => (
                <div key={cb.id} className="glass rounded-xl p-4 border border-border-subtle/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2 h-2 rounded-full ${
                      cb.reason === 'injury' ? 'bg-status-danger'
                      : cb.reason === 'other_promotion' ? 'bg-status-warning'
                      : 'bg-text-secondary'
                    }`} />
                    <span className="text-text-white text-sm font-medium capitalize">
                      {cb.reason.replace('_', ' ')}
                      {cb.other_promotion && ` — ${cb.other_promotion}`}
                    </span>
                  </div>
                  <p className="text-text-secondary text-xs">
                    {formatDateShort(cb.start_date)} → {cb.end_date ? formatDateShort(cb.end_date) : 'Present'}
                  </p>
                  {cb.description && (
                    <p className="text-text-secondary text-sm mt-2">{cb.description}</p>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Draft history */}
        {superstar.draftHistory?.length > 0 && (
          <Section title="Draft History">
            <div className="space-y-2">
              {superstar.draftHistory.map((d: any) => (
                <div key={d.id} className="flex items-center gap-3 py-2 border-b border-border-subtle/30 last:border-b-0">
                  <span className="text-text-secondary text-sm w-28 shrink-0">{formatDateShort(d.draft_date)}</span>
                  <span className="text-text-secondary text-sm">
                    {d.from_brand && <>{d.from_brand} →{' '}</>}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    d.to_brand === 'Raw' ? 'bg-red-500/20 text-red-400'
                    : d.to_brand === 'SmackDown' ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {d.to_brand}
                  </span>
                  <span className="text-text-secondary text-xs capitalize">{d.draft_type}</span>
                  {d.notes && <span className="text-text-secondary text-xs hidden sm:inline">— {d.notes}</span>}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* Right column: Quick info cards */}
      <div className="space-y-6">
        {/* Personal Info card */}
        <Section title="Personal Info">
          <InfoRow label="Real Name" value={superstar.real_name} />
          <InfoRow label="Born" value={formatDate(superstar.birth_date)} />
          {superstar.death_date && <InfoRow label="Died" value={formatDate(superstar.death_date)} />}
          <InfoRow label="Birthplace" value={[superstar.birth_city, superstar.birth_state, superstar.birth_country].filter(Boolean).join(', ')} />
          <InfoRow label="Nationality" value={superstar.nationalities?.join(', ')} />
          <InfoRow label="Billed From" value={superstar.billed_from} />
        </Section>

        {/* Career Info card */}
        <Section title="Career Info">
          <InfoRow label="WWE Debut" value={formatDate(superstar.debut_date)} />
          {superstar.retirement_date && <InfoRow label="Retired" value={formatDate(superstar.retirement_date)} />}
          {superstar.current_brand && <InfoRow label="Current Brand" value={superstar.current_brand} />}
          {superstar.is_hall_of_fame && <InfoRow label="Hall of Fame" value="Inducted" />}
          {/* Roles */}
          {superstar.roles?.length > 0 && (
            <div className="pt-2 mt-2 border-t border-border-subtle/30">
              <p className="text-text-secondary text-xs mb-2 uppercase tracking-wider">Roles</p>
              <div className="flex flex-wrap gap-1.5">
                {superstar.roles.map((r: any) => (
                  <span
                    key={r.id}
                    className={`text-xs px-2 py-1 rounded-md border capitalize ${
                      r.is_primary
                        ? 'bg-neon-blue/15 text-neon-blue border-neon-blue/30'
                        : 'bg-bg-tertiary text-text-secondary border-border-subtle'
                    }`}
                  >
                    {r.role.replace('_', ' ')}
                    {r.start_year && (
                      <span className="opacity-60 ml-1">
                        {r.start_year}{r.end_year ? `–${r.end_year}` : '+'}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Eras */}
        {superstar.eras?.length > 0 && (
          <Section title="Eras">
            <div className="flex flex-wrap gap-2">
              {superstar.eras.map((e: any) => (
                <span
                  key={e.id}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    e.is_primary
                      ? 'bg-neon-blue/15 text-neon-blue border-neon-blue/30'
                      : 'bg-bg-tertiary text-text-secondary border-border-subtle'
                  }`}
                >
                  {e.eras?.name || `Era ${e.era_id}`}
                  {e.is_primary && <span className="ml-1 text-[10px] opacity-60">★</span>}
                </span>
              ))}
            </div>
          </Section>
        )}

        {/* Family connections */}
        {superstar.families?.length > 0 && (
          <Section title="Family in WWE">
            <div className="space-y-2">
              {superstar.families.map((f: any) => (
                <div key={f.id} className="flex items-center gap-3">
                  <span className="text-text-secondary text-xs capitalize w-20 shrink-0">{f.relation_type.replace('_', ' ')}</span>
                  {f.related?.slug ? (
                    <Link href={`/superstars/${f.related.slug}`} className="text-neon-blue text-sm hover:underline">
                      {f.related.name}
                    </Link>
                  ) : (
                    <span className="text-text-white text-sm">{f.related?.name || 'Unknown'}</span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Trainers */}
        {superstar.trainers?.length > 0 && (
          <Section title="Trained By">
            <div className="space-y-1">
              {superstar.trainers.map((t: any) => (
                <div key={t.id}>
                  {t.trainer?.slug ? (
                    <Link href={`/superstars/${t.trainer.slug}`} className="text-neon-blue text-sm hover:underline">
                      {t.trainer.name}
                    </Link>
                  ) : (
                    <span className="text-text-white text-sm">{t.trainer_name || t.trainer?.name || 'Unknown'}</span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

// ---- Reusable sub-components ----

function Section({ title, children }: { title: string; children: React.ReactNode }) {
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

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value || value === '—') return null
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-border-subtle/20 last:border-b-0">
      <span className="text-text-secondary text-sm">{label}</span>
      <span className="text-text-white text-sm text-right ml-4">{value}</span>
    </div>
  )
}
