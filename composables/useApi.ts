import { useToast } from 'primevue/usetoast'
import { parseApiError } from '~/utils/apiError'
import { useAuthStore } from '~/stores/auth'

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,

    headers: {
      Accept: 'application/json'
    },

    onRequest({ options }) {
      const authSessionCookie = useCookie<{ token?: string } | null>('auth-session')
      const accessTokenCookie = useCookie<string | null>('access_token')
      const token = authStore.token || authSessionCookie.value?.token || accessTokenCookie.value

      if (token) {
        options.headers = new Headers(options.headers)

        options.headers.set(
          'Authorization',
          `Bearer ${token}`
        )
      }
    },

    async onResponseError(context) {
      const errorResult = parseApiError(context)
      const isAuthEndpoint =
        context.request.toString().includes('/auth/login') ||
        context.request.toString().includes('/auth/refresh') ||
        context.request.toString().includes('/auth/logout')

      if (context.response?.status === 401 && !isAuthEndpoint) {
        if (authStore.refreshToken) {
          try {
            const baseUrl = config.public.apiBaseUrl?.replace(/\/$/, '') || '/api/v1'
            const refreshRes = await $fetch<{
              data?: {
                access_token: string
                refresh_token?: string
              }
            }>(`${baseUrl}/auth/refresh`, {
              method: 'POST',
              body: {
                refresh_token: authStore.refreshToken
              }
            })

            const newToken = refreshRes?.data?.access_token
            const newRefreshToken = refreshRes?.data?.refresh_token
            if (newToken) {
              authStore.setTokens(newToken, newRefreshToken)
              return
            }
          } catch {
            await authStore.logout()
          }
        } else {
          await authStore.logout()
        }
      }

      if (import.meta.client) {
        try {
          const toast = useToast()
          toast.add({
            severity: errorResult.severity,
            summary: errorResult.summary,
            detail: errorResult.detail,
            life: 4000
          })
        } catch (err) {
          if (import.meta.dev) {
            // eslint-disable-next-line no-console
            console.warn('[useApi] Toast omitted (outside PrimeVue context):', errorResult.detail, err)
          }
        }
      }
    }
  })

  return api
}