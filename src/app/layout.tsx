import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { Oswald, Source_Sans_3, JetBrains_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

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

export const metadata: Metadata = {
  title: {
    default: 'Pinfall Data — The Ultimate WWE Statistics Database',
    template: '%s | Pinfall Data',
  },
  description:
    'The most comprehensive WWE database ever built. Explore 70+ years of superstars, matches, championships, rivalries, and history. Every stat. Every match. Every moment.',
  keywords: [
    'WWE stats',
    'WWE statistics',
    'WWE database',
    'WWE match history',
    'WWE superstars',
    'WWE championships',
    'wrestling stats',
    'WWE records',
    'WWE results',
    'Pinfall Data',
  ],
  openGraph: {
    title: 'Pinfall Data — The Ultimate WWE Statistics Database',
    description:
      'Explore 70+ years of WWE history. Every superstar. Every match. Every moment.',
    siteName: 'Pinfall Data',
    type: 'website',
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
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      className={`${oswald.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}
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
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
