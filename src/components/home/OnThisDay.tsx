'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'


interface OnThisDayEvent {
  id: number
  month: number
  day: number
  year: number
  title: string
  description: string | null
  image_url: string | null
  importance: number
}

export function OnThisDay() {
  const t = useTranslations()

  const [events, setEvents] = useState<OnThisDayEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const now = new Date()
    const m = now.getMonth() + 1
    const d = now.getDate()
    fetch(`/api/on-this-day?month=${m}&day=${d}`)
      .then(r => r.json())
      .then(data => {
        setEvents(data.events || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const goNext = useCallback(() => {
    setCurrent(prev => (prev + 1) % events.length)
  }, [events.length])

  const goPrev = useCallback(() => {
    setCurrent(prev => (prev - 1 + events.length) % events.length)
  }, [events.length])

  // Today's date display
  const today = new Date()
  const monthName = today.toLocaleString('en-US', { month: 'long' })
  const dayNum = today.getDate()

  if (loading) {
    return (
      <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden h-full">
        <div className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-neon-blue flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-neon-blue rounded-full animate-glow-pulse" />
            {t('home.sections.onThisDay')}
          </h2>
          <div className="h-56 sm:h-64 rounded-xl bg-bg-tertiary/30 animate-pulse" />
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden h-full">
        <div className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-neon-blue flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-neon-blue rounded-full animate-glow-pulse" />
            {t('home.sections.onThisDay')}
          </h2>
          <p className="text-text-secondary text-sm">{t('home.sections.noEvents')}</p>
        </div>
      </div>
    )
  }

  const event = events[current]

  return (
    <div className="group/card rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden hover:border-neon-blue/20 transition-all duration-300 h-full flex flex-col">
      {/* Header bar */}
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-0 flex items-center justify-between shrink-0">
        <h2 className="font-display text-lg font-bold text-neon-blue flex items-center gap-2">
          <span className="w-2 h-2 bg-neon-blue rounded-full animate-glow-pulse" />
          {t('home.sections.onThisDay')}
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-mono font-bold">
            {monthName} {dayNum}
          </span>
        </div>
      </div>

      {/* Event card — fills remaining height */}
      <div className="p-5 sm:p-6 pt-4 flex-1 flex flex-col">
        <div className="relative flex-1 flex flex-col">
          {/* Image — large, cinematic */}
          {event.image_url && (
            <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden shrink-0 border border-border-subtle/20 mb-4">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                sizes="(max-width: 640px) 100vw, 800px"
                className="object-cover object-top transition-transform duration-500 group-hover/card:scale-105"
              />
              {/* Gradient overlay with year */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <span className="inline-flex px-2 py-0.5 rounded-md bg-neon-blue/20 border border-neon-blue/30 text-neon-blue text-sm font-mono font-bold backdrop-blur-sm">
                  {event.year}
                </span>
              </div>
            </div>
          )}

          {/* Year badge (when no image) */}
          {!event.image_url && (
            <span className="inline-flex self-start mb-3 px-2.5 py-1 rounded-md bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-mono font-bold">
              {event.year}
            </span>
          )}

          {/* Text content — grows to fill space */}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-display text-lg sm:text-xl font-bold text-text-white leading-snug mb-2">
                {event.title}
              </h3>
              {event.description && (
                <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
                  {event.description}
                </p>
              )}
            </div>

            {/* Bottom: dots + arrows navigation */}
            <div className="flex items-center justify-between mt-4">
              {/* Dot indicators */}
              <div className="flex items-center gap-1.5">
                {events.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrent(idx)}
                    className={`transition-all duration-300 rounded-full ${
                      idx === current
                        ? 'w-5 h-2 bg-neon-blue'
                        : 'w-2 h-2 bg-border-subtle/50 hover:bg-text-secondary/40'
                    }`}
                    aria-label={`Event ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Arrow navigation */}
              <div className="flex items-center gap-1.5">
                <span className="text-text-secondary text-xs font-mono mr-2">
                  {current + 1}/{events.length}
                </span>
                <button
                  onClick={goPrev}
                  className="w-8 h-8 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue hover:border-neon-blue/30 transition-all"
                  aria-label="Previous event"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={goNext}
                  className="w-8 h-8 rounded-full border border-border-subtle/30 flex items-center justify-center text-text-secondary hover:text-neon-blue hover:border-neon-blue/30 transition-all"
                  aria-label="Next event"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
