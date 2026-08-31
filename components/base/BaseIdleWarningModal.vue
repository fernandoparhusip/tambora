<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'

const {
  showWarning,
  formattedCountdown,
  extendSession,
  handleTimeout
} = useIdleTimer()
</script>

<template>
  <VueFinalModal
    v-model="showWarning"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    content-class="relative z-[100] w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-100 overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200"
    overlay-class="fixed inset-0 z-[99] bg-gray-950/60 backdrop-blur-xs"
    :click-to-close="false"
    :esc-to-close="false"
  >
    <div class="p-6 sm:p-7 text-center flex flex-col items-center">
      <!-- Warning Animated Icon -->
      <div class="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-500 mb-4 shadow-inner">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="animate-pulse"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>

      <!-- Title & Message -->
      <h3 class="text-xl font-bold text-gray-900 tracking-tight mb-2">
        Sesi Anda Segera Berakhir
      </h3>
      <p class="text-sm text-gray-600 leading-relaxed mb-5 max-w-xs">
        Tidak ada aktivitas terdeteksi. Sesi kerja Anda akan ditutup otomatis dalam:
      </p>

      <!-- Countdown Digital Timer Display -->
      <div class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 font-mono text-2xl font-bold tracking-wider mb-6">
        <span>{{ formattedCountdown }}</span>
      </div>

      <!-- Action Buttons -->
      <div class="w-full flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          class="w-full sm:flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
          @click="handleTimeout"
        >
          Keluar Sekarang
        </button>

        <button
          type="button"
          class="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#008284] hover:bg-[#006e70] text-white text-sm font-semibold shadow-md shadow-[#008284]/20 active:scale-[0.98] transition-all cursor-pointer"
          @click="extendSession"
        >
          Lanjutkan Sesi
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>
