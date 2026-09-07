import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'



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

  it('should reset state on logout', async () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'Admin User', role: 'Admin' }, 'token_123', 'refresh_123')
    expect(authStore.isLoggedIn).toBe(true)

    await authStore.logout()
    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.user).toBeNull()
    expect(authStore.token).toBeNull()
    expect(authStore.refreshToken).toBeNull()
  })

  it('should return false when refreshSession is called without refreshToken', async () => {
    const authStore = useAuthStore()
    const result = await authStore.refreshSession()
    expect(result).toBe(false)
  })

  it('should auto-logout and navigate to login when fetchUserMe gets 401 and refresh fails', async () => {
    const { navigateTo } = await import('#app')
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'User', role: 'Staff' }, 'expired_token')

    // Mock global $fetch to simulate 401
    const mockFetch = vi.fn().mockRejectedValue({
      status: 401,
      statusCode: 401,
      message: 'invalid access token'
    })
    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '/api/v1' } }))

    await authStore.fetchUserMe()

    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.token).toBeNull()
    expect(navigateTo).toHaveBeenCalledWith(expect.stringContaining('/login'))

    vi.unstubAllGlobals()
  })
})
