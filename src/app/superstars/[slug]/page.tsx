import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSuperstarBySlug } from '@/lib/queries'
import { ProfileHero } from '@/components/superstar/ProfileHero'
import { ProfileInfoBar } from '@/components/superstar/ProfileInfoBar'
import { ProfileTabs } from '@/components/superstar/ProfileTabs'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const superstar = await getSuperstarBySlug(params.slug)
  if (!superstar) return { title: 'Superstar not found — Pinfall Data' }

  const nickname = superstar.nicknames?.find((n: any) => n.is_primary)?.nickname
  const sub = nickname ? `"${nickname}" — ` : ''

  return {
    title: `${superstar.name} — WWE Stats & Career History | Pinfall Data`,
    description: `${sub}Complete WWE profile for ${superstar.name}. Career stats, championship history, rivalries, matches, and more.`,
    openGraph: {
      title: `${superstar.name} | Pinfall Data`,
      images: superstar.photo_url ? [superstar.photo_url] : [],
    },
  }
}

export default async function SuperstarProfilePage({ params }: Props) {
  const superstar = await getSuperstarBySlug(params.slug)
  if (!superstar) notFound()

  return (
    <main className="min-h-screen">
      <ProfileHero superstar={superstar} />
      <ProfileInfoBar superstar={superstar} />
      <ProfileTabs superstar={superstar} />
    </main>
  )
}
