import { ref } from 'vue'
import { extractApiErrorMessage } from '~/utils/apiError'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  title: string
  message: string
  duration: number
  createdAt: number
}

// Global reactive toast state
const toasts = ref<ToastItem[]>([])

export const useAppToast = () => {
  const addToast = (
    type: ToastType,
    message: any,
    title?: string,
    duration = 4000
  ): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    
    // Default titles based on type
    const defaultTitles: Record<ToastType, string> = {
      success: 'Berhasil',
      error: 'Terjadi Kesalahan',
      warning: 'Peringatan',
      info: 'Informasi',
    }

    const cleanMessage =
      type === 'error'
        ? extractApiErrorMessage(
            message,
            typeof message === 'string' ? message : 'Terjadi kesalahan pada sistem.'
          )
        : typeof message === 'string'
          ? message
          : String(message || '')

    const newToast: ToastItem = {
      id,
      type,
      title: title || defaultTitles[type],
      message: cleanMessage,
      duration,
      createdAt: Date.now(),
    }

    toasts.value.push(newToast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  const success = (message: string, title?: string, duration?: number) =>
    addToast('success', message, title, duration)

  const error = (message: string, title?: string, duration?: number) =>
    addToast('error', message, title, duration)

  const warning = (message: string, title?: string, duration?: number) =>
    addToast('warning', message, title, duration)

  const info = (message: string, title?: string, duration?: number) =>
    addToast('info', message, title, duration)

  const clearAll = () => {
    toasts.value = []
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    clearAll,
  }
}
