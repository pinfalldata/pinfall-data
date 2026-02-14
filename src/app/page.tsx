import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { StatCounter } from '@/components/ui/StatCounter'
import { QuickAccessCard } from '@/components/ui/QuickAccessCard'

const QUICK_ACCESS = [
  { title: 'Superstars', description: 'Browse all WWE superstars', href: '/superstars', icon: '🌟', color: 'blue' as const },
  { title: 'Matches & Shows', description: 'Explore 100,000+ matches', href: '/matches', icon: '🏟️', color: 'pink' as const },
  { title: 'Champions', description: 'Every title, every reign', href: '/champions', icon: '🏆', color: 'blue' as const },
  { title: 'Rivalries', description: 'The greatest feuds in history', href: '/rivalries', icon: '⚔️', color: 'pink' as const },
  { title: 'Records', description: 'Who holds the records?', href: '/records', icon: '📊', color: 'blue' as const },
  { title: 'WWE History', description: '70+ years of moments', href: '/history', icon: '📜', color: 'pink' as const },
]

const STATS = [
  { value: 5000, label: 'Superstars', suffix: '+' },
  { value: 100000, label: 'Matches', suffix: '+' },
  { value: 5000, label: 'Shows', suffix: '+' },
  { value: 70, label: 'Years of History', suffix: '+' },
  { value: 50, label: 'Championships', suffix: '+' },
  { value: 100, label: 'Match Types', suffix: '+' },
]

export default function HomePage() {
  const t = useTranslations('home')

  return (
    <div className="relative">
      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-pink/5 rounded-full blur-[120px]" />

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-16 pb-12 lg:pt-24 lg:pb-20">
          {/* Main title */}
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-text-white tracking-tight mb-6">
              {t('hero.title').split(' ').map((word, i) => (
                <span key={i}>
                  {word === 'WWE' ? (
                    <span className="text-neon-blue text-glow-blue">{word}</span>
                  ) : word === 'Ultimate' ? (
                    <span className="text-neon-pink text-glow-pink">{word}</span>
                  ) : (
                    word
                  )}{' '}
                </span>
              ))}
            </h1>
            <p className="text-text-secondary text-lg sm:text-xl lg:text-2xl font-body max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* ===== STATS COUNTERS ===== */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6 mb-20">
            {STATS.map((stat, i) => (
              <StatCounter
                key={stat.label}
                value={stat.value}
                label={stat.label}
                suffix={stat.suffix}
                delay={i * 100}
              />
            ))}
          </div>

          {/* ===== NEON SEPARATOR ===== */}
          <div className="neon-line mb-16" />

          {/* ===== QUICK ACCESS ===== */}
          <div className="mb-20">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-text-white mb-8 text-center">
              {t('sections.quickAccess')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {QUICK_ACCESS.map((item, i) => (
                <QuickAccessCard key={item.href} {...item} index={i} />
              ))}
            </div>
          </div>

          {/* ===== MATCH OF THE DAY PLACEHOLDER ===== */}
          <div className="neon-line mb-16" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
            {/* Match of the Day */}
            <div className="glass rounded-2xl p-8 border border-border-subtle">
              <h2 className="font-display text-xl font-bold text-neon-blue mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-blue rounded-full animate-glow-pulse" />
                {t('sections.matchOfTheDay')}
              </h2>
              <div className="skeleton h-40 rounded-lg" />
              <p className="text-text-secondary text-sm mt-4 text-center">
                Data will appear once matches are imported
              </p>
            </div>

            {/* Rivalry of the Day */}
            <div className="glass rounded-2xl p-8 border border-border-subtle">
              <h2 className="font-display text-xl font-bold text-neon-pink mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-neon-pink rounded-full animate-glow-pulse" />
                {t('sections.rivalryOfTheDay')}
              </h2>
              <div className="skeleton h-40 rounded-lg" />
              <p className="text-text-secondary text-sm mt-4 text-center">
                Data will appear once rivalries are imported
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
