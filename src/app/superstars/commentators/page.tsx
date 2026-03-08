import type { Metadata } from 'next'
import RoleSubpageShell from '@/components/superstar/RoleSubpageShell'

export const metadata: Metadata = {
  title: 'WWE Commentators — The Voices of Professional Wrestling | Pinfall Data',
  description: 'Browse every WWE commentator in history. From Jim Ross to Michael Cole, explore the iconic voices who called the greatest moments in wrestling.',
  keywords: ['WWE commentators', 'wrestling announcers', 'Jim Ross', 'Michael Cole', 'WWE broadcast team', 'play-by-play'],
  openGraph: {
    title: 'WWE Commentators — Complete Directory | Pinfall Data',
    description: 'Every WWE commentator in history. The voices behind the greatest moments in wrestling.',
    type: 'website',
  },
  alternates: { canonical: '/superstars/commentators' },
}

export default function CommentatorsPage() {
  return (
    <RoleSubpageShell
      title="Commentators"
      roleKey="commentator"
      description="The voices that brought every match to life. From legendary play-by-play to color commentary, discover every announcer who called the action in WWE history."
      imageUrl="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/commentator.webp"
    />
  )
}
