import { getLocale, getTranslations } from 'next-intl/server'

import type { GlobalStats } from '@/types'

/**
 * The most used languages as horizontal bars, rendered on the server: no
 * chart library, no client script. Every bar carries its count and share as
 * text, so no value is told by length alone.
 */
export async function StatsCharts({ stats }: { stats: GlobalStats }) {
  const [t, tl, locale] = await Promise.all([getTranslations('stats'), getTranslations('languages'), getLocale()])
  const total = stats.topLanguages.reduce((sum, l) => sum + l.count, 0)
  const number = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB')
  const percent = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB', { style: 'percent', maximumFractionDigits: 1 })

  return (
    <section aria-labelledby="top-languages" className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <h2 id="top-languages" className="mb-4 font-display text-lead font-[650]">
        {t('topLanguages')}
      </h2>
      {stats.topLanguages.length === 0 ? (
        <p className="py-6 text-center text-small text-muted-foreground">{t('noData')}</p>
      ) : (
        <ul className="grid gap-3">
          {stats.topLanguages.map((l) => {
            const share = total > 0 ? l.count / total : 0
            const name = tl.has(l.language) ? tl(l.language) : l.language
            return (
              <li key={l.language} className="grid gap-1">
                <div className="flex items-center justify-between gap-3 text-small">
                  <span className="truncate">{name}</span>
                  <span className="shrink-0 text-muted-foreground tabular-nums">
                    {number.format(l.count)} ({percent.format(share)})
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-chart-1" style={{ width: `${share * 100}%` }} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
