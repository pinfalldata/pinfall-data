'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

interface SearchBarProps {
  onClose: () => void
}

export function SearchBar({ onClose }: SearchBarProps) {
  const t = useTranslations('nav')
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Search container */}
      <div className="relative max-w-2xl mx-auto mt-24 px-4 animate-slide-in">
        <div className="glass rounded-xl p-2 shadow-neon-blue">
          <div className="flex items-center gap-3 px-4">
            {/* Search icon */}
            <svg className="w-5 h-5 text-neon-blue shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search')}
              className="flex-1 bg-transparent py-3 text-text-white placeholder:text-text-secondary outline-none font-body text-lg"
            />

            {/* Close button */}
            <button onClick={onClose} className="text-text-secondary hover:text-text-white transition-colors">
              <kbd className="px-2 py-0.5 text-xs border border-border-subtle rounded">ESC</kbd>
            </button>
          </div>
        </div>

        {/* Results will go here once connected to Supabase */}
        {query.length > 2 && (
          <div className="glass rounded-xl mt-2 p-6 text-center">
            <p className="text-text-secondary text-sm">
              Search will be connected to the database in Phase 1.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
