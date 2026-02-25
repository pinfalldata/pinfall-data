import { HeroRing } from '@/components/home/HeroRing'
import { HomeStats } from '@/components/home/HomeStats'
import { EraTimeline } from '@/components/home/EraTimeline'
import { MatchOfDay } from '@/components/home/MatchOfDay'
import { SuperstarGrid } from '@/components/home/SuperstarGrid'
import { ShowCalendar } from '@/components/home/ShowCalendar'
import { SocialWidgets } from '@/components/home/SocialWidgets'

export default function HomePage() {
  return (
    <div className="relative">
      {/* ===== HERO — Animated Ring ===== */}
      <HeroRing />

      {/* ===== NEON SEPARATOR ===== */}
      <div className="neon-line max-w-5xl mx-auto" />

      {/* ===== STATS — Real Supabase data ===== */}
      <HomeStats />

      {/* ===== NEON SEPARATOR ===== */}
      <div className="neon-line max-w-5xl mx-auto" />

      {/* ===== ERA TIMELINE ===== */}
      <EraTimeline />

      {/* ===== NEON SEPARATOR ===== */}
      <div className="neon-line-pink max-w-5xl mx-auto" />

      {/* ===== MATCH OF THE DAY — Full Width ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
        <MatchOfDay />
      </section>

      {/* ===== NEON SEPARATOR ===== */}
      <div className="neon-line max-w-5xl mx-auto" />

      {/* ===== SUPERSTAR GRID + SOCIAL WIDGETS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-text-white mb-6 text-center">
          <span className="text-neon-pink">Hall</span> of Legends
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          {/* Grid takes most of the width */}
          <SuperstarGrid />
          {/* Social widgets sidebar — desktop only */}
          <div className="hidden lg:flex lg:flex-col lg:justify-start">
            <SocialWidgets mode="full" />
          </div>
        </div>
        {/* Social widgets — mobile/tablet only */}
        <div className="lg:hidden mt-8">
          <SocialWidgets mode="compact" />
        </div>
      </section>

      {/* ===== NEON SEPARATOR ===== */}
      <div className="neon-line-pink max-w-5xl mx-auto" />

      {/* ===== SHOW CALENDAR ===== */}
      <ShowCalendar />
    </div>
  )
}
