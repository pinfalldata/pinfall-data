'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

// ✅ UPDATED — Added Privacy Policy, About, and Manage cookies links
export function Footer() {
  const t = useTranslations('footer')

  const handleManageCookies = () => {
    localStorage.removeItem('pd_cookie_consent')
    window.location.reload()
  }

  return (
    <footer className="border-t border-border-subtle bg-bg-primary/80">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        {/* Neon separator */}
        <div className="neon-line mb-8" />

        {/* Disclaimer */}
        <p className="text-text-secondary text-sm leading-relaxed max-w-3xl mx-auto text-center mb-6">
          {t('disclaimer')}
        </p>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-border-subtle/50">
          <p className="text-text-secondary text-xs">
            © {new Date().getFullYear()} Pinfall Data. {t('madeWith')}
          </p>

          {/* Legal links */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/about"
              className="text-text-secondary text-xs hover:text-neon-blue transition-colors"
            >
              About
            </Link>
            <span className="text-border-subtle text-xs">·</span>
            <Link
              href="/privacy-policy"
              className="text-text-secondary text-xs hover:text-neon-blue transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-border-subtle text-xs">·</span>
            <Link
              href="/legal"
              className="text-text-secondary text-xs hover:text-neon-blue transition-colors"
            >
              {t('legal')}
            </Link>
            <span className="text-border-subtle text-xs">·</span>
            <button
              onClick={handleManageCookies}
              className="text-text-secondary text-xs hover:text-neon-blue transition-colors cursor-pointer"
            >
              Manage cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
