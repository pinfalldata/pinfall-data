'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SegmentMedia {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  sort_order: number;
}

interface SegmentParticipant {
  id: string;
  role: string;
  superstars: {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
  };
}

interface Segment {
  id: string;
  title: string;
  slug: string;
  segment_type: string;
  description_md?: string;
  image_url?: string;
  sort_order: number;
  duration_seconds?: number;
  show_segments_media?: SegmentMedia[];
  show_segments_participants?: SegmentParticipant[];
  shows: {
    id: string;
    name: string;
    slug: string;
    date: string;
    venue?: string;
    city?: string;
    state?: string;
    country?: string;
    attendance?: number;
    tv_rating?: number;
    start_time?: string;
    show_series?: {
      name: string;
      slug: string;
      logo_url?: string;
    };
    show_commentators?: { name: string }[];
    show_producers?: { name: string }[];
    show_announcers?: { name: string }[];
  };
}

const segmentTypeLabels: Record<string, string> = {
  in_ring_segment: '🎤 In-Ring Segment',
  backstage_segment: '🚪 Backstage',
  interview: '🎙️ Interview',
  promo: '📢 Promo',
  entrance: '🎵 Entrance',
  video_package: '📹 Video Package',
  announcement: '📣 Announcement',
  other: '📋 Other',
};

const MIC_BG_URL = 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Segments/microwwe.png';

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function renderDescription(md?: string) {
  if (!md) return null;
  // Split on double newlines for paragraphs, single newlines for <br>
  const paragraphs = md.split(/\n\s*\n/);
  return paragraphs.map((para, i) => {
    const lines = para.split('\n');
    return (
      <p key={i} className="text-gray-300 leading-relaxed mb-4 last:mb-0">
        {lines.map((line, j) => (
          <React.Fragment key={j}>
            {j > 0 && <br />}
            {line}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

export default function SegmentDetail({ segment }: { segment: Segment }) {
  const show = segment.shows;
  const media = segment.show_segments_media?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const participants = segment.show_segments_participants || [];
  const isInRing = segment.segment_type === 'in_ring_segment';

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ===== HERO IMAGE ===== */}
      {segment.image_url && (
        <section className="relative h-[280px] sm:h-[360px] lg:h-[440px] w-full overflow-hidden">
          <Image
            src={segment.image_url}
            alt={segment.title}
            fill
            className="object-cover object-top transition-transform duration-700 hover:scale-105"
            priority
            quality={100}
            sizes="100vw"
          />
          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          
          {/* Vignette effect */}
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
          
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {segmentTypeLabels[segment.segment_type] || segment.segment_type}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black">
                <span className="text-amber-400">{segment.title.split(' ')[0]}</span>{' '}
                <span className="text-white">{segment.title.split(' ').slice(1).join(' ')}</span>
              </h1>
              {segment.duration_seconds && (
                <p className="text-gray-400 mt-2 text-sm">
                  ⏱️ {formatDuration(segment.duration_seconds)}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== SHOW INFO BAR (same as match pages) ===== */}
      <section className="bg-zinc-900/80 border-y border-amber-500/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          {/* Show name + date */}
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {show.show_series?.logo_url && (
              <Image
                src={show.show_series.logo_url}
                alt={show.show_series.name}
                width={40}
                height={40}
                className="rounded"
              />
            )}
            <div>
              <Link 
                href={`/shows/${show.slug}`}
                className="text-amber-400 font-bold text-lg hover:text-amber-300 transition-colors"
              >
                {show.name}
              </Link>
              <p className="text-gray-400 text-sm">{formatDate(show.date)}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-300">
            {show.attendance && (
              <span>🏟️ {show.attendance.toLocaleString()}</span>
            )}
            {show.tv_rating && (
              <span>📡 {show.tv_rating}M</span>
            )}
            {show.start_time && (
              <span>🕐 {show.start_time}</span>
            )}
          </div>

          {/* Location */}
          {(show.venue || show.city) && (
            <div className="mt-2 text-sm text-gray-400">
              <span>📍 </span>
              {show.venue && <span className="text-gray-300">{show.venue}</span>}
              {show.venue && show.city && <span> — </span>}
              {show.city && <span>{show.city}</span>}
              {show.state && <span>, {show.state}</span>}
              {show.country && <span>, {show.country}</span>}
            </div>
          )}

          {/* Crew */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm">
            {show.show_producers && show.show_producers.length > 0 && (
              <span className="text-gray-400">
                🎧 <span className="text-gray-300">{show.show_producers.map(p => p.name).join(', ')}</span>
              </span>
            )}
            {show.show_announcers && show.show_announcers.length > 0 && (
              <span className="text-gray-400">
                🎙️ <span className="text-gray-300">{show.show_announcers.map(a => a.name).join(', ')}</span>
              </span>
            )}
            {show.show_commentators && show.show_commentators.length > 0 && (
              <span className="text-gray-400">
                📺 <span className="text-gray-300">{show.show_commentators.map(c => c.name).join(', ')}</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative">
        {/* Microphone background for in-ring segments */}
        {isInRing && (
          <div className="absolute right-0 top-0 bottom-0 w-[300px] lg:w-[400px] pointer-events-none overflow-hidden opacity-[0.04]">
            <Image
              src={MIC_BG_URL}
              alt=""
              fill
              className="object-contain object-right"
              aria-hidden="true"
            />
          </div>
        )}

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          {/* ===== PARTICIPANTS ===== */}
          {participants.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-amber-400 mb-4 uppercase tracking-wider">
                Participants
              </h2>
              <div className="flex flex-wrap gap-4">
                {participants.map((p) => (
                  <Link
                    key={p.id}
                    href={`/superstars/${p.superstars.slug}`}
                    className="group flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 hover:border-amber-500/40 transition-all"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-700 group-hover:border-amber-500/50 transition-colors">
                      {p.superstars.image_url ? (
                        <Image
                          src={p.superstars.image_url}
                          alt={p.superstars.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-amber-400 text-lg font-bold">
                          {p.superstars.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-white font-semibold group-hover:text-amber-400 transition-colors text-sm">
                        {p.superstars.name}
                      </span>
                      {p.role && p.role !== 'participant' && (
                        <span className="block text-xs text-gray-500 capitalize">{p.role}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ===== DESCRIPTION ===== */}
          {segment.description_md && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-amber-400 mb-4 uppercase tracking-wider">
                Description
              </h2>
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 sm:p-6 max-w-3xl">
                {renderDescription(segment.description_md)}
              </div>
            </section>
          )}

          {/* ===== MEDIA ===== */}
          {media.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold text-amber-400 mb-4 uppercase tracking-wider">
                Media
              </h2>
              <div className={`
                ${media.length === 1 
                  ? 'flex justify-center' 
                  : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                }
              `}>
                {media.map((m) => (
                  <div
                    key={m.id}
                    className={`
                      bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden
                      ${media.length === 1 ? 'w-full max-w-2xl' : ''}
                    `}
                  >
                    {m.media_type === 'video' || m.media_url?.includes('youtube') || m.media_url?.includes('youtu.be') ? (
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={m.media_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={m.caption || segment.title}
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video">
                        <Image
                          src={m.thumbnail_url || m.media_url}
                          alt={m.caption || segment.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    {m.caption && (
                      <p className="px-3 py-2 text-xs text-gray-400 text-center">{m.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}