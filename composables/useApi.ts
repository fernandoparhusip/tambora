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
      const token = authSessionCookie.value?.token || accessTokenCookie.value

      if (token) {
        options.headers = new Headers(options.headers)

        options.headers.set(
          'Authorization',
          `Bearer ${token}`
        )
      }
    },

    onResponseError(context) {
      const errorResult = parseApiError(context)

      if (import.meta.client) {
        try {
          const toast = useToast()
          toast.add({
            severity: errorResult.severity,
            summary: errorResult.summary,
            detail: errorResult.detail,
            life: 4000
          })
        } catch {
          // Context not active or outside setup
        }
      }

      if (context.response.status === 401) {
        authStore.logout()
      }
    }
  })

  return api
}