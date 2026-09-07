import { describe, it, expect } from 'vitest'
import { getDeviceTimezoneName, formatAppDateTime, formatAppDateOnly } from '~/utils/formatDate'

describe('formatDate Utility', () => {
  describe('getDeviceTimezoneName', () => {
    it('returns a valid timezone name string', () => {
      const tz = getDeviceTimezoneName(new Date())
      expect(typeof tz).toBe('string')
      expect(tz.length).toBeGreaterThan(0)
    })

    it('handles null/invalid input by returning fallback WIB', () => {
      const invalid = null as unknown as Date
      expect(getDeviceTimezoneName(invalid)).toBe('WIB')
    })
  })

  describe('formatAppDateTime', () => {
    it('returns "-" for null, undefined, or empty input', () => {
      expect(formatAppDateTime(null)).toBe('-')
      expect(formatAppDateTime(undefined)).toBe('-')
      expect(formatAppDateTime('')).toBe('-')
    })

    it('returns "-" for Go zero date (0001-01-01)', () => {
      expect(formatAppDateTime('0001-01-01T00:00:00Z')).toBe('-')
      expect(formatAppDateTime('0001-01-01 00:00:00')).toBe('-')
    })

    it('returns "-" for invalid date string or year < 1970', () => {
      expect(formatAppDateTime('not-a-valid-date')).toBe('-')
      expect(formatAppDateTime('1960-01-01')).toBe('-')
    })

    it('formats valid date string correctly', () => {
      const formatted = formatAppDateTime('2026-09-07T08:30:00Z', {
        includeTime: true,
        showTimezone: false
      })
      expect(formatted).toContain('2026')
      expect(formatted).toContain('September')
    })

    it('formats valid Date instance with timezone suffix', () => {
      const date = new Date('2026-09-07T08:30:00Z')
      const formatted = formatAppDateTime(date, {
        includeTime: true,
        showTimezone: true
      })
      expect(formatted).toContain('2026')
      expect(typeof formatted).toBe('string')
    })

    it('formats valid timestamp number', () => {
      const timestamp = new Date('2026-09-07T08:30:00Z').getTime()
      const formatted = formatAppDateTime(timestamp, { includeTime: false })
      expect(formatted).toContain('2026')
    })
  })

  describe('formatAppDateOnly', () => {
    it('returns "-" for empty or invalid input', () => {
      expect(formatAppDateOnly(null)).toBe('-')
      expect(formatAppDateOnly(undefined)).toBe('-')
    })

    it('formats date only without time and timezone', () => {
      const formatted = formatAppDateOnly('2026-09-07T12:00:00Z', 'long')
      expect(formatted).toContain('September 2026')
      expect(formatted).not.toContain('pukul')
    })

    it('supports short, medium, and full styles', () => {
      const shortDate = formatAppDateOnly('2026-09-07T12:00:00Z', 'short')
      expect(shortDate).toBeDefined()
      expect(shortDate.length).toBeGreaterThan(0)
    })
  })
})
