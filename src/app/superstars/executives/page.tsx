import type { Metadata } from 'next'
import RoleSubpageShell from '@/components/superstar/RoleSubpageShell'

export const metadata: Metadata = {
  title: 'WWE Executives — The Power Players Behind the Curtain | Pinfall Data',
  description: 'Browse every WWE Executive in history. From Vince McMahon to Triple H, explore the corporate figures who shaped the direction of professional wrestling.',
  keywords: ['WWE executives', 'Vince McMahon', 'Triple H', 'WWE corporate', 'WWE leadership', 'WWE CEO'],
  openGraph: {
    title: 'WWE Executives — Complete Directory | Pinfall Data',
    description: 'Every WWE Executive in history. The corporate leaders who shaped professional wrestling.',
    type: 'website',
  },
  alternates: { canonical: '/superstars/executives' },
}

export default function ExecutivesPage() {
  return (
    <RoleSubpageShell
      title="WWE Executives"
      roleKey="executive"
      description="The power players behind the curtain. WWE executives who made the business decisions, shaped creative direction, and built the global empire of professional wrestling."
      imageUrl="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/Executives.webp"
    />
  )
}
