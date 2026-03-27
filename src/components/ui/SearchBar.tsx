'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'


interface SearchResult {
  name: string
  slug: string
  href: string
  image?: string
  subtitle?: string
}

interface SearchCategory {
  key: string
  label: string
  icon: string
  items: SearchResult[]
}

interface SearchBarProps {
  onClose: () => void
}

// Highlight matched text in result name
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-neon-blue font-bold">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

export function SearchBar({ onClose }: SearchBarProps) {
  const t = useTranslations()

  const router = useRouter()
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<SearchCategory[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<{ name: string; href: string }[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Build flat list of all results for keyboard nav
  const allResults = categories.flatMap(c => c.items)

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setCategories([])
      setTotalResults(0)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await r.json()
      setCategories(data.categories || [])
      setTotalResults(data.totalResults || 0)
      setActiveIndex(-1)
    } catch {
      setCategories([])
      setTotalResults(0)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setCategories([])
      setTotalResults(0)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(() => doSearch(query), 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, doSearch])

  // Navigate to result
  const goTo = useCallback((item: SearchResult) => {
    // Save to recent
    setRecentSearches(prev => {
      const filtered = prev.filter(r => r.href !== item.href)
      return [{ name: item.name, href: item.href }, ...filtered].slice(0, 5)
    })
    onClose()
    router.push(item.href)
  }, [router, onClose])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % allResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => prev <= 0 ? allResults.length - 1 : prev - 1)
    } else if (e.key === 'Enter' && activeIndex >= 0 && allResults[activeIndex]) {
      e.preventDefault()
      goTo(allResults[activeIndex])
    }
  }

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const el = resultsRef.current.querySelector(`[data-idx="${activeIndex}"]`)
      if (el) el.scrollIntoView({ block: 'nearest' })
    }
  }, [activeIndex])

  // Track flat index across categories
  let flatIdx = 0

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      {/* Search container */}
      <div className="relative max-w-2xl mx-auto mt-12 sm:mt-20 px-4 animate-fade-in">
        {/* Input box */}
        <div className="rounded-2xl border border-neon-blue/20 bg-bg-primary/95 backdrop-blur-xl shadow-2xl shadow-neon-blue/10 overflow-hidden">
          <div className="flex items-center gap-3 px-5 border-b border-border-subtle/20">
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
              onKeyDown={handleKeyDown}
              placeholder={t('search.placeholder')}
              className="flex-1 bg-transparent py-4 text-text-white placeholder:text-text-secondary/50 outline-none font-body text-base sm:text-lg"
              autoComplete="off"
              spellCheck={false}
            />

            {/* Loading spinner */}
            {loading && (
              <div className="w-5 h-5 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin shrink-0" />
            )}

            {/* Shortcut hint / Close */}
            <button onClick={onClose} className="text-text-secondary hover:text-text-white transition-colors shrink-0">
              <kbd className="px-2 py-0.5 text-[10px] border border-border-subtle/40 rounded-md bg-bg-secondary/50 font-mono">ESC</kbd>
            </button>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto overscroll-contain">
            {/* No query — show recent + tips */}
            {query.length < 2 && !loading && (
              <div className="p-5">
                {recentSearches.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold mb-2">{t('search.recent')}</p>
                    <div className="space-y-1">
                      {recentSearches.map((r, i) => (
                        <button
                          key={i}
                          onClick={() => { onClose(); router.push(r.href) }}
                          className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg hover:bg-neon-blue/5 transition-all group"
                        >
                          <svg className="w-4 h-4 text-text-secondary/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-text-secondary group-hover:text-neon-blue transition-colors truncate">{r.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">{t('search.searchAcross')}</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { icon: '💪', label: t('home.stats.superstars') },
                      { icon: '📺', label: t('home.stats.shows') },
                      { icon: '🏆', label: t('common.championships') },
                      { icon: '🏟️', label: 'Arenas' },
                      { icon: '⚔️', label: t('home.stats.matchTypes') },
                      { icon: '🤝', label: t('tagTeams.teams') },
                      { icon: '🛡️', label: t('tagTeams.stables') },
                      { icon: '🪑', label: 'Objects' },
                    ].map(cat => (
                      <span key={cat.label} className="text-[11px] px-2.5 py-1 rounded-lg bg-bg-secondary/40 border border-border-subtle/20 text-text-secondary">
                        {cat.icon} {cat.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-text-secondary/40 mt-3">
                    <kbd className="px-1.5 py-0.5 border border-border-subtle/30 rounded text-[9px] bg-bg-secondary/30 font-mono">↑↓</kbd> navigate
                    <span className="mx-2">·</span>
                    <kbd className="px-1.5 py-0.5 border border-border-subtle/30 rounded text-[9px] bg-bg-secondary/30 font-mono">↵</kbd> select
                    <span className="mx-2">·</span>
                    <kbd className="px-1.5 py-0.5 border border-border-subtle/30 rounded text-[9px] bg-bg-secondary/30 font-mono">esc</kbd> close
                  </p>
                </div>
              </div>
            )}

            {/* Has results */}
            {query.length >= 2 && !loading && categories.length > 0 && (
              <div className="py-2">
                {categories.map((cat) => (
                  <div key={cat.key}>
                    {/* Category header */}
                    <div className="px-5 py-2 flex items-center gap-2">
                      <span className="text-sm">{cat.icon}</span>
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">{cat.label}</span>
                      <span className="text-[9px] text-text-secondary/40 font-mono">({cat.items.length})</span>
                    </div>
                    {/* Results */}
                    {cat.items.map((item) => {
                      const idx = flatIdx++
                      const isActive = idx === activeIndex
                      return (
                        <button
                          key={item.href}
                          data-idx={idx}
                          onClick={() => goTo(item)}
                          className={`w-full text-left flex items-center gap-3 px-5 py-2.5 transition-all ${
                            isActive
                              ? 'bg-neon-blue/10 border-l-2 border-neon-blue'
                              : 'hover:bg-bg-secondary/40 border-l-2 border-transparent'
                          }`}
                        >
                          {/* Image or fallback */}
                          {item.image ? (
                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-bg-tertiary/30 shrink-0 border border-border-subtle/20">
                              <Image src={item.image} alt="" width={36} height={36} className="w-full h-full object-cover" unoptimized />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-bg-tertiary/20 border border-border-subtle/15 flex items-center justify-center shrink-0">
                              <span className="text-sm opacity-40">{cat.icon}</span>
                            </div>
                          )}
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isActive ? 'text-neon-blue' : 'text-text-white'}`}>
                              <HighlightMatch text={item.name} query={query} />
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-text-secondary/60 truncate mt-0.5">{item.subtitle}</p>
                            )}
                          </div>
                          {/* Arrow */}
                          <svg className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-neon-blue' : 'text-text-secondary/20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )
                    })}
                  </div>
                ))}
                {/* Footer */}
                <div className="px-5 py-3 border-t border-border-subtle/15">
                  <p className="text-[10px] text-text-secondary/40 text-center">
                    {totalResults} result{totalResults !== 1 ? 's' : ''} across {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
                  </p>
                </div>
              </div>
            )}

            {/* No results */}
            {query.length >= 2 && !loading && categories.length === 0 && (
              <div className="p-8 text-center">
                <span className="text-4xl block mb-3 opacity-30">🔍</span>
                <p className="text-sm text-text-secondary">No results for "<span className="text-text-white font-medium">{query}</span>"</p>
                <p className="text-[11px] text-text-secondary/50 mt-1">{t('search.tryDifferent')}</p>
              </div>
            )}

            {/* Loading skeleton */}
            {query.length >= 2 && loading && (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2">
                    <div className="w-9 h-9 rounded-lg bg-bg-secondary/40 animate-pulse shrink-0" />
                    <div className="flex-1">
                      <div className="h-3.5 w-32 bg-bg-secondary/40 rounded animate-pulse" />
                      <div className="h-2.5 w-20 bg-bg-secondary/30 rounded animate-pulse mt-1.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ctrl+K hint below */}
        <div className="mt-3 text-center">
          <span className="text-[10px] text-text-secondary/30">
            Tip: Press <kbd className="px-1.5 py-0.5 border border-border-subtle/20 rounded text-[9px] bg-bg-secondary/20 font-mono mx-0.5">Ctrl</kbd>+<kbd className="px-1.5 py-0.5 border border-border-subtle/20 rounded text-[9px] bg-bg-secondary/20 font-mono mx-0.5">K</kbd> to open search from anywhere
          </span>
        </div>
      </div>
    </div>
  )
}
