import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useIdleTimer } from '~/composables/useIdleTimer'

// Mock Nuxt runtime variables
vi.mock('#app', () => ({
  useCookie: () => ({
    value: null
  }),
  navigateTo: vi.fn()
}))

describe('useIdleTimer Composable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('triggers warning modal after idle timeout', () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'Operator' }, 'tok', 'ref')

    const { showWarning, resetIdleTimer } = useIdleTimer({
      idleTimeoutMs: 1000,
      countdownSeconds: 10
    })

    resetIdleTimer(true)
    expect(showWarning.value).toBe(false)

    // Fast-forward idle timeout
    vi.advanceTimersByTime(1000)
    expect(showWarning.value).toBe(true)
  })

  it('counts down and triggers logout when time expires', async () => {
    const authStore = useAuthStore()
    authStore.setSession({ nama: 'Operator' }, 'tok', 'ref')
    const logoutMock = vi.fn().mockResolvedValue(undefined)
    authStore.logout = logoutMock

    const { showWarning, resetIdleTimer } = useIdleTimer({
      idleTimeoutMs: 1000,
      countdownSeconds: 5
    })

    resetIdleTimer(true)
    vi.advanceTimersByTime(1000)
    expect(showWarning.value).toBe(true)

    // Advance countdown 5 seconds
    vi.advanceTimersByTime(5000)
    await Promise.resolve()
    expect(logoutMock).toHaveBeenCalled()
  })

  it('extends session when extendSession is called', async () => {
    const authStore = useAuthStore()
    authStore.refreshSession = vi.fn().mockResolvedValue(true)
    authStore.setSession({ nama: 'Operator' }, 'tok', 'ref')

    const { showWarning, extendSession, resetIdleTimer } = useIdleTimer({
      idleTimeoutMs: 1000,
      countdownSeconds: 10
    })

    resetIdleTimer(true)
    vi.advanceTimersByTime(1000)
    expect(showWarning.value).toBe(true)

    await extendSession()
    expect(showWarning.value).toBe(false)
  })
})
