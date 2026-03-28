'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const CONSENT_KEY = 'pd_cookie_consent'

type ConsentValue = 'accepted' | 'declined' | null

export function CookieBanner() {
  const [consent, setConsent] = useState<ConsentValue>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentValue
    if (!stored) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
    setConsent(stored)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setConsent('accepted')
    setVisible(false)
    // If Google AdSense script is loaded, signal consent here
    // window.gtag?.('consent', 'update', { ad_storage: 'granted' })
  }

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setConsent('declined')
    setVisible(false)
  }

  if (!visible || consent !== null) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div className="max-w-4xl mx-auto rounded-xl border border-border-subtle/40 bg-bg-primary/95 backdrop-blur-md shadow-lg p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-text-white text-sm font-medium mb-1">
              🍪 We use cookies
            </p>
            <p className="text-text-secondary text-xs leading-relaxed">
              We use cookies for analytics and advertising (Google AdSense). By clicking{' '}
              <strong className="text-text-white">Accept</strong>, you consent to our use of advertising cookies.
              You can also{' '}
              <strong className="text-text-white">Decline</strong> to use the site with essential cookies only.{' '}
              <Link href="/privacy-policy" className="text-neon-blue hover:underline">
                Privacy Policy →
              </Link>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-xs rounded-lg border border-border-subtle/50 text-text-secondary hover:text-text-white hover:border-border-subtle transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-xs rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 hover:border-neon-blue/50 transition-colors font-medium"
            >
              Accept all
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
