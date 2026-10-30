import { describe, expect, it } from 'vitest'
import { checkFormStamp, issueFormStamp, MAX_FORM_AGE_MS, MIN_FILL_MS } from './formStamp'

const T0 = 1_790_000_000_000

describe('form stamp', () => {
  it('accepts a stamp once a person could have filled the form', () => {
    expect(checkFormStamp(issueFormStamp(T0), T0 + MIN_FILL_MS)).toBe('ok')
  })

  it('turns down a form sent too quickly', () => {
    expect(checkFormStamp(issueFormStamp(T0), T0 + MIN_FILL_MS - 1)).toBe('too-fast')
  })

  it('turns down a page left open too long', () => {
    expect(checkFormStamp(issueFormStamp(T0), T0 + MAX_FORM_AGE_MS + 1)).toBe('expired')
  })

  it('turns down a stamp with a forged time', () => {
    const [, signature] = issueFormStamp(T0).split('.')
    expect(checkFormStamp(`${T0 - 60_000}.${signature}`, T0 + 5_000)).toBe('invalid')
  })

  it('turns down missing and malformed stamps', () => {
    expect(checkFormStamp(undefined, T0)).toBe('invalid')
    expect(checkFormStamp('', T0)).toBe('invalid')
    expect(checkFormStamp('123.abc', T0)).toBe('invalid')
    expect(checkFormStamp({ stamp: 1 }, T0)).toBe('invalid')
  })
})
