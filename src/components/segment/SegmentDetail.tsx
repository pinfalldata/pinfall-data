'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SegmentMedia {
  id: string;
  media_type: string;
  url: string;
  thumbnail_url?: string;
  title?: string;
  sort_order: number;
}

interface SegmentParticipant {
  id: string;
  role: string;
  sort_order: number;
  superstar: {
    id: string;
    name: string;
    slug: string;
    photo_url?: string;
  };
}

interface CrewMember {
  superstar: {
    id: string;
    name: string;
    slug: string;
    photo_url?: string;
  };
}

interface Segment {
  id: string;
  title: string;
  slug: string;
  category: string;
  description_md?: string;
  image_url?: string;
  sort_order: number;
  duration_seconds?: number;
  media?: SegmentMedia[];
  participants?: SegmentParticipant[];
  show: {
    id: string;
    name: string;
    slug: string;
    date: string;
    venue?: string;
    city?: string;
    state_province?: string;
    country?: string;
    attendance?: number;
    tv_audience?: number;
    start_time?: string;
    primary_color?: string;
    logo_url?: string;
    show_series?: {
      id: number;
      name: string;
      slug: string;
      logo_url?: string;
    };
    commentators?: CrewMember[];
    ringAnnouncers?: CrewMember[];
  };
}

const segmentTypeLabels: Record<string, string> = {
  in_ring_segment: '🎤 In-Ring Segment',
  backstage: '🚪 Backstage',
  interference: '⚡ Interference',
  ceremony: '🏆 Ceremony',
  authority: '👔 Authority',
  psychology: '🧠 Psychology',
  props_spectacle: '🎪 Props & Spectacle',
  medical_injury: '🏥 Medical / Injury',
  musical: '🎵 Musical',
  fan_engagement: '📣 Fan Engagement',
  broadcast: '📺 Broadcast',
  digital: '💻 Digital',
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
  const show = segment.show;
  const media = segment.media?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const participants = segment.participants?.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)) || [];
  const isInRing = segment.category === 'in_ring_segment';

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
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {segmentTypeLabels[segment.category] || segment.category}
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

      {/* ===== NO HERO FALLBACK ===== */}
      {!segment.image_url && (
        <section className="relative py-10 sm:py-14 lg:py-20 bg-gradient-to-b from-zinc-900 to-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {segmentTypeLabels[segment.category] || segment.category}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black">
              <span className="text-amber-400">{segment.title.split(' ')[0]}</span>{' '}
              <span className="text-white">{segment.title.split(' ').slice(1).join(' ')}</span>
            </h1>
            {segment.duration_seconds && (
              <p className="text-gray-400 mt-3 text-sm">
                ⏱️ {formatDuration(segment.duration_seconds)}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ===== SHOW INFO BAR ===== */}
      <section className="bg-zinc-900/80 border-y border-amber-500/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
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

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-300">
            {show.attendance && (
              <span>🏟️ {show.attendance.toLocaleString()}</span>
            )}
            {show.tv_audience && (
              <span>📡 {show.tv_audience}M</span>
            )}
            {show.start_time && (
              <span>🕐 {show.start_time}</span>
            )}
          </div>

          {(show.venue || show.city) && (
            <div className="mt-2 text-sm text-gray-400">
              <span>📍 </span>
              {show.venue && <span className="text-gray-300">{show.venue}</span>}
              {show.venue && show.city && <span> — </span>}
              {show.city && <span>{show.city}</span>}
              {show.state_province && <span>, {show.state_province}</span>}
              {show.country && <span>, {show.country}</span>}
            </div>
          )}

          {/* Crew */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm">
            {show.commentators && show.commentators.length > 0 && (
              <span className="text-gray-400">
                📺 <span className="text-gray-300">{show.commentators.map((c: any) => c.superstar?.name).filter(Boolean).join(', ')}</span>
              </span>
            )}
            {show.ringAnnouncers && show.ringAnnouncers.length > 0 && (
              <span className="text-gray-400">
                🎙️ <span className="text-gray-300">{show.ringAnnouncers.map((a: any) => a.superstar?.name).filter(Boolean).join(', ')}</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative overflow-hidden">
        {/* Microphone decoration — only for in_ring_segment, subtle and on the side */}
        {isInRing && (
          <div
            className="absolute right-0 top-8 w-[220px] lg:w-[320px] pointer-events-none select-none"
            style={{ height: 'calc(100% - 32px)' }}
          >
            <div
              className="sticky top-20 w-full h-[400px] lg:h-[500px] opacity-[0.06]"
              style={{
                animation: 'mic-float 6s ease-in-out infinite',
              }}
            >
              <Image
                src={MIC_BG_URL}
                alt=""
                fill
                className="object-contain object-right-top"
                aria-hidden="true"
                sizes="320px"
                unoptimized
              />
            </div>
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
                    href={`/superstars/${p.superstar.slug}`}
                    className="group flex items-center gap-3 bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-3 hover:border-amber-500/40 transition-all"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-zinc-700 group-hover:border-amber-500/50 transition-colors">
                      {p.superstar.photo_url ? (
                        <Image
                          src={p.superstar.photo_url}
                          alt={p.superstar.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-amber-400 text-lg font-bold">
                          {p.superstar.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-white font-semibold group-hover:text-amber-400 transition-colors text-sm">
                        {p.superstar.name}
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
                    {m.media_type === 'video' || m.url?.includes('youtube') || m.url?.includes('youtu.be') ? (
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={m.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={m.title || segment.title}
                        />
                      </div>
                    ) : (
                      <div className="relative aspect-video">
                        <Image
                          src={m.thumbnail_url || m.url}
                          alt={m.title || segment.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    {m.title && (
                      <p className="px-3 py-2 text-xs text-gray-400 text-center">{m.title}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* CSS animation for microphone float */}
      <style jsx global>{`
        @keyframes mic-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}
