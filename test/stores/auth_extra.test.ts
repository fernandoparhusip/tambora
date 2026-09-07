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

  it('fetchUserAccess returns null if no token is available', async () => {
    const authStore = useAuthStore()
    const access = await authStore.fetchUserAccess()
    expect(access).toBeNull()
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
})
