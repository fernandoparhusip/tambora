import { describe, it, expect } from 'vitest'
import {
  encryptAes256,
  decryptAes256,
  getQueryValue,
  resolveTargetRoute
} from '~/utils/authCrypto'

describe('authCrypto utilities', () => {
  it('should encrypt and decrypt string correctly', () => {
    const original = 'user@pln.co.id'
    const encrypted = encryptAes256(original)
    expect(encrypted).not.toBe(original)
    const decrypted = decryptAes256(encrypted)
    expect(decrypted).toBe(original)
  })

  it('should return empty string on invalid/empty inputs for encrypt/decrypt', () => {
    expect(encryptAes256('')).toBe('')
    expect(decryptAes256('')).toBe('')
  })

  it('should parse query parameters correctly', () => {
    expect(getQueryValue('token_123')).toBe('token_123')
    expect(getQueryValue(['token_abc', 'token_def'])).toBe('token_abc')
    expect(getQueryValue(null)).toBe('')
    expect(getQueryValue(undefined)).toBe('')
  })

  it('should resolve target route properly', () => {
    expect(resolveTargetRoute('Home', '1', [])).toEqual({ name: 'Home' })
    expect(resolveTargetRoute('Overview', '2', ['Overview'])).toEqual({ name: 'Overview' })
    expect(resolveTargetRoute('', '3', [])).toEqual({ name: 'Home' })
    expect(resolveTargetRoute('', '1', [])).toEqual({ name: 'Overview' })
  })
})
