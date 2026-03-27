import type { Metadata } from 'next'
import TeamDetailClient from '../../TeamDetailClient'

export const metadata: Metadata = {
  title: 'Tag Team Profile — WWE Tag Team History | Pinfall Data',
  description: 'Complete tag team profile with match history, championship reigns, win rates and statistics on Pinfall Data.',
  alternates: { canonical: '/tag-teams/teams' },
}

export default function TagTeamDetailPage() {
  return <TeamDetailClient type="tag_team" />
}
