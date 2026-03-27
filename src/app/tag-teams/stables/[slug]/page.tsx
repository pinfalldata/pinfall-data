import type { Metadata } from 'next'
import TeamDetailClient from '../../TeamDetailClient'

export const metadata: Metadata = {
  title: 'Stable Profile — WWE Faction History | Pinfall Data',
  description: 'Complete stable profile with match history, championship reigns, members and statistics on Pinfall Data.',
  alternates: { canonical: '/tag-teams/stables' },
}

export default function StableDetailPage() {
  return <TeamDetailClient type="stable" />
}
