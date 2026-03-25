import { NextRequest, NextResponse } from 'next/server'
import { locales, LOCALE_COOKIE, type Locale } from '@/lib/locales'

export async function POST(request: NextRequest) {
  try {
    const { locale } = await request.json()

    if (!locale || !locales.includes(locale as Locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true, locale })

    response.cookies.set(LOCALE_COOKIE, locale, {
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
      sameSite: 'lax',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 })
  }
}
