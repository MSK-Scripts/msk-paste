import { getTranslations } from 'next-intl/server'
import { PageHead } from '@/components/site/PageHead'
import { SiteFrame } from '@/components/site/SiteFrame'

const SECTIONS = [
  'intro',
  'controller',
  'dpo',
  'hosting',
  'data',
  'legalBasis',
  'cookies',
  'tracking',
  'retention',
  'rights',
  'noAutomatedDecisions',
  'authority',
  'security',
  'thirdParty',
  'contact',
] as const

export default async function PrivacyPage() {
  const t = await getTranslations('privacy')

  return (
    <SiteFrame>
      <PageHead title={t('title')} lead={t('lastUpdated', { date: '2026-10-30' })} />
      <div className="tool-column py-[var(--space-section)]">
        <div className="grid max-w-[65ch] gap-8">

          {SECTIONS.map((section) => (
            <section key={section} className="space-y-2">
              <h2 className="font-display text-h3 font-[650] text-foreground">
                {t(`${section}.title`)}
              </h2>
              <p className="max-w-[65ch] text-muted-foreground leading-relaxed whitespace-pre-line">
                {t(`${section}.text`)}
              </p>
            </section>
          ))}

        </div>
      </div>

    </SiteFrame>
  )
}
