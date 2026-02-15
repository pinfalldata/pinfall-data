import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSuperstarBySlug } from '@/lib/queries'
import { ProfileHero } from '@/components/superstar/ProfileHero'
import { ProfileStats } from '@/components/superstar/ProfileStats'
import { ProfileTabs } from '@/components/superstar/ProfileTabs'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const superstar = await getSuperstarBySlug(params.slug)
  if (!superstar) return { title: 'Superstar not found' }

  const primaryNickname = superstar.nicknames?.find((n: any) => n.is_primary)?.nickname
  const subtitle = primaryNickname ? `"${primaryNickname}" — ` : ''

  return {
    title: `${superstar.name} — WWE Stats & Career History`,
    description: `${subtitle}Complete WWE profile for ${superstar.name}. Career stats, championship history, rivalries, matches, and more on Pinfall Data.`,
    openGraph: {
      title: `${superstar.name} | Pinfall Data`,
      description: `${subtitle}${superstar.bio_md?.slice(0, 150) || `Complete WWE profile for ${superstar.name}`}`,
      images: superstar.photo_url ? [superstar.photo_url] : [],
    },
  }
}

export default async function SuperstarProfilePage({ params }: Props) {
  const superstar = await getSuperstarBySlug(params.slug)
  if (!superstar) notFound()

  return (
    <div className="min-h-screen">
      <ProfileHero superstar={superstar} />
      <ProfileStats superstar={superstar} />
      <ProfileTabs superstar={superstar} />
    </div>
  )
}
