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

      {/* ===== MATCH OF THE DAY + SOCIAL WIDGETS ===== */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <MatchOfDay />
          <div className="hidden lg:block">
            <SocialWidgets />
          </div>
        </div>
      </section>

      {/* ===== NEON SEPARATOR ===== */}
      <div className="neon-line max-w-5xl mx-auto" />

      {/* ===== SUPERSTAR GRID ===== */}
      <SuperstarGrid />

      {/* ===== NEON SEPARATOR ===== */}
      <div className="neon-line-pink max-w-5xl mx-auto" />

      {/* ===== SHOW CALENDAR ===== */}
      <ShowCalendar />

      {/* ===== SOCIAL WIDGETS (mobile only) ===== */}
      <section className="lg:hidden max-w-[1440px] mx-auto px-4 sm:px-6 py-6">
        <SocialWidgets />
      </section>
    </div>
  )
}
