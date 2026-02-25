'use client'

import { useState, useEffect } from 'react'

interface SocialLink {
  id: number
  platform: string
  display_name: string
  embed_url: string
}

const ICONS: Record<string, { svg: JSX.Element; color: string; bg: string }> = {
  'YouTube': {
    color: '#FF0000',
    bg: 'rgba(255,0,0,0.08)',
    svg: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
        <polygon fill="#0a0c14" points="9.545,15.568 15.818,12 9.545,8.432"/>
      </svg>
    ),
  },
  'X (Twitter)': {
    color: '#FFFFFF',
    bg: 'rgba(255,255,255,0.06)',
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  'Instagram': {
    color: '#E4405F',
    bg: 'rgba(228,64,95,0.08)',
    svg: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
}

export function SocialWidgets({ mode = 'full' }: { mode?: 'full' | 'compact' }) {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/social-links')
      .then(r => r.json())
      .then(data => { setLinks(data.links || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-bg-secondary/20 animate-pulse" />
        ))}
      </div>
    )
  }

  if (links.length === 0) return null

  // ===== COMPACT (mobile) — horizontal row =====
  if (mode === 'compact') {
    return (
      <div className="flex gap-3 justify-center">
        {links.map(link => {
          const meta = ICONS[link.platform]
          return (
            <a
              key={link.id}
              href={link.embed_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border-subtle/20 bg-bg-secondary/20 hover:bg-bg-secondary/40 hover:border-neon-blue/20 transition-all"
            >
              <span style={{ color: meta?.color || '#888' }}>{meta?.svg}</span>
              <span className="text-xs font-medium text-text-white">{link.platform}</span>
            </a>
          )
        })}
      </div>
    )
  }

  // ===== FULL (desktop sidebar) — vertical cards =====
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-display text-xs font-bold text-text-secondary uppercase tracking-wider px-1 mb-1">
        WWE Official
      </h3>
      {links.map(link => {
        const meta = ICONS[link.platform]
        return (
          <a
            key={link.id}
            href={link.embed_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-3.5 rounded-xl border border-border-subtle/20 bg-bg-secondary/15 hover:bg-bg-secondary/35 hover:border-neon-blue/20 transition-all duration-200"
          >
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
              style={{ background: meta?.bg || 'rgba(128,128,128,0.1)', color: meta?.color || '#888' }}
            >
              {meta?.svg || <span className="text-lg">🔗</span>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-white group-hover:text-neon-blue transition-colors">
                {link.platform}
              </div>
              <p className="text-[10px] text-text-secondary leading-snug mt-0.5 truncate">
                {link.display_name}
              </p>
            </div>
            <svg className="w-4 h-4 text-text-secondary/20 group-hover:text-neon-blue/40 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )
      })}
    </div>
  )
}
