<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { VueFinalModal } from "vue-final-modal";
import { FileText, RotateCcw, X } from "@lucide/vue";
import type { FormSectionConfig, FormFieldConfig } from "~/types";
import { useFormDraft, type FormDraftData } from "~/composables/useFormDraft";

interface Props {
  title: string;
  subtitle?: string;
  sections: FormSectionConfig[];
  submitting?: boolean;
  errors?: Record<string, string>;
  variant?: "drawer" | "centered";
  /** Optional unique key for auto-saving form drafts to prevent data loss */
  draftKey?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: "",
  submitting: false,
  errors: () => ({}),
  variant: "drawer",
  draftKey: "",
});

const emit = defineEmits<{
  (e: "submit" | "cancel"): void;
}>();

// Two-way modal controls
const isOpen = defineModel<boolean>("isOpen", { default: false });
const formData = defineModel<Record<string, any>>("formData", {
  default: () => ({}),
});

// Draft handling
const { saveDraft, getDraft, clearDraft } = useFormDraft();
const existingDraft = ref<FormDraftData | null>(null);
const showDraftBanner = ref(false);
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// State for unsaved changes guard
const initialSnapshot = ref("");
const showUnsavedPrompt = ref(false);

// Record initial snapshot and check for existing drafts whenever modal opens
watch(
  isOpen,
  (open) => {
    if (open) {
      showUnsavedPrompt.value = false;
      initialSnapshot.value = JSON.stringify(formData.value || {});

      // Check for available draft
      if (props.draftKey) {
        const found = getDraft(props.draftKey);
        if (found && found.data) {
          // Only show banner if draft data is different from current form data
          const currentStr = JSON.stringify(formData.value || {});
          const draftStr = JSON.stringify(found.data);
          if (currentStr !== draftStr) {
            existingDraft.value = found;
            showDraftBanner.value = true;
          }
        }
      }
    } else {
      showDraftBanner.value = false;
      existingDraft.value = null;
    }
  },
  { immediate: true }
);

// Auto-save draft on form input changes (debounced 500ms)
watch(
  formData,
  (newVal) => {
    if (!isOpen.value || !props.draftKey) return;

    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
    }

    saveDebounceTimer = setTimeout(() => {
      if (props.draftKey && isOpen.value) {
        saveDraft(props.draftKey, newVal || {});
      }
    }, 500);
  },
  { deep: true }
);

onBeforeUnmount(() => {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }
});

const restoreDraft = () => {
  if (existingDraft.value?.data) {
    formData.value = {
      ...formData.value,
      ...existingDraft.value.data,
    };
  }
  showDraftBanner.value = false;
};

const discardDraft = () => {
  if (props.draftKey) {
    clearDraft(props.draftKey);
  }
  showDraftBanner.value = false;
  existingDraft.value = null;
};

// Check if form data has been modified by the user
const isDirty = computed(() => {
  if (!isOpen.value) return false;
  const current = JSON.stringify(formData.value || {});
  if (current === initialSnapshot.value) return false;
  const data = formData.value || {};
  return Object.values(data).some(
    (v) => v !== "" && v !== null && v !== undefined
  );
});

const isFieldVisible = (field: FormFieldConfig) => {
  if (typeof field.hidden === "function") {
    return !field.hidden(formData.value || {});
  }
  return !field.hidden;
};

// Check if all required fields in active form sections are filled out
const isFormValid = computed(() => {
  if (!props.sections || props.sections.length === 0) return true;

  for (const section of props.sections) {
    for (const field of section.fields) {
      if (
        isFieldVisible(field) &&
        field.required !== false &&
        field.required !== undefined
      ) {
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

const handleAttemptClose = () => {
  if (isDirty.value && !props.submitting) {
    showUnsavedPrompt.value = true;
  } else {
    isOpen.value = false;
    emit("cancel");
  }
};

const confirmDiscardChanges = () => {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  if (props.draftKey) {
    clearDraft(props.draftKey);
  }
  existingDraft.value = null;
  showDraftBanner.value = false;
  showUnsavedPrompt.value = false;
  isOpen.value = false;
  emit("cancel");
};

const continueEditing = () => {
  showUnsavedPrompt.value = false;
};

const handleSubmit = () => {
  if (!isFormValid.value || props.submitting) return;
  if (props.draftKey) {
    clearDraft(props.draftKey);
  }
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
    :click-to-close="!isDirty"
    :esc-to-close="!isDirty"
    :class="
      variant === 'centered'
        ? 'fixed inset-0 z-[100] flex items-center justify-center p-4'
        : 'fixed inset-0 z-[100] flex justify-end'
    "
    :content-class="
      variant === 'centered'
        ? 'relative z-[100] bg-[#F6FAFD] w-full max-w-md rounded-xl flex flex-col shadow-2xl border border-gray-200/60 overflow-visible max-h-[90vh] my-auto'
        : 'absolute z-[100] top-0 right-0 bg-[#F6FAFD] w-4/5 sm:w-3/4 md:w-2/3 lg:w-3/5 h-screen flex flex-col shadow-2xl border-l border-gray-200/60 overflow-hidden'
    "
    overlay-class="fixed inset-0 bg-gray-950/40 backdrop-blur-xs z-[99]"
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
          @click="handleAttemptClose"
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
        <!-- Draft Recovery Banner -->
        <Transition
          enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0"
          enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0"
        >
          <div
            v-if="showDraftBanner"
            class="p-4 bg-amber-50/90 border border-amber-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
          >
            <div class="flex items-start sm:items-center gap-3">
              <div class="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                <FileText class="w-4 h-4" />
              </div>
              <div>
                <p class="text-xs font-semibold text-amber-900">
                  Ditemukan Draft Tersimpan
                </p>
                <p class="text-[11px] text-amber-700 mt-0.5">
                  Tersimpan otomatis
                  <span v-if="existingDraft?.formattedTime">pukul {{ existingDraft.formattedTime }}</span>.
                  Pulihkan data input sebelumnya?
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                @click="restoreDraft"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Pulihkan Draft</span>
              </button>
              <button
                type="button"
                class="px-2.5 py-1.5 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                title="Abaikan dan hapus draft"
                @click="discardDraft"
              >
                <X class="w-3.5 h-3.5" />
                <span>Abaikan</span>
              </button>
            </div>
          </div>
        </Transition>

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
              <span class="w-1.5 h-4 bg-[#2671D9] rounded-full" />
              <h4 class="text-xs font-bold uppercase tracking-wider text-[#2671D9]">
                {{ section.title }}
              </h4>
              <div class="flex-1 h-px bg-gray-200/80" />
            </div>

            <!-- Fields Grid for this Section -->
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div
                v-for="field in section.fields.filter(isFieldVisible)"
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
                  :form-data="formData"
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
          @click="handleAttemptClose"
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

      <!-- Unsaved Changes Prompt Overlay (Teleported to Body for clean full-screen backdrop) -->
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="showUnsavedPrompt"
            class="fixed inset-0 z-[100] bg-gray-950/45 backdrop-blur-xs flex items-center justify-center p-4 select-none"
          >
            <div
              class="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] border border-gray-100 flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            >
              <!-- Left-Aligned Header with Icon Badge -->
              <div class="flex items-start gap-3.5">
                <div
                  class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 class="text-base font-bold text-gray-900">
                    Perubahan Belum Disimpan
                  </h4>
                  <p class="text-xs text-gray-500 mt-1 leading-relaxed">
                    Anda memiliki data yang belum disimpan pada formulir ini. Yakin ingin menutup dan membuang perubahan?
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                  @click="continueEditing"
                >
                  Lanjut Mengisi
                </button>
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors cursor-pointer"
                  @click="confirmDiscardChanges"
                >
                  Buang & Tutup
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </VueFinalModal>
</template>
