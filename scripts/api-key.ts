/**
 * MSK Paste – API key management
 *
 * Issues and withdraws the keys that may create pastes through the API. Runs
 * on the server with the app's .env, so only someone with a shell there and
 * read access to the .env can use it.
 *
 * Usage on the server: /opt/msk-paste/scripts/api-key.sh <command>
 * Locally:             npm run api-key -- <command>
 * Commands: see HELP below or run `api-key.sh help`.
 */

// dotenv MUST be loaded before db.ts reads the environment.
import { config } from 'dotenv'
import { closePool, execute, queryMany } from '../src/lib/db'
import { API_KEY_PREFIX, generateApiKey, hashApiKey, type ApiKeyRow } from '../src/lib/apiKeys'

config({ quiet: true })

const HELP = `MSK Paste – API keys

Usage: api-key.sh <command> [argument]

Commands:
  help                      Show this overview.
  list                      All keys: id, prefix, label, created, last used, state.
  create ["<label>"]        Issue a new key. It is shown once, store it right away.
  revoke <key|prefix|id>    Block a key at once. Its row stays, with the time.
  delete <key|prefix|id>    Remove a key entirely.

A key is sent as:  Authorization: Bearer <key>`

const COLUMNS = 'id, key_prefix, label, created_at, last_used_at, revoked_at'

function fail(message: string): never {
  console.error(message)
  process.exit(1)
}

/** Local date and time, e.g. 2026-10-30 16:58. */
function formatDate(date: Date | null): string {
  return date ? date.toLocaleString('sv-SE', { dateStyle: 'short', timeStyle: 'short' }) : '-'
}

/** Prints rows as plain aligned columns. */
function printTable(rows: Record<string, string | number>[]) {
  const headers = Object.keys(rows[0]!)
  const widths = headers.map((h) => Math.max(h.length, ...rows.map((r) => String(r[h]).length)))
  const line = (cells: string[]) => cells.map((c, i) => c.padEnd(widths[i]!)).join('  ').trimEnd()
  console.log(line(headers))
  console.log(line(widths.map((w) => '-'.repeat(w))))
  for (const row of rows) console.log(line(headers.map((h) => String(row[h]))))
}

/** Rows matching a full key, a shown prefix or an id. */
async function findKeys(ref: string): Promise<ApiKeyRow[]> {
  if (/^\d+$/.test(ref)) {
    return queryMany<ApiKeyRow>(`SELECT ${COLUMNS} FROM api_keys WHERE id = ?`, [ref])
  }
  if (ref.startsWith(API_KEY_PREFIX) && ref.length > 20) {
    return queryMany<ApiKeyRow>(`SELECT ${COLUMNS} FROM api_keys WHERE key_hash = ?`, [
      hashApiKey(ref),
    ])
  }
  // The listing shows the prefix followed by an ellipsis; accept it copied.
  return queryMany<ApiKeyRow>(`SELECT ${COLUMNS} FROM api_keys WHERE key_prefix = ?`, [
    ref.replace(/…$/, ''),
  ])
}

async function findOne(ref: string | undefined): Promise<ApiKeyRow> {
  if (!ref) fail('Name the key: its full value, its prefix or its id (see "list").')
  const rows = await findKeys(ref)
  if (rows.length === 0) fail(`No API key matches "${ref}".`)
  if (rows.length > 1) fail(`"${ref}" matches ${rows.length} keys, use the id from "list".`)
  return rows[0]!
}

async function create(label: string | undefined) {
  const name = label?.trim() || `key ${new Date().toISOString().slice(0, 10)}`
  if (name.length > 100) fail('The label may have at most 100 characters.')

  const { key, prefix, hash } = generateApiKey()
  await execute('INSERT INTO api_keys (key_hash, key_prefix, label) VALUES (?, ?, ?)', [
    hash,
    prefix,
    name,
  ])
  console.log(`Created API key "${name}" (${prefix}…).`)
  console.log('')
  console.log(`  ${key}`)
  console.log('')
  console.log('Store it now, it is not shown again. Send it as: Authorization: Bearer <key>')
}

async function list() {
  const rows = await queryMany<ApiKeyRow>(`SELECT ${COLUMNS} FROM api_keys ORDER BY id`)
  if (rows.length === 0) {
    console.log('No API keys. Issue one with: api-key.sh create "<label>"')
    return
  }
  printTable(
    rows.map((r) => ({
      id:        r.id,
      prefix:    `${r.key_prefix}…`,
      label:     r.label,
      created:   formatDate(r.created_at),
      last_used: formatDate(r.last_used_at),
      state:     r.revoked_at ? `revoked ${formatDate(r.revoked_at)}` : 'active',
    })),
  )
}

async function revoke(ref: string | undefined) {
  const row = await findOne(ref)
  if (row.revoked_at) {
    console.log(`API key ${row.id} "${row.label}" was already revoked on ${formatDate(row.revoked_at)}.`)
    return
  }
  await execute('UPDATE api_keys SET revoked_at = NOW() WHERE id = ?', [row.id])
  console.log(`Revoked API key ${row.id} "${row.label}" (${row.key_prefix}…). It stops working now.`)
}

async function remove(ref: string | undefined) {
  const row = await findOne(ref)
  await execute('DELETE FROM api_keys WHERE id = ?', [row.id])
  console.log(`Deleted API key ${row.id} "${row.label}" (${row.key_prefix}…). It stops working now.`)
}

async function main() {
  const [command, arg] = process.argv.slice(2)
  switch (command) {
    case 'list':
      return list()
    case 'create':
      return create(arg)
    case 'revoke':
      return revoke(arg)
    case 'delete':
      return remove(arg)
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      console.log(HELP)
      return
    default:
      console.error(`Unknown command "${command}".\n`)
      console.error(HELP)
      process.exitCode = 1
  }
}

main()
  .catch((err) => {
    console.error('API key command failed:', (err as Error).message)
    process.exitCode = 1
  })
  .finally(() => closePool())
