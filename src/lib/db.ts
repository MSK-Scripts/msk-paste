import mysql from 'mysql2/promise'
import { envInt } from './env'

// ─── ENV validation (lazy) ────────────────────────────────────────
const REQUIRED_ENV = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'] as const

/**
 * Checks that all required ENV variables are set.
 * Runs at the first getPool() call (runtime), NOT at module import time,
 * so the Next.js build can run without a real database.
 */
function validateEnv(): void {
  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) {
      throw new Error(`Missing ENV variable: ${key}`)
    }
  }
}

// ─── Types ────────────────────────────────────────────────────────────

/**
 * Allowed parameter types for prepared statements.
 * Matches the values accepted by mysql2.
 */
export type SqlParam =
  | string
  | number
  | boolean
  | bigint
  | Date
  | Buffer
  | null

export type SqlParams = ReadonlyArray<SqlParam>

// ─── Connection pool ──────────────────────────────────────────────────
let pool: mysql.Pool | null = null

export function getPool(): mysql.Pool {
  if (pool) return pool

  // Lazy: validate ENV only when the DB is actually needed
  validateEnv()

  pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     envInt('DB_PORT', 3306),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Connection settings
    waitForConnections:    true,
    connectionLimit:       10,
    queueLimit:            0,
    enableKeepAlive:       true,
    keepAliveInitialDelay: 10_000,

    // Charset & timezone
    charset:     'utf8mb4_unicode_ci',
    timezone:    '+00:00',
    dateStrings: false,

    // Numeric handling for BIGINT
    supportBigNumbers: true,
    bigNumberStrings:  false,
  })

  return pool
}

// ─── Query helpers ────────────────────────────────────────────────────

/**
 * Executes a SELECT and returns the first row (or null).
 */
export async function queryOne<T = unknown>(
  sql: string,
  params: SqlParams = []
): Promise<T | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>(sql, Array.from(params) as any[])
  return (rows[0] as T | undefined) ?? null
}

/**
 * Executes a SELECT and returns all rows.
 */
export async function queryMany<T = unknown>(
  sql: string,
  params: SqlParams = []
): Promise<T[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rows] = await getPool().execute<mysql.RowDataPacket[]>(sql, Array.from(params) as any[])
  return rows as T[]
}

/**
 * Executes an INSERT/UPDATE/DELETE and returns the ResultSetHeader.
 */
export async function execute(
  sql: string,
  params: SqlParams = []
): Promise<mysql.ResultSetHeader> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result] = await getPool().execute<mysql.ResultSetHeader>(sql, Array.from(params) as any[])
  return result
}

/**
 * Closes the pool — used only by migration scripts and tests.
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
