import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Show & Event Records — WWE Event Records | Pinfall Data',
  description: 'WWE show and event records. Highest attendance, most matches per card, most title changes, most prolific series, and shows by country.',
  keywords: ['WWE attendance records', 'biggest WWE crowd', 'WrestleMania attendance', 'most WWE title changes per show', 'WWE show records'],
  openGraph: { title: 'Show & Event Records — Pinfall Data', type: 'website', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/20190405_WM35_show_hosts--86e5ca0f3c9f636c79cfceb29ae5b165_2026-03-21_16_54_31.187272.jpg.png'] },
  alternates: { canonical: 'https://pinfalldata.com/records/shows' },
}
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</> }
