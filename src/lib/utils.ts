export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function formatDateShort(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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
