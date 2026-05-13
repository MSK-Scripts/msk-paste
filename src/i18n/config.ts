/**
 * MSK Paste – i18n configuration.
 * Cookie-only setup, no URL prefix.
 */

export const LOCALES = ['de', 'en'] as const
export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'de'
export const LOCALE_COOKIE = 'NEXT_LOCALE'

export const LOCALE_LABELS: Record<Locale, string> = {
  de: 'Deutsch',
  en: 'English',
}

export const LOCALE_FLAGS: Record<Locale, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
}

export function isLocale(value: string | undefined | null): value is Locale {
  return value !== null && value !== undefined && (LOCALES as readonly string[]).includes(value)
}
