import { getTranslations } from 'next-intl/server'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export async function generateMetadata() {
  const t = await getTranslations('imprintPage')
  return { title: t('title') }
}

export default async function ImprintPage() {
  const t = await getTranslations('imprintPage')

  return (
    <main className="min-h-screen flex flex-col">
      <Header backLink={{ href: '/' }} />

      <div className="flex-1 px-6 py-10">
        <article className="max-w-3xl mx-auto space-y-8">

          <header>
            <h1 className="font-heading text-3xl text-msk-text">{t('title')}</h1>
          </header>

          <section className="space-y-2">
            <h2 className="font-heading text-xl text-msk-text">
              {t('section1Title')}
            </h2>
            <div className="bg-msk-surface/40 border border-msk-border rounded-lg p-4">
              <p className="text-msk-text font-medium">{t('addressName')}</p>
              <p className="text-sm text-msk-muted whitespace-pre-line mt-1">
                {t('addressLines')}
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading text-xl text-msk-text">
              {t('contactTitle')}
            </h2>
            <p className="text-sm text-msk-muted">{t('contactEmail')}</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-heading text-lg text-msk-text">
              {t('noAdsTitle')}
            </h3>
            <p className="text-sm text-msk-muted leading-relaxed">
              {t('noAdsText')}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading text-xl text-msk-text">
              {t('responsibleTitle')}
            </h2>
            <div className="bg-msk-surface/40 border border-msk-border rounded-lg p-4">
              <p className="text-msk-text font-medium">{t('addressName')}</p>
              <p className="text-sm text-msk-muted whitespace-pre-line mt-1">
                {t('addressLines')}
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-heading text-xl text-msk-text">
              {t('disputeTitle')}
            </h2>
            <p className="text-sm text-msk-muted leading-relaxed">
              {t('disputeText')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading text-xl text-msk-text">
              {t('liabilityTitle')}
            </h2>

            <div className="space-y-2">
              <h3 className="font-heading text-lg text-msk-text">
                {t('liabilityContentTitle')}
              </h3>
              <p className="text-sm text-msk-muted leading-relaxed">
                {t('liabilityContentText')}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-heading text-lg text-msk-text">
                {t('liabilityLinksTitle')}
              </h3>
              <p className="text-sm text-msk-muted leading-relaxed">
                {t('liabilityLinksText')}
              </p>
            </div>
          </section>

        </article>
      </div>

      <Footer />
    </main>
  )
}
