import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { navigateTo } from '#app'
import authMiddleware from '~/middleware/auth.global'

describe('Auth Global Middleware', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('redirects to /login when user is not logged in and accesses protected route', async () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = false

    const to = { path: '/home/master/asset', fullPath: '/home/master/asset' } as any
    await authMiddleware(to, {} as any)

    expect(navigateTo).toHaveBeenCalledWith({
      path: '/login',
      query: { redirect: '/home/master/asset' },
    })
  })

  it('allows access to /login when user is not logged in', async () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = false

    const to = { path: '/login', fullPath: '/login' } as any
    await authMiddleware(to, {} as any)

    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('redirects to /home or redirectUrl when user is logged in and accesses /login', async () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = true

    const to = { path: '/login', query: { redirect: '/home/master/user' } } as any
    await authMiddleware(to, {} as any)

    expect(navigateTo).toHaveBeenCalledWith('/home/master/user')
  })

  it('redirects logged in user to /home by default if no redirect query', async () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = true

    const to = { path: '/login', query: {} } as any
    await authMiddleware(to, {} as any)

    expect(navigateTo).toHaveBeenCalledWith('/home')
  })

  it('checks menu RBAC on client and calls fetchUserMe if permissions are empty', async () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = true
    authStore.token = 'mock-token'
    authStore.user = null
    authStore.permissions = []
    authStore.fetchUserMe = vi.fn().mockResolvedValue({})
    authStore.hasMenuAccess = vi.fn().mockReturnValue(true)

    const to = { path: '/home/master/asset', fullPath: '/home/master/asset' } as any
    await authMiddleware(to, {} as any)

    expect(authStore.fetchUserMe).toHaveBeenCalled()
    expect(authStore.hasMenuAccess).toHaveBeenCalledWith('/home/master/asset')
    expect(navigateTo).not.toHaveBeenCalled()
  })

  it('redirects to /home if menu access is denied', async () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = true
    authStore.token = 'mock-token'
    authStore.user = { id: 'u1' } as any
    authStore.permissions = ['some-perm']
    authStore.hasMenuAccess = vi.fn().mockReturnValue(false)

    const to = { path: '/home/master/forbidden', fullPath: '/home/master/forbidden' } as any
    await authMiddleware(to, {} as any)

    expect(navigateTo).toHaveBeenCalledWith('/home')
  })

  it('handles fetchUserMe failure gracefully when checking route guard', async () => {
    const authStore = useAuthStore()
    authStore.isLoggedIn = true
    authStore.token = 'mock-token'
    authStore.user = null
    authStore.permissions = []
    authStore.fetchUserMe = vi.fn().mockRejectedValue(new Error('Network error'))
    authStore.hasMenuAccess = vi.fn().mockReturnValue(true)

    const to = { path: '/home/master/asset', fullPath: '/home/master/asset' } as any
    await authMiddleware(to, {} as any)

    expect(authStore.fetchUserMe).toHaveBeenCalled()
  })
})
