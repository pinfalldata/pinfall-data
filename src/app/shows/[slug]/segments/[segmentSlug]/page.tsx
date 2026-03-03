// @ts-nocheck
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import SegmentDetail from '@/components/segment/SegmentDetail';

type Props = {
  params: Promise<{ slug: string; segmentSlug: string }>;
};

async function getSegmentData(showSlug: string, segmentSlug: string) {
  try {
    // 1) Get the show
    const { data: show, error: showError } = await supabase
      .from('shows')
      .select(`
        id, name, slug, date, venue, city, state_province, country,
        attendance, tv_audience, start_time, primary_color, logo_url,
        show_series:show_series_id ( id, name, slug, logo_url )
      `)
      .eq('slug', showSlug)
      .single();

    if (showError || !show) {
      console.error('[segment] show query error:', showError);
      return null;
    }

    // 2) Get the segment with participants + media
    const { data: segment, error: segError } = await supabase
      .from('show_segments')
      .select(`
        id, slug, title, category, description_md, image_url, video_url,
        sort_order, duration_seconds, rating, is_spoiler, display_order,
        created_at, updated_at
      `)
      .eq('show_id', show.id)
      .eq('slug', segmentSlug)
      .single();

    if (segError || !segment) {
      console.error('[segment] segment query error:', segError);
      return null;
    }

    // 3) Get participants and media separately to avoid join issues
    const [
      { data: participants, error: partError },
      { data: media, error: mediaError },
    ] = await Promise.all([
      supabase
        .from('show_segment_participants')
        .select(`
          id, role, sort_order,
          superstar:superstars ( id, name, slug, photo_url )
        `)
        .eq('segment_id', segment.id)
        .order('sort_order', { ascending: true }),
      supabase
        .from('segment_media')
        .select('id, media_type, url, thumbnail_url, title, sort_order')
        .eq('segment_id', segment.id)
        .order('sort_order', { ascending: true }),
    ]);

    if (partError) console.error('[segment] participants error:', partError);
    if (mediaError) console.error('[segment] media error:', mediaError);

    // 4) Optionally get commentators + ring announcers (non-blocking)
    let commentators = [];
    let ringAnnouncers = [];
    try {
      const [commRes, annRes] = await Promise.all([
        supabase
          .from('show_commentators')
          .select('*, superstar:superstars(id, name, slug, photo_url)')
          .eq('show_id', show.id),
        supabase
          .from('show_ring_announcers')
          .select('*, superstar:superstars(id, name, slug, photo_url)')
          .eq('show_id', show.id),
      ]);
      commentators = commRes.data || [];
      ringAnnouncers = annRes.data || [];
    } catch (e) {
      console.error('[segment] crew query error (non-blocking):', e);
    }

    return {
      ...segment,
      participants: participants || [],
      media: media || [],
      show: {
        ...show,
        commentators,
        ringAnnouncers,
      },
    };
  } catch (err) {
    console.error('[segment] unexpected error:', err);
    return null;
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const segment = await getSegmentData(params.slug, params.segmentSlug);
  if (!segment) return { title: 'Segment Not Found — Pinfall Data' };

  const show = segment.show;
  const participants = segment.participants?.map(
    (p: any) => p.superstar?.name
  ).filter(Boolean).join(', ');

  const title = `${segment.title} — ${show.name} | Pinfall Data`;
  const description = `${segment.title} segment from ${show.name} (${show.date}).${participants ? ` Featuring: ${participants}.` : ''} Full details, media, and description on Pinfall Data.`;

  return {
    title,
    description,
    keywords: [
      segment.title, show.name, 'WWE segment', 'wrestling segment',
      segment.category, ...(participants ? participants.split(', ') : []),
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
  const segment = await getSegmentData(params.slug, params.segmentSlug);
  if (!segment) notFound();

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: segment.title,
    startDate: segment.show.date,
    location: {
      '@type': 'Place',
      name: segment.show.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: segment.show.city,
        addressRegion: segment.show.state_province,
        addressCountry: segment.show.country,
      },
    },
    ...(segment.image_url && { image: segment.image_url }),
    ...(segment.duration_seconds && { duration: `PT${Math.floor(segment.duration_seconds / 60)}M${segment.duration_seconds % 60}S` }),
    performer: segment.participants?.map((p: any) => ({
      '@type': 'Person',
      name: p.superstar?.name,
    })).filter((p: any) => p.name) || [],
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
