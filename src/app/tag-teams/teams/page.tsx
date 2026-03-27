import type { Metadata } from 'next'
import TeamListClient from '../TeamListClient'

export const metadata: Metadata = {
  title: 'All Tag Teams — WWE Tag Team History | Pinfall Data',
  description: 'Browse every tag team in WWE history with complete rosters, match records, win rates and statistics.',
  keywords: ['WWE tag teams', 'tag team history', 'wrestling duos', 'Pinfall Data'],
  alternates: { canonical: '/tag-teams/teams' },
}

export default function TagTeamsListPage() {
  return <TeamListClient type="tag_team" title="Tag Teams" subtitle="Every tag team duo in WWE history — from legendary partnerships to dominant combinations." heroImage="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Tag%20Teams/wwe-monday-night-raw-in-las-vegas-90070877-a6f49f0304654d1daebd9a5dcea7d522_2026-03-20_21_48_12.363447.jpg.png" />
}
