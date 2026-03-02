// @ts-nocheck
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SegmentDetail from '@/components/segment/SegmentDetail';

type Props = {
  params: Promise<{ slug: string; segmentSlug: string }>;
};

async function getSegment(showSlug: string, segmentSlug: string) {
  const { data: show, error: showError } = await supabase
    .from('shows')
    .select('id')
    .eq('slug', showSlug)
    .single();

  if (showError || !show) return null;

  const { data, error } = await supabase
    .from('show_segments')
    .select(`
      *,
      shows (
        id, name, slug, date, venue, city, state_province, country,
        attendance, tv_rating, start_time,
        show_series ( name, slug, logo_url ),
        show_commentators ( name ),
        show_producers ( name ),
        show_announcers ( name )
      ),
      show_segments_media ( id, media_type, media_url, thumbnail_url, caption, sort_order ),
      show_segments_participants (
        id, role,
        superstars ( id, name, slug, photo_url )
      )
    `)
    .eq('show_id', show.id)
    .eq('slug', segmentSlug)
    .single();

  if (error) {
    console.error('[segment] query error:', error);
    return null;
  }

  return data;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const segment = await getSegment(params.slug, params.segmentSlug);
  if (!segment) return { title: 'Segment Not Found — Pinfall Data' };

  const show = segment.shows;
  const participants = segment.show_segments_participants?.map(
    (p: any) => p.superstars?.name
  ).filter(Boolean).join(', ');

  const title = `${segment.title} — ${show.name} | Pinfall Data`;
  const description = `${segment.title} segment from ${show.name} (${show.date}).${participants ? ` Featuring: ${participants}.` : ''} Full details, media, and description on Pinfall Data.`;

  return {
    title,
    description,
    keywords: [
      segment.title, show.name, 'WWE segment', 'wrestling segment',
      segment.segment_type, ...(participants ? participants.split(', ') : []),
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      ...(segment.image_url && { images: [{ url: segment.image_url, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function SegmentPage(props: Props) {
  const params = await props.params;
  const segment = await getSegment(params.slug, params.segmentSlug);
  if (!segment) notFound();

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: segment.title,
    startDate: segment.shows.date,
    location: {
      '@type': 'Place',
      name: segment.shows.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: segment.shows.city,
        addressRegion: segment.shows.state_province,
        addressCountry: segment.shows.country,
      },
    },
    ...(segment.image_url && { image: segment.image_url }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SegmentDetail segment={segment} />
    </>
  );
}
