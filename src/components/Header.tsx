import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Logo } from './Logo'
import { LanguageSwitcher } from './LanguageSwitcher'

interface HeaderProps {
  /** If true: render only the logo + language switcher (no nav links). */
  minimal?: boolean
  /** If set: render a back link instead of the navigation. */
  backLink?: { href: string }
}

export async function Header({ minimal = false, backLink }: HeaderProps) {
  const t = await getTranslations('header')
  const c = await getTranslations('common')

  return (
    <header className="px-6 py-5 border-b border-msk-border/50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={32} />
          <span className="font-heading text-xl text-msk-text">
            MSK <span className="text-msk-accent">Paste</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {!minimal && !backLink && (
            <nav className="flex items-center gap-6 text-sm mr-2">
              <Link
                href="/"
                className="text-msk-muted hover:text-msk-text transition-colors"
              >
                {t('createNew')}
              </Link>
              <Link
                href="/stats"
                className="text-msk-muted hover:text-msk-text transition-colors"
              >
                {t('stats')}
              </Link>
              <a
                href="https://github.com/MSK-Scripts/msk-paste"
                target="_blank"
                rel="noopener noreferrer"
                className="text-msk-muted hover:text-msk-text transition-colors"
              >
                {t('github')}
              </a>
            </nav>
          )}

          {backLink && (
            <Link
              href={backLink.href}
              className="text-sm text-msk-muted hover:text-msk-accent transition-colors flex items-center gap-1.5 mr-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {c('back')}
            </Link>
          )}

          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
