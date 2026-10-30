import { describe, expect, it, vi } from 'vitest'

vi.mock('./db', () => ({ queryOne: vi.fn(async () => null), execute: vi.fn() }))

import { API_KEY_FORMAT, bearerKey, findActiveApiKey, generateApiKey, hashApiKey } from './apiKeys'
import { queryOne } from './db'

describe('API keys', () => {
  it('generates keys in the expected format and stores only their hash', async () => {
    const { key, prefix, hash } = await generateApiKey()
    expect(key).toMatch(API_KEY_FORMAT)
    expect(prefix).toBe(key.slice(0, 13))
    expect(hash).toMatch(/^[0-9a-f]{64}$/)
    expect(hash).not.toContain(key.slice(5, 15))
    expect(await hashApiKey(key)).toBe(hash)
  })

  it('hashes different keys differently', async () => {
    const a = await generateApiKey()
    const b = await generateApiKey()
    expect(a.hash).not.toBe(b.hash)
  })

  it('turns down a malformed key without hashing or asking the database', async () => {
    vi.mocked(queryOne).mockClear()
    expect(await findActiveApiKey('mskp_short')).toBeNull()
    expect(await findActiveApiKey('Basic abc')).toBeNull()
    expect(await findActiveApiKey('mskp_' + 'a'.repeat(44))).toBeNull()
    expect(queryOne).not.toHaveBeenCalled()
  })

  it('reads the key from a Bearer header', () => {
    const headers = (value: string | null) => ({ get: () => value })
    expect(bearerKey(headers(null))).toBeNull()
    expect(bearerKey(headers('Bearer mskp_x'))).toBe('mskp_x')
    expect(bearerKey(headers('Basic abc'))).toBe('Basic abc')
  })
})
