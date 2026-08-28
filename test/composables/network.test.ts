import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useNetworkStatus } from '~/composables/useNetworkStatus'
import { useAppToast } from '~/composables/useAppToast'

describe('useNetworkStatus Composable', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useAppToast().clearAll()
  })

  it('tracks online and offline events and dispatches toast notifications', () => {
    const { isOnline, initNetworkListeners } = useNetworkStatus()
    const { toasts } = useAppToast()

    const cleanup = initNetworkListeners()
    expect(isOnline.value).toBe(true)

    // Simulate offline event
    window.dispatchEvent(new Event('offline'))
    expect(isOnline.value).toBe(false)
    expect(toasts.value.length).toBe(1)
    expect(toasts.value[0]?.type).toBe('warning')

    // Simulate online event (reconnection)
    window.dispatchEvent(new Event('online'))
    expect(isOnline.value).toBe(true)
    expect(toasts.value.length).toBe(2)
    expect(toasts.value[1]?.type).toBe('success')

    if (cleanup) cleanup()
  })
})
