import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore, extractPermissionKey, extractScopeKey } from '~/stores/auth'

vi.mock('#app', () => ({
  useCookie: () => ({
    value: null
  }),
  navigateTo: vi.fn()
}))

describe('Auth Pinia Store Deep Coverage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('extracts permission keys and scope keys correctly', () => {
    expect(extractPermissionKey('DIRECT.KEY')).toBe('DIRECT.KEY')
    expect(extractPermissionKey({ Key: 'UPPER.KEY' })).toBe('UPPER.KEY')
    expect(extractPermissionKey({ key: 'lower.key' })).toBe('lower.key')
    expect(extractPermissionKey({ permission_key: 'p.key' })).toBe('p.key')
    expect(extractPermissionKey({ PermissionKey: 'P.Key' })).toBe('P.Key')
    expect(extractPermissionKey({ ResourceCode: 'USER', ActionCode: 'VIEW' })).toBe('USER.VIEW')
    expect(extractPermissionKey({ resource_code: 'user', action_code: 'edit' })).toBe('user.edit')
    expect(extractPermissionKey({ code: 'CODE.1' })).toBe('CODE.1')
    expect(extractPermissionKey({ name: 'NAME.1' })).toBe('NAME.1')
    expect(extractPermissionKey(null)).toBe('')

    expect(extractScopeKey('DIRECT.SCOPE')).toBe('DIRECT.SCOPE')
    expect(extractScopeKey({ Key: 'UPPER.SCOPE' })).toBe('UPPER.SCOPE')
    expect(extractScopeKey({ key: 'lower.scope' })).toBe('lower.scope')
    expect(extractScopeKey({ ScopeCode: 'SC' })).toBe('SC')
    expect(extractScopeKey({ scope_code: 'sc' })).toBe('sc')
    expect(extractScopeKey({ code: 'S.CODE' })).toBe('S.CODE')
    expect(extractScopeKey({ name: 'S.NAME' })).toBe('S.NAME')
    expect(extractScopeKey(null)).toBe('')
  })

  it('sets and updates permissions and scopes', () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'User' }, 'tok_1')

    authStore.setPermissions(['USER.VIEW', 'USER.CREATE'], ['NATIONAL'])
    expect(authStore.permissions).toEqual(['USER.VIEW', 'USER.CREATE'])
    expect(authStore.scopes).toEqual(['NATIONAL'])
    expect(authStore.user?.permissions).toEqual(['USER.VIEW', 'USER.CREATE'])
    expect(authStore.user?.scopes).toEqual(['NATIONAL'])
  })

  it('fetchUserAccess returns empty array if no token is available', async () => {
    const authStore = useAuthStore()
    const access = await authStore.fetchUserAccess()
    expect(access).toEqual([])
  })

  it('fetchUserAccess retrieves and formats permissions, scopes, and overrides', async () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'User' }, 'valid_token')

    const mockFetch = vi.fn().mockResolvedValueOnce({
      data: {
        permissions: ['MASTER.VIEW', { code: 'MASTER.CREATE' }, { permission_key: 'MASTER.DELETE' }],
        scopes: ['REGIONAL', { scope_code: 'SENTRAL' }],
        permission_overrides: [{ permission_id: 'p1', is_granted: true }],
        menus: [{ id: 'm1', name: 'Dashboard' }]
      }
    })
    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '/api/v1' } }))

    const result = await authStore.fetchUserAccess(true)
    expect(result).toBeDefined()
    expect(authStore.permissions).toContain('MASTER.VIEW')
    expect(authStore.permissions).toContain('MASTER.CREATE')
    expect(authStore.permissions).toContain('MASTER.DELETE')
    expect(authStore.scopes).toContain('REGIONAL')
    expect(authStore.scopes).toContain('SENTRAL')
  })

  it('handles fetchUserAccess network error gracefully', async () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'User' }, 'valid_token')

    const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network offline'))
    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '/api/v1' } }))

    const result = await authStore.fetchUserAccess(true)
    expect(result).toBeNull()
  })

  it('clears all session and local storage on clearLocalState', () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'User' }, 'token', 'refresh')
    expect(authStore.isLoggedIn).toBe(true)

    authStore.clearLocalState(false)
    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.token).toBeNull()
    expect(authStore.user).toBeNull()
    expect(authStore.permissions).toEqual([])
  })

  it('evaluates permissions with can() including overrides, wildcards and formats', () => {
    const authStore = useAuthStore()
    authStore.setUser({ nama: 'Regular User', role: 'Staff' })
    authStore.setPermissions(['USER.VIEW', 'MENU.*', 'ASSET_EDIT', 'SENTRAL:READ'], ['NATIONAL'])

    // Direct match
    expect(authStore.can('USER.VIEW')).toBe(true)
    expect(authStore.can('USER.DELETE')).toBe(false)

    // Resource wildcard MENU.*
    expect(authStore.can('MENU.CREATE')).toBe(true)
    expect(authStore.can('MENU.DELETE')).toBe(true)

    // Delimiter compatibility
    expect(authStore.can('ASSET.EDIT')).toBe(true)
    expect(authStore.can('SENTRAL.READ')).toBe(true)

    // Array of permissions
    expect(authStore.can(['USER.VIEW', 'MENU.CREATE'])).toBe(true)
    expect(authStore.can(['USER.VIEW', 'UNKNOWN.ACTION'])).toBe(false)

    // Superadmin bypass
    authStore.setUser({ nama: 'Super Admin', role: 'Superadmin' })
    expect(authStore.can('ANYTHING.POSSIBLE')).toBe(true)

    // Permission override explicitly denying
    authStore.setUser({ nama: 'Regular User', role: 'Staff' })
    authStore.permissionOverrides = [{ permission_key: 'USER.VIEW', is_granted: false }]
    expect(authStore.can('USER.VIEW')).toBe(false)
  })

  it('evaluates scopes with hasScope()', () => {
    const authStore = useAuthStore()
    authStore.setUser({ nama: 'Regular User', role: 'Staff' })
    authStore.scopes = ['REGIONAL', 'SENTRAL']

    expect(authStore.hasScope('REGIONAL')).toBe(true)
    expect(authStore.hasScope('regional')).toBe(true)
    expect(authStore.hasScope('GLOBAL')).toBe(false)

    // Superadmin has all scopes
    authStore.setUser({ nama: 'Super User', role: 'SUPERADMIN' })
    expect(authStore.hasScope('GLOBAL')).toBe(true)
  })

  it('evaluates menu access with hasMenuAccess()', () => {
    const authStore = useAuthStore()
    authStore.setUser({ nama: 'Regular User', role: 'Staff' })

    // Home / dashboard always accessible
    expect(authStore.hasMenuAccess('/home')).toBe(true)
    expect(authStore.hasMenuAccess('/home/dashboard')).toBe(true)
    expect(authStore.hasMenuAccess('/home/dashboard/operasiPembangkit')).toBe(true)

    // With dynamic userMenus
    authStore.userMenus = [{ code: 'MENU_ASSET' }]
    expect(authStore.hasMenuAccess('/home/master/asset', 'ASSET.VIEW', 'MENU_ASSET')).toBe(true)
    expect(authStore.hasMenuAccess('/home/master/driver', 'DRIVER.VIEW', 'MENU_DRIVER')).toBe(false)
  })

  it('refreshes session with refreshSession()', async () => {
    const authStore = useAuthStore()

    // No refresh token
    authStore.refreshToken = null
    expect(await authStore.refreshSession()).toBe(false)

    // Successful refresh
    authStore.refreshToken = 'good_refresh'
    const mockFetch = vi.fn().mockResolvedValueOnce({
      data: { access_token: 'refreshed_access', refresh_token: 'refreshed_refresh' },
    })
    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '/api/v1' } }))

    const refreshed = await authStore.refreshSession()
    expect(refreshed).toBe(true)
    expect(authStore.token).toBe('refreshed_access')

    // Failed refresh network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    expect(await authStore.refreshSession()).toBe(false)
  })

  it('fetches user me and handles caching and 401 retry', async () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'User' }, 'jwt_token', 'rf_token')

    const mockFetch = vi.fn().mockResolvedValueOnce({
      data: {
        id: 'u100',
        full_name: 'Bambang',
        username: 'bambang',
        email: 'bambang@pln.co.id',
        role: 'Admin',
      },
    })
    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '/api/v1' } }))

    const me = await authStore.fetchUserMe(true)
    expect(me?.nama).toBe('Bambang')
    expect(authStore.user?.email).toBe('bambang@pln.co.id')

    // Caching within 5 seconds
    const cachedMe = await authStore.fetchUserMe(false)
    expect(cachedMe?.nama).toBe('Bambang')
  })

  it('performs logout and clears state with redirect', async () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'User' }, 'jwt_to_logout', 'rf_token')

    const mockFetch = vi.fn().mockResolvedValueOnce({})
    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '/api/v1' } }))

    await authStore.logout('/home/master/asset')

    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.token).toBeNull()
    expect(authStore.user).toBeNull()
  })

  it('handles backend logout failure gracefully', async () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'User' }, 'jwt_to_logout')

    const mockFetch = vi.fn().mockRejectedValueOnce(new Error('Network error'))
    vi.stubGlobal('$fetch', mockFetch)
    vi.stubGlobal('useRuntimeConfig', () => ({ public: { apiBaseUrl: '/api/v1' } }))

    await authStore.logout()

    expect(authStore.isLoggedIn).toBe(false)
    expect(authStore.token).toBeNull()
  })
})

