import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuth } from '~/composables/useAuth'
import { useAuthStore } from '~/stores/auth'

const mockFetch = () => vi.mocked($fetch) as any

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('performs login successfully and stores session', async () => {
    const auth = useAuth()
    const authStore = useAuthStore()

    const mockResponse = {
      data: {
        access_token: 'fake-access-token',
        refresh_token: 'fake-refresh-token',
        user: {
          id: 'u1',
          full_name: 'Budi Test',
          username: 'buditest',
          email: 'budi@pln.co.id',
          role: 'Admin',
          roles: ['Admin'],
          permissions: ['read:asset'],
          scopes: ['global'],
        },
      },
    }

    mockFetch().mockImplementation(async (url: any) => {
      if (String(url).includes('/auth/login')) {
        return mockResponse as any
      }
      if (String(url).includes('/auth/me')) {
        return {
          data: {
            id: 'u1',
            full_name: 'Budi Test',
            username: 'buditest',
            email: 'budi@pln.co.id',
          },
        } as any
      }
      return { data: [] } as any
    })

    const res = await auth.login({ email: 'budi@pln.co.id', password: 'password123' })
    expect(res).toEqual(mockResponse)
    expect(authStore.token).toBe('fake-access-token')
    expect(authStore.refreshToken).toBe('fake-refresh-token')
    expect(authStore.user?.nama).toBe('Budi Test')
  })

  it('handles login failure and sets error message', async () => {
    const auth = useAuth()
    mockFetch().mockRejectedValueOnce({
      data: { message: 'Invalid credentials' },
    })

    await expect(
      auth.login({ email: 'wrong@pln.co.id', password: 'wrong' }),
    ).rejects.toThrow()
    expect(auth.errorMessage.value).toBeDefined()
    expect(auth.loading.value).toBe(false)
  })

  it('refreshes token successfully and handles failure', async () => {
    const auth = useAuth()
    const authStore = useAuthStore()

    // No refresh token available
    authStore.refreshToken = null
    const resNoToken = await auth.refreshToken()
    expect(resNoToken).toBeNull()

    // Successful refresh
    authStore.refreshToken = 'valid-refresh'
    mockFetch().mockResolvedValueOnce({
      data: { access_token: 'new-token', refresh_token: 'new-refresh' },
    } as any)

    const resSuccess = await auth.refreshToken()
    expect(resSuccess).toBe('new-token')
    expect(authStore.token).toBe('new-token')

    // Failed refresh calls logout
    const logoutSpy = vi.spyOn(authStore, 'logout').mockResolvedValue(undefined as any)
    mockFetch().mockRejectedValueOnce(new Error('Refresh expired'))
    const resFail = await auth.refreshToken('expired-token')
    expect(resFail).toBeNull()
    expect(logoutSpy).toHaveBeenCalled()
  })

  it('handles forgotPassword, unlockUser, getSSOUrl, and verifyRedirectToken', async () => {
    const auth = useAuth()

    // forgotPassword success
    mockFetch().mockResolvedValueOnce({ message: 'Email sent' } as any)
    const fpSuccess = await auth.forgotPassword({ email: 'test@pln.co.id' })
    expect(fpSuccess.message).toBe('Email sent')

    // forgotPassword error fallback
    mockFetch().mockRejectedValueOnce(new Error('Network error'))
    const fpFallback = await auth.forgotPassword({ email: 'test@pln.co.id' })
    expect(fpFallback.message).toContain('Instruksi reset password')

    // unlockUser success
    mockFetch().mockResolvedValueOnce({ message: 'User unlocked' } as any)
    const ulSuccess = await auth.unlockUser({ email: 'test@pln.co.id' })
    expect(ulSuccess.message).toBe('User unlocked')

    // unlockUser error fallback
    mockFetch().mockRejectedValueOnce(new Error('Failed'))
    const ulFallback = await auth.unlockUser({ email: 'test@pln.co.id' })
    expect(ulFallback.message).toContain('Akun berhasil dibuka')

    // getSSOUrl fallback
    mockFetch().mockRejectedValueOnce(new Error('Failed'))
    const sso = await auth.getSSOUrl()
    expect(sso.data).toBe('https://iam.pln.co.id')

    // verifyRedirectToken
    mockFetch().mockResolvedValueOnce({ status: true } as any)
    const verifyRes = await auth.verifyRedirectToken({ token: 'sso-tok' })
    expect(verifyRes.status).toBe(true)

    // logout
    const authStore = useAuthStore()
    const logoutSpy = vi.spyOn(authStore, 'logout').mockResolvedValue(undefined as any)
    await auth.logout()
    expect(logoutSpy).toHaveBeenCalled()
  })
})
