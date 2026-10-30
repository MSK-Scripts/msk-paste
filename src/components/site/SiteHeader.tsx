import { getLocale, getTranslations } from 'next-intl/server'

import { DEFAULT_LOCALE, isLocale } from '@/i18n/config'

import { HeaderBar } from './HeaderBar'
import { aboutLink, productLines, sectionLinks, type SiteCopy } from './navigation'

const COPY_KEYS = [
  'mainNav', 'submenu', 'newTab', 'menu', 'language', 'fivem', 'fivemPaid', 'fivemPaidDesc',
  'fivemFree', 'fivemFreeDesc', 'fivemAllAccess', 'fivemAllAccessDesc', 'fivemStats',
  'fivemStatsDesc', 'discord', 'ticketDesc', 'giveawayDesc', 'tools', 'images', 'imagesDesc',
  'formsDesc', 'pasteDesc', 'shortenerDesc', 'about', 'stats',
] as const satisfies readonly (keyof SiteCopy)[]

/**
 * The header of every page, built like the shop's so MSK Shortener reads as
 * a web tool of msk-scripts.de. Reads the copy on the server and hands it to
 * the client bar, which owns the open panels.
 */
export async function SiteHeader() {
  const [t, rawLocale] = await Promise.all([getTranslations('site'), getLocale()])
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE
  // `submenu` keeps its {name} placeholder; the bar fills it per line.
  const copy = Object.fromEntries(
    COPY_KEYS.map((key) => [key, key === 'submenu' ? t.raw(key) : t(key)]),
  ) as SiteCopy

  return (
    <HeaderBar
      locale={locale}
      copy={copy}
      section={sectionLinks(copy)}
      lines={productLines(copy, locale)}
      about={aboutLink(copy, locale)}
    />
  )
}
