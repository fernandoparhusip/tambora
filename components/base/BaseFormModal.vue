<script setup lang="ts">
import { computed } from "vue";
import { VueFinalModal } from "vue-final-modal";
import type { FormSectionConfig } from "~/types";

interface Props {
  title: string;
  subtitle?: string;
  sections: FormSectionConfig[];
  submitting?: boolean;
  errors?: Record<string, string>;
  variant?: "drawer" | "centered";
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: "",
  submitting: false,
  errors: () => ({}),
  variant: "drawer",
});

const emit = defineEmits<{
  (e: "submit" | "cancel"): void;
}>();

// Two-way modal controls
const isOpen = defineModel<boolean>("isOpen", { default: false });
const formData = defineModel<Record<string, any>>("formData", {
  default: () => ({}),
});

// Check if all required fields in active form sections are filled out
const isFormValid = computed(() => {
  if (!props.sections || props.sections.length === 0) return true;

  for (const section of props.sections) {
    for (const field of section.fields) {
      if (field.required !== false) {
        const val = formData.value?.[field.key];
        if (val === undefined || val === null || val === "") {
          return false;
        }
        if (typeof val === "string" && val.trim() === "") {
          return false;
        }
      }
    }
  }
  return true;
});

const closeModal = () => {
  isOpen.value = false;
  emit("cancel");
};

const handleSubmit = () => {
  if (!isFormValid.value || props.submitting) return;
  emit("submit");
};
</script>

<template>
  <VueFinalModal
    v-model="isOpen"
    overlay-transition="vfm-slide-fade"
    :content-transition="
      variant === 'centered' ? 'vfm-slide-fade' : 'vfm-slide-right'
    "
    :click-to-close="true"
    :esc-to-close="true"
    :class="
      variant === 'centered'
        ? 'fixed inset-0 z-50 flex items-center justify-center p-4'
        : 'fixed inset-0 z-50 flex justify-end'
    "
    :content-class="
      variant === 'centered'
        ? 'relative z-40 bg-[#F6FAFD] w-full max-w-md rounded-xl flex flex-col shadow-2xl border border-gray-200/60 overflow-visible max-h-[90vh] my-auto'
        : 'absolute z-40 top-0 right-0 bg-[#F6FAFD] w-4/5 sm:w-3/4 md:w-2/3 lg:w-3/5 h-screen flex flex-col shadow-2xl border-l border-gray-200/60 overflow-hidden'
    "
    overlay-class="fixed inset-0 bg-gray-950/40 backdrop-blur-xs"
  >
    <div
      id="base-form-modal-container"
      class="relative flex flex-col w-full h-full min-h-0"
    >
      <!-- Drawer Header -->
      <div
        class="px-6 py-4 bg-white border-b border-gray-200/60 flex items-center gap-3.5 shrink-0 rounded-t-2xl"
      >
        <!-- Close Icon (Circle button on top left) -->
        <button
          type="button"
          class="w-9 h-9 rounded-full bg-sky-50 text-sky-600 hover:bg-sky-100 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
          title="Tutup"
          @click="closeModal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 stroke-[2.5]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div>
          <h3
            class="text-base sm:text-lg font-bold text-[#2C3E50] leading-snug"
          >
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-xs text-gray-400 mt-0.5 font-normal">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- Drawer Body (Full height scrollable, bg-[#F6FAFD]) -->
      <div class="flex-1 overflow-y-auto p-6 bg-[#F6FAFD] space-y-6">
        <form
          id="base-form-modal-form"
          class="space-y-6"
          @submit.prevent="handleSubmit"
        >
          <div
            v-for="(section, sIdx) in sections"
            :key="sIdx"
            class="space-y-3"
          >
            <!-- Section Divider & Title (if title exists) -->
            <div v-if="section.title" class="flex items-center gap-3 pt-2">
              <span
                class="text-xs font-bold text-[#4D5E80] tracking-wide whitespace-nowrap"
              >
                {{ section.title }}
              </span>
              <div class="h-px bg-gray-200/80 w-full" />
            </div>

            <!-- Fields Grid directly on bg-[#F6FAFD] -->
            <div class="grid grid-cols-12 gap-3 sm:gap-4">
              <div
                v-for="field in section.fields"
                :key="field.key"
                class="col-span-12"
                :class="{
                  'md:col-span-1': field.colSpan === 1,
                  'md:col-span-2': field.colSpan === 2,
                  'md:col-span-3': field.colSpan === 3,
                  'md:col-span-4': field.colSpan === 4,
                  'md:col-span-5': field.colSpan === 5,
                  'md:col-span-6': field.colSpan === 6,
                  'md:col-span-7': field.colSpan === 7,
                  'md:col-span-8': field.colSpan === 8,
                  'md:col-span-9': field.colSpan === 9,
                  'md:col-span-10': field.colSpan === 10,
                  'md:col-span-11': field.colSpan === 11,
                  'md:col-span-12': field.colSpan === 12 || !field.colSpan,
                }"
              >
                <BaseFormFieldRenderer
                  v-model="formData[field.key]"
                  :field="field"
                  :error="errors?.[field.key]"
                />
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Drawer Footer (Fixed Bottom Right) -->
      <div
        class="px-6 py-4 bg-white border-t border-gray-200/60 flex items-center justify-end gap-3 shrink-0 mt-auto"
        :class="{ 'rounded-b-2xl': variant === 'centered' }"
      >
        <button
          type="button"
          class="text-red-500 hover:text-red-600 font-bold text-xs tracking-wider uppercase px-4 py-2 transition-colors cursor-pointer"
          @click="closeModal"
        >
          BATAL
        </button>
        <button
          type="submit"
          form="base-form-modal-form"
          :disabled="submitting || !isFormValid"
          class="font-bold text-xs tracking-wider uppercase px-6 py-2.5 rounded-lg shadow-xs transition-all"
          :class="[
            isFormValid && !submitting
              ? 'bg-[#2671D9] hover:bg-[#1d5bb8] active:scale-98 text-white cursor-pointer'
              : 'bg-[#6C757D] text-white opacity-70 cursor-not-allowed',
          ]"
        >
          <span v-if="submitting">MEMPROSES...</span>
          <span v-else>SIMPAN</span>
        </button>
      </div>
    </div>
  </VueFinalModal>
</template>
