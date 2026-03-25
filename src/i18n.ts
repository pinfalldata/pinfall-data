import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'
import { defaultLocale, locales, LOCALE_COOKIE, type Locale } from '@/lib/locales'

export default getRequestConfig(async () => {
  // Read the locale from the cookie set by middleware
  const cookieStore = cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value

  const locale: Locale =
    cookieLocale && locales.includes(cookieLocale as Locale)
      ? (cookieLocale as Locale)
      : defaultLocale

  // Load the translation JSON file for this locale
  let messages: Record<string, any>
  try {
    messages = (await import(`../messages/${locale}/common.json`)).default
  } catch {
    // Fallback to English if the locale file doesn't exist
    messages = (await import(`../messages/en/common.json`)).default
  }

  return {
    locale,
    messages,
  }
})
