import { useTranslations } from 'next-intl'

export function Footer() {
  const t = useTranslations('footer')

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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border-subtle/50">
          <p className="text-text-secondary text-xs">
            © {new Date().getFullYear()} Pinfall Data. {t('madeWith')}
          </p>
          <a
            href="/legal"
            className="text-text-secondary text-xs hover:text-neon-blue transition-colors"
          >
            {t('legal')}
          </a>
        </div>
      </div>
    </footer>
  )
}
