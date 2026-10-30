import Link from 'next/link'
import Script from 'next/script'
import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'

import { CreatePasteForm } from '@/components/CreatePasteForm'
import { ChartBar } from '@/components/icons'
import { PageHead } from '@/components/site/PageHead'
import { SiteFrame } from '@/components/site/SiteFrame'
import { Button } from '@/components/ui/Button'
import { issueFormStamp } from '@/lib/formStamp'
import { turnstileSiteKey } from '@/lib/turnstile'

// Every render carries a fresh form stamp.
export const dynamic = 'force-dynamic'

const FACTS = ['highlight', 'expiry', 'protect', 'raw'] as const

export default async function HomePage() {
  const t       = await getTranslations('home')
  const nonce   = (await headers()).get('x-nonce') ?? undefined
  const siteKey = turnstileSiteKey()

  return (
    <SiteFrame>
      <PageHead
        size="tool"
        kicker={t('kicker')}
        title={
          <>
            MSK <span className="text-band-accent">Paste</span>
          </>
        }
        lead={t('subtitle')}
      />

      <div className="tool-column grid gap-[var(--space-stack)] py-[var(--space-section)]">
        <section aria-labelledby="create-heading" className="grid gap-4">
          <h2 id="create-heading" className="sr-only">
            {t('formTitle')}
          </h2>
          <div className="relative rounded-lg border border-border bg-card p-[clamp(1.25rem,0.75rem+1.5vw,2.5rem)] shadow-[var(--shadow-card)]">
            <CreatePasteForm siteKey={siteKey} formStamp={issueFormStamp()} />
          </div>
          <div>
            <Button asChild variant="link" className="min-h-11">
              <Link href="/stats">
                <ChartBar className="h-5 w-5" />
                {t('statsLink')}
              </Link>
            </Button>
          </div>
        </section>

        <section aria-labelledby="facts-heading" className="grid gap-4 border-t border-border pt-[var(--space-stack)]">
          <h2 id="facts-heading" className="font-display text-h3 font-[650]">
            {t('factsTitle')}
          </h2>
          <ul className="grid gap-x-10 [grid-template-columns:repeat(auto-fill,minmax(min(100%,18rem),1fr))]">
            {FACTS.map((key) => (
              <li key={key} className="grid content-start gap-1 border-t border-border py-4">
                <p className="font-semibold">{t(`facts.${key}.title`)}</p>
                <p className="max-w-[65ch] text-small text-muted-foreground">{t(`facts.${key}.text`)}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          nonce={nonce}
        />
      )}
    </SiteFrame>
  )
}
