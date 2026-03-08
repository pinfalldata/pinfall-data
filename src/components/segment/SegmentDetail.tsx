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

/* ===== DECORATIVE OBJECT URLS ===== */
const DECO_OBJECTS = {
  mic: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Segments/microwwe.png',
  ulaFala: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Segments/Ula%20Fala.png',
  chair: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Segments/chair.png',
  urn: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Segments/urn.png',
  contract: 'https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Segments/contract.png',
};

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
      <p key={i} className="text-text-secondary leading-relaxed mb-4 last:mb-0">
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
  const color = show.primary_color || '#c7a05a';

  const venue = [show?.venue, show?.city, show?.state_province, show?.country].filter(Boolean).join(', ');
  const seriesName = show.show_series?.short_name || show.show_series?.name || '';

  return (
    <div className="min-h-screen bg-bg-primary text-text-white">

      {/* ===== SHOW INFO BAR — like MatchHero ===== */}
      <div className="bg-bg-secondary/60 border-b border-border-subtle/20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            {show.logo_url && (
              <Link href={`/shows/${show.slug}`}>
                <Image src={show.logo_url} alt="" width={48} height={48} className="h-10 sm:h-12 w-auto object-contain" />
              </Link>
            )}
            <div className="min-w-0">
              <Link href={`/shows/${show.slug}`} className="text-sm sm:text-base font-bold hover:underline" style={{ color }}>
                {show.name}
              </Link>
              <p className="text-xs text-text-secondary">{formatDate(show.date)}</p>
            </div>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              {show.attendance && (
                <span className="text-[10px] px-2 py-1 rounded-full border border-border-subtle/30 bg-bg-tertiary/50 text-text-secondary">
                  🏟️ {show.attendance.toLocaleString()}
                </span>
              )}
              {show.tv_audience && (
                <span className="text-[10px] px-2 py-1 rounded-full border border-border-subtle/30 bg-bg-tertiary/50 text-text-secondary">
                  📡 {show.tv_audience}M
                </span>
              )}
              {show.start_time && (
                <span className="text-[10px] px-2 py-1 rounded-full border border-border-subtle/30 bg-bg-tertiary/50 text-text-secondary">
                  🕐 {show.start_time}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-secondary">
            {venue && (
              <span className="flex items-center gap-1">
                <span>📍</span>
                <span>{venue}</span>
              </span>
            )}
            {show.commentators && show.commentators.length > 0 && (
              <span className="flex items-center gap-1">
                <span>🎧</span>
                {show.commentators.map((c: any, i: number) => (
                  <span key={i}>
                    {c.superstar?.slug ? (
                      <Link href={`/superstars/${c.superstar.slug}`} className="hover:underline" style={{ color }}>
                        {c.superstar?.name}
                      </Link>
                    ) : <span>{c.superstar?.name}</span>}
                    {i < (show.commentators?.length || 0) - 1 && ', '}
                  </span>
                ))}
              </span>
            )}
            {show.ringAnnouncers && show.ringAnnouncers.length > 0 && (
              <span className="flex items-center gap-1">
                <span>🎙️</span>
                {show.ringAnnouncers.map((ra: any, i: number) => (
                  <span key={i}>
                    {ra.superstar?.slug ? (
                      <Link href={`/superstars/${ra.superstar.slug}`} className="hover:underline" style={{ color }}>
                        {ra.superstar?.name}
                      </Link>
                    ) : <span>{ra.superstar?.name}</span>}
                    {i < (show.ringAnnouncers?.length || 0) - 1 && ', '}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== SEGMENT HERO — like MatchHero style ===== */}
      <section className="relative overflow-hidden bg-bg-primary">
        <div className="relative py-8 sm:py-12 lg:py-16">
          {/* Background glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[220px] opacity-12 pointer-events-none"
            style={{ backgroundColor: color }}
          />

          {/* Grid bg */}
          <div
            className="absolute inset-0 bg-grid opacity-15 animate-grid-pulse pointer-events-none"
            style={{
              maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
            }}
          />

          <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Segment type badge */}
            <div className="text-center mb-4">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border"
                style={{ backgroundColor: `${color}20`, borderColor: `${color}40`, color }}
              >
                {segmentTypeLabels[segment.category] || segment.category}
              </span>
            </div>

            {/* Segment title */}
            <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-text-white tracking-tight text-center mb-4">
              {segment.title}
            </h1>

            {segment.duration_seconds && (
              <p className="text-text-secondary text-center text-sm mb-6">
                ⏱️ {formatDuration(segment.duration_seconds)}
              </p>
            )}

            {/* Segment image — full width beautiful display */}
            {segment.image_url && (
              <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden border border-border-subtle/20 mt-4">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <Image
                    src={segment.image_url}
                    alt={segment.title}
                    fill
                    className="object-cover"
                    priority
                    quality={100}
                    sizes="(max-width: 1024px) 100vw, 896px"
                    unoptimized
                  />
                </div>
              </div>
            )}

            {/* Participants — displayed like match participants */}
            {participants.length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6">
                {participants.map((p) => (
                  <Link
                    key={p.id}
                    href={`/superstars/${p.superstar.slug}`}
                    className="group flex flex-col items-center text-center"
                    style={{ minWidth: '90px', maxWidth: '140px' }}
                  >
                    <div
                      className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-xl overflow-hidden border-2 transition-all hover:scale-105"
                      style={{ borderColor: `${color}40` }}
                    >
                      {p.superstar.photo_url ? (
                        <Image src={p.superstar.photo_url} alt={p.superstar.name} fill className="object-cover object-top" sizes="112px" />
                      ) : (
                        <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
                          <span className="text-2xl text-border-subtle font-bold">{p.superstar.name[0]}</span>
                        </div>
                      )}
                    </div>
                    <span className="mt-2 text-sm font-medium text-text-white group-hover:underline" style={p.role === 'interviewer' ? { color } : {}}>
                      {p.superstar.name}
                    </span>
                    {p.role && p.role !== 'participant' && (
                      <span className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color }}>{p.role}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Neon separator */}
        <div
          className="h-px"
          style={{
            background: `linear-gradient(90deg, transparent 0%, transparent 30%, ${color} 50%, transparent 70%, transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: 'neon-sweep 3s ease-in-out infinite',
          }}
        />
      </section>

      {/* ===== MAIN CONTENT with decorative objects ===== */}
      <div className="relative overflow-hidden">
        {/* ===== DECORATIVE OBJECTS — mic right, contract left ===== */}

        {/* Microphone — far right edge, floating, visible */}
        <div className="hidden xl:block absolute right-0 top-4 w-[200px] pointer-events-none select-none" style={{ height: 'calc(100% - 16px)' }}>
          <div className="sticky top-16 w-full h-[350px] opacity-[0.14]" style={{ animation: 'deco-float-1 6s ease-in-out infinite' }}>
            <Image src={DECO_OBJECTS.mic} alt="" fill className="object-contain object-right" aria-hidden="true" sizes="200px" unoptimized />
          </div>
        </div>

        {/* Contract — far left edge, more visible, floating */}
        <div className="hidden xl:block absolute left-0 top-4 w-[200px] pointer-events-none select-none" style={{ height: 'calc(100% - 16px)' }}>
          <div className="sticky top-20 w-full h-[320px] opacity-[0.10]" style={{ animation: 'deco-float-2 8s ease-in-out infinite', transform: 'rotate(-5deg)' }}>
            <Image src={DECO_OBJECTS.contract} alt="" fill className="object-contain object-left" aria-hidden="true" sizes="200px" unoptimized />
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          {/* ===== DESCRIPTION ===== */}
          {segment.description_md && (
            <section className="mb-10">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color }}>
                Description
              </h2>
              <div className="bg-bg-secondary/20 border border-border-subtle/20 rounded-2xl p-5 sm:p-6">
                {renderDescription(segment.description_md)}
              </div>
            </section>
          )}

          {/* ===== MEDIA ===== */}
          {media.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color }}>
                Media
              </h2>
              <div className={`${media.length === 1 ? 'flex justify-center' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}`}>
                {media.map((m) => (
                  <div
                    key={m.id}
                    className={`bg-bg-secondary/30 border border-border-subtle/20 rounded-2xl overflow-hidden ${media.length === 1 ? 'w-full max-w-2xl' : ''}`}
                  >
                    {m.media_type === 'video' || m.url?.includes('youtube') || m.url?.includes('youtu.be') ? (
                      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                          src={m.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                          className="absolute inset-0 w-full h-full rounded-t-2xl"
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
                      <p className="px-3 py-2 text-xs text-text-secondary text-center">{m.title}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Neon separator */}
      <div
        className="h-px"
        style={{
          background: `linear-gradient(90deg, transparent 0%, transparent 30%, ${color} 50%, transparent 70%, transparent 100%)`,
        }}
      />

      {/* ===== SEO FOOTER ===== */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            <span style={{ color }}>{segment.title}</span> — {show.name}
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            This page covers the &ldquo;{segment.title}&rdquo; segment from {show.name} ({formatDate(show.date)}).
            {participants.length > 0 && ` Featuring ${participants.map(p => p.superstar.name).join(', ')}.`}
            {' '}Browse the full show card, match results, and other segments on Pinfall Data.
          </p>
        </div>
      </section>

      {/* CSS animations for decorative objects */}
      <style jsx global>{`
        @keyframes deco-float-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes deco-float-2 {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-12px) rotate(-3deg); }
        }
      `}</style>
    </div>
  );
}
