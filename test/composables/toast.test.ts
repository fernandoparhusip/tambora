import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAppToast } from '~/composables/useAppToast'

describe('useAppToast Composable', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    const { clearAll } = useAppToast()
    clearAll()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('adds a success toast and auto-dismisses after duration', () => {
    const toast = useAppToast()
    toast.success('Data berhasil disimpan', 'Sukses', 3000)

    expect(toast.toasts.value.length).toBe(1)
    expect(toast.toasts.value[0]?.type).toBe('success')
    expect(toast.toasts.value[0]?.message).toBe('Data berhasil disimpan')
    expect(toast.toasts.value[0]?.title).toBe('Sukses')

    // Fast-forward 3000ms
    vi.advanceTimersByTime(3000)
    expect(toast.toasts.value.length).toBe(0)
  })

  it('supports error, warning, and info toasts', () => {
    const toast = useAppToast()
    toast.error('Gagal mengambil data')
    toast.warning('Koneksi lambat')
    toast.info('Sistem diperbarui')

    expect(toast.toasts.value.length).toBe(3)
    expect(toast.toasts.value[0]?.type).toBe('error')
    expect(toast.toasts.value[1]?.type).toBe('warning')
    expect(toast.toasts.value[2]?.type).toBe('info')
  })

  it('removes toast manually by id', () => {
    const toast = useAppToast()
    const id = toast.success('Operasi berhasil')
    expect(toast.toasts.value.length).toBe(1)

    toast.removeToast(id)
    expect(toast.toasts.value.length).toBe(0)
  })
})
