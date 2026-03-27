import type { Metadata } from 'next'
import TeamListClient from '../TeamListClient'

export const metadata: Metadata = {
  title: 'All Stables — WWE Faction History | Pinfall Data',
  description: 'Browse every stable and faction in WWE history with complete rosters, match records, and statistics.',
  keywords: ['WWE stables', 'wrestling factions', 'WWE groups', 'Pinfall Data'],
  alternates: { canonical: '/tag-teams/stables' },
}

export default function StablesListPage() {
  return <TeamListClient type="stable" title="Stables" subtitle="The most powerful factions and groups — armies that changed the landscape of WWE." heroImage="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Tag%20Teams/Damage_CTRL_WM39__cropped__2026-03-20_21_48_13.215540.jpg.png" />
}
