<script setup lang="ts">
import { watch } from "vue";
import { VueFinalModal } from "vue-final-modal";

interface Props {
  title?: string;
  subtitle?: string;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  title: "Data berhasil disimpan",
  subtitle: "Berhasil disimpan",
  autoClose: true,
  autoCloseDelay: 2000,
});

const emit = defineEmits<{
  (e: "close"): void;
}>();

const isOpen = defineModel<boolean>("isOpen", { default: false });

let timer: ReturnType<typeof setTimeout> | null = null;

watch(isOpen, (val) => {
  if (val && props.autoClose) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      isOpen.value = false;
    }, props.autoCloseDelay);
  }
});

const handleClosed = () => {
  emit("close");
};
</script>

<template>
  <VueFinalModal
    v-model="isOpen"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    :click-to-close="true"
    :esc-to-close="true"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    content-class="relative z-[100] bg-white w-full max-w-xs sm:max-w-sm rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center text-center shadow-2xl border border-gray-100/80 my-auto select-none"
    overlay-class="fixed inset-0 bg-gray-950/40 backdrop-blur-xs z-[99]"
    @closed="handleClosed"
  >
    <!-- Confetti & Green Checkmark Illustration -->
    <div
      class="relative flex items-center justify-center w-28 h-28 mb-5 select-none"
    >
      <!-- Confetti Particles Background SVG -->
      <svg
        class="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="12" r="3" fill="#10B981" />
        <circle cx="28" cy="24" r="2.5" fill="#3B82F6" />
        <circle cx="72" cy="22" r="2.5" fill="#F59E0B" />
        <circle cx="16" cy="50" r="3" fill="#F59E0B" />
        <circle cx="86" cy="52" r="2" fill="#10B981" />
        <circle cx="32" cy="80" r="2.5" fill="#10B981" />
        <circle cx="68" cy="82" r="3" fill="#3B82F6" />
        <rect
          x="20"
          y="32"
          width="4"
          height="4"
          rx="1"
          fill="#10B981"
          transform="rotate(25 20 32)"
        />
        <rect
          x="76"
          y="68"
          width="5"
          height="3"
          rx="1"
          fill="#10B981"
          transform="rotate(-15 76 68)"
        />
        <path
          d="M22 68 C 24 64, 28 66, 30 62"
          stroke="#10B981"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
        <path
          d="M70 76 C 72 80, 76 78, 78 82"
          stroke="#10B981"
          stroke-width="2"
          stroke-linecap="round"
          fill="none"
        />
      </svg>

      <!-- Center Green Circle with Checkmark -->
      <div
        class="relative z-10 w-20 h-20 bg-[#10B981] rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-10 h-10 text-white stroke-[3.5]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    </div>

    <!-- Text Header -->
    <h3
      class="text-base sm:text-lg font-bold text-[#2671D9] mb-1.5 leading-snug"
    >
      {{ title }}
    </h3>
    <p class="text-xs text-gray-400 font-normal">
      {{ subtitle }}
    </p>
  </VueFinalModal>
</template>

<style scoped>
/* Pure smooth fade transition for success modal popup */
:deep(.vfm-fade-enter-active),
:deep(.vfm-fade-leave-active) {
  transition: opacity 0.3s ease-in-out !important;
}

:deep(.vfm-fade-enter-from),
:deep(.vfm-fade-leave-to) {
  opacity: 0 !important;
}
</style>
