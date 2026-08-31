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

    it('returns Unknown OS when UA is empty', () => {
      expect(detectOS('')).toBe('Unknown OS')
    })
  })

  describe('detectBrowser', () => {
    it('detects Edge', () => {
      const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
      expect(detectBrowser(ua)).toBe('Edge')
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
  })
})
