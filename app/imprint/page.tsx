import { getTranslations } from 'next-intl/server'
import { PageHead } from '@/components/site/PageHead'
import { SiteFrame } from '@/components/site/SiteFrame'

export async function generateMetadata() {
  const t = await getTranslations('imprintPage')
  return { title: t('title') }
}

export default async function ImprintPage() {
  const t = await getTranslations('imprintPage')

  return (
    <SiteFrame>
      <PageHead title={t('title')} />
      <div className="tool-column py-[var(--space-section)]">
        <article className="grid max-w-[65ch] gap-8">

          <section className="space-y-2">
            <h2 className="font-display text-h3 font-[650] text-foreground">
              {t('section1Title')}
            </h2>
            <div className="bg-card/40 border border-border rounded-lg p-4">
              <p className="text-foreground font-medium">{t('addressName')}</p>
              <p className="text-small text-muted-foreground whitespace-pre-line mt-1">
                {t('addressLines')}
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-h3 font-[650] text-foreground">
              {t('contactTitle')}
            </h2>
            <p className="text-small text-muted-foreground">{t('contactEmail')}</p>
          </section>

          <section className="space-y-2">
            <h3 className="font-display text-lg text-foreground">
              {t('noAdsTitle')}
            </h3>
            <p className="text-small text-muted-foreground leading-relaxed">
              {t('noAdsText')}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-h3 font-[650] text-foreground">
              {t('responsibleTitle')}
            </h2>
            <div className="bg-card/40 border border-border rounded-lg p-4">
              <p className="text-foreground font-medium">{t('addressName')}</p>
              <p className="text-small text-muted-foreground whitespace-pre-line mt-1">
                {t('addressLines')}
              </p>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-h3 font-[650] text-foreground">
              {t('disputeTitle')}
            </h2>
            <p className="text-small text-muted-foreground leading-relaxed">
              {t('disputeText')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-h3 font-[650] text-foreground">
              {t('liabilityTitle')}
            </h2>

            <div className="space-y-2">
              <h3 className="font-display text-lg text-foreground">
                {t('liabilityContentTitle')}
              </h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                {t('liabilityContentText')}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-display text-lg text-foreground">
                {t('liabilityLinksTitle')}
              </h3>
              <p className="text-small text-muted-foreground leading-relaxed">
                {t('liabilityLinksText')}
              </p>
            </div>
          </section>

        </article>
      </div>

    </SiteFrame>
  )
}
