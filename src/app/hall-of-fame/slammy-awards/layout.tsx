import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Slammy Awards — Every WWE Slammy Winner | Pinfall Data',
  description: 'The complete history of WWE Slammy Awards. Every winner, every category, every year. Browse and search the most prestigious annual awards in professional wrestling.',
  keywords: ['WWE Slammy Awards', 'Slammy Award winners', 'WWE awards history', 'best WWE Slammy'],
  openGraph: { title: 'Slammy Awards — Pinfall Data', type: 'website', images: ['https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20Hall%20Of%20Fame/wwe-slammy-awards-2037751.webp'] },
  alternates: { canonical: 'https://pinfalldata.com/hall-of-fame/slammy-awards' },
}
export default function L({ children }: { children: React.ReactNode }) { return <>{children}</> }
