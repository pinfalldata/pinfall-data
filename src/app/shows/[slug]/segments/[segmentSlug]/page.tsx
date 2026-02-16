import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getSegmentBySlug } from '@/lib/queries'
import { SegmentDetail } from '@/components/segment/SegmentDetail'

interface Props {
  params: { slug: string; segmentSlug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const segment = await getSegmentBySlug(params.slug, params.segmentSlug)
  if (!segment) return { title: 'Segment not found — Pinfall Data' }

  const showName = (segment as any).show?.name || ''
  const participants = (segment as any).participants || []
  const names = participants.map((p: any) => p.superstar?.name).filter(Boolean).slice(0, 3)

  return {
    title: `${(segment as any).title} — ${showName} | Pinfall Data`,
    description: `${(segment as any).title} at ${showName}. ${names.length > 0 ? `Featuring ${names.join(', ')}.` : ''} Full details and media.`,
    alternates: {
      canonical: `/shows/${params.slug}/segments/${params.segmentSlug}`,
    },
  }
}

export default async function SegmentPage({ params }: Props) {
  const segment = await getSegmentBySlug(params.slug, params.segmentSlug)
  if (!segment) notFound()

  return (
    <main className="min-h-screen">
      <SegmentDetail segment={segment} />
    </main>
  )
}
