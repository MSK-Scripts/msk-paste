import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

type Variant = 'expired' | 'burned' | 'notFound'

interface StatusPanelProps {
  variant: Variant
}

/**
 * Shared full-page status panel used for expired / burned / not-found views.
 */
export async function StatusPanel({ variant }: StatusPanelProps) {
  const tns = variant === 'notFound' ? 'notFound' : variant
  const t   = await getTranslations(tns)
  const c   = await getTranslations('common')

  const palette = variant === 'burned' ? 'danger' : 'accent'

  return (
    <div className="w-full max-w-md mx-auto text-center animate-fade-in">
      <div
        className={`inline-flex w-16 h-16 rounded-full items-center justify-center mb-5 ${
          palette === 'danger' ? 'bg-msk-danger/10' : 'bg-msk-accent/10'
        }`}
      >
        {variant === 'burned' ? (
          <svg className="w-8 h-8 text-msk-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.24 17 7.317c2 3 .5 6 3 8 .5.6.5 2-2.343 3.34z" />
          </svg>
        ) : variant === 'expired' ? (
          <svg className="w-8 h-8 text-msk-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-8 h-8 text-msk-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>
      <h1 className="font-heading text-2xl text-msk-text">{t('title')}</h1>
      <p className="text-sm text-msk-muted mt-2">{t('subtitle')}</p>

      <Link
        href="/"
        className="inline-block mt-6 px-5 py-2.5 text-sm bg-msk-accent hover:bg-msk-hover text-white rounded-lg font-medium transition-colors"
      >
        {variant === 'notFound' ? t('backHome') : c('back')}
      </Link>
    </div>
  )
}
