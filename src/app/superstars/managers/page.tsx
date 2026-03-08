import type { Metadata } from 'next'
import RoleSubpageShell from '@/components/superstar/RoleSubpageShell'

export const metadata: Metadata = {
  title: 'WWE Managers — The Masterminds Behind the Superstars | Pinfall Data',
  description: 'Browse every WWE manager in history. From Bobby Heenan to Paul Heyman, explore the legendary managers who shaped careers and championships.',
  keywords: ['WWE managers', 'wrestling managers', 'Paul Heyman', 'Bobby Heenan', 'WWE valets', 'wrestling history'],
  openGraph: {
    title: 'WWE Managers — Complete Directory | Pinfall Data',
    description: 'Every WWE manager in history with full career profiles and client histories.',
    type: 'website',
  },
  alternates: { canonical: '/superstars/managers' },
}

export default function ManagersPage() {
  return (
    <RoleSubpageShell
      title="Managers"
      roleKey="manager"
      description="The masterminds behind the superstars. Managers who shaped careers, turned the tide of championships, and became legends in their own right."
      imageUrl="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/manager.webp"
    />
  )
}
