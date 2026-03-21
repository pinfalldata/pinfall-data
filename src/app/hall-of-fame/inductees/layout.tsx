import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'WWE Hall of Fame — Every Inductee in History | Pinfall Data',
  description: 'The complete WWE Hall of Fame database. Every inductee, every class, every year. Browse by year, search by name, view induction details and speeches.',
  keywords: ['WWE Hall of Fame', 'WWE HOF inductees', 'Hall of Fame class', 'WWE legends', 'WWE Hall of Fame list'],
  openGraph: { title: 'WWE Hall of Fame — Every Inductee', type: 'website', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Hall%20Of%20Fame/216_WM39_04022023RC_42848--11c292c2be35a5ca5d00f8ad298b804d.jpg'] },
  alternates: { canonical: 'https://pinfalldata.com/hall-of-fame/inductees' },
}
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</> }
