import Script from 'next/script'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { CreatePasteForm } from '@/components/CreatePasteForm'
import { issueFormStamp } from '@/lib/formStamp'
import { turnstileSiteKey } from '@/lib/turnstile'

// Every render carries a fresh form stamp.
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const t       = await getTranslations('home')
  const nonce   = (await headers()).get('x-nonce') ?? undefined
  const siteKey = turnstileSiteKey()

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="font-heading text-4xl sm:text-5xl text-msk-text">
              MSK <span className="text-msk-accent">Paste</span>
            </h1>
            <p className="text-msk-muted text-sm sm:text-base mt-3">{t('subtitle')}</p>
          </div>

          <CreatePasteForm siteKey={siteKey} formStamp={issueFormStamp()} />
        </div>
      </div>

      <Footer />

      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          nonce={nonce}
        />
      )}
    </main>
  )
}
