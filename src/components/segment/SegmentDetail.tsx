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

  return (
    <div className="min-h-screen bg-bg-primary text-text-white">
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
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />

          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-12">
            <div className="max-w-6xl mx-auto">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border"
                style={{ backgroundColor: `${color}20`, borderColor: `${color}30`, color }}
              >
                {segmentTypeLabels[segment.category] || segment.category}
              </span>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-text-white tracking-tight">
                {segment.title}
              </h1>
              {segment.duration_seconds && (
                <p className="text-text-secondary mt-2 text-sm">
                  ⏱️ {formatDuration(segment.duration_seconds)}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ===== NO HERO FALLBACK ===== */}
      {!segment.image_url && (
        <section className="relative py-10 sm:py-14 lg:py-20 bg-gradient-to-b from-bg-secondary to-bg-primary overflow-hidden">
          {/* Grid bg */}
          <div
            className="absolute inset-0 bg-grid opacity-15 animate-grid-pulse pointer-events-none"
            style={{
              maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
              WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, black, transparent)',
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[120px] opacity-20 pointer-events-none"
            style={{ backgroundColor: color }}
          />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border"
              style={{ backgroundColor: `${color}20`, borderColor: `${color}30`, color }}
            >
              {segmentTypeLabels[segment.category] || segment.category}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-text-white tracking-tight">
              {segment.title}
            </h1>
            {segment.duration_seconds && (
              <p className="text-text-secondary mt-3 text-sm">
                ⏱️ {formatDuration(segment.duration_seconds)}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ===== SHOW INFO BAR ===== */}
      <section className="bg-bg-secondary/30 border-y border-border-subtle/20">
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
                className="font-bold text-lg hover:opacity-80 transition-opacity"
                style={{ color }}
              >
                {show.name}
              </Link>
              <p className="text-text-secondary text-sm">{formatDate(show.date)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary">
            {show.attendance && (
              <span>🏟️ <span className="text-text-white">{show.attendance.toLocaleString()}</span></span>
            )}
            {show.tv_audience && (
              <span>📡 <span className="text-text-white">{show.tv_audience}M</span></span>
            )}
            {show.start_time && (
              <span>🕐 <span className="text-text-white">{show.start_time}</span></span>
            )}
          </div>

          {(show.venue || show.city) && (
            <div className="mt-2 text-sm text-text-secondary">
              <span>📍 </span>
              {show.venue && <span className="text-text-white">{show.venue}</span>}
              {show.venue && show.city && <span> — </span>}
              {show.city && <span>{show.city}</span>}
              {show.state_province && <span>, {show.state_province}</span>}
              {show.country && <span>, {show.country}</span>}
            </div>
          )}

          {/* Crew */}
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm">
            {show.commentators && show.commentators.length > 0 && (
              <span className="text-text-secondary">
                📺 <span className="text-text-white">{show.commentators.map((c: any) => c.superstar?.name).filter(Boolean).join(', ')}</span>
              </span>
            )}
            {show.ringAnnouncers && show.ringAnnouncers.length > 0 && (
              <span className="text-text-secondary">
                🎙️ <span className="text-text-white">{show.ringAnnouncers.map((a: any) => a.superstar?.name).filter(Boolean).join(', ')}</span>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ===== MAIN CONTENT with decorative objects ===== */}
      <div className="relative overflow-hidden">
        {/* ===== DECORATIVE OBJECTS — hidden on mobile, subtle opacity ===== */}

        {/* Microphone — right side, top area */}
        <div className="hidden lg:block absolute right-0 top-8 w-[280px] pointer-events-none select-none" style={{ height: 'calc(100% - 32px)' }}>
          <div className="sticky top-20 w-full h-[420px] opacity-[0.05]" style={{ animation: 'deco-float-1 6s ease-in-out infinite' }}>
            <Image src={DECO_OBJECTS.mic} alt="" fill className="object-contain object-right-top" aria-hidden="true" sizes="280px" unoptimized />
          </div>
        </div>

        {/* Chair — left side, upper middle */}
        <div className="hidden lg:block absolute left-[-40px] top-[15%] w-[200px] h-[220px] pointer-events-none select-none opacity-[0.04]" style={{ animation: 'deco-float-2 8s ease-in-out infinite', transform: 'rotate(-12deg)' }}>
          <Image src={DECO_OBJECTS.chair} alt="" fill className="object-contain" aria-hidden="true" sizes="200px" unoptimized />
        </div>

        {/* Urn — right side, below middle */}
        <div className="hidden lg:block absolute right-[5%] top-[55%] w-[160px] h-[180px] pointer-events-none select-none opacity-[0.04]" style={{ animation: 'deco-float-3 7s ease-in-out infinite' }}>
          <Image src={DECO_OBJECTS.urn} alt="" fill className="object-contain" aria-hidden="true" sizes="160px" unoptimized />
        </div>

        {/* Ula Fala — left side, lower area */}
        <div className="hidden lg:block absolute left-[3%] top-[65%] w-[180px] h-[200px] pointer-events-none select-none opacity-[0.04]" style={{ animation: 'deco-float-2 9s ease-in-out infinite', transform: 'rotate(8deg)' }}>
          <Image src={DECO_OBJECTS.ulaFala} alt="" fill className="object-contain" aria-hidden="true" sizes="180px" unoptimized />
        </div>

        {/* Contract — right side, bottom area */}
        <div className="hidden lg:block absolute right-[8%] bottom-[10%] w-[170px] h-[190px] pointer-events-none select-none opacity-[0.04]" style={{ animation: 'deco-float-1 10s ease-in-out infinite', transform: 'rotate(-5deg)' }}>
          <Image src={DECO_OBJECTS.contract} alt="" fill className="object-contain" aria-hidden="true" sizes="170px" unoptimized />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
          {/* ===== PARTICIPANTS ===== */}
          {participants.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color }}>
                Participants
              </h2>
              <div className="flex flex-wrap gap-4">
                {participants.map((p) => (
                  <Link
                    key={p.id}
                    href={`/superstars/${p.superstar.slug}`}
                    className="group flex items-center gap-3 bg-bg-secondary/30 border border-border-subtle/20 rounded-xl px-4 py-3 hover:border-neon-blue/30 transition-all card-glow"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-border-subtle/30 group-hover:border-neon-blue/40 transition-colors">
                      {p.superstar.photo_url ? (
                        <Image
                          src={p.superstar.photo_url}
                          alt={p.superstar.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full bg-bg-tertiary flex items-center justify-center text-neon-blue text-lg font-bold">
                          {p.superstar.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-text-white font-semibold group-hover:text-neon-blue transition-colors text-sm">
                        {p.superstar.name}
                      </span>
                      {p.role && p.role !== 'participant' && (
                        <span className="block text-xs text-text-secondary capitalize">{p.role}</span>
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
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4" style={{ color }}>
                Description
              </h2>
              <div className="bg-bg-secondary/20 border border-border-subtle/20 rounded-2xl p-5 sm:p-6 max-w-3xl">
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
                      bg-bg-secondary/30 border border-border-subtle/20 rounded-2xl overflow-hidden
                      ${media.length === 1 ? 'w-full max-w-2xl' : ''}
                    `}
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
          50% { transform: translateY(-12px); }
        }
        @keyframes deco-float-2 {
          0%, 100% { transform: translateY(0px) rotate(-12deg); }
          50% { transform: translateY(-10px) rotate(-10deg); }
        }
        @keyframes deco-float-3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
