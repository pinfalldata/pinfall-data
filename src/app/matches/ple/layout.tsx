import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All WWE PLEs — WrestleMania, Royal Rumble, SummerSlam & More | Pinfall Data',
  description: 'Every WWE Premium Live Event in history. WrestleMania, Royal Rumble, SummerSlam, Survivor Series, Money in the Bank, and all special events with full match cards, results, and ratings from 1985 to today.',
  keywords: [
    'WWE PLE', 'WWE Premium Live Events', 'WrestleMania history', 'Royal Rumble history',
    'SummerSlam history', 'Survivor Series history', 'WWE PPV history', 'all WWE PLEs',
    'WWE PLE database', 'WWE PPV results', 'WWE PLE list', 'Money in the Bank history',
  ],
  openGraph: {
    title: 'All WWE PLEs — Every Premium Live Event in History',
    description: 'WrestleMania, Royal Rumble, SummerSlam, and every WWE PLE with full match cards and results.',
    type: 'website',
    images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page/showple.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All WWE PLEs — Pinfall Data',
    description: 'Every Premium Live Event in WWE history with full results.',
  },
  alternates: {
    canonical: 'https://pinfalldata.com/matches/ple',
  },
}

export default function PLELayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
