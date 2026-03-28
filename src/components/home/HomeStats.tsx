'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'


interface Stat {
  value: number
  label: string
  suffix?: string
  icon: string
  href: string
}

export function HomeStats() {
  const t = useTranslations()

  const [stats, setStats] = useState<Stat[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/homepage-stats')
      .then(r => r.json())
      .then(data => {
        setStats([
          { value: data.superstars || 0, label: t('home.stats.superstars'), suffix: '+', icon: '🌟', href: '/superstars' },
          { value: data.matches || 0, label: t('home.stats.matches'), suffix: '+', icon: '🥊', href: '/matches/search' },
          { value: data.shows || 0, label: t('home.stats.shows'), suffix: '+', icon: '🏟️', href: '/matches' },
          { value: data.yearsOfHistory || 70, label: t('home.stats.yearsOfHistory'), suffix: '+', icon: '📜', href: '/history' },
          { value: data.hallOfFamers || 0, label: t('home.stats.hallOfFamers'), suffix: '+', icon: '🏛️', href: '/hall-of-fame' },
          { value: data.titleChanges || 0, label: t('home.stats.titleChanges'), suffix: '+', icon: '🏆', href: '/champions' },
          { value: data.omgMoments || 0, label: t('omg.title'), suffix: '+', icon: '💥', href: '/omg-moments' },
          { value: data.arenas || 0, label: t('home.stats.arenasWorldwide'), suffix: '+', icon: '🗺️', href: '/matches/arenas' },
          { value: data.matchTypes || 0, label: t('home.stats.matchTypes'), suffix: '+', icon: '⚔️', href: '/matches/stipulations' },
        ])
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  if (!loaded) {
    return (
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-bg-secondary/30 animate-pulse" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-3 lg:grid-cols-9 gap-2 sm:gap-3">
        {stats.map((stat, i) => (
          <AnimatedStat key={stat.label} stat={stat} delay={i * 80} />
        ))}
      </div>
    </section>
  )
}

function AnimatedStat({ stat, delay }: { stat: Stat; delay: number }) {
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(() => {
      const duration = 1500
      const steps = 40
      const increment = stat.value / steps
      let step = 0
      const interval = setInterval(() => {
        step++
        if (step >= steps) {
          setCurrent(stat.value)
          clearInterval(interval)
        } else {
          setCurrent(Math.floor(increment * step))
        }
      }, duration / steps)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [visible, stat.value, delay])

  const formatted = current >= 1000
    ? current >= 100000
      ? `${Math.floor(current / 1000)}k`
      : current.toLocaleString('en-US')
    : String(current)

  return (
    <Link href={stat.href} ref={ref}
      className="group relative flex flex-col items-center justify-center py-4 sm:py-5 px-2 rounded-xl border border-border-subtle/20 bg-bg-secondary/20 hover:bg-bg-secondary/40 hover:border-neon-blue/20 transition-all duration-300 cursor-pointer"
    >
      <span className="text-lg sm:text-xl mb-1 group-hover:scale-110 transition-transform duration-300">{stat.icon}</span>
      <span className="font-stats text-xl sm:text-3xl font-bold text-neon-blue tabular-nums tracking-wide">
        {formatted}{stat.suffix}
      </span>
      <span className="font-stats text-[10px] sm:text-xs text-text-secondary uppercase tracking-[0.15em] mt-0.5 text-center leading-tight group-hover:text-neon-blue/70 transition-colors">
        {stat.label}
      </span>
    </Link>
  )
}
