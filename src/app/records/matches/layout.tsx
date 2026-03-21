import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Match Records — All-Time WWE Match Records | Pinfall Data',
  description: 'WWE match records: highest rated matches, longest matches, shortest matches, youngest & oldest competitors, most participants, and every match milestone.',
  keywords: ['WWE match records', 'highest rated WWE match', 'longest WWE match', 'shortest WWE match', 'youngest WWE competitor', 'best WWE matches ever'],
  openGraph: { title: 'Match Records — Pinfall Data', type: 'website', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/EZxXlPqXYAESmVQ_2026-03-21_16_54_31.604686.jpg.png'] },
  alternates: { canonical: 'https://pinfalldata.com/records/matches' },
}
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</> }
