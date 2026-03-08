import type { Metadata } from 'next'
import RoleSubpageShell from '@/components/superstar/RoleSubpageShell'

export const metadata: Metadata = {
  title: 'WWE General Managers — The Authority Figures of WWE | Pinfall Data',
  description: 'Browse every WWE General Manager in history. From Mick Foley to Kurt Angle, explore the authority figures who ran Raw, SmackDown, and every brand.',
  keywords: ['WWE general managers', 'WWE authority', 'Raw GM', 'SmackDown GM', 'WWE commissioner', 'wrestling authority figures'],
  openGraph: {
    title: 'WWE General Managers — Complete Directory | Pinfall Data',
    description: 'Every WWE General Manager in history with tenure details and major decisions.',
    type: 'website',
  },
  alternates: { canonical: '/superstars/general-managers' },
}

export default function GeneralManagersPage() {
  return (
    <RoleSubpageShell
      title="General Managers"
      roleKey="general_manager"
      description="The authority figures who ran the show. General Managers who booked main events, sparked rivalries, and wielded power across Raw, SmackDown, and beyond."
      imageUrl="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/general%20manager.webp"
    />
  )
}
