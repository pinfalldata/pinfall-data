import type { Metadata } from 'next'
import RoleSubpageShell from '@/components/superstar/RoleSubpageShell'

export const metadata: Metadata = {
  title: 'WWE Interviewers — The Story Tellers Behind the Scenes | Pinfall Data',
  description: 'Browse every WWE interviewer in history. From Mean Gene Okerlund to Renee Paquette, explore the personalities who captured the stories behind the action.',
  keywords: ['WWE interviewers', 'Mean Gene Okerlund', 'Renee Young', 'wrestling interviews', 'backstage interviewer'],
  openGraph: {
    title: 'WWE Interviewers — Complete Directory | Pinfall Data',
    description: 'Every WWE interviewer in history with career profiles.',
    type: 'website',
  },
  alternates: { canonical: '/superstars/interviewers' },
}

export default function InterviewersPage() {
  return (
    <RoleSubpageShell
      title="Interviewers"
      roleKey="interviewer"
      description="The personalities who captured the emotion, the drama, and the stories behind every rivalry. WWE interviewers who brought backstage to life."
      imageUrl="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20superstars/Interviewer.webp"
    />
  )
}
