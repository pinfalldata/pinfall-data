import { HeroRing } from '@/components/home/HeroRing'
import { HomeStats } from '@/components/home/HomeStats'
import { EraTimeline } from '@/components/home/EraTimeline'
import { OnThisDay } from '@/components/home/OnThisDay'
import { SuperstarGrid } from '@/components/home/SuperstarGrid'
import { ShowCalendar } from '@/components/home/ShowCalendar'
import { SocialWidgets } from '@/components/home/SocialWidgets'
import { WweLogosCarousel, HomeExtraSections } from '@/components/home/HomeExtraSections'

export default function HomePage() {
  return (
    <div className="relative">
      {/* ===== HERO — Animated Ring ===== */}
      <HeroRing />

      <div className="neon-line max-w-5xl mx-auto" />

      {/* ===== STATS ===== */}
      <HomeStats />

      <div className="neon-line max-w-5xl mx-auto" />

      {/* ===== ERA TIMELINE ===== */}
      <EraTimeline />

      <div className="neon-line-pink max-w-5xl mx-auto" />

      {/* ===== SHOW CALENDAR ===== */}
      <ShowCalendar />

      <div className="neon-line max-w-5xl mx-auto" />

      {/* ★ NEW: WWE LOGOS CAROUSEL */}
      <WweLogosCarousel />

      <div className="neon-line-pink max-w-5xl mx-auto" />

      {/* ===== ON THIS DAY + BIRTHDAY (side by side) ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
        <OnThisDay />
      </section>

      {/* ★ NEW: All extra homepage sections (birthdays, matches, segments, spotlights, belts, omg, hof...) */}
      <HomeExtraSections />

      <div className="neon-line max-w-5xl mx-auto" />

      {/* ===== SUPERSTAR GRID + SOCIAL WIDGETS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-text-white mb-5 text-center">
          <span className="text-neon-pink">Hall</span> of Legends
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
          <SuperstarGrid />
          <div className="hidden lg:flex lg:flex-col lg:justify-start">
            <SocialWidgets mode="full" />
          </div>
        </div>
        <div className="lg:hidden mt-6">
          <SocialWidgets mode="compact" />
        </div>
      </section>

      <div className="neon-line-pink max-w-5xl mx-auto" />

      {/* ===== HOF + SLAMMY rendered inside HomeExtraSections ===== */}
    </div>
  )
}
