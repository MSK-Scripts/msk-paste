import { getTranslations } from 'next-intl/server'
import { PageHead } from '@/components/site/PageHead'
import { SiteFrame } from '@/components/site/SiteFrame'
import { StatsCharts } from '@/components/StatsCharts'
import { getGlobalStats } from '@/lib/stats'

// Always fetch the latest numbers — caching happens in the API layer.
export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const t = await getTranslations('stats')

  const stats = await getGlobalStats()

  return (
    <SiteFrame>
      <PageHead title={t('title')} lead={t('subtitle')} />
      <div className="container-page py-[var(--space-section)]">
        <div className="grid gap-8">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card label={t('totalPastes')}    value={stats.totalPastes} />
            <Card label={t('pastesToday')}    value={stats.pastesToday} />
            <Card label={t('pastesThisWeek')} value={stats.pastesThisWeek} />
          </div>

          <StatsCharts stats={stats} />
        </div>
      </div>

    </SiteFrame>
  )
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="text-label font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-h3 font-[650] tabular-nums text-foreground">
        {value.toLocaleString('de-DE')}
      </div>
    </div>
  )
}
