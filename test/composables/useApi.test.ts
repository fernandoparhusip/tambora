import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from '~/stores/auth'

describe('useApi', () => {
  let createdOptions: any = null

  beforeEach(() => {
    vi.clearAllMocks()
    createdOptions = null
    vi.spyOn($fetch as any, 'create').mockImplementation((opts: any) => {
      createdOptions = opts
      return vi.fn()
    })
  })

  it('creates api instance and attaches Authorization header in onRequest', () => {
    const authStore = useAuthStore()
    authStore.token = 'my-secret-jwt'

    useApi()
    expect(createdOptions).toBeDefined()
    expect(createdOptions.baseURL).toBeDefined()

    // Test onRequest with token
    const reqOptions: any = { headers: new Headers() }
    createdOptions.onRequest({ options: reqOptions })
    expect(reqOptions.headers.get('Authorization')).toBe('Bearer my-secret-jwt')

    // Test onRequest without token
    authStore.token = null
    const reqOptionsEmpty: any = { headers: new Headers() }
    createdOptions.onRequest({ options: reqOptionsEmpty })
    expect(reqOptionsEmpty.headers.get('Authorization')).toBeNull()
  })

  it('handles 401 onResponseError with successful refreshSession', async () => {
    const authStore = useAuthStore()
    authStore.refreshToken = 'valid-refresh-token'
    const refreshSpy = vi.spyOn(authStore, 'refreshSession').mockResolvedValue(true)

    useApi()
    const context: any = {
      request: '/api/v1/master/asset',
      response: { status: 401 },
      error: new Error('Unauthorized'),
    }

    await createdOptions.onResponseError(context)
    expect(refreshSpy).toHaveBeenCalled()
  })

  it('handles 401 onResponseError with failed refreshSession and triggers logout', async () => {
    const authStore = useAuthStore()
    authStore.refreshToken = 'bad-refresh-token'
    vi.spyOn(authStore, 'refreshSession').mockResolvedValue(false)
    const logoutSpy = vi.spyOn(authStore, 'logout').mockResolvedValue(undefined as any)

    useApi()
    const context: any = {
      request: '/api/v1/master/asset',
      response: { status: 401 },
      error: new Error('Unauthorized'),
    }

    await createdOptions.onResponseError(context)
    expect(logoutSpy).toHaveBeenCalled()
  })

  it('ignores 401 on auth endpoints like login/refresh', async () => {
    const authStore = useAuthStore()
    const logoutSpy = vi.spyOn(authStore, 'logout')

    useApi()
    const context: any = {
      request: '/api/v1/auth/login',
      response: { status: 401 },
      error: new Error('Unauthorized'),
    }

    await createdOptions.onResponseError(context)
    expect(logoutSpy).not.toHaveBeenCalled()
  })
})
