import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Historical Milestones — WWE History by the Numbers | Pinfall Data',
  description: 'WWE history decade by decade. Matches per year, title changes, era comparisons, attendance evolution, and the complete statistical growth of World Wrestling Entertainment.',
  keywords: ['WWE history statistics', 'WWE matches per year', 'WWE era comparison', 'Attitude Era stats', 'WWE growth history', 'WWE decade stats'],
  openGraph: { title: 'Historical Milestones — Pinfall Data', type: 'website', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Stats%20&%20Records/wwesiege_2026-03-21_16_54_30.597250.png.png'] },
  alternates: { canonical: 'https://pinfalldata.com/records/milestones' },
}
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</> }
