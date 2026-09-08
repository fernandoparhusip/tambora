import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  detectOS,
  detectBrowser,
  getOrCreateDeviceId,
  getDeviceMetaHeaders
} from '~/utils/deviceMeta'

describe('deviceMeta Utility', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  describe('detectOS', () => {
    it('detects Windows 10/11', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      expect(detectOS(ua)).toBe('Windows 10/11')
    })

    it('detects Windows 8.1', () => {
      const ua = 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36'
      expect(detectOS(ua)).toBe('Windows 8.1')
    })

    it('detects Windows 8', () => {
      const ua = 'Mozilla/5.0 (Windows NT 6.2; Win64; x64) AppleWebKit/537.36'
      expect(detectOS(ua)).toBe('Windows 8')
    })

    it('detects Windows 7', () => {
      const ua = 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36'
      expect(detectOS(ua)).toBe('Windows 7')
    })

    it('detects generic Windows', () => {
      const ua = 'Mozilla/5.0 (Windows NT 5.1; Win32; x86) AppleWebKit/537.36'
      expect(detectOS(ua)).toBe('Windows')
    })

    it('detects macOS', () => {
      const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      expect(detectOS(ua)).toBe('macOS')
    })

    it('detects Linux', () => {
      const ua = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      expect(detectOS(ua)).toBe('Linux')
    })

    it('detects Android', () => {
      const ua = 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36'
      expect(detectOS(ua)).toBe('Android')
    })

    it('detects iOS', () => {
      const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15'
      expect(detectOS(ua)).toBe('iOS')
    })

    it('detects ChromeOS', () => {
      const ua = 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36'
      expect(detectOS(ua)).toBe('ChromeOS')
    })

    it('returns Unknown OS when UA is empty', () => {
      expect(detectOS('')).toBe('Unknown OS')
    })

    it('uses navigator.userAgent when no UA argument given', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        writable: true, configurable: true,
      })
      expect(detectOS()).toBe('Windows 10/11')
    })
  })

  describe('detectBrowser', () => {
    it('detects Edge', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      expect(detectBrowser(ua)).toBe('Edge')
    })

    it('detects Opera (OPR)', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0'
      expect(detectBrowser(ua)).toBe('Opera')
    })

    it('detects Opera (legacy)', () => {
      const ua = 'Opera/9.80 (Windows NT 6.1; WOW64) Presto/2.12.388 Version/12.18'
      expect(detectBrowser(ua)).toBe('Opera')
    })

    it('detects Chrome', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      expect(detectBrowser(ua)).toBe('Chrome')
    })

    it('detects Firefox', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0'
      expect(detectBrowser(ua)).toBe('Firefox')
    })

    it('detects Safari', () => {
      const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15'
      expect(detectBrowser(ua)).toBe('Safari')
    })

    it('returns Unknown Browser when UA is empty', () => {
      expect(detectBrowser('')).toBe('Unknown Browser')
    })
  })

  describe('getOrCreateDeviceId', () => {
    it('generates and persists UUID in localStorage', () => {
      expect(localStorage.getItem('tambora_device_id')).toBeNull()

      const deviceId = getOrCreateDeviceId()
      expect(deviceId).toBeDefined()
      expect(deviceId.length).toBeGreaterThan(10)
      expect(localStorage.getItem('tambora_device_id')).toBe(deviceId)

      // Next call returns the same persistent deviceId
      const deviceId2 = getOrCreateDeviceId()
      expect(deviceId2).toBe(deviceId)
    })

    it('returns existing deviceId from localStorage', () => {
      localStorage.setItem('tambora_device_id', 'existing-device-uuid')
      const deviceId = getOrCreateDeviceId()
      expect(deviceId).toBe('existing-device-uuid')
    })

    it('falls back to generateUUID when localStorage.getItem throws', () => {
      vi.spyOn(localStorage, 'getItem').mockImplementationOnce(() => {
        throw new Error('localStorage blocked')
      })
      const deviceId = getOrCreateDeviceId()
      expect(deviceId).toBeTruthy()
      expect(deviceId.length).toBeGreaterThan(5)
      vi.restoreAllMocks()
    })
  })

  describe('getDeviceMetaHeaders', () => {
    it('returns all 4 required RequestMeta headers', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      const headers = getDeviceMetaHeaders(ua)

      expect(headers).toHaveProperty('X-Device-ID')
      expect(headers).toHaveProperty('X-Device-Name')
      expect(headers).toHaveProperty('X-Browser')
      expect(headers).toHaveProperty('X-OS')

      expect(headers['X-OS']).toBe('Windows 10/11')
      expect(headers['X-Browser']).toBe('Edge')
      expect(headers['X-Device-Name']).toBe('Windows 10/11 Desktop')
      expect(headers['X-Device-ID']).toBeTruthy()
    })

    it('detects Mobile device type from navigator.userAgent', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: { userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 Mobile Safari/537.36' },
        writable: true, configurable: true,
      })
      const headers = getDeviceMetaHeaders('Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36')
      expect(headers['X-Device-Name']).toContain('Mobile')
    })
  })
})
