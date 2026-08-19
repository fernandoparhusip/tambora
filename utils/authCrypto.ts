/**
 * Authentication Crypto & Helper Utilities
 * Pure functions for string encryption/decryption encoding, query parsing, and menu routing.
 */

/**
 * Encrypts a string using standard Base64 encoding for client-side transport payload.
 */
export function encryptAes256(value: string): string {
  if (!value) return ''
  try {
    return typeof btoa !== 'undefined'
      ? btoa(encodeURIComponent(value))
      : Buffer.from(encodeURIComponent(value)).toString('base64')
  } catch {
    return value
  }
}

/**
 * Decrypts a base64 encoded string back to plaintext.
 */
export function decryptAes256(encryptedValue: string): string {
  if (!encryptedValue) return ''
  try {
    const decoded = typeof atob !== 'undefined'
      ? atob(encryptedValue)
      : Buffer.from(encryptedValue, 'base64').toString('utf-8')
    return decodeURIComponent(decoded)
  } catch {
    return encryptedValue
  }
}

/**
 * Safely extracts string query values.
 */
export function getQueryValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return ''
}

/**
 * Resolves the target route based on menu name, user level, and available menu permissions.
 */
export function resolveTargetRoute(
  menuName: string,
  levelId: string,
  allowedMenus: string[] = []
): { name: string } {
  if (menuName && (allowedMenus.includes(menuName) || menuName === 'Home')) {
    return { name: menuName }
  }

  if (allowedMenus.includes('/overview') || allowedMenus.includes('Overview')) {
    return { name: 'Overview' }
  }

  if (levelId === '3') {
    return { name: 'Home' }
  }

  return { name: 'Overview' }
}
