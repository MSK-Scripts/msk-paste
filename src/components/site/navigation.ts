import { shopUrl } from '@/lib/shopUrl'

/**
 * The navigation of the site header, after the shop's. MSK Paste sits in
 * the shop's "Web tools" line, which is therefore the current one; its own
 * pages come first. One table, so the desktop navigation and the menu
 * cannot drift apart.
 */

/** This tool: its name, its address and where it sits among the web tools. */
export const TOOL = {
  name:   'MSK Paste',
  origin: 'https://paste.msk-scripts.de',
} as const

export interface NavLink {
  href:         string
  label:        string
  description?: string
  /** Another site that opens in a new tab. */
  external?:    boolean
  /** The area the visitor is in. */
  current?:     boolean
}

export interface ProductLine {
  id:      'fivem' | 'discord' | 'tools'
  href:    string
  label:   string
  links:   NavLink[]
  current: boolean
}

/** The strings the navigation needs, from the `site` messages. */
export interface SiteCopy {
  mainNav:            string
  submenu:            string
  newTab:             string
  menu:               string
  language:           string
  fivem:              string
  fivemPaid:          string
  fivemPaidDesc:      string
  fivemFree:          string
  fivemFreeDesc:      string
  fivemAllAccess:     string
  fivemAllAccessDesc: string
  fivemStats:         string
  fivemStatsDesc:     string
  discord:            string
  ticketDesc:         string
  giveawayDesc:       string
  tools:              string
  images:             string
  imagesDesc:         string
  formsDesc:          string
  pasteDesc:          string
  shortenerDesc:      string
  about:              string
  stats:              string
}

export function productLines(t: SiteCopy, locale: string): ProductLine[] {
  return [
    {
      id:      'fivem',
      href:    shopUrl(locale, '/fivem'),
      label:   t.fivem,
      current: false,
      links: [
        { href: shopUrl(locale, '/fivem'), label: t.fivemPaid, description: t.fivemPaidDesc },
        { href: shopUrl(locale, '/fivem/free'), label: t.fivemFree, description: t.fivemFreeDesc },
        { href: shopUrl(locale, '/fivem/all-access'), label: t.fivemAllAccess, description: t.fivemAllAccessDesc },
        { href: shopUrl(locale, '/stats'), label: t.fivemStats, description: t.fivemStatsDesc },
      ],
    },
    {
      id:      'discord',
      href:    shopUrl(locale, '/discord'),
      label:   t.discord,
      current: false,
      // Product names stay as they are in every language.
      links: [
        { href: shopUrl(locale, '/discord/ticket-bot'), label: 'Ticket Bot', description: t.ticketDesc },
        { href: shopUrl(locale, '/discord/giveaway-bot'), label: 'Giveaway Bot', description: t.giveawayDesc },
      ],
    },
    {
      id:      'tools',
      href:    shopUrl(locale, '/tools'),
      label:   t.tools,
      current: true,
      links: [
        { href: shopUrl(locale, '/tools/images'), label: t.images, description: t.imagesDesc },
        { href: 'https://forms.msk-scripts.de/', label: 'MSK Forms', description: t.formsDesc, external: true },
        { href: '/', label: 'MSK Paste', description: t.pasteDesc, current: true },
        { href: 'https://s.msk-scripts.de/', label: 'MSK Shortener', description: t.shortenerDesc, external: true },
      ],
    },
  ]
}

export function aboutLink(t: SiteCopy, locale: string): NavLink {
  return { href: shopUrl(locale, '/about'), label: t.about }
}

/** The pages of the tool itself, ahead of the shop's lines. */
export function sectionLinks(t: SiteCopy): NavLink[] {
  return [{ href: '/stats', label: t.stats }]
}
