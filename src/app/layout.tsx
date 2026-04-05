import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Oswald, Source_Sans_3, JetBrains_Mono, Bebas_Neue } from 'next/font/google'
import '@/styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { isRTL } from '@/lib/locales'
import { CookieBanner } from '@/components/CookieBanner'
import { FloatingButtons } from '@/components/layout/FloatingButtons'

const oswald = Oswald({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-stats',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://pinfalldata.com'),
  title: {
    default: 'Pinfall Data — The Ultimate WWE Statistics Database',
    template: '%s | Pinfall Data',
  },
  description:
    'The most comprehensive WWE database ever built. Explore 70+ years of superstars, matches, championships, rivalries, and history. Every stat. Every match. Every moment.',
  keywords: [
    'WWE stats', 'WWE statistics', 'WWE database', 'WWE match history',
    'WWE superstars', 'WWE championships', 'wrestling stats', 'WWE records',
    'WWE results', 'WWE match database', 'WWE show results',
    'WrestleMania results', 'WWE championship history', 'Pinfall Data',
  ],
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon.png', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/favicon.png',
    apple: [
      { url: '/favicon.png', sizes: '180x180' },
    ],
  },
  manifest: undefined,
  appleWebApp: {
    capable: true,
    title: 'Pinfall Data',
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    title: 'Pinfall Data — The Ultimate WWE Statistics Database',
    description:
      'Explore 70+ years of WWE history. Every superstar. Every match. Every moment.',
    siteName: 'Pinfall Data',
    type: 'website',
    url: 'https://pinfalldata.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pinfall Data — The Ultimate WWE Statistics Database',
    description:
      'Explore 70+ years of WWE history. Every superstar. Every match. Every moment.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {},
  alternates: {
    canonical: 'https://pinfalldata.com',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const dir = isRTL(locale) ? 'rtl' : 'ltr'

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${oswald.variable} ${sourceSans.variable} ${jetbrainsMono.variable} ${bebasNeue.variable}`}
    >
      <body className="min-h-screen bg-bg-primary text-text-primary font-body antialiased">
        <NextIntlClientProvider messages={messages}>
          {/* Background grid effect */}
          <div className="fixed inset-0 bg-grid pointer-events-none opacity-50 z-0" />

          {/* Subtle radial gradient from top */}
          <div className="fixed inset-0 bg-gradient-radial from-neon-blue/[0.03] via-transparent to-transparent pointer-events-none z-0" />

          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          
          <Analytics />
          <SpeedInsights />
          <CookieBanner />
          <FloatingButtons />
          
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
