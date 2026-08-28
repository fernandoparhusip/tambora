import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useCookie, navigateTo } from '#app'

export interface UserSession {
  id?: string
  nama: string
  full_name?: string
  username?: string
  role?: string
  email?: string
  level_id?: string
  organization?: string
  nip?: string
  prnr?: string
  status?: number | string
}

export interface AuthSession {
  isLoggedIn: boolean
  user: UserSession | null
  token?: string
  refreshToken?: string
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

    authCookie.value = {
      isLoggedIn: true,
      user: sessionUser,
      token: sessionToken,
      refreshToken: sessionRefreshToken || refreshToken.value || ''
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
    if (authCookie.value) {
      authCookie.value.user = updatedUser
    }
    if (import.meta.client) {
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
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
          role: u.organization || 'Admin',
          level_id: '1'
        }
        setUser(updated)
        return updated
      }
    } catch {
      // Ignored if me endpoint temporarily fails
    }
    return null
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
    authCookie.value = null
    accessTokenCookie.value = null
    refreshTokenCookie.value = null

    if (import.meta.client) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')

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
    errorMessage,
    message,
    isError,
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
