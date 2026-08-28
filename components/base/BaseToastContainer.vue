<script setup lang="ts">

const { toasts, removeToast } = useAppToast()

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
        progressBar: 'bg-emerald-500',
        border: 'border-emerald-100/80',
      }
    case 'error':
      return {
        badgeBg: 'bg-red-50 text-red-600 border-red-100',
        progressBar: 'bg-red-500',
        border: 'border-red-100/80',
      }
    case 'warning':
      return {
        badgeBg: 'bg-amber-50 text-amber-600 border-amber-100',
        progressBar: 'bg-amber-500',
        border: 'border-amber-100/80',
      }
    case 'info':
    default:
      return {
        badgeBg: 'bg-blue-50 text-[#2563EB] border-blue-100',
        progressBar: 'bg-[#2563EB]',
        border: 'border-blue-100/80',
      }
  }
}
</script>

<template>
  <div
    class="fixed top-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none"
    aria-live="polite"
  >
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto relative flex flex-col bg-white rounded-xl shadow-lg border overflow-hidden transition-all duration-200"
        :class="getToastStyles(toast.type).border"
      >
        <div class="flex items-start gap-3 p-3.5">
          <!-- Type Icon Badge -->
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border"
            :class="getToastStyles(toast.type).badgeBg"
          >
            <!-- Success Icon -->
            <svg
              v-if="toast.type === 'success'"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 stroke-[2.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>

            <!-- Error Icon -->
            <svg
              v-else-if="toast.type === 'error'"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 stroke-[2.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>

            <!-- Warning Icon -->
            <svg
              v-else-if="toast.type === 'warning'"
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 stroke-[2.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>

            <!-- Info Icon -->
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 stroke-[2.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0 pr-1">
            <h4 class="text-xs font-bold text-gray-900 leading-tight">
              {{ toast.title }}
            </h4>
            <p class="text-[11px] text-gray-600 mt-0.5 leading-snug break-words">
              {{ toast.message }}
            </p>
          </div>

          <!-- Close Button -->
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors cursor-pointer shrink-0"
            title="Tutup Notifikasi"
            @click="removeToast(toast.id)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Animated Progress Countdown Bar -->
        <div
          v-if="toast.duration > 0"
          class="h-[2.5px] w-full bg-gray-100 overflow-hidden"
        >
          <div
            class="h-full toast-progress"
            :class="getToastStyles(toast.type).progressBar"
            :style="{ animationDuration: `${toast.duration}ms` }"
          />
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
/* Toast Transition */
.toast-enter-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

/* Progress Bar Countdown Animation */
.toast-progress {
  animation: progressCountdown linear forwards;
  width: 100%;
  transform-origin: left;
}

@keyframes progressCountdown {
  from {
    transform: scaleX(1);
  }
  to {
    transform: scaleX(0);
  }
}
</style>
