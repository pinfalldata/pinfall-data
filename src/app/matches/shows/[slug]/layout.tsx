// @ts-nocheck
import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { data: series } = await supabase
    .from('show_series')
    .select('name, description, logo_url, first_episode_date, is_active')
    .eq('slug', params.slug)
    .single()

  if (!series) {
    return {
      title: 'Show Series — Complete Episode Guide | Pinfall Data',
      description: 'Browse every episode of this WWE show series with full match cards and results.',
    }
  }

  const firstYear = series.first_episode_date ? new Date(series.first_episode_date).getFullYear() : null
  const yearStr = firstYear ? ` (${firstYear}–${series.is_active ? t('common.present') : ''})` : ''

  const title = `${series.name}${yearStr} — Complete Episode Guide | Pinfall Data`
  const description = series.description
    ? `${series.description.substring(0, 150)}... Browse every ${series.name} episode with match cards, results, venues, and ratings.`
    : `Complete episode guide for ${series.name}. Every show with full match cards, results, venues, attendance, and detailed statistics on Pinfall Data.`

  return {
    title,
    description,
    keywords: [
      series.name, 'WWE', 'episode guide', 'show history',
      'match results', 'wrestling show', 'Pinfall Data',
      `${series.name} episodes`, `${series.name} results`,
      `${series.name} superstars`, `${series.name} statistics`,
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      ...(series.logo_url && { images: [{ url: series.logo_url, width: 400, height: 400 }] }),
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/matches/shows/${params.slug}`,
    },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
