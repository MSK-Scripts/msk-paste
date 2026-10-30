'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState } from 'react'

import { ArrowSquareOut, CaretDown, List, X } from '@/components/icons'
import type { Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'

import { LanguagePicker } from './LanguagePicker'
import { TOOL, type NavLink, type ProductLine, type SiteCopy } from './navigation'
import { useDismiss } from './useDismiss'

const MENU_ID = 'site-menu'

/** `aria-current` for a link of our own: the page itself, or a page below it. */
function currentFor(path: string, href: string): 'page' | 'true' | undefined {
  if (path === href) return 'page'
  return href !== '/' && path.startsWith(`${href}/`) ? 'true' : undefined
}

// The current area gets the green underline, as in the shop.
const topLinkClass =
  'inline-flex min-h-11 items-center font-medium text-foreground transition-colors duration-150 ' +
  'hover:text-primary aria-[current]:font-semibold aria-[current]:shadow-[inset_0_-3px_0_hsl(var(--primary))]'

/** One entry of a product line's panel: name, one line of description. */
function PanelLink({ link, newTab, onNavigate }: { link: NavLink; newTab: string; onNavigate?: () => void }) {
  return (
    <a
      href={link.href}
      onClick={onNavigate}
      aria-current={link.current ? 'true' : undefined}
      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'group grid min-h-11 content-center gap-0.5 rounded-md px-3 py-2 transition-colors duration-150 hover:bg-muted',
        link.current && 'bg-accent-soft hover:bg-accent-soft',
      )}
    >
      <span
        className={cn(
          'flex items-center gap-1.5 font-semibold group-hover:text-primary',
          link.current ? 'text-primary' : 'text-foreground',
        )}
      >
        {link.label}
        {link.external && <ArrowSquareOut className="h-3.5 w-3.5 text-muted-foreground" />}
      </span>
      {link.description && <span className="text-small text-muted-foreground">{link.description}</span>}
      {link.external && <span className="sr-only"> {newTab}</span>}
    </a>
  )
}

/**
 * Main navigation from 1280 px: the tool's pages, then the shop's product
 * lines and its about page. Each line is a link to its overview plus a small
 * button that opens a panel with its pages (the disclosure pattern): the
 * link still navigates, the button is reachable by keyboard, Escape closes
 * and returns the focus. Hovering an entry opens its panel too.
 */
function MainNav({
  path,
  section,
  lines,
  about,
  copy,
  className,
}: {
  path:       string
  section:    NavLink[]
  lines:      ProductLine[]
  about:      NavLink
  copy:       SiteCopy
  className?: string
}) {
  const [open, setOpen] = useState<string | null>(null)
  // A panel the pointer opened stays open when its button is clicked next;
  // otherwise moving onto the button and clicking it would close it again.
  const openedByHover = useRef(false)
  const ref = useRef<HTMLUListElement>(null)

  useDismiss(open !== null, ref, (reason) => {
    if (reason === 'escape' && open) document.getElementById(`nav-toggle-${open}`)?.focus()
    setOpen(null)
  })

  return (
    <nav aria-label={copy.mainNav} className={className}>
      <ul ref={ref} className="flex items-center gap-[clamp(0.75rem,1.4vw,2.25rem)]">
        {section.map((link) => (
          <li key={link.href}>
            <a href={link.href} aria-current={currentFor(path, link.href)} className={topLinkClass}>
              {link.label}
            </a>
          </li>
        ))}
        <li aria-hidden className="h-6 w-px bg-border" />
        {lines.map((line) => {
          const isOpen = open === line.id
          const panelId = `nav-panel-${line.id}`
          return (
            <li
              key={line.id}
              className="relative flex items-center"
              onMouseEnter={() => {
                openedByHover.current = open !== line.id
                setOpen(line.id)
              }}
              onMouseLeave={() => setOpen((current) => (current === line.id ? null : current))}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                  setOpen((current) => (current === line.id ? null : current))
                }
              }}
            >
              <a href={line.href} aria-current={line.current ? 'true' : undefined} className={topLinkClass}>
                {line.label}
              </a>
              <button
                id={`nav-toggle-${line.id}`}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={copy.submenu.replace('{name}', line.label)}
                onClick={() => {
                  if (isOpen && openedByHover.current) {
                    openedByHover.current = false
                    return
                  }
                  openedByHover.current = false
                  setOpen(isOpen ? null : line.id)
                }}
                className="-ml-1 inline-flex min-h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:text-primary"
              >
                <CaretDown className={cn('h-4 w-4 transition-transform duration-150', isOpen && 'rotate-180')} />
              </button>

              {/* `pt-2` bridges the gap to the panel, so the pointer can travel
                  down without leaving the entry. */}
              <div id={panelId} hidden={!isOpen} className="absolute top-full left-0 z-[60] pt-2">
                <ul className="grid w-[24rem] gap-0.5 rounded-lg border border-border bg-card p-2 shadow-[var(--shadow-card-hover)]">
                  {line.links.map((link) => (
                    <li key={link.href}>
                      <PanelLink link={link} newTab={copy.newTab} onNavigate={() => setOpen(null)} />
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
        <li>
          <a href={about.href} className={topLinkClass}>
            {about.label}
          </a>
        </li>
      </ul>
    </nav>
  )
}

/**
 * The header of every page, after the shop's Header: the MSK green stripe on
 * top, the brand, the navigation, then the language. Below 1280 px the
 * navigation moves into a menu that opens below the bar (a disclosure, not a
 * modal: the page stays where it is and the panel scrolls on its own).
 */
export function HeaderBar({
  locale,
  copy,
  section,
  lines,
  about,
}: {
  locale:  Locale
  copy:    SiteCopy
  section: NavLink[]
  lines:   ProductLine[]
  about:   NavLink
}) {
  const path = usePathname() ?? '/'
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useDismiss(menuOpen, headerRef, (reason) => {
    setMenuOpen(false)
    if (reason === 'escape') menuButtonRef.current?.focus()
  })

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-t-4 border-b border-t-brand border-b-border bg-card">
      <div className="container-page flex min-h-[var(--header-height)] items-center gap-[clamp(1rem,2vw,2.5rem)]">
        <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2.5 text-foreground">
          <Image src="/logo.png" alt="" width={36} height={36} loading="eager" className="h-9 w-9 rounded-lg object-contain" />
          {/* Below 360 px the name gives way to the buttons; it stays the
              link's name for a screen reader. */}
          <span className="sr-only font-display text-lead font-bold tracking-[-0.01em] [font-stretch:108%] min-[360px]:not-sr-only">
            {TOOL.name}
          </span>
        </Link>

        {/* Our own pages stay in the bar from 768 px; the shop's lines join
            them from 1280 px. */}
        <nav aria-label={TOOL.name} className="hidden md:block xl:hidden">
          <ul className="flex items-center gap-[clamp(0.75rem,1.4vw,2.25rem)]">
            {section.map((link) => (
              <li key={link.href}>
                <a href={link.href} aria-current={currentFor(path, link.href)} className={topLinkClass}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <MainNav path={path} section={section} lines={lines} about={about} copy={copy} className="hidden xl:block" />

        <div className="ml-auto flex items-center gap-[clamp(0.25rem,0.9vw,1.25rem)]">
          <LanguagePicker locale={locale} label={copy.language} className="hidden sm:inline-flex" />
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-md border-[1.5px] border-input px-3 font-medium text-foreground transition-colors duration-150 hover:border-foreground xl:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <List className="h-5 w-5" />}
            <span className="sr-only min-[480px]:not-sr-only">{copy.menu}</span>
          </button>
        </div>
      </div>

      <div
        id={MENU_ID}
        hidden={!menuOpen}
        className="max-h-[calc(100dvh-var(--header-height)-5px)] overflow-y-auto overscroll-contain border-t border-border bg-card xl:hidden"
      >
        <div className="container-page grid gap-8 py-6">
          <nav aria-label={copy.mainNav} className="@container">
            <ul className="grid gap-6 @lg:grid-cols-2 @lg:gap-x-8">
              <li className="grid content-start gap-1">
                <Link
                  href="/"
                  aria-current={path === '/' ? 'page' : 'true'}
                  className="inline-flex min-h-11 items-center self-start font-display text-h3 font-[650] text-foreground aria-[current]:shadow-[inset_0_-3px_0_hsl(var(--primary))]"
                >
                  {TOOL.name}
                </Link>
                <ul className="grid gap-0.5">
                  {section.map((link) => (
                    <li key={link.href}>
                      <PanelLink
                        link={{ ...link, current: currentFor(path, link.href) !== undefined }}
                        newTab={copy.newTab}
                        onNavigate={() => setMenuOpen(false)}
                      />
                    </li>
                  ))}
                </ul>
              </li>
              {lines.map((line) => (
                <li key={line.id} className="grid content-start gap-1">
                  <a
                    href={line.href}
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex min-h-11 items-center self-start font-display text-h3 font-[650] text-foreground hover:text-primary"
                  >
                    {line.label}
                  </a>
                  <ul className="grid gap-0.5">
                    {line.links.map((link) => (
                      <li key={link.href}>
                        <PanelLink link={link} newTab={copy.newTab} onNavigate={() => setMenuOpen(false)} />
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              <li>
                <a
                  href={about.href}
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex min-h-11 items-center font-display text-h3 font-[650] text-foreground hover:text-primary"
                >
                  {about.label}
                </a>
              </li>
            </ul>
          </nav>

          <div className="grid gap-2 border-t border-border pt-6 sm:hidden">
            <p className="kicker">{copy.language}</p>
            <LanguagePicker locale={locale} label={copy.language} className="self-start" />
          </div>
        </div>
      </div>
    </header>
  )
}
