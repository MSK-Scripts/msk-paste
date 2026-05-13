'use client'

import { useTranslations } from 'next-intl'
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import type { GlobalStats } from '@/types'

interface StatsChartsProps {
  stats: GlobalStats
}

export function StatsCharts({ stats }: StatsChartsProps) {
  const t  = useTranslations('stats')
  const tl = useTranslations('languages')

  const data = stats.topLanguages.map((l) => ({
    name:  tl(l.language as never) || l.language,
    count: l.count,
  }))

  if (data.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-msk-muted bg-msk-surface border border-msk-border rounded-lg">
        {t('noData')}
      </div>
    )
  }

  return (
    <div className="px-4 py-6 bg-msk-surface border border-msk-border rounded-lg">
      <h2 className="text-sm font-medium text-msk-muted uppercase tracking-wider mb-4">
        {t('topLanguages')}
      </h2>
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
            <CartesianGrid stroke="#3d3d3f" strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#8d9096" fontSize={12} />
            <YAxis stroke="#8d9096" fontSize={12} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: 'rgba(94,177,49,0.08)' }}
              contentStyle={{
                background:   '#1b1b1d',
                border:       '1px solid #3d3d3f',
                borderRadius: 8,
                fontSize:     12,
              }}
              labelStyle={{ color: '#e3e3e3' }}
              itemStyle={{ color: '#5eb131' }}
            />
            <Bar dataKey="count" fill="#5eb131" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
