import { getTranslations } from 'next-intl/server'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { StatsCharts } from '@/components/StatsCharts'
import { getGlobalStats } from '@/lib/stats'

// Always fetch the latest numbers — caching happens in the API layer.
export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  const t = await getTranslations('stats')

  const stats = await getGlobalStats()

  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">

          <div>
            <h1 className="font-heading text-3xl text-msk-text">{t('title')}</h1>
            <p className="text-sm text-msk-muted mt-1">{t('subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card label={t('totalPastes')}    value={stats.totalPastes} />
            <Card label={t('pastesToday')}    value={stats.pastesToday} />
            <Card label={t('pastesThisWeek')} value={stats.pastesThisWeek} />
          </div>

          <StatsCharts stats={stats} />
        </div>
      </div>

      <Footer />
    </main>
  )
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="px-5 py-6 bg-msk-surface border border-msk-border rounded-lg">
      <div className="text-xs uppercase tracking-wider text-msk-muted">{label}</div>
      <div className="font-heading text-3xl text-msk-text mt-2">
        {value.toLocaleString('de-DE')}
      </div>
    </div>
  )
}
