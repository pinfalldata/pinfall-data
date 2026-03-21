import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Tag Team & Stable Records — WWE Team Records | Pinfall Data',
  description: 'WWE tag team and stable records. Most matches together, best win rates, longest partnerships, largest factions, and every team milestone.',
  keywords: ['WWE tag team records', 'best WWE tag teams', 'most successful WWE tag team', 'WWE stable records', 'largest WWE stable'],
  openGraph: { title: 'Tag Team & Stable Records — Pinfall Data', type: 'website', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/Jeri-Show_2026-03-21_16_54_31.480723.jpg.png'] },
  alternates: { canonical: 'https://pinfalldata.com/records/tag-teams' },
}
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</> }
