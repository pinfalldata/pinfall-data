import { HeroRing } from '@/components/home/HeroRing'
import { HomeStats } from '@/components/home/HomeStats'
import { EraTimeline } from '@/components/home/EraTimeline'
import { OnThisDay } from '@/components/home/OnThisDay'
import { SuperstarGrid } from '@/components/home/SuperstarGrid'
import { ShowCalendar } from '@/components/home/ShowCalendar'
import { SocialWidgets } from '@/components/home/SocialWidgets'
import { HomepageDataProvider, WweLogosCarousel, BirthdayStandalone, HomeExtraSections, HomeAfterLegends } from '@/components/home/HomeExtraSections'

export default function HomePage() {
  return (
    <HomepageDataProvider>
      <div className="relative">
        {/* 1. Hero Ring */}
        <HeroRing />
        <div className="neon-line max-w-5xl mx-auto" />

        {/* 2. Stats */}
        <HomeStats />
        <div className="neon-line max-w-5xl mx-auto" />

        {/* 3. Wrestling Through the Ages */}
        <EraTimeline />
        <div className="neon-line-pink max-w-5xl mx-auto" />

        {/* 4. On This Day + Born Today */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_280px] gap-4 items-start">
            <OnThisDay />
            <BirthdayStandalone />
          </div>
        </section>
        <div className="neon-line max-w-5xl mx-auto" />

        {/* 5. Matches + Segments | 6. Belt Carousel | 7. Spotlight Cards */}
        <HomeExtraSections />
        <div className="neon-line-pink max-w-5xl mx-auto" />

        {/* 8. Calendrier */}
        <ShowCalendar />
        <div className="neon-line max-w-5xl mx-auto" />

        {/* 9. WWE Logos */}
        <WweLogosCarousel />
        <div className="neon-line-pink max-w-5xl mx-auto" />

        {/* 10. Hall of Legends */}
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
        <div className="neon-line max-w-5xl mx-auto" />

        {/* 11. HOF + Slammy */}
        <HomeAfterLegends />
      </div>
    </HomepageDataProvider>
  )
}
