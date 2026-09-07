import { vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import * as appMock from '#app'

// Global Pinia setup
setActivePinia(createPinia())
beforeEach(() => {
  setActivePinia(createPinia())
})

function defineAutoImport(name: string, getter: () => any) {
  let override: any = undefined
  Object.defineProperty(globalThis, name, {
    get() {
      return override !== undefined ? override : getter()
    },
    set(val) {
      override = val
    },
    configurable: true,
    enumerable: true,
  })
}

// Global $fetch mock
const defaultFetchMock: any = vi.fn().mockResolvedValue({ data: [] })
defaultFetchMock.create = vi.fn(() => defaultFetchMock)
defaultFetchMock.raw = vi.fn().mockResolvedValue({ _data: { data: [] } })
defineAutoImport('$fetch', () => defaultFetchMock)

// Nuxt / Vue Router Globals
defineAutoImport('definePageMeta', () => (meta: any) => meta)
defineAutoImport('useRoute', () => () => ({ path: '/', params: {}, query: {}, fullPath: '/' }))
defineAutoImport('useRouter', () => () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), go: vi.fn(), getRoutes: vi.fn(() => []) }))
defineAutoImport('useRuntimeConfig', () => () => ({ public: {} }))
defineAutoImport('useHead', () => vi.fn())
defineAutoImport('useSeoMeta', () => vi.fn())
defineAutoImport('navigateTo', () => appMock.navigateTo)
defineAutoImport('useCookie', () => appMock.useCookie)
defineAutoImport('useNuxtApp', () => () => ({ $toast: { add: vi.fn() } }))
