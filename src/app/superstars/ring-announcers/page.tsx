import type { Metadata } from 'next'
import RoleSubpageShell from '@/components/superstar/RoleSubpageShell'

export const metadata: Metadata = {
  title: 'WWE Ring Announcers — The Voices of the Arena | Pinfall Data',
  description: 'Browse every WWE ring announcer in history. From Howard Finkel to Lilian Garcia, explore the voices that introduced every superstar to the world.',
  keywords: ['WWE ring announcers', 'Howard Finkel', 'Lilian Garcia', 'ring introducing', 'WWE announcer'],
  openGraph: {
    title: 'WWE Ring Announcers — Complete Directory | Pinfall Data',
    description: 'Every WWE ring announcer in history with career profiles.',
    type: 'website',
  },
  alternates: { canonical: '/superstars/ring-announcers' },
}

export default function RingAnnouncersPage() {
  return (
    <RoleSubpageShell
      title="Ring Announcers"
      roleKey="ring_announcer"
      description="The voices that set the stage for every match. Ring announcers who introduced superstars with gravitas and became iconic figures in their own right."
      imageUrl="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/Ring%20Announcer.webp"
    />
  )
}
