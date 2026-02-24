'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatDate, getSegmentCategoryLabel, getSegmentCategoryIcon, getShowColorStyle } from '@/lib/utils'

export function SegmentDetail({ segment }: { segment: any }) {
  const show = segment.show
  const color = show?.primary_color || '#c7a05a'
  const colorStyle = getShowColorStyle(color) as React.CSSProperties
  const participants = segment.participants || []

  return (
    <div style={colorStyle}>
      {/* Show header breadcrumb */}
      <div className="bg-bg-secondary/50 border-b border-border-subtle/20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            {show?.logo_url && (
              <Image src={show.logo_url} alt="" width={32} height={32} className="h-8 w-auto object-contain" />
            )}
            <div>
              <Link href={`/shows/${show?.slug}`} className="text-sm font-medium hover:underline" style={{ color }}>
                {show?.name}
              </Link>
              <p className="text-xs text-text-secondary">{formatDate(show?.date)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Segment hero */}
      <section className="relative overflow-hidden bg-bg-primary">
        <div className="relative py-10 sm:py-14 lg:py-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[180px] opacity-8 pointer-events-none" style={{ backgroundColor: color }} />

          <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Category */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">{getSegmentCategoryIcon(segment.category)}</span>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
                {getSegmentCategoryLabel(segment.category)}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white tracking-tight leading-tight max-w-3xl mx-auto">
              {segment.title}
            </h1>

            {/* Image */}
            {segment.image_url && (
              <div className="mt-8 max-w-2xl mx-auto rounded-xl overflow-hidden border border-border-subtle/30">
                <Image src={segment.image_url} alt={segment.title} width={800} height={450} className="w-full object-cover" />
              </div>
            )}

            {/* Participants */}
            {participants.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
                {participants
                  .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((p: any) => (
                    <Link key={p.id} href={`/superstars/${p.superstar?.slug}`} className="flex flex-col items-center group">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-border-subtle/30 group-hover:border-opacity-60 transition-all"
                        style={{ borderColor: `${color}30` }}>
                        {p.superstar?.photo_url ? (
                          <Image src={p.superstar.photo_url} alt={p.superstar.name} width={96} height={96} className="w-full h-full object-cover object-top" />
                        ) : (
                          <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
                            <span className="text-2xl text-border-subtle">?</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-text-white group-hover:underline">{p.superstar?.name}</p>
                      {p.role && p.role !== 'participant' && (
                        <p className="text-[10px] text-text-secondary capitalize">{p.role}</p>
                      )}
                    </Link>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div className="h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      </section>

      {/* Description */}
      {segment.description_md && (
        <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="prose prose-invert prose-sm max-w-none text-text-primary leading-relaxed">
            {segment.description_md.split('\n').map((line: string, i: number) => (
              <p key={i} className="mb-3">{line}</p>
            ))}
          </div>
        </div>
      )}

      {/* Media */}
      {segment.media?.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-4">Media</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {segment.media.map((m: any) => (
              <div key={m.id} className="rounded-xl overflow-hidden border border-border-subtle/30 bg-bg-secondary/50">
                {m.media_type === 'video' && m.url?.includes('youtube') ? (
                  <div className="aspect-video">
                    <iframe src={m.url.replace('watch?v=', 'embed/')} className="w-full h-full" allowFullScreen loading="lazy" />
                  </div>
                ) : m.url ? (
                  <Image src={m.url} alt={m.title || ''} width={400} height={225} className="w-full object-cover" />
                ) : null}
                {m.title && <p className="p-3 text-sm text-text-secondary">{m.title}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
