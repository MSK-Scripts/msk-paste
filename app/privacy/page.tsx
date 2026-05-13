import { getTranslations } from 'next-intl/server'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

const SECTIONS = [
  'intro',
  'controller',
  'data',
  'cookies',
  'tracking',
  'retention',
  'rights',
  'security',
  'thirdParty',
  'contact',
] as const

export default async function PrivacyPage() {
  const t = await getTranslations('privacy')

  return (
    <main className="min-h-screen flex flex-col">
      <Header backLink={{ href: '/' }} />

      <div className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto space-y-8">

          <header>
            <h1 className="font-heading text-3xl text-msk-text">{t('title')}</h1>
            <p className="text-xs text-msk-muted mt-2 font-mono">
              {t('lastUpdated', { date: '2026-05-13' })}
            </p>
          </header>

          {SECTIONS.map((section) => (
            <section key={section} className="space-y-2">
              <h2 className="font-heading text-xl text-msk-text">
                {t(`${section}.title`)}
              </h2>
              <p className="text-sm text-msk-muted leading-relaxed whitespace-pre-line">
                {t(`${section}.text`)}
              </p>
            </section>
          ))}

        </div>
      </div>

      <Footer />
    </main>
  )
}
