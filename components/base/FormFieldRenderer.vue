<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import type { FormFieldConfig } from "~/types";

interface Props {
  field: FormFieldConfig;
  error?: string;
}

const props = defineProps<Props>();

// Vue 3.4 two-way model binding
const value = defineModel<any>();

// Phone Number Input Handler
const phoneInputValue = computed(() => {
  if (!value.value) return "";
  const raw = String(value.value);
  if (raw.startsWith("+62")) {
    return raw.slice(3);
  }
  return raw;
});

const onPhoneInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const digitsOnly = target.value.replace(/\D/g, "");
  target.value = digitsOnly;
  value.value = digitsOnly ? `+62${digitsOnly}` : "";
};

// Multi-select state & helpers
const multiSelectValues = computed<any[]>(() => {
  if (Array.isArray(value.value)) return value.value;
  if (value.value !== undefined && value.value !== null && value.value !== "") {
    return [value.value];
  }
  return [];
});

const isMultiSelected = (optValue: any) => {
  return multiSelectValues.value.includes(optValue);
};

const toggleMultiSelectOption = (optValue: any) => {
  const current = [...multiSelectValues.value];
  const idx = current.indexOf(optValue);
  if (idx > -1) {
    current.splice(idx, 1);
  } else {
    current.push(optValue);
  }
  value.value = current;
};

const multiSelectDisplayLabel = computed(() => {
  const selected = multiSelectValues.value;
  if (!selected || selected.length === 0) return "";
  const labels = selected
    .map((val) => {
      const opt = props.field.options?.find((o) => o.value === val);
      return opt ? opt.label : val;
    })
    .filter(Boolean);
  return labels.join(", ");
});

// Searchable select state & positioning
const isOpen = ref(false);
const selectSearchQuery = ref("");
const triggerRef = ref<HTMLElement | null>(null);
const popupRef = ref<HTMLElement | null>(null);
const selectSearchInputRef = ref<HTMLInputElement | null>(null);
const dropdownPos = ref({ top: 0, left: 0, width: 200 });

const teleportTarget = computed(() => {
  if (
    import.meta.client &&
    document.getElementById("base-form-modal-container")
  ) {
    return "#base-form-modal-container";
  }
  return "body";
});

const updatePosition = () => {
  if (!triggerRef.value) return;
  const rect = triggerRef.value.getBoundingClientRect();
  dropdownPos.value = {
    top: rect.bottom + 4,
    left: rect.left,
    width: rect.width,
  };
};

const toggleDropdown = async () => {
  if (!isOpen.value) {
    updatePosition();
    isOpen.value = true;
    await nextTick();
    updatePosition();
    selectSearchInputRef.value?.focus();
  } else {
    isOpen.value = false;
  }
};

const popupStyle = computed(() => ({
  top: `${dropdownPos.value.top}px`,
  left: `${dropdownPos.value.left}px`,
  width: `${dropdownPos.value.width}px`,
}));

const selectedOptionLabel = computed(() => {
  const opt = props.field.options?.find((o) => o.value === value.value);
  return opt ? opt.label : "";
});

const filteredOptions = computed(() => {
  const opts = props.field.options || [];
  if (!selectSearchQuery.value) return opts;
  const q = selectSearchQuery.value.toLowerCase();
  return opts.filter((o) => o.label.toLowerCase().includes(q));
});

const selectOption = (optValue: any) => {
  value.value = optValue;
  isOpen.value = false;
  selectSearchQuery.value = "";
};

const handleOutsideClick = (e: MouseEvent) => {
  if (!isOpen.value) return;
  const target = e.target as Node;
  if (
    triggerRef.value &&
    !triggerRef.value.contains(target) &&
    popupRef.value &&
    !popupRef.value.contains(target)
  ) {
    isOpen.value = false;
  }
};

const handleScrollOrResize = () => {
  if (isOpen.value) {
    updatePosition();
  }
};

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener("click", handleOutsideClick);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener("click", handleOutsideClick);
    window.removeEventListener("scroll", handleScrollOrResize, true);
    window.removeEventListener("resize", handleScrollOrResize);
  }
});

// PrimeVue DatePicker converters
const dateValue = computed<Date | null>(() => {
  if (!value.value) return null;
  const d = new Date(value.value);
  return isNaN(d.getTime()) ? null : d;
});

const onDateSelect = (
  date: Date | Date[] | (Date | null)[] | null | undefined,
) => {
  if (!date || Array.isArray(date)) {
    value.value = "";
    return;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  value.value = `${y}-${m}-${d}`;
};
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="field.label"
      :for="field.key"
      class="block text-xs font-semibold text-[#4D5E80] mb-1.5 select-none"
    >
      {{ field.label }}
      <span
        v-if="field.required !== false && field.required !== undefined"
        class="text-red-500 font-semibold ml-0.5"
        >*</span
      >
    </label>

    <!-- Radio Field -->
    <div
      v-if="field.type === 'radio'"
      class="flex flex-wrap items-center gap-6 py-1"
    >
      <label
        v-for="opt in field.options || []"
        :key="opt.value"
        class="inline-flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer select-none"
      >
        <input
          v-model="value"
          type="radio"
          :name="field.key"
          :value="opt.value"
          :disabled="field.disabled"
          class="w-4 h-4 accent-blue-600 border-gray-300 cursor-pointer"
          style="accent-color: #2563eb"
        />
        <span>{{ opt.label }}</span>
      </label>
    </div>

    <!-- Phone Field (+62 Prefix + Number only) -->
    <div v-else-if="field.type === 'phone'" class="relative flex items-center">
      <div
        class="h-10 px-3 bg-gray-50 border border-r-0 border-gray-200/80 rounded-l-lg flex items-center gap-1.5 shrink-0 text-xs font-semibold text-gray-700 select-none"
      >
        <!-- Indonesian Flag Icon -->
        <svg
          class="w-4 h-3 rounded-xs shadow-2xs"
          viewBox="0 0 3 2"
          fill="none"
        >
          <rect width="3" height="1" fill="#E70011" />
          <rect y="1" width="3" height="1" fill="#FFFFFF" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-3 h-3 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span class="text-gray-700 font-medium">+62</span>
      </div>
      <input
        :id="field.key"
        type="text"
        inputmode="numeric"
        :placeholder="field.placeholder || '8xx xxxx xxxx'"
        :disabled="field.disabled"
        class="w-full h-10 px-3.5 text-xs bg-white border border-gray-200/80 rounded-r-lg text-gray-700 placeholder-gray-400 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        :class="[
          field.disabled ? 'bg-[#E2E8F0] text-gray-700 cursor-not-allowed' : '',
          error ? 'border-red-500 focus:ring-red-500' : '',
        ]"
        :value="phoneInputValue"
        @input="onPhoneInput"
      />
    </div>

    <!-- Multi Select Field (or Searchable Multi Select) -->
    <div
      v-else-if="
        field.type === 'multi-select' ||
        field.type === 'searchable-multi-select'
      "
      ref="triggerRef"
      class="relative"
    >
      <button
        :id="field.key"
        type="button"
        :disabled="field.disabled"
        class="w-full h-10 pl-3.5 pr-8 text-xs rounded-lg transition-all text-left flex items-center justify-between shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        :class="[
          field.disabled
            ? 'bg-[#E2E8F0] text-gray-700 border border-transparent font-medium cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-200/80 hover:border-gray-300 focus:border-blue-500 cursor-pointer',
          (!multiSelectValues || multiSelectValues.length === 0) &&
          !field.disabled
            ? 'text-gray-400'
            : 'text-gray-700 font-medium',
          error ? 'border-red-500 focus:ring-red-500' : '',
        ]"
        @click.stop="toggleDropdown"
      >
        <span class="truncate">{{
          multiSelectDisplayLabel || field.placeholder || "Select..."
        }}</span>
        <div class="pointer-events-none text-[#2563EB] shrink-0 ml-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 stroke-[2.5] transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <!-- Dropdown Popup Teleported -->
      <ClientOnly>
        <Teleport :to="teleportTarget">
          <div
            v-if="
              isOpen &&
              (field.type === 'multi-select' ||
                field.type === 'searchable-multi-select')
            "
            ref="popupRef"
            class="fixed z-[99999] bg-white rounded-lg shadow-2xl border border-gray-200/80 overflow-hidden flex flex-col max-h-48"
            :style="popupStyle"
            @click.stop
            @mousedown.stop
          >
            <!-- Search Input if Searchable Multi-Select -->
            <div
              v-if="field.type === 'searchable-multi-select'"
              class="p-2 border-b border-gray-100 flex items-center relative bg-white sticky top-0 z-10"
              @click.stop
              @mousedown.stop
            >
              <input
                ref="selectSearchInputRef"
                v-model="selectSearchQuery"
                type="text"
                placeholder="Cari Data ..."
                class="w-full h-8 pl-3 pr-8 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400"
                @click.stop
                @mousedown.stop
                @keydown.space.stop
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-3.5 h-3.5 text-gray-400 absolute right-4 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <!-- Options list with Checkboxes -->
            <div class="overflow-y-auto max-h-48 divide-y divide-gray-50">
              <button
                v-for="opt in filteredOptions"
                :key="opt.value"
                type="button"
                class="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-blue-50 transition-colors flex items-center justify-between cursor-pointer"
                @click.stop="toggleMultiSelectOption(opt.value)"
              >
                <div class="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    :checked="isMultiSelected(opt.value)"
                    class="w-3.5 h-3.5 text-blue-600 rounded-xs border-gray-300 pointer-events-none"
                  />
                  <span>{{ opt.label }}</span>
                </div>
              </button>
              <div
                v-if="filteredOptions.length === 0"
                class="px-4 py-3 text-xs text-gray-400 text-center"
              >
                Tidak ada data
              </div>
            </div>
          </div>
        </Teleport>
      </ClientOnly>
    </div>

    <!-- Searchable Select Field -->
    <div
      v-else-if="field.type === 'searchable-select'"
      ref="triggerRef"
      class="relative"
    >
      <!-- Trigger button -->
      <button
        :id="field.key"
        type="button"
        :disabled="field.disabled"
        class="w-full h-10 pl-3.5 pr-8 text-xs rounded-lg transition-all text-left flex items-center justify-between shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500"
        :class="[
          field.disabled
            ? 'bg-[#E2E8F0] text-gray-700 border border-transparent font-medium cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-200/80 hover:border-gray-300 focus:border-blue-500 cursor-pointer',
          !value && !field.disabled
            ? 'text-gray-400'
            : 'text-gray-700 font-medium',
          error ? 'border-red-500 focus:ring-red-500' : '',
        ]"
        @click.stop="toggleDropdown"
      >
        <span class="truncate">{{
          selectedOptionLabel || field.placeholder || "Pilih..."
        }}</span>
        <div class="pointer-events-none text-[#2563EB] shrink-0 ml-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 stroke-[2.5] transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      <!-- Dropdown Popup Teleported -->
      <ClientOnly>
        <Teleport :to="teleportTarget">
          <div
            v-if="isOpen && field.type === 'searchable-select'"
            ref="popupRef"
            class="fixed z-[99999] bg-white rounded-lg shadow-2xl border border-gray-200/80 overflow-hidden flex flex-col max-h-48"
            :style="popupStyle"
            @click.stop
            @mousedown.stop
          >
            <!-- Search Input -->
            <div
              class="p-2 border-b border-gray-100 flex items-center relative bg-white sticky top-0 z-10"
              @click.stop
              @mousedown.stop
            >
              <input
                ref="selectSearchInputRef"
                v-model="selectSearchQuery"
                type="text"
                placeholder="Cari Data ..."
                class="w-full h-8 pl-3 pr-8 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400"
                @click.stop
                @mousedown.stop
                @keydown.space.stop
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-3.5 h-3.5 text-gray-400 absolute right-4 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <!-- Options list -->
            <div class="overflow-y-auto max-h-48 divide-y divide-gray-50">
              <button
                v-for="opt in filteredOptions"
                :key="opt.value"
                type="button"
                class="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between cursor-pointer"
                :class="{
                  'bg-blue-50/80 font-semibold text-blue-600':
                    value === opt.value,
                }"
                @click.stop="selectOption(opt.value)"
              >
                <span>{{ opt.label }}</span>
              </button>
              <div
                v-if="filteredOptions.length === 0"
                class="px-4 py-3 text-xs text-gray-400 text-center"
              >
                Tidak ada data
              </div>
            </div>
          </div>
        </Teleport>
      </ClientOnly>
    </div>

    <!-- Standard Select Field -->
    <div v-else-if="field.type === 'select'" class="relative flex items-center">
      <select
        :id="field.key"
        v-model="value"
        :disabled="field.disabled"
        class="w-full h-10 pl-3.5 pr-8 text-xs rounded-lg transition-all appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
        :class="[
          field.disabled
            ? 'bg-[#E2E8F0] text-gray-700 border border-transparent font-medium cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-200/80 shadow-2xs focus:border-blue-500 cursor-pointer',
          !value && !field.disabled ? 'text-gray-400' : '',
          error ? 'border-red-500 focus:ring-red-500' : '',
        ]"
      >
        <option value="" disabled selected hidden>
          {{ field.placeholder || "Pilih..." }}
        </option>
        <option
          v-for="opt in field.options || []"
          :key="opt.value"
          :value="opt.value"
          class="text-gray-700 bg-white py-1"
        >
          {{ opt.label }}
        </option>
      </select>

      <!-- Chevron Icon -->
      <div
        v-if="!field.disabled"
        class="absolute right-2.5 pointer-events-none text-[#2563EB]"
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
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>

    <!-- Date Field — PrimeVue DatePicker -->
    <div
      v-else-if="field.type === 'date'"
      class="pv-datepicker-wrap w-full"
      :class="{ 'is-error': error, 'is-disabled': field.disabled }"
    >
      <DatePicker
        :id="field.key"
        :model-value="dateValue"
        :placeholder="field.placeholder || 'Pilih Tanggal'"
        :disabled="field.disabled"
        date-format="dd/mm/yy"
        show-icon
        :show-button-bar="true"
        fluid
        @update:model-value="onDateSelect"
      />
    </div>

    <!-- Currency Field -->
    <div
      v-else-if="field.type === 'currency'"
      class="relative flex items-center"
    >
      <span
        class="absolute left-3 text-xs text-gray-400 font-medium pointer-events-none select-none"
        >Rp</span
      >
      <input
        :id="field.key"
        v-model.number="value"
        type="number"
        :placeholder="field.placeholder || '0'"
        :disabled="field.disabled"
        class="w-full h-10 pl-8 pr-3.5 text-xs bg-white border border-gray-200/80 rounded-lg text-gray-700 placeholder-gray-400 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        :class="[
          field.disabled ? 'bg-[#E2E8F0] text-gray-600 cursor-not-allowed' : '',
          error ? 'border-red-500 focus:ring-red-500' : '',
        ]"
      />
    </div>

    <!-- Textarea Field -->
    <div v-else-if="field.type === 'textarea'" class="relative">
      <textarea
        :id="field.key"
        v-model="value"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        :maxlength="field.maxLength || 500"
        :rows="field.rows || 4"
        class="w-full px-3.5 py-2.5 text-xs rounded-lg resize-none transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
        :class="[
          field.disabled
            ? 'bg-[#E2E8F0] text-gray-700 border border-transparent font-medium cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-200/80 shadow-2xs',
          error ? 'border-red-500 focus:ring-red-500' : '',
        ]"
      />
      <div
        class="absolute bottom-2.5 right-3 text-[10px] text-gray-400 select-none pointer-events-none"
      >
        {{ String(value || "").length }} / {{ field.maxLength || 500 }}
      </div>
    </div>

    <!-- Switch / Toggle Field — PrimeVue ToggleSwitch -->
    <div v-else-if="field.type === 'switch'" class="flex items-center pt-1">
      <ToggleSwitch
        :id="field.key"
        v-model="value"
        :disabled="field.disabled"
      />
    </div>

    <!-- Text / Number Field -->
    <div v-else class="relative flex items-center">
      <input
        :id="field.key"
        v-model="value"
        :type="field.type || 'text'"
        :placeholder="field.placeholder"
        :disabled="field.disabled"
        class="w-full h-10 px-3.5 text-xs rounded-lg transition-all shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
        :class="[
          field.disabled
            ? 'bg-[#E2E8F0] text-gray-700 border border-transparent font-medium cursor-not-allowed'
            : 'bg-white text-gray-700 border border-gray-200/80',
          error ? 'border-red-500 focus:ring-red-500' : '',
        ]"
      />
    </div>

    <!-- Help Text under input -->
    <p
      v-if="field.helpText"
      class="text-[11px] text-gray-400 mt-1 select-none font-normal"
    >
      {{ field.helpText }}
    </p>

    <!-- Validation Error Text -->
    <p
      v-if="error"
      class="text-[11px] text-red-500 mt-1 select-none font-medium"
    >
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
/* ── Override PrimeVue Aura theme on DatePicker input ───────── */
.pv-datepicker-wrap {
  position: relative;
}

.pv-datepicker-wrap :deep(.p-datepicker) {
  width: 100%;
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.pv-datepicker-wrap :deep(.p-datepicker-input) {
  width: 100%;
  height: 2.5rem;
  padding: 0 2.75rem 0 0.875rem;
  font-size: 0.75rem;
  border-radius: 0.5rem;
  background-color: #ffffff;
  color: #374151;
  border: 1px solid rgba(229, 231, 235, 0.8) !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.15s ease;
}

.pv-datepicker-wrap :deep(.p-datepicker-input::placeholder) {
  color: #9ca3af;
}

.pv-datepicker-wrap :deep(.p-datepicker-input:focus) {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

/* Error state */
.pv-datepicker-wrap.is-error :deep(.p-datepicker-input) {
  border-color: #ef4444;
}
.pv-datepicker-wrap.is-error :deep(.p-datepicker-input:focus) {
  box-shadow: 0 0 0 1px #ef4444;
}

/* Disabled state */
.pv-datepicker-wrap.is-disabled :deep(.p-datepicker-input) {
  background-color: #e2e8f0;
  color: #374151;
  font-weight: 500;
  border-color: transparent;
  cursor: not-allowed;
}

/* Calendar icon button */
.pv-datepicker-wrap :deep(.p-datepicker-dropdown) {
  background: transparent !important;
  border: none !important;
  color: #2563eb;
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0;
  width: 1.25rem;
  height: 1.25rem;
}

.pv-datepicker-wrap :deep(.p-datepicker-dropdown:hover) {
  background: transparent !important;
  color: #1d4ed8;
}

/* ── Override native radio button color (hitam → biru) ─────── */
input[type="radio"] {
  accent-color: #2563eb;
}

/* ── Override PrimeVue ToggleSwitch color (hitam → biru) ───── */
:deep(.p-toggleswitch .p-toggleswitch-slider) {
  background-color: #d1d5db;
  transition: background-color 0.2s ease;
}
:deep(.p-toggleswitch.p-toggleswitch-checked .p-toggleswitch-slider) {
  background-color: #2563eb !important;
}
:deep(.p-toggleswitch:not(.p-disabled):hover .p-toggleswitch-slider) {
  background-color: #9ca3af;
}
:deep(
  .p-toggleswitch.p-toggleswitch-checked:not(.p-disabled):hover
    .p-toggleswitch-slider
) {
  background-color: #1d4ed8 !important;
}
</style>
