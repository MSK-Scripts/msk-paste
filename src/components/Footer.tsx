import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export async function Footer() {
  const t = await getTranslations('footer')

  return (
    <footer className="mt-16 border-t border-msk-border/50 px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-msk-muted">
        <p>
          <span className="text-msk-accent">MSK Paste</span> · {t('openSource')} · {t('byBrand')}
        </p>
        <nav className="flex items-center gap-4">
          <Link href="/imprint" className="hover:text-msk-text transition-colors">
            {t('imprint')}
          </Link>
          <Link href="/privacy" className="hover:text-msk-text transition-colors">
            {t('privacy')}
          </Link>
          <a
            href="https://github.com/MSK-Scripts/msk-paste"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-msk-text transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}
