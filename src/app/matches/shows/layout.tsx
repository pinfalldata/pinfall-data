import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All WWE Shows — Raw, SmackDown, NXT & Every Program Ever | Pinfall Data',
  description: 'Browse every WWE show in history. Monday Night Raw, Friday Night SmackDown, NXT, Saturday Night Main Event, Sunday Night Heat, Velocity, and hundreds more weekly and special programs with episode counts and match listings.',
  keywords: [
    'WWE shows', 'WWE Raw', 'WWE SmackDown', 'WWE NXT', 'all WWE shows',
    'WWE show list', 'WWE weekly shows', 'WWE program history', 'WWE show database',
    'WWE show directory', 'Saturday Night Main Event', 'WWE TV shows',
  ],
  openGraph: {
    title: 'All WWE Shows — Complete Show Directory',
    description: 'Browse every WWE show ever aired. From Monday Night Raw to NXT and beyond.',
    type: 'website',
    images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/showpage.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All WWE Shows — Pinfall Data',
    description: 'Every WWE show ever aired with full episode guides.',
  },
  alternates: {
    canonical: 'https://pinfall-data.vercel.app/matches/shows',
  },
}

export default function ShowsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
