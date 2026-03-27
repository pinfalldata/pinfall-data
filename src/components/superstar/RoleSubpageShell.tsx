'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


interface RoleSubpageShellProps {
  title: string
  roleKey: string
  description: string
  imageUrl: string
  accentColor?: string
}

export default function RoleSubpageShell({ title, roleKey, description, imageUrl, accentColor = '#c7a05a' }: RoleSubpageShellProps) {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ===== HERO ===== */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-primary via-bg-secondary/40 to-bg-primary" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[100px]" style={{ background: `${accentColor}08` }} />

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 pt-10 pb-8 sm:pt-14 sm:pb-10 lg:pt-16 lg:pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-text-secondary mb-6">
            <Link href="/superstars" className="hover:text-neon-blue transition-colors">{t('home.stats.superstars')}</Link>
            <span className="text-border-subtle">/</span>
            <span style={{ color: accentColor }}>{title}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8">
            {/* Role icon */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden border-2 shrink-0 bg-bg-tertiary" style={{ borderColor: `${accentColor}40` }}>
              <Image src={imageUrl} alt={title} fill className="object-cover object-top" sizes="112px" unoptimized />
            </div>

            <div className="text-center sm:text-left">
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white tracking-tight">
                <span style={{ color: accentColor }}>WWE</span> {title}
              </h1>
              <p className="text-text-secondary text-sm sm:text-base max-w-xl mt-2 leading-relaxed">
                {description}
              </p>
            </div>
          </div>

          <div className="neon-line mt-8 max-w-md mx-auto sm:mx-0" />
        </div>
      </section>

      {/* ===== PLACEHOLDER CONTENT ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="rounded-2xl border border-border-subtle/30 bg-bg-secondary/20 backdrop-blur-sm p-8 sm:p-12 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center border border-border-subtle/30 bg-bg-tertiary/50">
            <svg className="w-8 h-8 text-text-secondary/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-text-white mb-3">
            Content Coming Soon
          </h2>
          <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto mb-6">
            The full {title.toLowerCase()} directory is under construction. Complete profiles, stats, and search
            functionality will be available soon.
          </p>
          <Link
            href="/superstars"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all hover:scale-[1.02]"
            style={{ borderColor: `${accentColor}40`, color: accentColor, background: `${accentColor}10` }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Superstars
          </Link>
        </div>
      </section>

      {/* ===== SEO FOOTER ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <div className="rounded-2xl border border-border-subtle/20 bg-bg-secondary/10 p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold text-text-white mb-3">
            About WWE <span style={{ color: accentColor }}>{title}</span>
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed">
            {description} Browse every {title.toLowerCase().replace(/s$/, '')} in WWE history on Pinfall Data.
            Full profiles with career statistics, match history, championship reigns, and more.
          </p>
        </div>
      </section>
    </div>
  )
}
