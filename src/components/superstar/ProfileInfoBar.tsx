import {
  formatDate, formatHeight, formatWeight, calculateAge,
  calculateCareerYears, getGenderLabel, getRoleLabels,
} from '@/lib/utils'

export function ProfileInfoBar({ superstar }: { superstar: any }) {
  const age = calculateAge(superstar.birth_date, superstar.death_date)
  const careerYears = calculateCareerYears(superstar.debut_date, superstar.retirement_date)

  const birthplace = [superstar.birth_city, superstar.birth_state, superstar.birth_country].filter(Boolean).join(', ')
  const nationalities = superstar.nationalities?.join(', ') || superstar.nationality || ''

  // Build info cells — only show cells that have data
  const topRow = [
    { label: 'Height', value: formatHeight(superstar.height_cm) },
    { label: 'Weight', value: formatWeight(superstar.weight_kg) },
    { label: 'Born', value: formatDate(superstar.birth_date) },
    superstar.death_date ? { label: 'Died', value: formatDate(superstar.death_date) } : null,
    { label: 'Age', value: age !== null ? `${age} years${superstar.death_date ? ' (at death)' : ''}` : '' },
    { label: 'Gender', value: getGenderLabel(superstar.gender) },
  ].filter(cell => cell && cell.value) as { label: string; value: string }[]

  const bottomRow = [
    { label: 'Birthplace', value: birthplace },
    { label: 'Nationality', value: nationalities },
    { label: 'Billed From', value: superstar.billed_from || '' },
    { label: 'WWE Debut', value: formatDate(superstar.debut_date) },
    superstar.retirement_date
      ? { label: 'Retired', value: formatDate(superstar.retirement_date) }
      : careerYears !== null ? { label: 'Career', value: `${careerYears} years` } : null,
    superstar.is_hall_of_fame ? { label: 'Hall of Fame', value: 'Inducted ★' } : null,
  ].filter(cell => cell && cell.value) as { label: string; value: string }[]

  // Grid columns adapt to number of cells
  const getGridCols = (count: number) => {
    if (count <= 3) return 'grid-cols-1 sm:grid-cols-3'
    if (count <= 4) return 'grid-cols-2 sm:grid-cols-4'
    if (count <= 5) return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6'
  }

  return (
    <div className="relative bg-bg-secondary/50 backdrop-blur-sm">
      {/* ===== ANIMATED NEON LINE — TOP (blue) ===== */}
      <div className="neon-line-animated neon-line-glow h-px" />

      <div className="max-w-[1440px] mx-auto">
        {/* TOP ROW: Physical + vital info */}
        {topRow.length > 0 && (
          <div className={`grid ${getGridCols(topRow.length)}`}>
            {topRow.map((cell, i) => (
              <div key={cell.label} className="relative px-4 py-4 text-center border-b border-border-subtle/20 sm:border-b-0 sm:border-r sm:border-border-subtle/20 last:border-r-0">
                <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-widest mb-1">{cell.label}</p>
                <p className="text-text-white text-sm sm:text-base font-medium truncate">{cell.value}</p>
                {/* Neon dot separator (desktop) */}
                {i < topRow.length - 1 && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-neon-blue/60 shadow-[0_0_8px_rgba(199,160,90,0.6)] hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ===== ANIMATED NEON LINE — MIDDLE (pink, reverse direction) ===== */}
        <div className="neon-line-animated-pink h-px" />

        {/* BOTTOM ROW: Career + origin info */}
        {bottomRow.length > 0 && (
          <div className={`grid ${getGridCols(bottomRow.length)}`}>
            {bottomRow.map((cell, i) => (
              <div key={cell.label} className="relative px-4 py-3.5 text-center border-b border-border-subtle/20 sm:border-b-0 sm:border-r sm:border-border-subtle/20 last:border-r-0">
                <p className="text-text-secondary text-[10px] sm:text-xs uppercase tracking-widest mb-0.5">{cell.label}</p>
                <p className="text-text-white text-xs sm:text-sm font-body truncate">
                  {cell.label === 'Hall of Fame' ? (
                    <span className="text-neon-pink">{cell.value}</span>
                  ) : cell.value}
                </p>
                {/* Neon dot separator (desktop) */}
                {i < bottomRow.length - 1 && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-neon-pink/50 shadow-[0_0_6px_rgba(192,192,192,0.5)] hidden sm:block" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Roles row (if multiple roles) */}
        {superstar.roles?.length > 1 && (
          <>
            <div className="h-px bg-border-subtle/20" />
            <div className="flex items-center justify-center gap-3 py-3 flex-wrap px-4">
              <span className="text-text-secondary text-[10px] uppercase tracking-widest">Roles</span>
              {superstar.roles.map((r: any) => (
                <span key={r.id} className={`text-xs px-2.5 py-1 rounded-md border capitalize ${
                  r.is_primary ? 'bg-neon-blue/10 text-neon-blue border-neon-blue/30' : 'bg-bg-tertiary text-text-secondary border-border-subtle/50'
                }`}>
                  {r.role.replace('_', ' ')}
                  {r.start_year && (
                    <span className="opacity-50 ml-1 text-[10px]">{r.start_year}{r.end_year ? `–${r.end_year}` : '+'}</span>
                  )}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ===== ANIMATED NEON LINE — BOTTOM (blue) ===== */}
      <div className="neon-line-animated neon-line-glow h-px" />
    </div>
  )
}
