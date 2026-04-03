'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'

type Panel = 'report' | 'support' | null

export function FloatingButtons() {
  const t = useTranslations('floating')
  const [open, setOpen] = useState<Panel>(null)
  const [reportSubject, setReportSubject] = useState('')
  const [reportMessage, setReportMessage] = useState('')
  const [sent, setSent] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(null)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleSendReport = () => {
    const subject = encodeURIComponent(reportSubject || 'Bug Report — Pinfall Data')
    const body = encodeURIComponent(
      `${reportMessage}\n\n---\nPage: ${window.location.href}\nUser Agent: ${navigator.userAgent}`
    )
    window.location.href = `mailto:pinfalldata@gmail.com?subject=${subject}&body=${body}`
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setReportSubject('')
      setReportMessage('')
      setOpen(null)
    }, 2000)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2" ref={panelRef}>
      {/* ═══ PANELS ═══ */}
      {open === 'report' && (
        <div className="mb-2 w-[300px] sm:w-[340px] rounded-2xl border border-neon-blue/20 bg-bg-primary/95 backdrop-blur-xl shadow-2xl shadow-black/40 animate-fade-in overflow-hidden">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent" />
          <div className="p-5">
            <h3 className="font-display text-base font-bold text-neon-blue mb-1 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {t('reportTitle')}
            </h3>
            <p className="text-text-secondary text-xs mb-4">{t('reportDesc')}</p>

            {sent ? (
              <div className="text-center py-6">
                <span className="text-2xl">✅</span>
                <p className="text-sm text-status-success mt-2 font-medium">{t('reportSent')}</p>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder={t('reportSubject')}
                  value={reportSubject}
                  onChange={e => setReportSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary/50 border border-border-subtle/30 text-text-primary text-sm placeholder:text-text-secondary/40 focus:border-neon-blue/40 focus:outline-none transition-colors mb-2"
                />
                <textarea
                  placeholder={t('reportPlaceholder')}
                  value={reportMessage}
                  onChange={e => setReportMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-bg-secondary/50 border border-border-subtle/30 text-text-primary text-sm placeholder:text-text-secondary/40 focus:border-neon-blue/40 focus:outline-none transition-colors resize-none mb-3"
                />
                <button
                  onClick={handleSendReport}
                  disabled={!reportMessage.trim()}
                  className="w-full py-2.5 rounded-xl bg-neon-blue/15 border border-neon-blue/25 text-neon-blue text-sm font-bold hover:bg-neon-blue/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  {t('reportSend')}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {open === 'support' && (
        <div className="mb-2 w-[300px] sm:w-[340px] rounded-2xl border border-neon-pink/20 bg-bg-primary/95 backdrop-blur-xl shadow-2xl shadow-black/40 animate-fade-in overflow-hidden">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-neon-pink to-transparent" />
          <div className="p-5">
            <h3 className="font-display text-base font-bold text-neon-pink mb-1 flex items-center gap-2">
              <span className="text-lg">❤️</span>
              {t('supportTitle')}
            </h3>
            <p className="text-text-secondary text-[13px] leading-relaxed mb-4">
              {t('supportMessage')}
            </p>

            <a
              href="https://ko-fi.com/pinfalldata"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FF5E5B]/10 border border-[#FF5E5B]/25 text-[#FF5E5B] text-sm font-bold hover:bg-[#FF5E5B]/20 transition-all mb-2"
            >
              <span className="text-lg">☕</span>
              {t('supportKofi')}
            </a>

            <p className="text-text-secondary/50 text-[10px] text-center mt-2">
              {t('supportThanks')}
            </p>
          </div>
        </div>
      )}

      {/* ═══ BUTTONS ═══ */}
      <div className="flex flex-col gap-2">
        {/* Report Bug */}
        <button
          onClick={() => setOpen(open === 'report' ? null : 'report')}
          className={`group w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 shadow-lg ${
            open === 'report'
              ? 'bg-neon-blue/20 border-neon-blue/40 text-neon-blue'
              : 'bg-bg-primary/90 border-border-subtle/30 text-text-secondary hover:text-neon-blue hover:border-neon-blue/30 hover:bg-neon-blue/10'
          } backdrop-blur-sm`}
          aria-label={t('reportTitle')}
          title={t('reportTitle')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>

        {/* Donate */}
        <button
          onClick={() => setOpen(open === 'support' ? null : 'support')}
          className={`group w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 shadow-lg ${
            open === 'support'
              ? 'bg-neon-pink/20 border-neon-pink/40 text-neon-pink'
              : 'bg-bg-primary/90 border-border-subtle/30 text-text-secondary hover:text-neon-pink hover:border-neon-pink/30 hover:bg-neon-pink/10'
          } backdrop-blur-sm`}
          aria-label={t('supportTitle')}
          title={t('supportTitle')}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
