import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useCookie, navigateTo } from '#app'
import { useToast } from 'primevue/usetoast'
import { menuItems } from '~/config/navigation'
import { resetIdleState } from '~/composables/useIdleTimer'

export interface PermissionOverride {
  permission_key: string
  is_granted: boolean
}

export interface UserSession {
  id?: string
  nama: string
  full_name?: string
  username?: string
  role?: string
  akses_grup?: string
  email?: string
  level_id?: string
  organization?: string
  nip?: string
  prnr?: string
  status?: number | string
  roles?: string[]
  permissions?: string[]
  scopes?: string[]
  permission_overrides?: PermissionOverride[]
  menus?: any[]
}

export interface AuthSession {
  isLoggedIn: boolean
  user: UserSession | null
  token?: string
  refreshToken?: string
  permissions?: string[]
  scopes?: string[]
  menus?: any[]
}

export const extractPermissionKey = (p: any): string => {
  if (!p) return ''
  if (typeof p === 'string') return p
  if (p.Key) return String(p.Key)
  if (p.key) return String(p.key)
  if (p.permission_key) return String(p.permission_key)
  if (p.PermissionKey) return String(p.PermissionKey)
  if (p.ResourceCode && p.ActionCode) return `${p.ResourceCode}.${p.ActionCode}`
  if (p.resource_code && p.action_code) return `${p.resource_code}.${p.action_code}`
  if (p.code) return String(p.code)
  if (p.name) return String(p.name)
  return ''
}

export const extractScopeKey = (s: any): string => {
  if (!s) return ''
  if (typeof s === 'string') return s
  if (s.Key) return String(s.Key)
  if (s.key) return String(s.key)
  if (s.ScopeCode) return String(s.ScopeCode)
  if (s.scope_code) return String(s.scope_code)
  if (s.code) return String(s.code)
  if (s.name) return String(s.name)
  return ''
}

const AUTH_CHANNEL_NAME = 'tambora_auth_channel'

export const useAuthStore = defineStore('auth', () => {
  // 24 Hours Session Cookie (Standard 1 Shift)
  const authCookie = useCookie<AuthSession | null>('auth-session', {
    maxAge: 60 * 60 * 24,
    path: '/'
  })
  const accessTokenCookie = useCookie<string | null>('access_token', {
    maxAge: 60 * 60 * 24,
    path: '/'
  })
  const refreshTokenCookie = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24,
    path: '/'
  })

  const storedToken = import.meta.client ? localStorage.getItem('token') : null
  const storedRefreshToken = import.meta.client ? localStorage.getItem('refresh_token') : null

  let storedUser: UserSession | null = null
  let storedPermissions: string[] = []
  let storedScopes: string[] = []
  let storedMenus: any[] = []

  if (import.meta.client) {
    try {
      const u = localStorage.getItem('user')
      if (u) storedUser = JSON.parse(u)
      const p = localStorage.getItem('permissions')
      if (p) storedPermissions = JSON.parse(p)
      const s = localStorage.getItem('scopes')
      if (s) storedScopes = JSON.parse(s)
      const m = localStorage.getItem('menus')
      if (m) storedMenus = JSON.parse(m)
    } catch {
      // Graceful fallback on JSON parse error
    }
  }

  const isLoggedIn = ref(authCookie.value?.isLoggedIn ?? (!!accessTokenCookie.value || !!storedToken))
  const user = ref<UserSession | null>(authCookie.value?.user || storedUser || null)
  const token = ref<string | null>(authCookie.value?.token || accessTokenCookie.value || storedToken || null)
  const refreshToken = ref<string | null>(authCookie.value?.refreshToken || refreshTokenCookie.value || storedRefreshToken || null)
  const permissions = ref<string[]>(
    (authCookie.value?.permissions && authCookie.value.permissions.length > 0)
      ? authCookie.value.permissions
      : (storedPermissions.length > 0 ? storedPermissions : (authCookie.value?.user?.permissions || []))
  )
  const scopes = ref<string[]>(
    (authCookie.value?.scopes && authCookie.value.scopes.length > 0)
      ? authCookie.value.scopes
      : (storedScopes.length > 0 ? storedScopes : (authCookie.value?.user?.scopes || []))
  )
  const permissionOverrides = ref<PermissionOverride[]>(authCookie.value?.user?.permission_overrides || [])
  const userMenus = ref<any[]>(
    (authCookie.value?.menus && authCookie.value.menus.length > 0)
      ? authCookie.value.menus
      : (storedMenus.length > 0 ? storedMenus : (authCookie.value?.user?.menus || []))
  )
  const errorMessage = ref('')
  const message = ref('')
  const isError = ref(false)

  // In the browser, ALWAYS enforce relative /api/v1 to route through Nuxt's internal proxy (prevents CORS on VPS)
  const getResolvedApiBaseUrl = (): string => {
    const config = useRuntimeConfig()
    const configured = config.public?.apiBaseUrl
    if (import.meta.client && typeof configured === 'string' && configured.startsWith('http')) {
      return '/api/v1'
    }
    return configured?.replace(/\/$/, '') || '/api/v1'
  }


  // Cross-Tab BroadcastChannel setup
  let authChannel: BroadcastChannel | null = null
  if (import.meta.client && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    authChannel = new BroadcastChannel(AUTH_CHANNEL_NAME)
    authChannel.onmessage = (event) => {
      if (event.data?.type === 'LOGOUT') {
        clearLocalState(false)
        navigateTo('/login')
      } else if (event.data?.type === 'SESSION_UPDATE' && event.data?.session) {
        token.value = event.data.session.token
        user.value = event.data.session.user
        isLoggedIn.value = true
      }
    }
  }

  const setSession = (
    sessionUser: UserSession,
    sessionToken: string = 'token_dummy_123',
    sessionRefreshToken: string = ''
  ) => {
    isLoggedIn.value = true
    user.value = sessionUser
    token.value = sessionToken
    if (sessionRefreshToken) {
      refreshToken.value = sessionRefreshToken
    }
    if (sessionUser.permissions) {
      permissions.value = (sessionUser.permissions || []).map((p: any) => extractPermissionKey(p)).filter(Boolean)
    }
    if (sessionUser.scopes) {
      scopes.value = (sessionUser.scopes || []).map((s: any) => extractScopeKey(s)).filter(Boolean)
    }
    if (sessionUser.permission_overrides) {
      permissionOverrides.value = sessionUser.permission_overrides
    }
    if (sessionUser.menus) {
      userMenus.value = sessionUser.menus
    }

    authCookie.value = {
      isLoggedIn: true,
      user: sessionUser,
      token: sessionToken,
      refreshToken: sessionRefreshToken || refreshToken.value || '',
      permissions: permissions.value,
      scopes: scopes.value,
      menus: userMenus.value
    }

    accessTokenCookie.value = sessionToken
    if (sessionRefreshToken) {
      refreshTokenCookie.value = sessionRefreshToken
    }

    if (import.meta.client) {
      localStorage.setItem('token', sessionToken)
      if (sessionRefreshToken) {
        localStorage.setItem('refresh_token', sessionRefreshToken)
      }
      localStorage.setItem('user', JSON.stringify(sessionUser))
      localStorage.setItem('permissions', JSON.stringify(permissions.value))
      localStorage.setItem('scopes', JSON.stringify(scopes.value))
      localStorage.setItem('menus', JSON.stringify(userMenus.value))

      // Broadcast session update to other tabs
      try {
        authChannel?.postMessage({
          type: 'SESSION_UPDATE',
          session: { token: sessionToken, user: sessionUser }
        })
      } catch {
        // Ignore channel errors
      }
    }
  }

  const setTokens = (newAccessToken: string, newRefreshToken?: string) => {
    token.value = newAccessToken
    accessTokenCookie.value = newAccessToken
    if (newRefreshToken) {
      refreshToken.value = newRefreshToken
      refreshTokenCookie.value = newRefreshToken
    }
    if (authCookie.value) {
      authCookie.value = {
        ...authCookie.value,
        token: newAccessToken,
        ...(newRefreshToken ? { refreshToken: newRefreshToken } : {})
      }
    }
    if (import.meta.client) {
      localStorage.setItem('token', newAccessToken)
      if (newRefreshToken) {
        localStorage.setItem('refresh_token', newRefreshToken)
      }
    }
  }

  const setUser = (updatedUser: UserSession) => {
    user.value = updatedUser
    if (updatedUser.permissions) {
      permissions.value = (updatedUser.permissions || []).map((p: any) => extractPermissionKey(p)).filter(Boolean)
    }
    if (updatedUser.scopes) {
      scopes.value = (updatedUser.scopes || []).map((s: any) => extractScopeKey(s)).filter(Boolean)
    }
    if (updatedUser.permission_overrides) {
      permissionOverrides.value = updatedUser.permission_overrides
    }
    if (updatedUser.menus) {
      userMenus.value = updatedUser.menus
    }
    if (authCookie.value) {
      authCookie.value.user = updatedUser
      authCookie.value.permissions = permissions.value
      authCookie.value.scopes = scopes.value
      authCookie.value.menus = userMenus.value
    }
    if (import.meta.client) {
      localStorage.setItem('user', JSON.stringify(updatedUser))
      localStorage.setItem('permissions', JSON.stringify(permissions.value))
      localStorage.setItem('scopes', JSON.stringify(scopes.value))
      localStorage.setItem('menus', JSON.stringify(userMenus.value))
    }
  }

  const setPermissions = (perms: string[], scps?: string[]) => {
    permissions.value = perms
    if (scps) {
      scopes.value = scps
    }
    if (user.value) {
      user.value.permissions = perms
      if (scps) user.value.scopes = scps
    }
    if (authCookie.value) {
      authCookie.value.permissions = perms
      if (scps) authCookie.value.scopes = scps
    }
    if (import.meta.client) {
      localStorage.setItem('permissions', JSON.stringify(perms))
      if (scps) localStorage.setItem('scopes', JSON.stringify(scps))
    }
  }

  let isFetchingAccess: Promise<any> | null = null
  let lastFetchedAccess = 0

  const fetchUserAccess = async (force: boolean = false) => {
    if (!token.value) return null
    const now = Date.now()
    if (!force && isFetchingAccess) return isFetchingAccess
    if (!force && now - lastFetchedAccess < 5000 && permissions.value.length > 0) {
      return { permissions: permissions.value, scopes: scopes.value }
    }

    isFetchingAccess = (async () => {
      try {
        const baseUrl = getResolvedApiBaseUrl()
        const res = await $fetch<{ data?: any; permissions?: string[]; scopes?: string[]; menus?: any[] }>(
          `${baseUrl}/auth/access`,
          {
            headers: {
              Authorization: `Bearer ${token.value}`
            }
          }
        )
        const accessData = res?.data || res
        if (accessData) {
          const rawPerms = Array.isArray(accessData.permissions)
            ? accessData.permissions
            : Array.isArray(accessData.Permissions)
            ? accessData.Permissions
            : Array.isArray(accessData.data?.permissions)
            ? accessData.data.permissions
            : Array.isArray(accessData.data?.Permissions)
            ? accessData.data.Permissions
            : Array.isArray(accessData.data)
            ? accessData.data
            : Array.isArray(accessData)
            ? accessData
            : []
          const perms: string[] = rawPerms.map((p: any) => extractPermissionKey(p)).filter(Boolean)

          const rawScps = Array.isArray(accessData.scopes)
            ? accessData.scopes
            : Array.isArray(accessData.Scopes)
            ? accessData.Scopes
            : Array.isArray(accessData.data?.scopes)
            ? accessData.data.scopes
            : Array.isArray(accessData.data?.Scopes)
            ? accessData.data.Scopes
            : []
          const scps: string[] = rawScps.map((s: any) => extractScopeKey(s)).filter(Boolean)

          const overrides: PermissionOverride[] = Array.isArray(accessData.permission_overrides)
            ? accessData.permission_overrides
            : Array.isArray(accessData.data?.permission_overrides)
            ? accessData.data.permission_overrides
            : []

          const rawMenus = Array.isArray(accessData.menus)
            ? accessData.menus
            : Array.isArray(accessData.Menus)
            ? accessData.Menus
            : Array.isArray(accessData.data?.menus)
            ? accessData.data.menus
            : Array.isArray(accessData.data?.Menus)
            ? accessData.data.Menus
            : []

          const rawRoles = Array.isArray(accessData.roles)
            ? accessData.roles
            : Array.isArray(accessData.Roles)
            ? accessData.Roles
            : Array.isArray(accessData.data?.roles)
            ? accessData.data.roles
            : Array.isArray(accessData.data?.Roles)
            ? accessData.data.Roles
            : []
          const rls: string[] = rawRoles
            .map((r: any) => (typeof r === 'string' ? r : r?.role_code || r?.name || ''))
            .filter(Boolean)

          permissions.value = perms
          scopes.value = scps
          permissionOverrides.value = overrides
          userMenus.value = rawMenus

          if (user.value) {
            user.value.permissions = perms
            user.value.scopes = scps
            user.value.permission_overrides = overrides
            user.value.menus = rawMenus
            if (rls.length > 0) {
              user.value.roles = rls
              if (!user.value.role) {
                user.value.role = rls[0]
              }
            }
          }

          if (import.meta.client) {
            localStorage.setItem('permissions', JSON.stringify(perms))
            localStorage.setItem('scopes', JSON.stringify(scps))
            localStorage.setItem('menus', JSON.stringify(rawMenus))
            if (user.value) {
              localStorage.setItem('user', JSON.stringify(user.value))
            }
          }

          lastFetchedAccess = Date.now()
          return accessData
        }
      } catch (err: any) {
        const is401 =
          err?.status === 401 ||
          err?.statusCode === 401 ||
          err?.response?.status === 401
        if (is401) {
          const redirectPath = typeof window !== 'undefined' ? window.location.pathname : '/home'
          await logout(redirectPath)
        }
      } finally {
        isFetchingAccess = null
      }
      return null
    })()

    return isFetchingAccess
  }

  let isFetchingMe: Promise<any> | null = null
  let lastFetchedMe = 0

  const fetchUserMe = async (force: boolean = false) => {
    if (!token.value) return null
    const now = Date.now()
    if (!force && isFetchingMe) return isFetchingMe
    if (!force && now - lastFetchedMe < 5000 && user.value) {
      return user.value
    }

    isFetchingMe = (async () => {
      try {
        const baseUrl = getResolvedApiBaseUrl()
        const res = await $fetch<{ data: any }>(`${baseUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        })
        if (res?.data) {
          const u = res.data
          const updated: UserSession = {
            id: u.id,
            nama: u.full_name || u.username || 'User Tambora',
            full_name: u.full_name || u.username,
            username: u.username,
            email: u.email,
            organization: u.organization,
            nip: u.nip,
            prnr: u.prnr,
            status: u.status,
            role: u.role || u.akses_grup || u.role_assignments?.[0]?.role_code,
            akses_grup: u.akses_grup || u.role_assignments?.[0]?.role_code,
            roles: u.roles || (u.role_assignments?.map((r: any) => r.role_code)) || [],
            permissions: u.permissions || permissions.value,
            scopes: u.scopes || scopes.value,
            permission_overrides: u.permission_overrides || permissionOverrides.value,
            level_id: '1'
          }
          setUser(updated)
          // Also sync access
          await fetchUserAccess(force)
          lastFetchedMe = Date.now()
          return updated
        }
      } catch (err: any) {
        const is401 =
          err?.status === 401 ||
          err?.statusCode === 401 ||
          err?.response?.status === 401 ||
          String(err?.message || '').toLowerCase().includes('401') ||
          String(err?.data?.message || '').toLowerCase().includes('token')

        if (is401) {
          const redirectPath = typeof window !== 'undefined' ? window.location.pathname : '/home'
          if (refreshToken.value) {
            const isRefreshed = await refreshSession()
            if (isRefreshed && token.value) {
              try {
                const baseUrl = getResolvedApiBaseUrl()
                const retryRes = await $fetch<{ data: any }>(`${baseUrl}/auth/me`, {
                  headers: {
                    Authorization: `Bearer ${token.value}`
                  }
                })
                if (retryRes?.data) {
                  const u = retryRes.data
                  const updated: UserSession = {
                    id: u.id,
                    nama: u.full_name || u.username || 'User Tambora',
                    full_name: u.full_name || u.username,
                    username: u.username,
                    email: u.email,
                    organization: u.organization,
                    nip: u.nip,
                    prnr: u.prnr,
                    status: u.status,
                    role: u.role || u.akses_grup || u.role_assignments?.[0]?.role_code,
                    akses_grup: u.akses_grup || u.role_assignments?.[0]?.role_code,
                    roles: u.roles || (u.role_assignments?.map((r: any) => r.role_code)) || [],
                    permissions: u.permissions || permissions.value,
                    scopes: u.scopes || scopes.value,
                    permission_overrides: u.permission_overrides || permissionOverrides.value,
                    level_id: '1'
                  }
                  setUser(updated)
                  await fetchUserAccess(true)
                  lastFetchedMe = Date.now()
                  return updated
                }
              } catch {
                await logout(redirectPath)
              }
            } else {
              await logout(redirectPath)
            }
          } else {
            await logout(redirectPath)
          }
        }
      } finally {
        isFetchingMe = null
      }
      return null
    })()

    return isFetchingMe
  }

  const can = (permissionKey: string | string[]): boolean => {
    const roleCode = String(user.value?.role || user.value?.akses_grup || '').toUpperCase()
    const userRoles = (user.value?.roles || []).map((r: any) =>
      typeof r === 'string' ? r.toUpperCase() : String(r?.role_code || r?.name || '').toUpperCase()
    )
    const isSuperAdmin =
      roleCode === 'SUPER_ADMIN' ||
      roleCode === 'SUPERADMIN' ||
      roleCode.replace(/[\s_-]/g, '') === 'SUPERADMIN' ||
      userRoles.includes('SUPER_ADMIN') ||
      userRoles.includes('SUPERADMIN') ||
      userRoles.some((r) => r.replace(/[\s_-]/g, '') === 'SUPERADMIN') ||
      permissions.value.some((p: any) => {
        const key = extractPermissionKey(p)
        return key === '*'
      })

    // Index permissions into normalized Set for fast O(1) evaluation
    const permissionSet = new Set<string>()
    for (const p of permissions.value) {
      const pKey = extractPermissionKey(p)
      if (pKey) {
        permissionSet.add(String(pKey).trim().toUpperCase())
      }
    }

    const checkSingle = (key: string): boolean => {
      if (!key) return false
      const normalizedKey = key.trim().toUpperCase()

      // 1. Check explicit permission overrides first
      if (permissionOverrides.value && permissionOverrides.value.length > 0) {
        const override = permissionOverrides.value.find((o: any) => {
          const oKey = extractPermissionKey(o)
          return String(oKey).toUpperCase() === normalizedKey
        })
        if (override) {
          return Boolean(override.is_granted)
        }
      }

      // 2. Super admin gets full access (unless explicitly denied above)
      if (isSuperAdmin) {
        return true
      }

      // 3. Direct match
      if (permissionSet.has(normalizedKey)) {
        return true
      }

      // 4. Wildcard matching: global '*'
      if (permissionSet.has('*')) {
        return true
      }

      // 5. Resource wildcard: e.g. "MENU.*" grants "MENU.CREATE"
      const dotIndex = normalizedKey.indexOf('.')
      if (dotIndex > 0) {
        const resourcePrefix = normalizedKey.slice(0, dotIndex)
        if (permissionSet.has(`${resourcePrefix}.*`)) {
          return true
        }
      }

      // 6. Delimiter compatibility: underscore variant (e.g. "MENU_CREATE")
      const underscoreKey = normalizedKey.replace(/\./g, '_')
      if (permissionSet.has(underscoreKey)) {
        return true
      }

      // 7. Delimiter compatibility: colon variant (e.g. "MENU:CREATE")
      const colonKey = normalizedKey.replace(/\./g, ':')
      if (permissionSet.has(colonKey)) {
        return true
      }

      return false
    }

    if (Array.isArray(permissionKey)) {
      return permissionKey.every((k) => checkSingle(k))
    }
    return checkSingle(permissionKey)
  }

  const hasScope = (scopeCode: string): boolean => {
    if (!scopeCode) return false
    const roleCode = String(user.value?.role || user.value?.akses_grup || '').toUpperCase()
    const userRoles = (user.value?.roles || []).map((r: any) =>
      typeof r === 'string' ? r.toUpperCase() : String(r?.role_code || r?.name || '').toUpperCase()
    )
    const isSuperAdmin =
      roleCode === 'SUPER_ADMIN' ||
      roleCode === 'SUPERADMIN' ||
      roleCode.replace(/[\s_-]/g, '') === 'SUPERADMIN' ||
      userRoles.includes('SUPER_ADMIN') ||
      userRoles.includes('SUPERADMIN') ||
      userRoles.some((r) => r.replace(/[\s_-]/g, '') === 'SUPERADMIN') ||
      permissions.value.some((p: any) => {
        const key = typeof p === 'string' ? p : p?.permission_key || p?.code || p?.name || ''
        return key === '*'
      })

    if (isSuperAdmin) return true
    return scopes.value.some((s: any) => {
      const sKey = typeof s === 'string' ? s : s?.scope_code || s?.code || s?.name || ''
      return String(sKey).toLowerCase() === scopeCode.toLowerCase()
    })
  }

  const findNavMetadata = (path: string): { permission?: string; menuCode?: string } | undefined => {
    const normalized = path.toLowerCase().replace(/\/$/, '')
    for (const item of menuItems) {
      if (item.path && item.path.toLowerCase().replace(/\/$/, '') === normalized) {
        return { permission: item.permission, menuCode: item.menuCode }
      }
      if (item.children) {
        for (const sub of item.children) {
          if (sub.path && sub.path.toLowerCase().replace(/\/$/, '') === normalized) {
            return { permission: sub.permission, menuCode: sub.menuCode }
          }
          if (sub.children) {
            for (const leaf of sub.children) {
              if (leaf.path && leaf.path.toLowerCase().replace(/\/$/, '') === normalized) {
                return { permission: leaf.permission, menuCode: leaf.menuCode }
              }
            }
          }
        }
      }
    }
    return undefined
  }

  const hasMenuAccess = (routePath: string, requiredPermission?: string, menuCode?: string): boolean => {
    if (!routePath) return true
    const normalizedPath = routePath.toLowerCase().replace(/\/$/, '')

    // 1. Home and Dashboard are accessible for all authenticated users
    if (
      normalizedPath === '/home' ||
      normalizedPath === '/home/dashboard' ||
      normalizedPath === '/home/dashboard/operasipembangkit'
    ) {
      return true
    }

    // 2. Super admin gets access to all menus
    const roleCode = String(user.value?.role || user.value?.akses_grup || '').toUpperCase()
    const userRoles = (user.value?.roles || []).map((r: any) =>
      typeof r === 'string' ? r.toUpperCase() : String(r?.role_code || r?.name || '').toUpperCase()
    )
    const isSuperAdmin =
      roleCode === 'SUPER_ADMIN' ||
      roleCode === 'SUPERADMIN' ||
      roleCode.replace(/[\s_-]/g, '') === 'SUPERADMIN' ||
      userRoles.includes('SUPER_ADMIN') ||
      userRoles.includes('SUPERADMIN') ||
      userRoles.some((r) => r.replace(/[\s_-]/g, '') === 'SUPERADMIN') ||
      permissions.value.some((p: any) => extractPermissionKey(p) === '*')

    if (isSuperAdmin) return true

    // Resolve navigation metadata if not explicitly provided
    const navMeta = findNavMetadata(routePath)
    const effectivePermission = requiredPermission || navMeta?.permission
    const effectiveMenuCode = menuCode || navMeta?.menuCode

    // 3. Check if user has permission (e.g. USER.VIEW, DRIVER.VIEW)
    if (effectivePermission && can(effectivePermission)) {
      return true
    }

    // 4. Check if backend userMenus has this menuCode (e.g. MENU_USERS, MENU_DRIVER)
    if (effectiveMenuCode && userMenus.value.some((m: any) => {
      const code = String(m.code || m.Code || '').toUpperCase()
      return code === effectiveMenuCode.toUpperCase()
    })) {
      return true
    }

    // 5. Fallback if backend does not enforce dynamic menus list
    if (userMenus.value.length === 0) {
      if (effectivePermission) {
        return can(effectivePermission)
      }
      return true
    }

    return false
  }

  const refreshSession = async (): Promise<boolean> => {
    if (!refreshToken.value) return false
    try {
      const baseUrl = getResolvedApiBaseUrl()
      const res = await $fetch<{
        data?: {
          access_token?: string
          refresh_token?: string
          token?: string
        }
        access_token?: string
        refresh_token?: string
        token?: string
      }>(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        body: { refresh_token: refreshToken.value }
      })

      const newAccess =
        res?.data?.access_token ||
        res?.data?.token ||
        res?.access_token ||
        res?.token
      const newRefresh =
        res?.data?.refresh_token ||
        res?.refresh_token
      if (newAccess) {
        setTokens(newAccess, newRefresh)
        return true
      }
    } catch {
      // Refresh failed
    }
    return false
  }

  const setError = (errorState: boolean) => {
    isError.value = errorState
  }

  const setMessage = (msg: string) => {
    message.value = msg
  }

  const clearLocalState = (notifyBroadcast: boolean = true) => {
    isLoggedIn.value = false
    user.value = null
    token.value = null
    refreshToken.value = null
    permissions.value = []
    scopes.value = []
    permissionOverrides.value = []
    userMenus.value = []
    authCookie.value = null
    accessTokenCookie.value = null
    refreshTokenCookie.value = null

    if (import.meta.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
      localStorage.removeItem('scopes')
      localStorage.removeItem('menus')

      if (notifyBroadcast) {
        try {
          authChannel?.postMessage({ type: 'LOGOUT' })
        } catch {
          // Ignore channel errors
        }
      }
    }

    // Reset idle timer & expired modal state completely when clearing local state
    resetIdleState(true)
  }

  const logout = async (redirectPath?: string) => {
    try {
      const baseUrl = getResolvedApiBaseUrl()
      if (token.value) {
        await $fetch(`${baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        })
      }
    } catch {
      // Ignore backend logout network error
    }

    clearLocalState(true)

    if (import.meta.client) {
      try {
        const toast = useToast()
        toast?.add?.({
          severity: 'info',
          summary: 'Sesi Berakhir',
          detail: 'Sesi Anda telah berakhir demi keamanan. Silakan login kembali.',
          life: 4000
        })
      } catch {
        // Ignore if toast provider unavailable
      }
    }

    const target = redirectPath ? `/login?redirect=${encodeURIComponent(redirectPath)}` : '/login'
    navigateTo(target)
  }

  return {
    isLoggedIn,
    user,
    token,
    refreshToken,
    permissions,
    scopes,
    permissionOverrides,
    userMenus,
    errorMessage,
    message,
    isError,
    can,
    hasScope,
    hasMenuAccess,
    setPermissions,
    fetchUserAccess,
    setSession,
    setTokens,
    setUser,
    fetchUserMe,
    refreshSession,
    setError,
    setMessage,
    clearLocalState,
    logout
  }
})

