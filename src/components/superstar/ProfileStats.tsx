import {
  formatHeight,
  formatWeight,
  formatDate,
  calculateAge,
  calculateCareerYears,
  getWinRate,
  isInRingPerformer,
} from '@/lib/utils'

interface ProfileStatsProps {
  superstar: any
}

export function ProfileStats({ superstar }: ProfileStatsProps) {
  const age = calculateAge(superstar.birth_date, superstar.death_date)
  const careerYears = calculateCareerYears(superstar.debut_date, superstar.retirement_date)
  const isWrestler = isInRingPerformer(superstar)

  // Top row: performance stats (ONLY for wrestlers)
  const performanceStats = isWrestler ? [
    { label: 'Matches', value: superstar.total_matches || 0 },
    { label: 'Wins', value: superstar.win_count || 0 },
    { label: 'Losses', value: superstar.loss_count || 0 },
    { label: 'Win Rate', value: getWinRate(superstar.win_count || 0, superstar.total_matches || 0) },
    { label: 'Titles', value: superstar.total_reigns || 0 },
    { label: 'Days as Champ', value: superstar.total_championship_days || 0 },
  ] : null

  // Bottom row: identity info (like Height/Weight/Country in NBA)
  const identityStats = [
    { label: 'Height', value: formatHeight(superstar.height_cm) },
    { label: 'Weight', value: formatWeight(superstar.weight_kg) },
    { label: 'Age', value: age ? `${age} years` : '—' },
    { label: 'Birthdate', value: formatDate(superstar.birth_date) },
    { label: 'From', value: superstar.billed_from || superstar.birth_city || '—' },
    { label: 'Career', value: careerYears ? `${careerYears} years` : '—' },
  ]

  return (
    <div className="relative border-b border-border-subtle bg-bg-secondary/40 backdrop-blur-sm">
      {/* Neon glow line on top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/60 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue/20 to-transparent blur-sm" />

      <div className="max-w-[1440px] mx-auto">
        {/* Performance stats — wrestlers only */}
        {performanceStats && (
          <div className="relative grid grid-cols-3 sm:grid-cols-6 border-b border-border-subtle/50">
            {performanceStats.map((stat, i) => (
            <div key={stat.label} className="relative px-3 py-4 text-center border-r border-border-subtle/30 last:border-r-0 group">
              <p className="font-mono text-lg sm:text-xl lg:text-2xl font-bold text-neon-blue drop-shadow-[0_0_8px_rgba(44,178,254,0.3)]">
                {stat.value}
              </p>
              <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-widest mt-1">
                {stat.label}
              </p>
              {/* Subtle neon dot separator between cells */}
              {i < performanceStats.length - 1 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[0.5px] w-[3px] h-[3px] rounded-full bg-neon-blue/50 shadow-[0_0_6px_rgba(44,178,254,0.5)] hidden sm:block" />
              )}
            </div>
          ))}
          </div>
        )}

        {/* Identity stats */}
        <div className="relative grid grid-cols-3 sm:grid-cols-6">
          {identityStats.map((stat, i) => (
            <div key={stat.label} className="relative px-3 py-3 text-center border-r border-border-subtle/30 last:border-r-0">
              <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-widest">
                {stat.label}
              </p>
              <p className="text-text-white text-xs sm:text-sm font-body mt-0.5 truncate">
                {stat.value}
              </p>
              {/* Subtle neon pink dot separator */}
              {i < identityStats.length - 1 && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[0.5px] w-[3px] h-[3px] rounded-full bg-neon-pink/50 shadow-[0_0_6px_rgba(245,84,218,0.5)] hidden sm:block" />
              )}
            </div>
          ))}
        </div>

        {/* Neon glow line on bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-pink/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-pink/15 to-transparent blur-sm" />
      </div>
    </div>
  )
}
