// ============================================================
// PINFALL DATA — Utils
// ============================================================

// --- DATE FORMATTING ---

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return ''
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${m} ${ampm}`
}

// --- AGE / CAREER ---

export function calculateAge(birthDate: string | null, deathDate?: string | null): number | null {
  if (!birthDate) return null
  const birth = new Date(birthDate)
  const end = deathDate ? new Date(deathDate) : new Date()
  let age = end.getFullYear() - birth.getFullYear()
  const m = end.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--
  return age
}

export function calculateCareerYears(debutDate: string | null, retirementDate?: string | null): number | null {
  if (!debutDate) return null
  const debut = new Date(debutDate)
  const end = retirementDate ? new Date(retirementDate) : new Date()
  return end.getFullYear() - debut.getFullYear()
}

// --- PHYSICAL ---

export function formatHeight(cm: number | null): string {
  if (!cm) return ''
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}" (${cm} cm)`
}

export function formatWeight(kg: number | null): string {
  if (!kg) return ''
  const lbs = Math.round(kg * 2.20462)
  return `${lbs} lbs (${kg} kg)`
}

// --- STATUS ---

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-status-success/20 border-status-success/40 text-status-success'
    case 'retired': return 'bg-bg-tertiary border-border-subtle text-text-secondary'
    case 'deceased': return 'bg-bg-tertiary border-border-subtle text-text-secondary'
    case 'released': return 'bg-status-warning/20 border-status-warning/40 text-status-warning'
    case 'inactive': return 'bg-status-warning/20 border-status-warning/40 text-status-warning'
    default: return 'bg-bg-tertiary border-border-subtle text-text-secondary'
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    active: 'Active', retired: 'Retired', deceased: 'Deceased', released: 'Released', inactive: 'Inactive'
  }
  return labels[status] || status
}

// --- ROLES ---

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    wrestler: 'Wrestler', manager: 'Manager', referee: 'Referee', announcer: 'Ring Announcer',
    commentator: 'Commentator', authority: 'Authority Figure', promoter: 'Promoter',
    trainer: 'Trainer', producer: 'Producer', other: 'Personality'
  }
  return labels[role] || role
}

export function getRoleLabels(superstar: any): string[] {
  if (superstar.roles?.length > 0) {
    return superstar.roles.map((r: any) => getRoleLabel(r.role))
  }
  return superstar.role ? [getRoleLabel(superstar.role)] : []
}

export function hasRole(superstar: any, role: string): boolean {
  if (superstar.roles?.length > 0) return superstar.roles.some((r: any) => r.role === role)
  return superstar.role === role
}

export function getGenderLabel(gender: string): string {
  return gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : 'Other'
}

// --- MATCH DURATION ---

export function formatDuration(seconds: number | null): string {
  if (!seconds) return ''
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`
  return `${m}:${s.toString().padStart(2, '0')}`
}

// --- MATCH RATING COLOR ---
// 1-3 = red, 4-5 = orange, 6-7 = yellow, 8-9 = green, 10 = gold
export function getRatingColor(rating: number | null): string {
  if (!rating) return 'text-text-secondary'
  if (rating >= 9) return 'text-emerald-400'
  if (rating >= 7) return 'text-green-400'
  if (rating >= 5) return 'text-yellow-400'
  if (rating >= 3) return 'text-orange-400'
  return 'text-red-400'
}

export function getRatingBgColor(rating: number | null): string {
  if (!rating) return 'bg-bg-tertiary'
  if (rating >= 9) return 'bg-emerald-500/20 border-emerald-500/40'
  if (rating >= 7) return 'bg-green-500/20 border-green-500/40'
  if (rating >= 5) return 'bg-yellow-500/20 border-yellow-500/40'
  if (rating >= 3) return 'bg-orange-500/20 border-orange-500/40'
  return 'bg-red-500/20 border-red-500/40'
}

// --- MATCH RESULT ---

export function getResultLabel(resultType: string | null): string {
  const labels: Record<string, string> = {
    pinfall: 'Pinfall', submission: 'Submission', dq: 'Disqualification',
    count_out: 'Count Out', no_contest: 'No Contest', forfeit: 'Forfeit',
    ko: 'Knockout', referee_stoppage: 'Referee Stoppage', escape: 'Escape',
    retrieve: 'Retrieve', last_elimination: 'Last Elimination', other: 'Other',
  }
  return labels[resultType || ''] || resultType || ''
}

export function getResultColor(resultType: string | null): string {
  if (!resultType) return 'text-text-secondary'
  if (resultType === 'no_contest') return 'text-text-secondary'
  if (resultType === 'dq' || resultType === 'count_out') return 'text-yellow-400'
  return 'text-text-white'
}

// --- WIN RATE ---

export function getWinRate(wins: number, total: number): string {
  if (total === 0) return '0%'
  return `${Math.round((wins / total) * 100)}%`
}

// --- MATCH TYPE HELPERS ---

export function isMultiManMatch(participantCount: number): boolean {
  return participantCount > 4
}

export function isBattleRoyalType(matchTypeName: string | null): boolean {
  if (!matchTypeName) return false
  const name = matchTypeName.toLowerCase()
  return name.includes('royal rumble') || name.includes('battle royal') || name.includes('andre')
}

export function isEliminationMatch(matchTypeName: string | null): boolean {
  if (!matchTypeName) return false
  const name = matchTypeName.toLowerCase()
  return name.includes('elimination chamber') || name.includes('survivor series') || name.includes('war games')
}

export function isIronManMatch(matchTypeName: string | null): boolean {
  if (!matchTypeName) return false
  return matchTypeName.toLowerCase().includes('iron man')
}

/**
 * Matches that have a score (falls count).
 * Includes Iron Man, 2 out of 3 falls, Best of X falls, etc.
 */
export function isScoredMatch(matchTypeName: string | null): boolean {
  if (!matchTypeName) return false
  const name = matchTypeName.toLowerCase()
  return (
    name.includes('iron man') ||
    name.includes('falls') ||
    name.includes('2 out of 3') ||
    name.includes('best of') ||
    name.includes('two out of three')
  )
}

// --- SEGMENT CATEGORIES ---

export function getSegmentCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    in_ring_segment: 'In-Ring Segment',
    backstage: 'Backstage',
    interference: 'Interference',
    ceremony: 'Ceremony',
    authority: 'Authority Decision',
    psychology: 'Mind Games',
    props_spectacle: 'Spectacle',
    medical_injury: 'Medical / Injury',
    musical: 'Musical Performance',
    fan_engagement: 'Fan Engagement',
    broadcast: 'Broadcast',
    digital: 'Digital Exclusive',
  }
  return labels[category] || category
}

export function getSegmentCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    in_ring_segment: '🎤',
    backstage: '🚪',
    interference: '⚡',
    ceremony: '🏆',
    authority: '👔',
    psychology: '🧠',
    props_spectacle: '🔥',
    medical_injury: '🏥',
    musical: '🎵',
    fan_engagement: '👏',
    broadcast: '📺',
    digital: '📱',
  }
  return icons[category] || '📋'
}

// --- DYNAMIC SHOW COLOR ---
// Returns CSS custom property style object for dynamic show color

export function getShowColorStyle(color: string | null): Record<string, string> {
  const c = color || '#c7a05a' // fallback to neon blue
  return {
    '--show-color': c,
    '--show-color-20': `${c}33`,    // 20% opacity
    '--show-color-40': `${c}66`,    // 40% opacity
    '--show-color-60': `${c}99`,    // 60% opacity
  }
}

// --- ATTENDANCE / AUDIENCE FORMATTING ---

export function formatNumber(n: number | null): string {
  if (!n) return ''
  return n.toLocaleString('en-US')
}

export function formatCompactNumber(n: number | null): string {
  if (!n) return ''
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

// --- PARTICIPANTS GROUPING ---
export function groupParticipantsByTeam(participants: any[]): Map<number, any[]> {
  const teams = new Map<number, any[]>()
  
  for (const p of participants) {
    const team = p.team_number ?? 0
    if (!teams.has(team)) teams.set(team, [])
    teams.get(team)!.push(p)
  }

  // Correction de la boucle : on utilise forEach au lieu de for..of
  teams.forEach((members) => {
    members.sort((a: any, b: any) => (a.entrance_order ?? 99) - (b.entrance_order ?? 99))
  })

  return teams
}