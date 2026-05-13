import { NextRequest, NextResponse } from 'next/server'
import { isLocale, LOCALE_COOKIE } from '@/i18n/config'

/**
 * POST /api/locale
 * Body: { locale: 'de' | 'en' }
 * Sets the language cookie for one year.
 */
export async function POST(request: NextRequest) {
  try {
    const { locale } = await request.json()

    if (!isLocale(locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 })
    }

    const response = NextResponse.json({ ok: true, locale })
    response.cookies.set(LOCALE_COOKIE, locale, {
      maxAge:   60 * 60 * 24 * 365, // 1 year
      path:     '/',
      sameSite: 'lax',
      httpOnly: false,
      secure:   process.env.NODE_ENV === 'production',
    })

    return response
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
