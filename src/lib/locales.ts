// ─── Locale configuration ───────────────────────────────────────
// Central source of truth for every supported language on Pinfall Data.

export const defaultLocale = 'en' as const

export const locales = [
  'en', 'fr', 'es', 'de', 'pt', 'hi', 'ar', 'ja', 'it', 'pl', 'tr',
] as const

export type Locale = (typeof locales)[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  hi: 'हिन्दी',
  ar: 'العربية',
  ja: '日本語',
  it: 'Italiano',
  pl: 'Polski',
  tr: 'Türkçe',
}

/** Native flag emoji per locale (used in the language switcher) */
export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  es: '🇪🇸',
  de: '🇩🇪',
  pt: '🇧🇷',
  hi: '🇮🇳',
  ar: '🇸🇦',
  ja: '🇯🇵',
  it: '🇮🇹',
  pl: '🇵🇱',
  tr: '🇹🇷',
}

/** RTL locales */
export const rtlLocales: Locale[] = ['ar']

export function isRTL(locale: string): boolean {
  return rtlLocales.includes(locale as Locale)
}

/**
 * Map country codes (from Vercel's x-vercel-ip-country header) to locales.
 * Only the most obvious mappings — if no match, fall back to Accept-Language.
 */
export const countryToLocale: Record<string, Locale> = {
  // French-speaking
  FR: 'fr', MC: 'fr', BE: 'fr', LU: 'fr', SN: 'fr', CI: 'fr', ML: 'fr',
  BF: 'fr', NE: 'fr', TG: 'fr', BJ: 'fr', GA: 'fr', CG: 'fr', CD: 'fr',
  CM: 'fr', TD: 'fr', CF: 'fr', GN: 'fr', DJ: 'fr', KM: 'fr', MG: 'fr',
  HT: 'fr', RE: 'fr', GP: 'fr', MQ: 'fr', GF: 'fr', PF: 'fr', NC: 'fr',
  // Spanish-speaking
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', PE: 'es', VE: 'es', CL: 'es',
  EC: 'es', GT: 'es', CU: 'es', BO: 'es', DO: 'es', HN: 'es', PY: 'es',
  SV: 'es', NI: 'es', CR: 'es', PA: 'es', UY: 'es', PR: 'es', GQ: 'es',
  // German-speaking
  DE: 'de', AT: 'de', CH: 'de', LI: 'de',
  // Portuguese-speaking
  BR: 'pt', PT: 'pt', AO: 'pt', MZ: 'pt', CV: 'pt', GW: 'pt', ST: 'pt', TL: 'pt',
  // Hindi-speaking
  IN: 'hi',
  // Arabic-speaking
  SA: 'ar', AE: 'ar', EG: 'ar', IQ: 'ar', MA: 'ar', DZ: 'ar', SD: 'ar',
  YE: 'ar', SY: 'ar', TN: 'ar', JO: 'ar', LY: 'ar', LB: 'ar', OM: 'ar',
  KW: 'ar', QA: 'ar', BH: 'ar', MR: 'ar', PS: 'ar',
  // Japanese
  JP: 'ja',
  // Italian
  IT: 'it', SM: 'it', VA: 'it',
  // Polish
  PL: 'pl',
  // Turkish
  TR: 'tr', CY: 'tr',
}

/** Cookie name for locale preference */
export const LOCALE_COOKIE = 'NEXT_LOCALE'
