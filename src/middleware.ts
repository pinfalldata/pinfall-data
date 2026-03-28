import { NextRequest, NextResponse } from 'next/server'
import { locales, defaultLocale, countryToLocale, LOCALE_COOKIE, type Locale } from '@/lib/locales'

// ============================================================
// ✅ FIX — RATE LIMITING (100 req/min par IP sur les routes API)
// Note : en serverless, ce compteur est par instance Edge.
// C'est une première protection solide. Pour un rate limiting
// distribué (multi-instances), utilise Vercel WAF (plan Pro)
// ou Upstash Redis.
// ============================================================
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = 100      // requêtes max
const WINDOW_MS  = 60_000  // par minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

// Nettoyage toutes les 5 min pour éviter les fuites mémoire
let lastCleanup = Date.now()
function cleanupIfNeeded() {
  const now = Date.now()
  if (now - lastCleanup < 5 * 60_000) return
  lastCleanup = now
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) rateLimitMap.delete(ip)
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ✅ FIX — Applique le rate limiting sur toutes les routes API
  if (pathname.startsWith('/api/')) {
    cleanupIfNeeded()

    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Réessaie dans une minute.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT),
            'X-RateLimit-Window': '60s',
          },
        }
      )
    }

    return NextResponse.next()
  }

  // Skip Next.js internals et fichiers statiques (inchangé)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // 1. Locale cookie existant (choix explicite de l'utilisateur)
  const existingLocale = request.cookies.get(LOCALE_COOKIE)?.value
  if (existingLocale && locales.includes(existingLocale as Locale)) {
    return response
  }

  // 2. Détection via Vercel geo header (IP → pays)
  const country = request.headers.get('x-vercel-ip-country') || ''
  const geoLocale = countryToLocale[country.toUpperCase()]
  if (geoLocale) {
    response.cookies.set(LOCALE_COOKIE, geoLocale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
      sameSite: 'lax',
    })
    return response
  }

  // 3. Détection via Accept-Language header
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

  // 4. Fallback : langue par défaut
  response.cookies.set(LOCALE_COOKIE, defaultLocale, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    sameSite: 'lax',
  })

  return response
}

function parseAcceptLanguage(header: string): Locale | null {
  if (!header) return null

  const parts = header.split(',').map((part) => {
    const [lang, qPart] = part.trim().split(';')
    const q = qPart ? parseFloat(qPart.replace('q=', '')) : 1
    return { lang: lang.trim().toLowerCase(), q }
  })

  parts.sort((a, b) => b.q - a.q)

  for (const { lang } of parts) {
    if (locales.includes(lang as Locale)) return lang as Locale
    const prefix = lang.split('-')[0]
    if (locales.includes(prefix as Locale)) return prefix as Locale
  }

  return null
}

export const config = {
  matcher: [
    // ✅ FIX — Le matcher inclut maintenant /api/* pour le rate limiting
    // On exclut seulement les fichiers statiques Next.js (_next/static, _next/image)
    '/((?!_next/static|_next/image|favicon).*)',
  ],
}
