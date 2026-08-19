import { describe, it, expect } from 'vitest'
import { formatCurrency, formatNumber, formatPercent, formatCompact } from '~/utils/formatNumber'

describe('formatNumber utility helpers', () => {
  describe('formatCurrency', () => {
    it('should format numbers to IDR currency format', () => {
      const cleanOutput = formatCurrency(15000).replace(/\s/g, ' ')
      expect(cleanOutput).toContain('Rp')
      expect(cleanOutput).toContain('15.000')
    })

    it('should handle null, undefined, or NaN gracefully', () => {
      expect(formatCurrency(null).replace(/\s/g, ' ')).toBe('Rp 0')
      expect(formatCurrency(undefined).replace(/\s/g, ' ')).toBe('Rp 0')
      expect(formatCurrency(NaN).replace(/\s/g, ' ')).toBe('Rp 0')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with decimal grouping', () => {
      expect(formatNumber(15000)).toBe('15.000')
      expect(formatNumber(1234.56)).toBe('1.234,56')
    })

    it('should handle invalid entries gracefully', () => {
      expect(formatNumber(null)).toBe('0')
      expect(formatNumber(undefined)).toBe('0')
      expect(formatNumber(NaN)).toBe('0')
    })
  })

  describe('formatPercent', () => {
    it('should append percent sign and use decimal formatting', () => {
      expect(formatPercent(12.5)).toContain('12,5%')
      expect(formatPercent(0.55)).toContain('0,55%') 
    })

    it('should handle invalid entries gracefully', () => {
      expect(formatPercent(null)).toBe('0%')
      expect(formatPercent(undefined)).toBe('0%')
    })
  })

  describe('formatCompact', () => {
    it('should format large values to Indonesian shorthand', () => {
      const millionClean = formatCompact(15000000).replace(/\s/g, ' ')
      const billionClean = formatCompact(12000000000).replace(/\s/g, ' ')
      
      expect(millionClean).toBe('15 jt')
      expect(billionClean).toBe('12 M')
    })

    it('should handle invalid entries gracefully', () => {
      expect(formatCompact(null)).toBe('0')
      expect(formatCompact(undefined)).toBe('0')
    })
  })
})
