import { cookies, headers } from 'next/headers'
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from './config'

/**
 * Resolves the current locale in this order:
 *   1. Cookie `NEXT_LOCALE`
 *   2. Accept-Language header (browser language)
 *   3. DEFAULT_LOCALE (fallback)
 */
export async function getCurrentLocale(): Promise<Locale> {
  // 1. Cookie
  const cookieStore  = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value
  if (isLocale(cookieLocale)) return cookieLocale

  // 2. Browser language
  const headerStore = await headers()
  const acceptLang  = headerStore.get('accept-language')
  if (acceptLang) {
    // Format: "de-DE,de;q=0.9,en;q=0.8" → extract first language code
    const primary = acceptLang
      .split(',')[0]
      ?.split(';')[0]
      ?.split('-')[0]
      ?.toLowerCase()

    if (isLocale(primary)) return primary
  }

  // 3. Default
  return DEFAULT_LOCALE
}
