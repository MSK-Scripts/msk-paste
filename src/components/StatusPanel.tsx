import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Clock, Fire, SmileySad } from '@/components/icons'

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
          palette === 'danger' ? 'bg-danger/8' : 'bg-accent-soft'
        }`}
      >
        {variant === 'burned' ? (
          <Fire className="w-8 h-8 text-danger" />
        ) : variant === 'expired' ? (
          <Clock className="w-8 h-8 text-primary" />
        ) : (
          <SmileySad className="w-8 h-8 text-primary" />
        )}
      </div>
      <h1 className="font-display text-2xl text-foreground">{t('title')}</h1>
      <p className="text-small text-muted-foreground mt-2">{t('subtitle')}</p>

      <Link
        href="/"
        className="inline-block mt-6 px-5 py-2.5 text-small bg-primary hover:bg-primary-hover text-primary-foreground rounded-lg font-medium transition-colors"
      >
        {variant === 'notFound' ? t('backHome') : c('back')}
      </Link>
    </div>
  )
}
