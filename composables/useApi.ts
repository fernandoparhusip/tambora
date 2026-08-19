export const useApi = () => {
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,

    headers: {
      Accept: 'application/json'
    },

    onRequest({ options }) {
      const token = useCookie('access_token')

      if (token.value) {
        options.headers = new Headers(options.headers)

        options.headers.set(
          'Authorization',
          `Bearer ${token.value}`
        )
      }
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        // handle unauthorized
        console.log('Token expired / unauthorized')
      }
    }
  })

  return api
}