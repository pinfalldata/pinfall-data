'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

interface MediaItem {
  id: string | number
  url: string
  title?: string
  media_type?: string // 'video' | 'image' | 'photo'
}

interface MediaCarouselProps {
  items: MediaItem[]
  /** Max columns in grid mode (when > 1 item) */
  columns?: 2 | 3
  /** Show color for accent */
  color?: string
}

/** Extract YouTube embed URL from various YouTube URL formats */
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null
  let videoId: string | null = null

  // youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([^&#]+)/)
  if (watchMatch) videoId = watchMatch[1]

  // youtu.be/ID
  if (!videoId) {
    const shortMatch = url.match(/youtu\.be\/([^?&#]+)/)
    if (shortMatch) videoId = shortMatch[1]
  }

  // youtube.com/embed/ID
  if (!videoId) {
    const embedMatch = url.match(/\/embed\/([^?&#]+)/)
    if (embedMatch) videoId = embedMatch[1]
  }

  // youtube.com/shorts/ID
  if (!videoId) {
    const shortsMatch = url.match(/\/shorts\/([^?&#]+)/)
    if (shortsMatch) videoId = shortsMatch[1]
  }

  // youtube.com/live/ID
  if (!videoId) {
    const liveMatch = url.match(/\/live\/([^?&#]+)/)
    if (liveMatch) videoId = liveMatch[1]
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}` : null
}

function isVideoItem(item: MediaItem): boolean {
  if (item.media_type === 'video') return true
  if (item.url?.includes('youtube') || item.url?.includes('youtu.be')) return true
  return false
}

export function MediaCarousel({ items, columns = 3, color = '#c7a05a' }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length)
  }, [items.length])

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
  }, [items.length])

  if (!items || items.length === 0) return null

  const current = items[currentIndex]
  const isVideo = isVideoItem(current)
  const embedUrl = isVideo ? getYouTubeEmbedUrl(current.url) : null

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
          <span>📸</span> Media
          <span className="text-[10px] font-normal text-text-secondary/60">
            {items.length} item{items.length > 1 ? 's' : ''}
          </span>
        </h3>

        {/* Navigation arrows */}
        {items.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary font-mono">
              {currentIndex + 1}/{items.length}
            </span>
            <button
              onClick={goPrev}
              className="w-8 h-8 rounded-lg border border-border-subtle/30 bg-bg-secondary/50 flex items-center justify-center hover:border-border-subtle/60 transition-colors"
              aria-label="Previous"
            >
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goNext}
              className="w-8 h-8 rounded-lg border border-border-subtle/30 bg-bg-secondary/50 flex items-center justify-center hover:border-border-subtle/60 transition-colors"
              aria-label="Next"
            >
              <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Main display */}
      <div className="relative rounded-xl overflow-hidden border border-border-subtle/30 bg-bg-secondary/30">
        {isVideo && embedUrl ? (
          <div className="aspect-video">
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allowFullScreen
              loading="lazy"
              title={current.title || 'Video'}
            />
          </div>
        ) : current.url ? (
          <div className="aspect-video relative">
            <Image
              src={current.url}
              alt={current.title || ''}
              fill
              className="object-contain bg-black/20"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
        ) : null}

        {/* Title overlay */}
        {current.title && (
          <div className="px-4 py-3 border-t border-border-subtle/20">
            <p className="text-sm text-text-secondary">{current.title}</p>
          </div>
        )}
      </div>

      {/* Thumbnail strip (if > 1) */}
      {items.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {items.map((item, i) => {
            const isActive = i === currentIndex
            const thumbIsVideo = isVideoItem(item)
            return (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(i)}
                className={`relative shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  isActive ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-75'
                }`}
                style={{ borderColor: isActive ? color : 'rgba(30,41,59,0.3)' }}
              >
                {thumbIsVideo ? (
                  <div className="w-full h-full bg-bg-tertiary flex items-center justify-center">
                    <svg className="w-5 h-5 text-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                ) : item.url ? (
                  <Image src={item.url} alt="" fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full bg-bg-tertiary" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
