import { useAuthStore } from "~/stores/auth";
import { ref, computed } from "vue";

export interface IdleTimerOptions {
  /** Idle duration before warning modal appears (default: 13 minutes in ms) */
  idleTimeoutMs?: number;
  /** Countdown duration on warning modal (default: 120 seconds) */
  countdownSeconds?: number;
}

// Global state across components so single source of truth
const showWarning = ref(false);
const remainingSeconds = ref(120);
const showExpired = ref(false);
const expiredRemainingSeconds = ref(10);

let lastActivityTime = Date.now();
let countdownStartTime = 0;
let expiredStartTime = 0;

let idleTimer: ReturnType<typeof setTimeout> | null = null;
let heartbeatInterval: ReturnType<typeof setInterval> | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let expiredCountdownInterval: ReturnType<typeof setInterval> | null = null;

export const useIdleTimer = (options: IdleTimerOptions = {}) => {
  const authStore = useAuthStore();

  // Default: 13 minutes idle + 2 minutes countdown = 15 minutes total (aligned with backend 15m access_token)
  const IDLE_TIMEOUT_MS = options.idleTimeoutMs ?? 13 * 60 * 1000;
  const COUNTDOWN_SECONDS = options.countdownSeconds ?? 120;

  const formattedCountdown = computed(() => {
    const mins = Math.floor(remainingSeconds.value / 60);
    const secs = remainingSeconds.value % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  });

  const triggerExpiredWarning = () => {
    showWarning.value = false;
    if (countdownInterval) clearInterval(countdownInterval);
    if (idleTimer) clearTimeout(idleTimer);
    if (expiredCountdownInterval) clearInterval(expiredCountdownInterval);

    showExpired.value = true;
    expiredRemainingSeconds.value = 10;
    expiredStartTime = Date.now();

    expiredCountdownInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - expiredStartTime) / 1000);
      expiredRemainingSeconds.value = Math.max(0, 10 - elapsed);
      if (expiredRemainingSeconds.value <= 0) {
        if (expiredCountdownInterval) clearInterval(expiredCountdownInterval);
        confirmExpiredLogout();
      }
    }, 1000);
  };

  const startCountdown = () => {
    if (countdownInterval) clearInterval(countdownInterval);
    remainingSeconds.value = COUNTDOWN_SECONDS;
    countdownStartTime = Date.now();

    countdownInterval = setInterval(() => {
      // Calculate remaining time using real timestamp to prevent suspension when tab is backgrounded
      const elapsed = Math.floor((Date.now() - countdownStartTime) / 1000);
      remainingSeconds.value = Math.max(0, COUNTDOWN_SECONDS - elapsed);
      if (remainingSeconds.value <= 0) {
        if (countdownInterval) clearInterval(countdownInterval);
        triggerExpiredWarning();
      }
    }, 1000);
  };

  const handleIdleTrigger = () => {
    if (!authStore.isLoggedIn) return;
    showWarning.value = true;
    startCountdown();
  };

  const checkIdleStatus = () => {
    if (!authStore.isLoggedIn || showWarning.value || showExpired.value) return;
    const idleElapsed = Date.now() - lastActivityTime;
    if (idleElapsed >= IDLE_TIMEOUT_MS) {
      handleIdleTrigger();
    }
  };

  const resetIdleTimer = (force = false) => {
    if ((showWarning.value || showExpired.value) && !force) return; // Don't silently dismiss if modal is already open

    lastActivityTime = Date.now();

    if (idleTimer) clearTimeout(idleTimer);
    if (countdownInterval) clearInterval(countdownInterval);
    if (expiredCountdownInterval) clearInterval(expiredCountdownInterval);

    if (force) {
      showWarning.value = false;
      showExpired.value = false;
    }

    if (authStore.isLoggedIn) {
      idleTimer = setTimeout(handleIdleTrigger, IDLE_TIMEOUT_MS);
    }
  };

  const confirmExpiredLogout = async () => {
    showExpired.value = false;
    showWarning.value = false;
    if (expiredCountdownInterval) clearInterval(expiredCountdownInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    if (idleTimer) clearTimeout(idleTimer);

    if (authStore.isLoggedIn) {
      await authStore.logout();
    }
  };

  const extendSession = async () => {
    // Pause countdown during refresh verification
    if (countdownInterval) clearInterval(countdownInterval);

    // Attempt silent token refresh
    const success = await authStore.refreshSession();
    if (success) {
      showWarning.value = false;
      showExpired.value = false;
      remainingSeconds.value = COUNTDOWN_SECONDS;
      resetIdleTimer(true);
    } else {
      triggerExpiredWarning();
    }
  };

  const handleTimeout = async () => {
    showWarning.value = false;
    showExpired.value = false;
    if (countdownInterval) clearInterval(countdownInterval);
    if (expiredCountdownInterval) clearInterval(expiredCountdownInterval);
    if (idleTimer) clearTimeout(idleTimer);

    if (authStore.isLoggedIn) {
      await authStore.logout();
    }
  };

  // Throttled activity handler: verifies real idle duration before resetting
  let throttleTimer = false;
  const onUserActivity = () => {
    if (showWarning.value || showExpired.value) return;

    // Check if idle threshold was already crossed before resetting
    const idleElapsed = Date.now() - lastActivityTime;
    if (idleElapsed >= IDLE_TIMEOUT_MS) {
      handleIdleTrigger();
      return;
    }

    if (throttleTimer) return;
    throttleTimer = true;
    setTimeout(() => {
      throttleTimer = false;
    }, 1000);

    resetIdleTimer();
  };

  // Event fired when tab visibility changes or window regains focus
  const onVisibilityOrFocus = () => {
    if (typeof document !== "undefined" && document.hidden) return;
    checkIdleStatus();
  };

  const registerListeners = () => {
    if (typeof window === "undefined") return;

    window.addEventListener("mousemove", onUserActivity, { passive: true });
    window.addEventListener("mousedown", onUserActivity, { passive: true });
    window.addEventListener("keydown", onUserActivity, { passive: true });
    window.addEventListener("touchstart", onUserActivity, { passive: true });
    window.addEventListener("scroll", onUserActivity, { passive: true });
    window.addEventListener("focus", onVisibilityOrFocus, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityOrFocus, { passive: true });

    // Periodic heartbeat check (every 2 seconds) to counter background timer throttling
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    heartbeatInterval = setInterval(checkIdleStatus, 2000);

    resetIdleTimer();

    // Dev helper for instant manual testing in browser console
    if (import.meta.client) {
      (window as any).__testIdleWarning = () => {
        handleIdleTrigger();
      };
      (window as any).__testIdleExpired = () => {
        triggerExpiredWarning();
      };
    }
  };

  const removeListeners = () => {
    if (typeof window === "undefined") return;

    window.removeEventListener("mousemove", onUserActivity);
    window.removeEventListener("mousedown", onUserActivity);
    window.removeEventListener("keydown", onUserActivity);
    window.removeEventListener("touchstart", onUserActivity);
    window.removeEventListener("scroll", onUserActivity);
    window.removeEventListener("focus", onVisibilityOrFocus);
    document.removeEventListener("visibilitychange", onVisibilityOrFocus);

    if (idleTimer) clearTimeout(idleTimer);
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    if (expiredCountdownInterval) clearInterval(expiredCountdownInterval);
  };

  return {
    showWarning,
    showExpired,
    remainingSeconds,
    expiredRemainingSeconds,
    formattedCountdown,
    extendSession,
    handleTimeout,
    triggerExpiredWarning,
    confirmExpiredLogout,
    resetIdleTimer,
    registerListeners,
    removeListeners,
  };
};
