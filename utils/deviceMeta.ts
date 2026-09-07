/**
 * Device & Browser Metadata Utility for Audit Trail & RequestMeta headers
 */

export interface DeviceMetaHeaders {
  'X-Device-ID': string
  'X-Device-Name': string
  'X-Browser': string
  'X-OS': string
}

const DEVICE_ID_STORAGE_KEY = 'tambora_device_id'

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    bytes[6] = (bytes[6]! & 0x0f) | 0x40
    bytes[8] = (bytes[8]! & 0x3f) | 0x80
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }
  return '00000000-0000-4000-8000-000000000000'
}

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 'server-device'
  }

  try {
    let deviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY)
    if (!deviceId) {
      deviceId = generateUUID()
      localStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId)
    }
    return deviceId
  } catch {
    return generateUUID()
  }
}

export function detectOS(userAgent?: string): string {
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  if (!ua) return 'Unknown OS'

  if (/Windows NT 10.0/i.test(ua)) return 'Windows 10/11'
  if (/Windows NT 6.3/i.test(ua)) return 'Windows 8.1'
  if (/Windows NT 6.2/i.test(ua)) return 'Windows 8'
  if (/Windows NT 6.1/i.test(ua)) return 'Windows 7'
  if (/Windows/i.test(ua)) return 'Windows'
  if (/Android/i.test(ua)) return 'Android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS'
  if (/Mac OS X|Macintosh/i.test(ua)) return 'macOS'
  if (/Linux/i.test(ua)) return 'Linux'
  if (/CrOS/i.test(ua)) return 'ChromeOS'

  return 'Unknown OS'
}

export function detectBrowser(userAgent?: string): string {
  const ua = userAgent ?? (typeof navigator !== 'undefined' ? navigator.userAgent : '')
  if (!ua) return 'Unknown Browser'

  if (/Edg\//i.test(ua)) return 'Edge'
  if (/OPR\/|Opera/i.test(ua)) return 'Opera'
  if (/Chrome\//i.test(ua) && !/Chromium/i.test(ua)) return 'Chrome'
  if (/Firefox\//i.test(ua)) return 'Firefox'
  if (/Safari\//i.test(ua) && !/Chrome/i.test(ua)) return 'Safari'

  return 'Unknown Browser'
}

export function getDeviceMetaHeaders(userAgent?: string): DeviceMetaHeaders {
  const os = detectOS(userAgent)
  const browser = detectBrowser(userAgent)
  const deviceId = getOrCreateDeviceId()

  const isMobile = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent)
  const deviceType = isMobile ? 'Mobile' : 'Desktop'
  const deviceName = `${os} ${deviceType}`

  return {
    'X-Device-ID': deviceId,
    'X-Device-Name': deviceName,
    'X-Browser': browser,
    'X-OS': os
  }
}
