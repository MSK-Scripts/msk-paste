// ─── Addresses on msk-scripts.de ────────────────────────────────────────
//
// MSK Paste presents itself as a web tool of msk-scripts.de: the header
// carries the shop's navigation. The shop has a language in every address
// (/en/..., /de/...) and German words for its German pages; this table holds
// the pages linked from here, copied from the shop's route table (msk-shop
// lib/routes.ts), so a click does not take a redirect first.

export const SHOP_ORIGIN = 'https://www.msk-scripts.de'

/** Internal path on the shop, with its German public form. */
const SHOP_ROUTES = {
  '/': '/',
  '/fivem': '/fivem',
  '/fivem/free': '/fivem/kostenlos',
  '/fivem/all-access': '/fivem/alle-scripts',
  '/stats': '/statistiken',
  '/discord': '/discord',
  '/discord/ticket-bot': '/discord/ticket-bot',
  '/discord/giveaway-bot': '/discord/giveaway-bot',
  '/tools': '/web-tools',
  '/tools/images': '/web-tools/bilder',
  '/about': '/ueber-msk',
} as const

export type ShopPath = keyof typeof SHOP_ROUTES

/** Absolute address of a shop page in the visitor's language. */
export function shopUrl(locale: string, path: ShopPath): string {
  const lang = locale === 'de' ? 'de' : 'en'
  const rest = lang === 'de' ? SHOP_ROUTES[path] : path
  return `${SHOP_ORIGIN}/${lang}${rest === '/' ? '' : rest}`
}
