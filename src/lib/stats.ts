import { queryOne, queryMany } from './db'
import type { GlobalStats } from '@/types'

export async function getGlobalStats(): Promise<GlobalStats> {
  // mysql2 reads/writes all dates as UTC (timezone: '+00:00' in db.ts), so the
  // stored expires_at / created_at values are UTC. Compare against UTC_TIMESTAMP()
  // / UTC_DATE() — these ignore the session time zone, so the result is correct
  // regardless of the MariaDB server's local time zone.
  const [total, today, week, langs] = await Promise.all([
    queryOne<{ count: number }>(
      'SELECT COUNT(*) AS count FROM pastes WHERE expires_at >= UTC_TIMESTAMP()',
    ),
    queryOne<{ count: number }>(
      `SELECT COUNT(*) AS count FROM pastes
        WHERE created_at >= UTC_DATE() AND expires_at >= UTC_TIMESTAMP()`,
    ),
    queryOne<{ count: number }>(
      `SELECT COUNT(*) AS count FROM pastes
        WHERE created_at >= (UTC_TIMESTAMP() - INTERVAL 7 DAY)
          AND expires_at >= UTC_TIMESTAMP()`,
    ),
    queryMany<{ language: string; count: number }>(
      `SELECT language, COUNT(*) AS count FROM pastes
        WHERE expires_at >= UTC_TIMESTAMP()
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
