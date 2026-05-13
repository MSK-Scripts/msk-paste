import { queryOne, queryMany } from './db'
import type { GlobalStats } from '@/types'

export async function getGlobalStats(): Promise<GlobalStats> {
  const [total, today, week, langs] = await Promise.all([
    queryOne<{ count: number }>(
      'SELECT COUNT(*) AS count FROM pastes WHERE expires_at >= NOW()',
    ),
    queryOne<{ count: number }>(
      `SELECT COUNT(*) AS count FROM pastes
        WHERE created_at >= CURDATE() AND expires_at >= NOW()`,
    ),
    queryOne<{ count: number }>(
      `SELECT COUNT(*) AS count FROM pastes
        WHERE created_at >= (NOW() - INTERVAL 7 DAY)
          AND expires_at >= NOW()`,
    ),
    queryMany<{ language: string; count: number }>(
      `SELECT language, COUNT(*) AS count FROM pastes
        WHERE expires_at >= NOW()
        GROUP BY language
        ORDER BY count DESC
        LIMIT 5`,
    ),
  ])

  return {
    totalPastes:    Number(total?.count ?? 0),
    pastesToday:    Number(today?.count ?? 0),
    pastesThisWeek: Number(week?.count ?? 0),
    topLanguages:   langs.map((l) => ({ language: l.language, count: Number(l.count) })),
  }
}
