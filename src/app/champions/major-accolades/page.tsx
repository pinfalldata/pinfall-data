import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Major Accolades — WWE Champions | Pinfall Data',
  description: 'Grand Slams, Triple Crowns, and milestone championship achievements in WWE history.',
}

export default function MajorAccoladesPage() {
  return (
    <div className="relative min-h-screen">
      <section className="relative w-full h-[220px] sm:h-[300px] lg:h-[380px] xl:h-[420px] overflow-hidden">
        <Image src="https://xusywypjmogzbizrwruv.supabase.co/storage/v1/object/public/Images/Page%20champions/IMG_20221213_102348-01.webp"
          alt="Major Accolades" fill priority sizes="100vw" quality={100} unoptimized className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/30 via-transparent to-bg-primary/30" />
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-60" />
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-8 lg:pb-10 px-4">
          <nav className="hidden sm:flex items-center gap-2 text-xs text-text-secondary mb-3">
            <Link href="/champions" className="hover:text-neon-blue transition-colors">Champions</Link>
            <span className="text-border-subtle">/</span>
            <span className="text-neon-blue">Major Accolades</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-text-white text-center tracking-tight mb-2">
            Major <span className="text-neon-blue">Accolades</span>
          </h1>
          <p className="text-text-secondary text-sm sm:text-base lg:text-lg text-center max-w-2xl">
            Grand Slams, Triple Crowns, and milestone championship achievements.
          </p>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="glass rounded-2xl p-12 border border-border-subtle text-center">
          <span className="text-5xl block mb-4">🌟</span>
          <p className="text-text-secondary text-lg mb-4">This page is under construction.</p>
          <p className="text-text-secondary text-sm">Grand Slam champions, Triple Crown winners, and more coming soon.</p>
          <Link href="/champions" className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-neon-blue/15 border border-neon-blue/30 text-neon-blue text-sm font-medium hover:bg-neon-blue/25 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Champions
          </Link>
        </div>
      </section>
    </div>
  )
}
