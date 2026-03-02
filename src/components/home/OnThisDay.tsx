'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

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
  const [events, setEvents] = useState<OnThisDayEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    fetch('/api/on-this-day')
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
      <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden">
        <div className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-neon-blue flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-neon-blue rounded-full animate-glow-pulse" />
            On This Day
          </h2>
          <div className="h-56 sm:h-64 rounded-xl bg-bg-tertiary/30 animate-pulse" />
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden">
        <div className="p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-neon-blue flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-neon-blue rounded-full animate-glow-pulse" />
            On This Day
          </h2>
          <p className="text-text-secondary text-sm">No notable events found for today.</p>
        </div>
      </div>
    )
  }

  const event = events[current]

  return (
    <div className="group/card rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 overflow-hidden hover:border-neon-blue/20 transition-all duration-300">
      {/* Header bar */}
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-0 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-neon-blue flex items-center gap-2">
          <span className="w-2 h-2 bg-neon-blue rounded-full animate-glow-pulse" />
          On This Day
        </h2>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-mono font-bold">
            {monthName} {dayNum}
          </span>
        </div>
      </div>

      {/* Event card */}
      <div className="p-5 sm:p-6 pt-4">
        <div className="relative">
          {/* Main content */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
            {/* Image */}
            {event.image_url && (
              <div className="relative w-full sm:w-44 md:w-52 h-40 sm:h-36 rounded-xl overflow-hidden shrink-0 border border-border-subtle/20">
                <Image
                  src={event.image_url}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                />
                {/* Year overlay on image */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2.5">
                  <span className="text-neon-blue font-mono text-sm font-bold">{event.year}</span>
                </div>
              </div>
            )}

            {/* Text content */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              {/* Year badge (when no image) */}
              {!event.image_url && (
                <span className="inline-flex self-start mb-2 px-2.5 py-1 rounded-md bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-mono font-bold">
                  {event.year}
                </span>
              )}

              <div>
                <h3 className="font-display text-base sm:text-lg font-bold text-text-white leading-snug mb-2">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-text-secondary text-xs sm:text-sm leading-relaxed line-clamp-3">
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
    </div>
  )
}
