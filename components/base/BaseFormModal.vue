<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount, nextTick } from "vue";
import { VueFinalModal } from "vue-final-modal";
import { FileText, RotateCcw, X } from "@lucide/vue";
import type { FormSectionConfig, FormFieldConfig } from "~/types";
import {
  useFormDraft,
  type FormDraftData,
  isFormDataEquivalent,
  hasMeaningfulContent,
} from "~/composables/useFormDraft";

interface Props {
  title: string;
  subtitle?: string;
  sections: FormSectionConfig[];
  submitting?: boolean;
  errors?: Record<string, string>;
  variant?: "drawer" | "centered";
  /** Optional unique key for auto-saving form drafts to prevent data loss */
  draftKey?: string;
  /** Optional explicit record ID to isolate drafts in edit mode */
  recordId?: string | number;
  /** Optional explicit edit mode flag (auto-detected if omitted) */
  isEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: "",
  submitting: false,
  errors: () => ({}),
  variant: "drawer",
  draftKey: "",
  recordId: "",
  isEdit: undefined,
});

const emit = defineEmits<{
  (e: "submit", data: Record<string, any>): void;
  (e: "cancel"): void;
}>();

// Two-way modal controls
const isOpen = defineModel<boolean>("isOpen", { default: false });
const formData = defineModel<Record<string, any>>("formData", {
  default: () => ({}),
});

// Draft handling composable
const { saveDraft, getDraft, clearDraft } = useFormDraft();
const existingDraft = ref<FormDraftData | null>(null);
const showDraftBanner = ref(false);
const isCheckingDraft = ref(false);
const draftDiscardedThisSession = ref(false);
let saveDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// Safe route retrieval for universal namespacing
let routePath = "";
try {
  const route = useRoute();
  routePath = route?.path || "";
} catch {
  // SSR or test fallback
}

// Universal Edit mode detection (checks prop or title semantics: ubah, edit, perbarui)
const isEditMode = computed(() => {
  if (props.isEdit !== undefined) return props.isEdit;
  return /(ubah|edit|perbarui)/i.test(props.title || "");
});

// Universal primary key detection: inspects explicit prop or any primary identifier in formData
const detectedRecordId = computed(() => {
  if (props.recordId !== undefined && props.recordId !== null && String(props.recordId).trim() !== "") {
    return String(props.recordId).trim();
  }
  const data = formData.value || {};

  // Search for standard primary key field patterns in Tambora
  const key = Object.keys(data).find(
    (k) =>
      /^(id|_id|uuid|code|kode_.*)$/i.test(k) &&
      data[k] !== null &&
      data[k] !== undefined &&
      String(data[k]).trim() !== "",
  );
  if (key) return String(data[key]).trim();

  // Deterministic fallback for edit mode without explicit id/kode field
  if (isEditMode.value) {
    const candidateVals = Object.entries(data)
      .filter(([_k, v]) => typeof v === "string" || typeof v === "number")
      .slice(0, 2)
      .map(([k, v]) => `${k}_${v}`)
      .join("_");
    if (candidateVals) return candidateVals.replace(/[^a-zA-Z0-9_-]/g, "_");
  }
  return "";
});

// Context-aware & collision-proof draft key
const effectiveDraftKey = computed(() => {
  const routeBase = routePath
    ? routePath.replace(/^\/|\/$/g, "").replace(/\//g, "_")
    : "";

  const base =
    props.draftKey ||
    routeBase ||
    (props.title
      ? props.title
          .toLowerCase()
          .replace(/^(tambah|ubah|edit|perbarui)\s+/i, "")
          .trim()
          .replace(/[^a-z0-9]+/g, "_")
      : "form");

  if (isEditMode.value) {
    const id = detectedRecordId.value || "unidentified";
    return `${base}_edit_${id}`;
  }
  return `${base}_create`;
});

// State for unsaved changes guard
const initialSnapshot = ref("");
const showUnsavedPrompt = ref(false);

const checkForExistingDraft = () => {
  if (!effectiveDraftKey.value) return;

  const found = getDraft(effectiveDraftKey.value);
  if (found && found.data) {
    // Only show banner if draft data actually differs semantically from current form
    const isEquivalent = isFormDataEquivalent(formData.value, found.data);
    if (!isEquivalent && hasMeaningfulContent(found.data)) {
      existingDraft.value = found;
      showDraftBanner.value = true;
      return;
    }
  }

  existingDraft.value = null;
  showDraftBanner.value = false;
};

// Lifecycle synchronization: wait for parent formData assignment before taking initial snapshot
watch(
  isOpen,
  async (open) => {
    if (open) {
      showUnsavedPrompt.value = false;
      draftDiscardedThisSession.value = false;
      isCheckingDraft.value = true;

      // Allow parent component to settle formData binding in the current microtask
      await nextTick();

      initialSnapshot.value = JSON.stringify(formData.value || {});
      checkForExistingDraft();
      isCheckingDraft.value = false;
    } else {
      if (saveDebounceTimer) {
        clearTimeout(saveDebounceTimer);
        saveDebounceTimer = null;
      }
      showDraftBanner.value = false;
      existingDraft.value = null;
    }
  },
  { immediate: true },
);

// Auto-save draft on form input changes (debounced 500ms)
// ONLY save if user modified form away from initial state and has not discarded
watch(
  formData,
  (newVal) => {
    if (
      !isOpen.value ||
      !effectiveDraftKey.value ||
      isCheckingDraft.value ||
      draftDiscardedThisSession.value
    ) {
      return;
    }

    if (saveDebounceTimer) {
      clearTimeout(saveDebounceTimer);
      saveDebounceTimer = null;
    }

    // Do NOT auto-save if formData is semantically equivalent to initial snapshot
    let initialObj = {};
    try {
      initialObj = JSON.parse(initialSnapshot.value || "{}");
    } catch {
      // ignore json parse error
    }

    if (isFormDataEquivalent(newVal, initialObj)) {
      return;
    }

    saveDebounceTimer = setTimeout(() => {
      if (
        effectiveDraftKey.value &&
        isOpen.value &&
        !draftDiscardedThisSession.value
      ) {
        saveDraft(effectiveDraftKey.value, newVal || {});
      }
    }, 500);
  },
  { deep: true },
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
  if (effectiveDraftKey.value) {
    clearDraft(effectiveDraftKey.value);
  }
  draftDiscardedThisSession.value = true;
  showDraftBanner.value = false;
  existingDraft.value = null;
};

// Check if form data has been modified by the user using semantic comparison
const isDirty = computed(() => {
  if (!isOpen.value) return false;
  let initialObj = {};
  try {
    initialObj = JSON.parse(initialSnapshot.value || "{}");
  } catch {
    // ignore json parse error
  }
  return !isFormDataEquivalent(formData.value || {}, initialObj);
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
  if (props.submitting) return;
  if (showUnsavedPrompt.value) {
    showUnsavedPrompt.value = false;
    return;
  }
  if (isDirty.value) {
    showUnsavedPrompt.value = true;
  } else {
    isOpen.value = false;
    emit("cancel");
  }
};

useModalEsc(isOpen, handleAttemptClose);

const confirmDiscardChanges = () => {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  if (effectiveDraftKey.value) {
    clearDraft(effectiveDraftKey.value);
  }

  // Restore formData back to original initial snapshot so parent state stays clean
  try {
    const original = JSON.parse(initialSnapshot.value || "{}");
    formData.value = { ...original };
  } catch {
    // ignore json parse error
  }

  draftDiscardedThisSession.value = true;
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
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  if (effectiveDraftKey.value) {
    clearDraft(effectiveDraftKey.value);
  }
  emit("submit", formData.value);
};
</script>

<template>
  <VueFinalModal
    v-model="isOpen"
    :focus-trap="false"
    overlay-transition="vfm-slide-fade"
    :content-transition="
      variant === 'centered' ? 'vfm-slide-fade' : 'vfm-slide-right'
    "
    :click-to-close="!isDirty"
    :esc-to-close="false"
    :class="
      variant === 'centered'
        ? 'fixed inset-0 z-[100] flex items-center justify-center p-4'
        : 'fixed inset-0 z-[100] flex justify-end'
    "
    :content-class="
      variant === 'centered'
        ? 'relative z-[100] bg-[#F6FAFD] w-full max-w-md rounded-xl flex flex-col shadow-2xl border border-gray-200/60 overflow-visible max-h-[90vh] my-auto'
        : 'absolute z-[100] top-0 right-0 bg-[#F6FAFD] w-full sm:w-11/12 md:w-5/6 lg:w-3/4 xl:w-2/3 max-w-4xl h-screen flex flex-col shadow-2xl border-l border-gray-200/60 overflow-hidden'
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
        <!-- Draft Recovery Banner (Smart Assistant Card) -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="transform -translate-y-2 scale-[0.98] opacity-0"
          enter-to-class="transform translate-y-0 scale-100 opacity-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="transform translate-y-0 scale-100 opacity-100"
          leave-to-class="transform -translate-y-2 scale-[0.98] opacity-0"
        >
          <div
            v-if="showDraftBanner"
            class="bg-white/95 border border-slate-200/90 rounded-xl p-3 sm:p-3.5 shadow-xs backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <div
                class="p-2 bg-[#008284]/10 text-[#008284] rounded-lg shrink-0 flex items-center justify-center"
              >
                <FileText class="w-4 h-4" />
              </div>
              <div class="text-left">
                <div class="flex items-center gap-2">
                  <p class="text-xs font-bold text-[#2C3E50]">
                    Ditemukan Draf Tersimpan
                  </p>
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                  >
                    Auto-Save
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Tersimpan otomatis
                  <span v-if="existingDraft?.formattedTime" class="font-medium text-slate-700"
                    >pukul {{ existingDraft.formattedTime }}</span
                  >. Pulihkan data sebelumnya?
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                class="px-3 py-1.5 bg-[#008284] hover:bg-[#006e70] active:scale-[0.97] text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                @click="restoreDraft"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Pulihkan Draf</span>
              </button>
              <button
                type="button"
                class="px-2.5 py-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 active:scale-[0.97] rounded-lg text-xs font-medium transition-all flex items-center gap-1 cursor-pointer"
                title="Abaikan dan hapus draf"
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
          class="space-y-3"
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
              <h4
                class="text-xs font-bold uppercase tracking-wider text-[#2671D9]"
              >
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
          <slot name="extra" />
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

      <!-- Unsaved Changes Prompt Overlay (Centered, Balanced, & Impeccable) -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <div
            v-if="showUnsavedPrompt"
            class="fixed inset-0 z-[105] bg-gray-950/40 backdrop-blur-xs flex items-center justify-center p-4 select-none"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="unsaved-prompt-title"
            aria-describedby="unsaved-prompt-desc"
          >
            <div
              class="bg-white rounded-2xl p-6 sm:p-7 max-w-sm sm:max-w-md w-full shadow-2xl border border-gray-100/90 flex flex-col items-center text-center select-none transform transition-all duration-200 ease-out animate-in zoom-in-[0.98]"
            >
              <!-- Layered Ring Warning Icon Badge -->
              <div
                class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/50 flex items-center justify-center mb-3.5"
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
                  <path
                    d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                  />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>

              <!-- Header & Message -->
              <h4
                id="unsaved-prompt-title"
                class="text-base sm:text-lg font-bold text-[#2C3E50] mb-2 leading-snug"
              >
                Perubahan Belum Disimpan
              </h4>
              <p
                id="unsaved-prompt-desc"
                class="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed mb-6 max-w-xs sm:max-w-sm"
              >
                Anda memiliki data yang belum disimpan pada formulir ini.
                Yakin ingin menutup dan membuang perubahan?
              </p>

              <!-- Action Buttons (Balanced Full-Width Standard Tambora Buttons) -->
              <div class="flex items-center justify-center gap-3 w-full">
                <button
                  type="button"
                  class="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-xl transition-all cursor-pointer"
                  @click="continueEditing"
                >
                  Lanjut Mengisi
                </button>
                <button
                  type="button"
                  class="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
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
