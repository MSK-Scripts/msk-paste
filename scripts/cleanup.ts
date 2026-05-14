/**
 * MSK Paste – Cleanup job
 *
 * Deletes all expired pastes.
 * Run regularly via cron, for example daily at 03:00:
 *
 *   0 3 * * * cd /opt/msk-paste && /usr/bin/node /usr/local/bin/tsx scripts/cleanup.ts >> /var/log/msk-paste-cleanup.log 2>&1
 *
 * Usage: npm run cleanup
 */
import { config } from 'dotenv'
import { resolve } from 'node:path'
import { execute, queryOne, closePool } from '../src/lib/db'

// Load .env
config({ path: resolve(process.cwd(), '.env'), quiet: true })

async function main() {
  const startedAt = Date.now()
  const timestamp = new Date().toISOString()

  console.log(`[${timestamp}] 🧹 MSK Paste – Cleanup job started`)
  console.log('─────────────────────────────────────────────────────')

  // expires_at is stored as UTC (mysql2 timezone: '+00:00'), so compare against
  // UTC_TIMESTAMP() — independent of the MariaDB session time zone.
  const expired = await queryOne<{ count: number }>(
    'SELECT COUNT(*) AS count FROM pastes WHERE expires_at < UTC_TIMESTAMP()'
  )
  const expectedCount = expired?.count ?? 0

  if (expectedCount === 0) {
    console.log('✨ No expired pastes found')
    await closePool()
    return
  }

  const result = await execute(
    'DELETE FROM pastes WHERE expires_at < UTC_TIMESTAMP()'
  )

  const duration = Date.now() - startedAt
  console.log(`✅ ${result.affectedRows} expired paste(s) deleted (${duration}ms)`)
  console.log('─────────────────────────────────────────────────────')

  await closePool()
}

main().catch(async (err) => {
  console.error('❌ Cleanup failed:')
  console.error(err)
  await closePool()
  process.exit(1)
})
