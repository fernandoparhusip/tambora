import { useToast } from 'primevue/usetoast'
import { parseApiError } from '~/utils/apiError'
import { useAuthStore } from '~/stores/auth'

// Shared mutex lock for concurrent 401 refresh requests
let refreshPromise: Promise<boolean> | null = null

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
        options.headers.set('Authorization', `Bearer ${token}`)
      }
    },

    async onResponseError(context) {
      const errorResult = parseApiError(context)
      const requestUrl = context.request.toString()
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/refresh') ||
        requestUrl.includes('/auth/logout')

      // Handle 401 Unauthorized with Single-Flight Refresh Mutex
      if (context.response?.status === 401 && !isAuthEndpoint) {
        if (authStore.refreshToken) {
          try {
            if (!refreshPromise) {
              refreshPromise = authStore.refreshSession().finally(() => {
                refreshPromise = null
              })
            }

            const isRefreshed = await refreshPromise
            if (isRefreshed) {
              return
            } else {
              await authStore.logout()
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