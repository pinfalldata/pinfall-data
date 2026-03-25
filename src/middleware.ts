import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale, countryToLocale, LOCALE_COOKIE, type Locale } from '@/lib/locales'

/**
 * Middleware that detects the user's preferred locale and stores it in a cookie.
 *
 * Priority order:
 * 1. Existing NEXT_LOCALE cookie (user chose explicitly)
 * 2. Vercel x-vercel-ip-country header (auto-detect from IP)
 * 3. Accept-Language header
 * 4. Default (English)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip API routes, static files, Next.js internals
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // 1. Check if user already has a locale cookie
  const existingLocale = request.cookies.get(LOCALE_COOKIE)?.value
  if (existingLocale && locales.includes(existingLocale as Locale)) {
    return response
  }

  // 2. Try Vercel geo header (auto-detect from IP)
  const country = request.headers.get('x-vercel-ip-country') || ''
  const geoLocale = countryToLocale[country.toUpperCase()]
  if (geoLocale) {
    response.cookies.set(LOCALE_COOKIE, geoLocale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: 'lax',
    })
    return response
  }

  // 3. Parse Accept-Language header
  const acceptLang = request.headers.get('accept-language') || ''
  const detectedLocale = parseAcceptLanguage(acceptLang)
  if (detectedLocale) {
    response.cookies.set(LOCALE_COOKIE, detectedLocale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    })
    return response
  }

  // 4. Fallback: set default
  response.cookies.set(LOCALE_COOKIE, defaultLocale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    sameSite: 'lax',
  })

  return response
}

/**
 * Parse the Accept-Language header and find the best matching locale.
 * E.g. "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7" → "fr"
 */
function parseAcceptLanguage(header: string): Locale | null {
  if (!header) return null

  const parts = header.split(',').map((part) => {
    const [lang, qPart] = part.trim().split(';')
    const q = qPart ? parseFloat(qPart.replace('q=', '')) : 1
    return { lang: lang.trim().toLowerCase(), q }
  })

  // Sort by quality descending
  parts.sort((a, b) => b.q - a.q)

  for (const { lang } of parts) {
    // Exact match: "fr" → "fr"
    if (locales.includes(lang as Locale)) {
      return lang as Locale
    }
    // Prefix match: "fr-FR" → "fr"
    const prefix = lang.split('-')[0]
    if (locales.includes(prefix as Locale)) {
      return prefix as Locale
    }
  }

  return null
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/ routes
     * - _next/ (static files, etc.)
     * - Files with extensions (static assets)
     */
    '/((?!api|_next|.*\\..*).*)',
  ],
}
