'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { locales, localeNames, type Locale } from '@/lib/locales'

/**
 * Flag images via Twemoji CDN — renders identically on all OS/browsers.
 * Maps each locale to its country code for the flag emoji SVG.
 */
const FLAG_CODES: Record<Locale, string> = {
  en: '1f1ec-1f1e7', // 🇬🇧
  fr: '1f1eb-1f1f7', // 🇫🇷
  es: '1f1ea-1f1f8', // 🇪🇸
  de: '1f1e9-1f1ea', // 🇩🇪
  pt: '1f1e7-1f1f7', // 🇧🇷
  hi: '1f1ee-1f1f3', // 🇮🇳
  ar: '1f1f8-1f1e6', // 🇸🇦
  ja: '1f1ef-1f1f5', // 🇯🇵
  it: '1f1ee-1f1f9', // 🇮🇹
  pl: '1f1f5-1f1f1', // 🇵🇱
  tr: '1f1f9-1f1f7', // 🇹🇷
}

function FlagImg({ locale, size = 20 }: { locale: Locale; size?: number }) {
  const code = FLAG_CODES[locale]
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code}.svg`}
      alt={localeNames[locale]}
      width={size}
      height={size}
      className="inline-block shrink-0"
      style={{ width: size, height: size }}
      loading="lazy"
    />
  )
}

export function LanguageSwitcher() {
  const currentLocale = useLocale() as Locale
  const [isOpen, setIsOpen] = useState(false)
  const [switching, setSwitching] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKey)
      return () => window.removeEventListener('keydown', handleKey)
    }
  }, [isOpen])

  const changeLocale = async (locale: Locale) => {
    if (locale === currentLocale) {
      setIsOpen(false)
      return
    }

    setSwitching(true)
    try {
      await fetch('/api/set-locale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale }),
      })
      window.location.reload()
    } catch {
      setSwitching(false)
    }
  }

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={switching}
        className={`p-2 transition-all duration-200 flex items-center gap-1.5 rounded-lg ${
          isOpen
            ? 'text-neon-blue bg-neon-blue/5'
            : 'text-text-secondary hover:text-neon-blue'
        } ${switching ? 'opacity-50 pointer-events-none' : ''}`}
        aria-label="Change language"
        aria-expanded={isOpen}
        title={localeNames[currentLocale]}
      >
        {switching ? (
          <div className="w-5 h-5 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
        ) : (
          <>
            <FlagImg locale={currentLocale} size={20} />
            <span className="hidden sm:block text-[11px] font-mono uppercase tracking-wide">
              {currentLocale}
            </span>
          </>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-neon-blue/15 bg-bg-primary/95 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden animate-fade-in z-50">
          {/* Gold line at top */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent" />

          {/* Header */}
          <div className="px-4 py-2.5 border-b border-border-subtle/20">
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">
              Language
            </p>
          </div>

          {/* Language list */}
          <div className="py-1.5 max-h-[360px] overflow-y-auto overscroll-contain scrollbar-hide">
            {locales.map((locale) => {
              const isActive = locale === currentLocale
              return (
                <button
                  key={locale}
                  onClick={() => changeLocale(locale)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 ${
                    isActive
                      ? 'text-neon-blue bg-neon-blue/5'
                      : 'text-text-secondary hover:text-neon-blue hover:bg-neon-blue/5'
                  }`}
                >
                  <FlagImg locale={locale} size={18} />
                  <span className="flex-1 text-left font-medium">{localeNames[locale]}</span>
                  {isActive && (
                    <svg
                      className="w-4 h-4 text-neon-blue shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
