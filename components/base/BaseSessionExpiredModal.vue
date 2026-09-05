<script setup lang="ts">
import { computed } from 'vue'
import { VueFinalModal } from 'vue-final-modal'
import { useIdleTimer } from '~/composables/useIdleTimer'

const {
  showExpired,
  expiredRemainingSeconds,
  confirmExpiredLogout
} = useIdleTimer()

// Total expired grace duration is 10s
const progressPercent = computed(() => {
  return Math.max(0, Math.min(100, (expiredRemainingSeconds.value / 10) * 100))
})
</script>

<template>
  <VueFinalModal
    v-model="showExpired"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    :click-to-close="false"
    :esc-to-close="false"
    class="fixed inset-0 z-[1000000] flex items-center justify-center p-4"
    content-class="relative z-[1000000] bg-white w-full max-w-sm sm:max-w-md rounded-2xl p-6 sm:p-7 flex flex-col items-center text-center shadow-2xl border border-gray-100/90 my-auto select-none transform transition-all duration-200 ease-out"
    overlay-class="fixed inset-0 bg-gray-950/70 backdrop-blur-xs z-[999999]"
    role="alertdialog"
    aria-modal="true"
    aria-labelledby="session-expired-title"
    aria-describedby="session-expired-desc"
  >
    <!-- Expired Warning Badge (Taste Design: Layered Ring, calm & authoritative) -->
    <div
      class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-rose-50 text-rose-600 ring-8 ring-rose-50/60 transition-colors duration-300"
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
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>

    <!-- Title & Description -->
    <h3
      id="session-expired-title"
      class="text-base sm:text-lg font-bold text-[#2C3E50] mb-1.5 leading-snug"
    >
      Sesi Anda Telah Kedaluwarsa
    </h3>
    <p
      id="session-expired-desc"
      class="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mb-4 max-w-xs sm:max-w-sm"
    >
      Masa aktif sesi di server telah berakhir demi keamanan. Silakan login kembali untuk memperbarui hak akses Anda.
    </p>

    <!-- Info Card (Impeccable Principle: Clear reassurance & context) -->
    <div class="w-full bg-rose-50/50 border border-rose-100/80 rounded-xl p-3 mb-4 flex items-start gap-2.5 text-left">
      <span class="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
      <p class="text-[11px] sm:text-xs text-rose-700 leading-relaxed">
        Sesi ditutup demi perlindungan data akun. Draft perubahan formulir yang belum sempat tersimpan tetap aman di peramban ini.
      </p>
    </div>

    <!-- Micro Linear Countdown (Emil Kowalski Principle: Smooth visual feedback) -->
    <div class="w-full bg-slate-50/80 border border-slate-100 rounded-xl p-3 mb-5 flex flex-col gap-2">
      <div class="flex items-center justify-between text-xs">
        <span class="font-medium text-slate-600 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          Pengalihan Otomatis
        </span>
        <span class="font-mono font-bold text-xs text-rose-600">
          {{ expiredRemainingSeconds }}s
        </span>
      </div>

      <div class="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
        <div
          class="h-full bg-rose-500 rounded-full transition-[width] duration-1000 ease-linear"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>

    <!-- Action Button (Tambora Teal Identity: Reassurance rather than destruction) -->
    <button
      type="button"
      class="w-full py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-[#008284] hover:bg-[#006e70] active:scale-[0.98] rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
      @click="confirmExpiredLogout"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
      <span>Login Kembali Sekarang</span>
    </button>
  </VueFinalModal>
</template>
