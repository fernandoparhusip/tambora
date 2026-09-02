import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useCookie, navigateTo } from '#app'

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
}

export interface AuthSession {
  isLoggedIn: boolean
  user: UserSession | null
  token?: string
  refreshToken?: string
  permissions?: string[]
  scopes?: string[]
}

const AUTH_CHANNEL_NAME = 'tambora_auth_channel'

export const useAuthStore = defineStore('auth', () => {
  // 24 Hours Session Cookie (Standard 1 Shift Enterprise)
  const authCookie = useCookie<AuthSession | null>('auth-session', {
    maxAge: 60 * 60 * 24
  })
  const accessTokenCookie = useCookie<string | null>('access_token', {
    maxAge: 60 * 60 * 24
  })
  const refreshTokenCookie = useCookie<string | null>('refresh_token', {
    maxAge: 60 * 60 * 24
  })

  const isLoggedIn = ref(authCookie.value?.isLoggedIn ?? !!accessTokenCookie.value)
  const user = ref<UserSession | null>(authCookie.value?.user ?? null)
  const token = ref<string | null>(authCookie.value?.token || accessTokenCookie.value || null)
  const refreshToken = ref<string | null>(authCookie.value?.refreshToken || refreshTokenCookie.value || null)
  const permissions = ref<string[]>(authCookie.value?.permissions || authCookie.value?.user?.permissions || [])
  const scopes = ref<string[]>(authCookie.value?.scopes || authCookie.value?.user?.scopes || [])
  const permissionOverrides = ref<PermissionOverride[]>(authCookie.value?.user?.permission_overrides || [])
  const errorMessage = ref('')
  const message = ref('')
  const isError = ref(false)


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
      permissions.value = sessionUser.permissions
    }
    if (sessionUser.scopes) {
      scopes.value = sessionUser.scopes
    }
    if (sessionUser.permission_overrides) {
      permissionOverrides.value = sessionUser.permission_overrides
    }

    authCookie.value = {
      isLoggedIn: true,
      user: sessionUser,
      token: sessionToken,
      refreshToken: sessionRefreshToken || refreshToken.value || '',
      permissions: permissions.value,
      scopes: scopes.value
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
      authCookie.value.token = newAccessToken
      if (newRefreshToken) {
        authCookie.value.refreshToken = newRefreshToken
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
      permissions.value = updatedUser.permissions
    }
    if (updatedUser.scopes) {
      scopes.value = updatedUser.scopes
    }
    if (updatedUser.permission_overrides) {
      permissionOverrides.value = updatedUser.permission_overrides
    }
    if (authCookie.value) {
      authCookie.value.user = updatedUser
      authCookie.value.permissions = permissions.value
      authCookie.value.scopes = scopes.value
    }
    if (import.meta.client) {
      localStorage.setItem('user', JSON.stringify(updatedUser))
      localStorage.setItem('permissions', JSON.stringify(permissions.value))
      localStorage.setItem('scopes', JSON.stringify(scopes.value))
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

  const fetchUserAccess = async () => {
    if (!token.value) return null
    try {
      const config = useRuntimeConfig()
      const baseUrl = config.public.apiBaseUrl?.replace(/\/$/, '') || '/api/v1'
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
        const perms: string[] = Array.isArray(accessData.permissions)
          ? accessData.permissions
          : Array.isArray(accessData)
          ? accessData
          : []
        const scps: string[] = Array.isArray(accessData.scopes) ? accessData.scopes : []
        const overrides: PermissionOverride[] = Array.isArray(accessData.permission_overrides)
          ? accessData.permission_overrides
          : []

        permissions.value = perms
        scopes.value = scps
        permissionOverrides.value = overrides

        if (user.value) {
          user.value.permissions = perms
          user.value.scopes = scps
          user.value.permission_overrides = overrides
        }

        if (import.meta.client) {
          localStorage.setItem('permissions', JSON.stringify(perms))
          localStorage.setItem('scopes', JSON.stringify(scps))
        }

        return accessData
      }
    } catch {
      // Endpoint fallback
    }
    return null
  }

  const fetchUserMe = async () => {
    if (!token.value) return null
    try {
      const config = useRuntimeConfig()
      const baseUrl = config.public.apiBaseUrl?.replace(/\/$/, '') || '/api/v1'
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
          role: u.organization || u.akses_grup || (u.role_assignments?.[0]?.role_code) || 'Admin',
          akses_grup: u.akses_grup || u.role_assignments?.[0]?.role_code,
          roles: u.roles || (u.role_assignments?.map((r: any) => r.role_code)) || [],
          permissions: u.permissions || permissions.value,
          scopes: u.scopes || scopes.value,
          permission_overrides: u.permission_overrides || permissionOverrides.value,
          level_id: '1'
        }
        setUser(updated)
        // Also sync access
        await fetchUserAccess()
        return updated
      }
    } catch {
      // Ignored if me endpoint temporarily fails
    }
    return null
  }

  const can = (permissionKey: string | string[]): boolean => {
    const roleCode = (user.value?.role || user.value?.akses_grup || '').toUpperCase()
    const userRoles = (user.value?.roles || []).map((r) => r.toUpperCase())
    const isSuperAdmin =
      roleCode === 'SUPER_ADMIN' ||
      userRoles.includes('SUPER_ADMIN') ||
      roleCode === 'SUPERADMIN' ||
      permissions.value.includes('*')

    const checkSingle = (key: string): boolean => {
      const normalizedKey = key.trim().toUpperCase()

      // 1. Check explicit permission overrides first
      if (permissionOverrides.value && permissionOverrides.value.length > 0) {
        const override = permissionOverrides.value.find(
          (o) => o.permission_key.toUpperCase() === normalizedKey
        )
        if (override) {
          return override.is_granted
        }
      }

      // 2. Super admin gets full access (unless explicitly denied above)
      if (isSuperAdmin) {
        return true
      }

      // 3. Check direct permissions list
      if (permissions.value.some((p) => p.toUpperCase() === normalizedKey)) {
        return true
      }

      // 4. Default role-based fallback matrices for standard personas if permissions array is empty
      if (permissions.value.length === 0) {
        if (roleCode === 'ORG_ADMIN') {
          // Admin Regional: Full CRUD
          return true
        }
        if (roleCode === 'ORG_MANAGER') {
          // Operator Cabang: Create & Update only, no DELETE
          return !normalizedKey.endsWith('.DELETE')
        }
        if (roleCode === 'ORG_VIEWER') {
          // Viewer Ranting: Read-only
          return normalizedKey.endsWith('.VIEW') || normalizedKey.endsWith('.READ') || normalizedKey.endsWith('.LIST')
        }
      }

      return false
    }

    if (Array.isArray(permissionKey)) {
      return permissionKey.every((k) => checkSingle(k))
    }
    return checkSingle(permissionKey)
  }

  const hasScope = (scopeCode: string): boolean => {
    const isSuperAdmin =
      (user.value?.role || '').toUpperCase() === 'SUPER_ADMIN' ||
      permissions.value.includes('*')
    if (isSuperAdmin) return true
    return scopes.value.some((s) => s.toLowerCase() === scopeCode.toLowerCase())
  }

  const refreshSession = async (): Promise<boolean> => {
    if (!refreshToken.value) return false
    try {
      const config = useRuntimeConfig()
      const baseUrl = config.public.apiBaseUrl?.replace(/\/$/, '') || '/api/v1'
      const res = await $fetch<{
        data?: {
          access_token: string
          refresh_token?: string
        }
      }>(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        body: { refresh_token: refreshToken.value }
      })

      const newAccess = res?.data?.access_token
      const newRefresh = res?.data?.refresh_token
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
    authCookie.value = null
    accessTokenCookie.value = null
    refreshTokenCookie.value = null

    if (import.meta.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      localStorage.removeItem('permissions')
      localStorage.removeItem('scopes')

      if (notifyBroadcast) {
        try {
          authChannel?.postMessage({ type: 'LOGOUT' })
        } catch {
          // Ignore channel errors
        }
      }
    }
  }

  const logout = async (redirectPath?: string) => {
    try {
      const config = useRuntimeConfig()
      const baseUrl = config.public.apiBaseUrl?.replace(/\/$/, '') || '/api/v1'
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
    errorMessage,
    message,
    isError,
    can,
    hasScope,
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

