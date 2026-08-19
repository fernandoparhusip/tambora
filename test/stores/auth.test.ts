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

  it('should reject login for invalid credentials', () => {
    const authStore = useAuthStore()
    const success = authStore.login('admin', 'wrong_pass')
    expect(success).toBe(false)
    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.user).toBeNull()
  })

  it('should log in successfully for valid credentials', () => {
    const authStore = useAuthStore()
    const success = authStore.login('admin', 'admin123')
    expect(success).toBe(true)
    expect(authStore.isLoggedIn).toBe(true)
    expect(authStore.user?.nama).toBe('Admin PLN')
    expect(authStore.user?.role).toBe('Admin')
  })

  it('should setSession correctly', () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'Test User', role: 'Operator', level_id: '2' }, 'test_token')
    expect(authStore.isLoggedIn).toBe(true)
    expect(authStore.token).toBe('test_token')
    expect(authStore.user).toEqual({ nama: 'Test User', role: 'Operator', level_id: '2' })
  })

  it('should reset state on logout', () => {
    const authStore = useAuthStore()
    authStore.login('admin', 'admin123')
    expect(authStore.isLoggedIn).toBe(true)

    authStore.logout()
    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.user).toBeNull()
  })
})
