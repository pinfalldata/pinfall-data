// ============================================================
// Pinfall Data — Utility functions
// ============================================================

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

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

export function formatHeight(cm: number | null): string {
  if (!cm) return '—'
  const totalInches = cm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  return `${feet}'${inches}" (${cm} cm)`
}

export function formatWeight(kg: number | null): string {
  if (!kg) return '—'
  const lbs = Math.round(kg * 2.20462)
  return `${lbs} lbs (${kg} kg)`
}

export function getWinRate(wins: number, total: number): string {
  if (total === 0) return '—'
  return `${((wins / total) * 100).toFixed(1)}%`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-status-success'
    case 'retired': return 'text-text-secondary'
    case 'deceased': return 'text-text-secondary'
    case 'released': return 'text-status-warning'
    case 'inactive': return 'text-status-warning'
    default: return 'text-text-secondary'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'active': return 'Active'
    case 'retired': return 'Retired'
    case 'deceased': return 'Deceased'
    case 'released': return 'Released'
    case 'inactive': return 'Inactive'
    default: return status
  }
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'wrestler': return 'Wrestler'
    case 'manager': return 'Manager'
    case 'referee': return 'Referee'
    case 'announcer': return 'Ring Announcer'
    case 'commentator': return 'Commentator'
    case 'authority': return 'Authority Figure'
    case 'promoter': return 'Promoter'
    case 'trainer': return 'Trainer'
    case 'producer': return 'Producer'
    case 'other': return 'Personality'
    default: return role
  }
}

// Check if a superstar has a specific role
export function hasRole(superstar: any, role: string): boolean {
  // Check new roles table first
  if (superstar.roles?.length > 0) {
    return superstar.roles.some((r: any) => r.role === role)
  }
  // Fallback to old single role column
  return superstar.role === role
}

// Check if superstar has any "in-ring" role (wrestler or manager with combat)
export function isInRingPerformer(superstar: any): boolean {
  return hasRole(superstar, 'wrestler')
}

// Get all role labels for display
export function getRoleLabels(superstar: any): string[] {
  if (superstar.roles?.length > 0) {
    return superstar.roles.map((r: any) => getRoleLabel(r.role))
  }
  return superstar.role ? [getRoleLabel(superstar.role)] : []
}
