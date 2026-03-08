import type { Metadata } from 'next'
import RoleSubpageShell from '@/components/superstar/RoleSubpageShell'

export const metadata: Metadata = {
  title: 'WWE Referees — The Officials of the Ring | Pinfall Data',
  description: 'Browse every WWE referee in history. From Earl Hebner to Charles Robinson, explore the officials who enforced the rules and became part of wrestling lore.',
  keywords: ['WWE referees', 'wrestling officials', 'Earl Hebner', 'Charles Robinson', 'WWE referee history'],
  openGraph: {
    title: 'WWE Referees — Complete Directory | Pinfall Data',
    description: 'Every WWE referee in history with career profiles and notable moments.',
    type: 'website',
  },
  alternates: { canonical: '/superstars/referees' },
}

export default function RefereesPage() {
  return (
    <RoleSubpageShell
      title="Referees"
      roleKey="referee"
      description="The keepers of the rules inside the squared circle. Referees who counted pinfalls, called submissions, and sometimes became part of the biggest storylines in WWE."
      imageUrl="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/referee.webp"
    />
  )
}
