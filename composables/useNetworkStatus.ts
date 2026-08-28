import { useAppToast } from '~/composables/useAppToast';
import { ref, computed } from 'vue'

const isOnline = ref(true)
const wasOffline = ref(false)
let isInitialized = false

export const useNetworkStatus = () => {
  const toast = useAppToast()

  const initNetworkListeners = () => {
    if (typeof window === 'undefined' || isInitialized) return

    isOnline.value = navigator.onLine
    isInitialized = true

    const handleOnline = () => {
      isOnline.value = true
      if (wasOffline.value) {
        toast.success('Koneksi internet kembali terhubung.', 'Online Kembali')
      }
      wasOffline.value = false
    }

    const handleOffline = () => {
      isOnline.value = false
      wasOffline.value = true
      toast.warning('Koneksi internet terputus. Bekerja dalam mode offline.', 'Koneksi Terputus')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      isInitialized = false
    }
  }

  return {
    isOnline: computed(() => isOnline.value),
    wasOffline: computed(() => wasOffline.value),
    initNetworkListeners,
  }
}
