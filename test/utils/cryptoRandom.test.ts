import { describe, it, expect } from 'vitest'
import { getSecureRandom, getNextSequenceId } from '~/utils/cryptoRandom'

describe('cryptoRandom utility', () => {
  it('getSecureRandom returns a number between 0 and 1', () => {
    for (let i = 0; i < 20; i++) {
      const val = getSecureRandom()
      expect(typeof val).toBe('number')
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })

  it('getNextSequenceId generates unique sequential IDs with prefix', () => {
    const id1 = getNextSequenceId('test')
    const id2 = getNextSequenceId('test')
    const id3 = getNextSequenceId('dropdown')

    expect(id1).toMatch(/^test-\d+-\d+$/)
    expect(id2).toMatch(/^test-\d+-\d+$/)
    expect(id3).toMatch(/^dropdown-\d+-\d+$/)
    expect(id1).not.toBe(id2)
  })
})
