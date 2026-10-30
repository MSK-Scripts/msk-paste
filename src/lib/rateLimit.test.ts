import { describe, expect, it } from 'vitest'
import { getClientIp } from './rateLimit'

function headers(values: Record<string, string>) {
  return { get: (name: string) => values[name.toLowerCase()] ?? null }
}

describe('getClientIp', () => {
  it('takes X-Real-IP, which Apache sets from the connection', () => {
    expect(getClientIp(headers({ 'x-real-ip': '203.0.113.7' }))).toBe('203.0.113.7')
    expect(getClientIp(headers({ 'x-real-ip': '2a0a:4cc0::1' }))).toBe('2a0a:4cc0::1')
  })

  it('ignores CF-Connecting-IP, which any client can send', () => {
    const h = headers({ 'cf-connecting-ip': '198.51.100.1', 'x-real-ip': '203.0.113.7' })
    expect(getClientIp(h)).toBe('203.0.113.7')
  })

  it('takes the last X-Forwarded-For entry, the one Apache appended', () => {
    const h = headers({ 'x-forwarded-for': '198.51.100.1, 203.0.113.7' })
    expect(getClientIp(h)).toBe('203.0.113.7')
  })

  it('falls back to X-Forwarded-For when X-Real-IP is not an address', () => {
    const h = headers({ 'x-real-ip': '(null)', 'x-forwarded-for': '198.51.100.1, 203.0.113.7' })
    expect(getClientIp(h)).toBe('203.0.113.7')
  })

  it('returns 0.0.0.0 without a usable header', () => {
    expect(getClientIp(headers({}))).toBe('0.0.0.0')
    expect(getClientIp(headers({ 'x-forwarded-for': 'garbage' }))).toBe('0.0.0.0')
  })
})
