import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

export interface IdleTimerOptions {
  /** Idle duration before warning modal appears (default: 28 minutes in ms) */
  idleTimeoutMs?: number
  /** Countdown duration on warning modal (default: 120 seconds) */
  countdownSeconds?: number
}

// Global state across components so single source of truth
const showWarning = ref(false)
const remainingSeconds = ref(120)
let idleTimer: NodeJS.Timeout | null = null
let countdownInterval: NodeJS.Timeout | null = null

export const useIdleTimer = (options: IdleTimerOptions = {}) => {
  const authStore = useAuthStore()

  // Default: 28 minutes idle + 2 minutes countdown = 30 minutes total
  const IDLE_TIMEOUT_MS = options.idleTimeoutMs ?? 28 * 60 * 1000
  const COUNTDOWN_SECONDS = options.countdownSeconds ?? 120

  const formattedCountdown = computed(() => {
    const mins = Math.floor(remainingSeconds.value / 60)
    const secs = remainingSeconds.value % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  const startCountdown = () => {
    if (countdownInterval) clearInterval(countdownInterval)
    remainingSeconds.value = COUNTDOWN_SECONDS

    countdownInterval = setInterval(() => {
      remainingSeconds.value -= 1
      if (remainingSeconds.value <= 0) {
        if (countdownInterval) clearInterval(countdownInterval)
        handleTimeout()
      }
    }, 1000)
  }

  const handleIdleTrigger = () => {
    if (!authStore.isLoggedIn) return
    showWarning.value = true
    startCountdown()
  }

  const resetIdleTimer = (force = false) => {
    if (showWarning.value && !force) return // Don't silently dismiss if modal is already open

    if (idleTimer) clearTimeout(idleTimer)
    if (countdownInterval) clearInterval(countdownInterval)

    if (force) {
      showWarning.value = false
    }

    if (authStore.isLoggedIn) {
      idleTimer = setTimeout(handleIdleTrigger, IDLE_TIMEOUT_MS)
    }
  }

  const extendSession = async () => {
    showWarning.value = false
    if (countdownInterval) clearInterval(countdownInterval)
    remainingSeconds.value = COUNTDOWN_SECONDS

    // Attempt silent token refresh
    await authStore.refreshSession()
    resetIdleTimer()
  }

  const handleTimeout = async () => {
    showWarning.value = false
    if (countdownInterval) clearInterval(countdownInterval)
    if (idleTimer) clearTimeout(idleTimer)

    if (authStore.isLoggedIn) {
      await authStore.logout()
    }
  }

  // Throttled activity handler
  let throttleTimer = false
  const onUserActivity = () => {
    if (throttleTimer || showWarning.value) return
    throttleTimer = true
    setTimeout(() => {
      throttleTimer = false
    }, 1000)

    resetIdleTimer()
  }

  const registerListeners = () => {
    if (typeof window === 'undefined') return
    window.addEventListener('mousemove', onUserActivity, { passive: true })
    window.addEventListener('mousedown', onUserActivity, { passive: true })
    window.addEventListener('keydown', onUserActivity, { passive: true })
    window.addEventListener('touchstart', onUserActivity, { passive: true })
    window.addEventListener('scroll', onUserActivity, { passive: true })
    resetIdleTimer()
  }

  const removeListeners = () => {
    if (typeof window === 'undefined') return
    window.removeEventListener('mousemove', onUserActivity)
    window.removeEventListener('mousedown', onUserActivity)
    window.removeEventListener('keydown', onUserActivity)
    window.removeEventListener('touchstart', onUserActivity)
    window.removeEventListener('scroll', onUserActivity)

    if (idleTimer) clearTimeout(idleTimer)
    if (countdownInterval) clearInterval(countdownInterval)
  }

  return {
    showWarning,
    remainingSeconds,
    formattedCountdown,
    extendSession,
    handleTimeout,
    resetIdleTimer,
    registerListeners,
    removeListeners
  }
}
