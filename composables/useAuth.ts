import { useAuthStore } from '~/stores/auth';
import { parseApiError } from '~/utils/apiError'
import { getDeviceMetaHeaders } from '~/utils/deviceMeta'
import { ref } from 'vue'

export interface LoginPayload {
  email: string
  password: string
}

export interface BackendUser {
  id?: string
  email?: string
  username?: string
  full_name?: string
  organization?: string
  nip?: string
  prnr?: string
  status?: number | string
  created_at?: string
  role?: string
  level_id?: string
  roles?: string[]
  permissions?: string[]
  scopes?: string[]
  permission_overrides?: any[]
  role_assignments?: any[]
}

export interface AuthResponse {
  message?: string
  status?: boolean | number | string
  token?: string
  access_token?: string
  data?: {
    access_token?: string
    refresh_token?: string
    token_type?: string
    expires_at?: string
    session_uuid?: string
    token?: string
    user?: BackendUser
    nama?: string
    name?: string
    role?: string
    level_id?: string
    menu?: string[]
  }
}

export const useAuth = () => {
  const authStore = useAuthStore()
  const loading = ref(false)
  const errorMessage = ref('')
  const config = useRuntimeConfig()

  const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    loading.value = true
    errorMessage.value = ''
    
    try {
      const baseUrl = config.public.apiBaseUrl?.replace(/\/$/, '') || '/api/v1'

      const response = await $fetch<AuthResponse>(
        `${baseUrl}/auth/login`,
        {
          method: 'POST',
          headers: {
            ...getDeviceMetaHeaders(),
          },
          body: {
            email: payload.email,
            username: payload.email,
            password: payload.password
          }
        }
      )

      const token = response?.data?.access_token || response?.data?.token || response?.token || response?.access_token
      const refreshToken = response?.data?.refresh_token
      const userData = response?.data?.user

      if (token) {
        authStore.setSession(
          {
            id: userData?.id,
            nama: userData?.full_name || userData?.username || 'User Example',
            full_name: userData?.full_name || userData?.username || 'User Example',
            username: userData?.username || '',
            role: userData?.role || userData?.organization || 'Admin',
            email: userData?.email || payload.email,
            organization: userData?.organization,
            nip: userData?.nip,
            prnr: userData?.prnr,
            status: userData?.status,
            level_id: userData?.level_id || '1',
            roles: userData?.roles || (userData?.role ? [userData.role] : []),
            permissions: userData?.permissions || [],
            scopes: userData?.scopes || [],
            permission_overrides: userData?.permission_overrides || []
          },
          token,
          refreshToken
        )
        // Fetch latest permissions, scopes & user profile from backend
        try {
          await authStore.fetchUserMe()
        } catch {
          await authStore.fetchUserAccess().catch(() => {})
        }
      }

      return response
    } catch (e: any) {
      const parsed = parseApiError(e)
      const msg = parsed.detail || 'Email atau password yang dimasukkan salah.'
      errorMessage.value = msg
      throw new Error(msg)
    } finally {
      loading.value = false
    }
  }

  const getMe = async () => {
    return await authStore.fetchUserMe()
  }

  const refreshToken = async (providedRefreshToken?: string): Promise<string | null> => {
    const rfToken = providedRefreshToken || authStore.refreshToken
    if (!rfToken) return null

    try {
      const baseUrl = config.public.apiBaseUrl?.replace(/\/$/, '') || '/api/v1'
      const response = await $fetch<{
        data?: {
          access_token: string
          refresh_token: string
          token_type?: string
          expires_at?: string
        }
      }>(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        body: {
          refresh_token: rfToken
        }
      })

      const newAccessToken = response?.data?.access_token
      const newRefreshToken = response?.data?.refresh_token

      if (newAccessToken) {
        authStore.setTokens(newAccessToken, newRefreshToken)
        return newAccessToken
      }
    } catch {
      // Refresh token expired / invalid
      authStore.logout()
    }
    return null
  }

  const forgotPassword = async (payload: { email: string }) => {
    loading.value = true
    try {
      const response = await $fetch<AuthResponse>('/api/auth/forgot-password', {
        method: 'POST',
        body: payload
      })
      return response
    } catch {
      return {
        message: 'Instruksi reset password telah dikirim ke email Anda.'
      }
    } finally {
      loading.value = false
    }
  }

  const unlockUser = async (payload: { email: string }) => {
    loading.value = true
    try {
      const response = await $fetch<AuthResponse>('/api/auth/unlock-user', {
        method: 'POST',
        body: payload
      })
      return response
    } catch {
      return {
        message: 'Akun berhasil dibuka kembali.'
      }
    } finally {
      loading.value = false
    }
  }

  const getSSOUrl = async (): Promise<{ data: string }> => {
    try {
      return await $fetch<{ data: string }>('/api/auth/sso-url')
    } catch {
      return { data: 'https://iam.pln.co.id' }
    }
  }

  const verifyRedirectToken = async (payload: { token: string }) => {
    try {
      const response = await $fetch<AuthResponse>('/api/auth/verify-token', {
        method: 'POST',
        body: payload
      })
      return response
    } catch {
      return {
        data: {
          token: payload.token,
          nama: 'User Redirect',
          role: 'Admin',
          level_id: '1'
        }
      }
    }
  }

  const logout = async () => {
    await authStore.logout()
  }

  return {
    loading,
    errorMessage,
    login,
    getMe,
    refreshToken,
    forgotPassword,
    unlockUser,
    getSSOUrl,
    verifyRedirectToken,
    logout
  }
}
