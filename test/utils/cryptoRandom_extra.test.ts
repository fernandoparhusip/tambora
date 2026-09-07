import { describe, it, expect } from 'vitest'
import { getSecureRandom, getNextSequenceId } from '~/utils/cryptoRandom'

describe('cryptoRandom Extended Coverage', () => {
  it('getNextSequenceId uses default prefix "id"', () => {
    const id = getNextSequenceId()
    expect(id).toMatch(/^id-\d+-\d+$/)
  })

  it('getNextSequenceId generates strictly increasing IDs', () => {
    const id1 = getNextSequenceId('seq')
    const id2 = getNextSequenceId('seq')
    const counter1 = parseInt(id1.split('-').pop()!, 10)
    const counter2 = parseInt(id2.split('-').pop()!, 10)
    expect(counter2).toBeGreaterThan(counter1)
  })

  it('getSecureRandom returns different values on multiple calls', () => {
    const values = new Set<number>()
    for (let i = 0; i < 50; i++) {
      values.add(getSecureRandom())
    }
    expect(values.size).toBeGreaterThan(1)
  })

  it('getSecureRandom returns a value in range [0, 1)', () => {
    for (let i = 0; i < 100; i++) {
      const val = getSecureRandom()
      expect(val).toBeGreaterThanOrEqual(0)
      expect(val).toBeLessThan(1)
    }
  })

  it('getNextSequenceId includes timestamp', () => {
    const before = Date.now()
    const id = getNextSequenceId('ts')
    const after = Date.now()
    const parts = id.split('-')
    const ts = parseInt(parts[1]!, 10)
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })

  it('getNextSequenceId with empty prefix', () => {
    const id = getNextSequenceId('')
    expect(id).toMatch(/^-\d+-\d+$/)
  })

  it('getNextSequenceId with special characters in prefix', () => {
    const id = getNextSequenceId('field_name')
    expect(id).toMatch(/^field_name-\d+-\d+$/)
  })
})
