<script setup lang="ts">
import { ref, computed } from 'vue'
import { VueFinalModal } from 'vue-final-modal'

const {
  showWarning,
  remainingSeconds,
  formattedCountdown,
  extendSession,
  handleTimeout
} = useIdleTimer()

const isExtending = ref(false)

// Total countdown is 120s by default
const progressPercent = computed(() => {
  return Math.max(0, Math.min(100, (remainingSeconds.value / 120) * 100))
})

// Urgent state when under 30 seconds remaining
const isUrgent = computed(() => remainingSeconds.value <= 30)

const handleExtend = async () => {
  if (isExtending.value) return
  isExtending.value = true
  try {
    await extendSession()
  } finally {
    isExtending.value = false
  }
}
</script>

<template>
  <VueFinalModal
    v-model="showWarning"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    :click-to-close="false"
    :esc-to-close="false"
    class="fixed inset-0 z-[999990] flex items-center justify-center p-4"
    content-class="relative z-[999990] bg-white w-full max-w-sm sm:max-w-md rounded-2xl p-6 sm:p-7 flex flex-col items-center text-center shadow-2xl border border-gray-100/90 my-auto select-none transform transition-all duration-200 ease-out"
    overlay-class="fixed inset-0 bg-gray-950/60 backdrop-blur-xs z-[999989]"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="session-warning-title"
    aria-describedby="session-warning-desc"
  >
    <!-- Warning Icon Badge (Layered Ring) -->
    <div
      class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300 ring-8"
      :class="[
        isUrgent
          ? 'bg-rose-50 text-rose-600 ring-rose-50/60'
          : 'bg-amber-50 text-amber-600 ring-amber-50/60'
      ]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-7 h-7"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    </div>

    <!-- Title & Message -->
    <h3
      id="session-warning-title"
      class="text-base sm:text-lg font-bold text-[#2C3E50] mb-1.5 leading-snug"
    >
      Sesi Anda Segera Berakhir
    </h3>
    <p
      id="session-warning-desc"
      class="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mb-5 max-w-xs sm:max-w-sm"
    >
      Tidak ada aktivitas terdeteksi. Sesi kerja Anda akan ditutup otomatis demi keamanan.
    </p>

    <!-- Integrated Linear Micro-Progress & Countdown Card -->
    <div class="w-full bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 mb-6 flex flex-col gap-2.5">
      <div class="flex items-center justify-between text-xs">
        <span class="font-medium text-slate-600 flex items-center gap-1.5">
          <span
            class="w-2 h-2 rounded-full transition-colors duration-300"
            :class="isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'"
          />
          Sisa Waktu Sesi
        </span>
        <span
          class="font-mono font-bold text-sm tracking-wide transition-colors duration-300"
          :class="isUrgent ? 'text-rose-600' : 'text-slate-800'"
        >
          {{ formattedCountdown }}
        </span>
      </div>

      <!-- Linear Progress Bar -->
      <div class="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-[width,background-color] duration-1000 ease-linear"
          :class="isUrgent ? 'bg-rose-500' : 'bg-[#008284]'"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>

    <!-- Action Buttons (Standard Tambora Button Hierarchy) -->
    <div class="flex items-center justify-center gap-3 w-full">
      <button
        type="button"
        :disabled="isExtending"
        class="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        @click="handleTimeout"
      >
        Keluar Sekarang
      </button>

      <button
        type="button"
        :disabled="isExtending"
        class="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#008284] hover:bg-[#006e70] active:scale-[0.98] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
        @click="handleExtend"
      >
        <svg
          v-if="isExtending"
          class="animate-spin h-3.5 w-3.5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span>{{ isExtending ? 'Memperbarui...' : 'Lanjutkan Sesi' }}</span>
      </button>
    </div>
  </VueFinalModal>
</template>
