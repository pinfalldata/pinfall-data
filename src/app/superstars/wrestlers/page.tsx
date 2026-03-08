import type { Metadata } from 'next'
import RoleSubpageShell from '@/components/superstar/RoleSubpageShell'

export const metadata: Metadata = {
  title: 'WWE Wrestlers — Complete Roster of In-Ring Competitors | Pinfall Data',
  description: 'Browse every WWE wrestler in history. Full career profiles, match stats, championship reigns, and rivalries for in-ring competitors across all eras.',
  keywords: ['WWE wrestlers', 'WWE roster', 'professional wrestlers', 'in-ring competitors', 'wrestling stats', 'WWE career profiles'],
  openGraph: {
    title: 'WWE Wrestlers — Complete Roster | Pinfall Data',
    description: 'Every WWE wrestler in history with full career statistics and match history.',
    type: 'website',
  },
  alternates: { canonical: '/superstars/wrestlers' },
}

export default function WrestlersPage() {
  return (
    <RoleSubpageShell
      title="Wrestlers"
      roleKey="wrestler"
      description="The in-ring competitors who define WWE. From legendary icons to rising stars, explore the complete roster of every wrestler across every era of professional wrestling."
      imageUrl="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/wrestler.webp"
    />
  )
}
