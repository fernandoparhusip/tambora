<script setup lang="ts">
import { VueFinalModal } from "vue-final-modal";

interface Props {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Konfirmasi Hapus",
  message: "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  confirmLabel: "HAPUS",
  cancelLabel: "BATAL",
  variant: "danger",
  loading: false,
});

const emit = defineEmits<{
  (e: "confirm" | "cancel"): void;
}>();

const isOpen = defineModel<boolean>("isOpen", { default: false });

const handleCancel = () => {
  if (props.loading) return;
  isOpen.value = false;
  emit("cancel");
};

useModalEsc(isOpen, handleCancel);

const handleConfirm = () => {
  emit("confirm");
};
</script>

<template>
  <VueFinalModal
    v-model="isOpen"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    :click-to-close="!loading"
    :esc-to-close="false"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    content-class="relative z-[100] bg-white w-full max-w-sm sm:max-w-md rounded-2xl p-6 sm:p-7 flex flex-col items-center text-center shadow-2xl border border-gray-100/90 my-auto select-none"
    overlay-class="fixed inset-0 bg-gray-950/40 backdrop-blur-xs z-[99]"
  >
    <!-- Warning / Danger Icon Badge -->
    <div
      class="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors"
      :class="[
        variant === 'danger'
          ? 'bg-red-50 text-red-600 ring-8 ring-red-50/50'
          : variant === 'warning'
            ? 'bg-amber-50 text-amber-600 ring-8 ring-amber-50/50'
            : 'bg-blue-50 text-blue-600 ring-8 ring-blue-50/50',
      ]"
    >
      <!-- Trash / Danger SVG -->
      <svg
        v-if="variant === 'danger'"
        xmlns="http://www.w3.org/2000/svg"
        class="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      </svg>
      <!-- Alert Triangle SVG -->
      <svg
        v-else
        xmlns="http://www.w3.org/2000/svg"
        class="w-8 h-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" x2="12" y1="9" y2="13" />
        <line x1="12" x2="12.01" y1="17" y2="17" />
      </svg>
    </div>

    <!-- Header & Message -->
    <h3 class="text-base sm:text-lg font-bold text-[#2C3E50] mb-2 leading-snug">
      {{ title }}
    </h3>
    <p class="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed mb-6">
      {{ message }}
    </p>

    <!-- Action Buttons -->
    <div class="flex items-center justify-center gap-3 w-full">
      <button
        type="button"
        :disabled="loading"
        class="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        @click="handleCancel"
      >
        {{ cancelLabel }}
      </button>
      <button
        type="button"
        :disabled="loading"
        class="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        :class="[
          variant === 'danger'
            ? 'bg-red-600 hover:bg-red-700 active:scale-98 shadow-red-500/20'
            : 'bg-blue-600 hover:bg-blue-700 active:scale-98',
        ]"
        @click="handleConfirm"
      >
        <svg
          v-if="loading"
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
        <span>{{ loading ? "MEMPROSES..." : confirmLabel }}</span>
      </button>
    </div>
  </VueFinalModal>
</template>

<style scoped>
:deep(.vfm-fade-enter-active),
:deep(.vfm-fade-leave-active) {
  transition: opacity 0.2s ease-in-out !important;
}

:deep(.vfm-fade-enter-from),
:deep(.vfm-fade-leave-to) {
  opacity: 0 !important;
}
</style>
