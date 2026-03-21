import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Arena Records — WWE Venue Records | Pinfall Data',
  description: 'WWE arena and venue records. Most events hosted, highest attendance, most series hosted, longest-running venues, and top arenas by country.',
  keywords: ['WWE arena records', 'Madison Square Garden WWE', 'most WWE events venue', 'WWE venue history', 'WWE arena attendance'],
  openGraph: { title: 'Arena Records — Pinfall Data', type: 'website', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/CR5KOQDYQZBD3A5F7AA7T43EPI_2026-03-21_16_54_31.002354.jpg.png'] },
  alternates: { canonical: 'https://pinfalldata.com/records/arenas' },
}
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</> }
