/**
 * MSK Paste – Migration Runner
 *
 * Runs every SQL file in /migrations in alphabetical order.
 * Tracks which migrations have already been applied in the table `_migrations`.
 *
 * Usage: npm run migrate
 */

// IMPORTANT: dotenv MUST be loaded before anything else so that ENV variables
// are available when db.ts is imported.
// Quiet=true suppresses the dotenvx banner (dotenv v17+).
import { config } from 'dotenv'
import { readdir, readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { getPool, queryMany, execute, closePool } from '../src/lib/db'

// Top-level — runs BEFORE main()
config({ quiet: true })

const MIGRATIONS_DIR = resolve(process.cwd(), 'migrations')

async function ensureMigrationsTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      filename    VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
}

async function getExecutedMigrations(): Promise<Set<string>> {
  const rows = await queryMany<{ filename: string }>(
    'SELECT filename FROM _migrations'
  )
  return new Set(rows.map((r) => r.filename))
}

async function runMigration(filename: string) {
  const filepath = join(MIGRATIONS_DIR, filename)
  const sql      = await readFile(filepath, 'utf-8')

  // Strip comments BEFORE splitting on `;` to avoid breaking statements
  // that contain `--`-style or block comments.
  const statements = sql
    // Inline comments (-- to end of line)
    .replace(/--.*$/gm, '')
    // Block comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Split on semicolon
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (statements.length === 0) {
    throw new Error(`Migration ${filename} contains no executable statements`)
  }

  const pool = getPool()
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()
    for (const stmt of statements) {
      await conn.query(stmt)
    }
    await conn.query('INSERT INTO _migrations (filename) VALUES (?)', [filename])
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

async function main() {
  console.log('🔧 MSK Paste – Migration Runner')
  console.log('─────────────────────────────────────')

  await ensureMigrationsTable()
  const executed = await getExecutedMigrations()

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort()

  let count = 0
  for (const file of files) {
    if (executed.has(file)) {
      console.log(`  ⏭️  ${file} (already applied)`)
      continue
    }

    process.stdout.write(`  ▶️  ${file}... `)
    await runMigration(file)
    console.log('✅')
    count++
  }

  console.log('─────────────────────────────────────')
  console.log(count > 0
    ? `✅ ${count} migration(s) successfully applied`
    : '✨ All migrations are up to date'
  )

  await closePool()
}

main().catch(async (err) => {
  console.error('\n❌ Migration failed:')
  console.error(err)
  await closePool()
  process.exit(1)
})
