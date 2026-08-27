import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'

// Mock Nuxt runtime variables
vi.mock('#app', () => ({
  useCookie: () => ({
    value: null
  }),
  navigateTo: vi.fn()
}))

describe('Auth Pinia Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize with default logged-out states', () => {
    const authStore = useAuthStore()
    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.user).toBeNull()
  })

  it('should update user with setUser', () => {
    const authStore = useAuthStore()
    authStore.setUser({ nama: 'Updated User', role: 'Staff', email: 'staff@example.com' })
    expect(authStore.user?.nama).toBe('Updated User')
    expect(authStore.user?.role).toBe('Staff')
  })

  it('should set error and message states', () => {
    const authStore = useAuthStore()
    authStore.setError(true)
    authStore.setMessage('Test error message')
    expect(authStore.isError).toBe(true)
    expect(authStore.message).toBe('Test error message')
  })

  it('should setSession correctly with tokens', () => {
    const authStore = useAuthStore()
    authStore.setSession(
      { nama: 'Test User', role: 'Operator', level_id: '2' },
      'test_access_token',
      'test_refresh_token'
    )
    expect(authStore.isLoggedIn).toBe(true)
    expect(authStore.token).toBe('test_access_token')
    expect(authStore.refreshToken).toBe('test_refresh_token')
    expect(authStore.user?.nama).toBe('Test User')
  })

  it('should update tokens with setTokens', () => {
    const authStore = useAuthStore()
    authStore.setTokens('new_access_token', 'new_refresh_token')
    expect(authStore.token).toBe('new_access_token')
    expect(authStore.refreshToken).toBe('new_refresh_token')
  })

  it('should reset state on logout', () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'Admin User', role: 'Admin' }, 'token_123', 'refresh_123')
    expect(authStore.isLoggedIn).toBe(true)

    authStore.logout()
    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.refreshToken).toBeNull()
  })
})
