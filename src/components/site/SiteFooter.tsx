import Link from 'next/link'
import { getLocale, getTranslations } from 'next-intl/server'

import { ArrowSquareOut } from '@/components/icons'
import { GithubMark } from '@/components/icons/BrandMarks'
import { ThemeSwitch } from '@/components/theme/ThemeSwitch'
import { shopUrl } from '@/lib/shopUrl'

import { TOOL } from './navigation'

interface FooterLink {
  label: string
  href:  string
}

const linkClass =
  'inline-flex min-h-11 items-center gap-1.5 text-band-muted transition-colors duration-150 ' +
  'hover:text-band-foreground hover:underline underline-offset-4'

/** Another site; our own pages are relative paths. */
function isExternal(href: string) {
  return /^https?:\/\//i.test(href)
}

/**
 * The footer of every page, after the shop's: link columns on the anthracite
 * band beside the brand and the appearance switch, one bottom line. Links
 * that leave this site open in a new tab and say so.
 */
export async function SiteFooter() {
  const [t, locale] = await Promise.all([getTranslations('site'), getLocale()])
  const newTab = t('newTab')

  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: t('footerProduct'),
      links: [
        { label: t('stats'), href: '/stats' },
        { label: t('documentation'), href: 'https://docu.msk-scripts.de/paste' },
        { label: t('github'), href: 'https://github.com/MSK-Scripts/msk-paste' },
      ],
    },
    {
      title: t('footerEcosystem'),
      links: [
        { label: 'MSK Shop', href: shopUrl(locale, '/') },
        { label: 'MSK Forms', href: 'https://forms.msk-scripts.de/' },
        { label: 'MSK Shortener', href: 'https://s.msk-scripts.de/' },
      ],
    },
    {
      title: t('footerLegal'),
      links: [
        { label: t('imprint'), href: '/imprint' },
        { label: t('privacy'), href: '/privacy' },
      ],
    },
  ]

  return (
    <footer className="surface-band pb-[env(safe-area-inset-bottom)]">
      <div className="container-page grid gap-12 py-[clamp(3rem,2rem+3vw,6rem)]">
        <div className="@container">
          <div className="grid gap-x-10 gap-y-10 @lg:grid-cols-2 @4xl:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
            <div className="grid content-start gap-4 @lg:col-span-2 @4xl:col-span-1">
              <Link href="/" className="inline-flex min-h-11 items-center gap-2.5 self-start text-band-foreground">
                <img src="/logo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
                <span className="font-display text-lead font-bold [font-stretch:108%]">{TOOL.name}</span>
              </Link>
              <p className="max-w-[40ch] text-small text-band-muted">{t('footerTagline')}</p>
              <div className="grid gap-2">
                <p className="text-small font-semibold">{t('theme.group')}</p>
                <ThemeSwitch
                  tone="band"
                  labels={{
                    group:  t('theme.group'),
                    system: t('theme.system'),
                    light:  t('theme.light'),
                    dark:   t('theme.dark'),
                  }}
                />
              </div>
            </div>

            {columns.map((col) => (
              <div key={col.title} className="grid content-start gap-2">
                <h2 className="text-label font-semibold tracking-[0.08em] text-band-foreground uppercase">{col.title}</h2>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.href}>
                      {isExternal(link.href) ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          {link.label}
                          <ArrowSquareOut className="h-3.5 w-3.5" />
                          <span className="sr-only"> {newTab}</span>
                        </a>
                      ) : (
                        <a href={link.href} className={linkClass}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-band-line pt-6 text-small text-band-muted">
          <span>
            © {new Date().getFullYear()} MSK Scripts. {t('rights')}
          </span>
          <span aria-hidden="true">·</span>
          <span>{t('license')}</span>
          <span aria-hidden="true">·</span>
          <span>
            {t('builtBy')}{' '}
            <a
              href="https://www.musiker15.de"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center underline-offset-4 hover:text-band-foreground hover:underline"
            >
              Musiker15
              <span className="sr-only"> {newTab}</span>
            </a>
          </span>
          <span aria-hidden="true">·</span>
          <a
            href="https://github.com/MSK-Scripts/msk-paste"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-1.5 underline-offset-4 hover:text-band-foreground hover:underline"
          >
            <GithubMark className="h-4 w-4" />
            GitHub
            <span className="sr-only"> {newTab}</span>
          </a>
        </p>
      </div>
    </footer>
  )
}
