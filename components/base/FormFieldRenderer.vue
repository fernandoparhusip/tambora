<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import type { FormFieldConfig } from "~/types";

interface Props {
  field: FormFieldConfig;
  error?: string;
  formData?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  error: "",
  formData: () => ({}),
});

const isDisabled = computed<boolean>(() => {
  if (typeof props.field.disabled === "function") {
    return props.field.disabled(props.formData || {});
  }
  return !!props.field.disabled;
});

const computedPrefix = computed<string>(() => {
  if (!props.field.prefix) return "";
  if (typeof props.field.prefix === "function") {
    return props.field.prefix(props.formData || {});
  }
  return props.field.prefix;
});

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
const uniqueDropdownId = `${props.field.key}-${Math.random().toString(36).substring(2, 9)}`;

const teleportTarget = computed(() => {
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
    if (import.meta.client) {
      window.dispatchEvent(
        new CustomEvent("form-field-dropdown-open", {
          detail: { id: uniqueDropdownId },
        }),
      );
    }
    updatePosition();
    isOpen.value = true;
    await nextTick();
    updatePosition();
    selectSearchInputRef.value?.focus();
  } else {
    isOpen.value = false;
  }
};

const handleOtherDropdownOpen = (e: Event) => {
  const ce = e as CustomEvent;
  if (ce.detail?.id !== uniqueDropdownId) {
    isOpen.value = false;
  }
};

const popupStyle = computed(() => ({
  top: `${dropdownPos.value.top}px`,
  left: `${dropdownPos.value.left}px`,
  width: `${dropdownPos.value.width}px`,
}));

const selectedOptionLabel = computed(() => {
  if (value.value === undefined || value.value === null || value.value === "") {
    return "";
  }
  const opt = props.field.options?.find(
    (o) => o && String(o.value) === String(value.value),
  );
  if (!opt) return "";
  if (opt.title && (opt.description || opt.subtitle)) {
    return `${opt.title} (${opt.description || opt.subtitle})`;
  }
  return String(opt.label ?? opt.title ?? opt.value ?? "");
});

const filteredOptions = computed(() => {
  const opts = props.field.options || [];
  if (!selectSearchQuery.value) return opts;
  const q = String(selectSearchQuery.value).toLowerCase().trim();
  return opts.filter((o) => {
    if (!o) return false;
    const label = String(o.label ?? o.title ?? "").toLowerCase();
    const desc = String(o.description ?? o.subtitle ?? "").toLowerCase();
    const val = String(o.value ?? "").toLowerCase();
    const route = String((o as any).route ?? "").toLowerCase();
    return (
      label.includes(q) ||
      desc.includes(q) ||
      val.includes(q) ||
      route.includes(q)
    );
  });
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
    window.addEventListener(
      "form-field-dropdown-open",
      handleOtherDropdownOpen,
    );
  }
});

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.removeEventListener("click", handleOutsideClick);
    window.removeEventListener("scroll", handleScrollOrResize, true);
    window.removeEventListener("resize", handleScrollOrResize);
    window.removeEventListener(
      "form-field-dropdown-open",
      handleOtherDropdownOpen,
    );
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

// PrimeVue TimePicker (DatePicker time-only) converters
const timeValue = computed<Date | null>(() => {
  if (!value.value) return null;
  if (value.value instanceof Date) return value.value;
  const parts = String(value.value).split(":");
  if (parts.length >= 2 && parts[0] !== undefined && parts[1] !== undefined) {
    const d = new Date();
    d.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0);
    return d;
  }
  return null;
});

const onTimeSelect = (
  date: Date | Date[] | (Date | null)[] | null | undefined,
) => {
  if (!date || Array.isArray(date)) {
    value.value = "";
    return;
  }
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  value.value = `${hours}:${minutes}`;
};

// Coordinate Picker (Two-Way BaseMap Integration)
const latKey = computed(() => props.field.latKey || "latitude");
const lngKey = computed(() => props.field.lngKey || "longitude");

const latValue = computed({
  get: () => props.formData?.[latKey.value] ?? "",
  set: (val: any) => {
    if (props.formData) {
      // eslint-disable-next-line vue/no-mutating-props
      props.formData[latKey.value] =
        val !== "" && val !== null && !isNaN(Number(val)) ? Number(val) : null;
    }
  },
});

const lngValue = computed({
  get: () => props.formData?.[lngKey.value] ?? "",
  set: (val: any) => {
    if (props.formData) {
      // eslint-disable-next-line vue/no-mutating-props
      props.formData[lngKey.value] =
        val !== "" && val !== null && !isNaN(Number(val)) ? Number(val) : null;
    }
  },
});

const pickerMarkers = computed(() => {
  const lat = Number(latValue.value);
  const lng = Number(lngValue.value);
  if (
    latValue.value !== "" &&
    latValue.value !== null &&
    lngValue.value !== "" &&
    lngValue.value !== null &&
    !isNaN(lat) &&
    !isNaN(lng)
  ) {
    return [
      {
        id: "picker-pin",
        lat,
        lng,
        title: "Titik Koordinat Terpilih",
        subtitle: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`,
        color: "#2563EB",
      },
    ];
  }
  return [];
});

const pickerCenter = computed<[number, number]>(() => {
  const lat = Number(latValue.value);
  const lng = Number(lngValue.value);
  if (
    latValue.value !== "" &&
    latValue.value !== null &&
    lngValue.value !== "" &&
    lngValue.value !== null &&
    !isNaN(lat) &&
    !isNaN(lng)
  ) {
    return [lng, lat];
  }
  return [117.85, -8.6]; // Default Sumbawa / NTB
});

const pickerZoom = computed(() => {
  return pickerMarkers.value.length > 0 ? 10 : 8;
});

const onPickerMapClick = (coords?: { lat: number; lng: number }) => {
  if (!coords || isDisabled.value) return;
  latValue.value = Number(coords.lat.toFixed(6));
  lngValue.value = Number(coords.lng.toFixed(6));
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
        v-if="field.required"
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
          :disabled="isDisabled"
          class="w-4 h-4 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 cursor-pointer"
          style="color-scheme: light; accent-color: #2563eb"
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
        :disabled="isDisabled"
        class="w-full h-10 px-3.5 text-xs bg-white border border-gray-200/80 rounded-r-lg text-gray-700 placeholder-gray-400 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        :class="[
          isDisabled ? 'bg-[#E2E8F0] text-gray-700 cursor-not-allowed' : '',
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
        :disabled="isDisabled"
        class="w-full h-10 pl-3.5 pr-9 text-xs rounded-lg transition-all text-left flex items-center shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 relative"
        :class="[
          isDisabled
            ? 'bg-[#E2E8F0] border border-transparent cursor-not-allowed'
            : 'bg-white border border-gray-200/80 hover:border-gray-300 focus:border-blue-500 cursor-pointer',
          error ? 'border-red-500 focus:ring-red-500' : '',
        ]"
        @click.stop="toggleDropdown"
      >
        <span
          class="truncate"
          :class="
            !multiSelectDisplayLabel
              ? 'text-gray-400 font-normal'
              : 'text-gray-700 font-medium'
          "
          >{{
            multiSelectDisplayLabel || field.placeholder || "Select..."
          }}</span
        >
        <div
          class="pointer-events-none text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 stroke-2 transition-transform duration-200"
            :class="{ 'rotate-180 text-blue-600': isOpen }"
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
            >
              <input
                ref="selectSearchInputRef"
                v-model="selectSearchQuery"
                type="text"
                placeholder="Cari Data ..."
                class="w-full h-8 pl-3 pr-8 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400"
                @click.stop
                @keydown.space.stop
                @keydown.enter.stop.prevent
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
                <div class="flex items-center gap-2.5 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    :checked="isMultiSelected(opt.value)"
                    class="w-3.5 h-3.5 text-blue-600 bg-white rounded-xs border-gray-300 pointer-events-none shrink-0"
                    style="color-scheme: light; accent-color: #2563eb"
                  />
                  <div
                    v-if="opt.description || opt.subtitle"
                    class="flex flex-col gap-0.5 text-left py-0.5 min-w-0"
                  >
                    <span
                      class="font-bold text-xs text-gray-900 leading-tight truncate"
                      >{{ opt.title || opt.label }}</span
                    >
                    <span
                      class="text-[11px] text-gray-500 font-normal leading-tight truncate"
                      >{{ opt.description || opt.subtitle }}</span
                    >
                  </div>
                  <span v-else class="truncate">{{ opt.label }}</span>
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

    <!-- Custom Select & Searchable Select Field -->
    <div
      v-else-if="field.type === 'searchable-select' || field.type === 'select'"
      ref="triggerRef"
      class="relative"
    >
      <!-- Trigger button -->
      <button
        :id="field.key"
        type="button"
        :disabled="isDisabled"
        class="w-full h-10 pl-3.5 pr-9 text-xs rounded-lg transition-all text-left flex items-center shadow-2xs focus:outline-none focus:ring-1 focus:ring-blue-500 relative"
        :class="[
          isDisabled
            ? 'bg-[#E2E8F0] border border-transparent cursor-not-allowed'
            : 'bg-white border border-gray-200/80 hover:border-gray-300 focus:border-blue-500 cursor-pointer',
          error ? 'border-red-500 focus:ring-red-500' : '',
        ]"
        @click.stop="toggleDropdown"
      >
        <span
          class="truncate"
          :class="
            !selectedOptionLabel
              ? 'text-gray-400 font-normal'
              : 'text-gray-700 font-medium'
          "
          >{{ selectedOptionLabel || field.placeholder || "Pilih..." }}</span
        >
        <div
          class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
        >
          <span
            v-if="!field.required && value && !isDisabled"
            class="text-gray-400 hover:text-red-500 p-0.5 rounded transition-colors cursor-pointer"
            title="Hapus pilihan"
            @click.stop="selectOption('')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3.5 h-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-4 h-4 stroke-2 transition-transform duration-200 pointer-events-none text-gray-400"
            :class="{ 'rotate-180 text-blue-600': isOpen }"
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
              (field.type === 'searchable-select' || field.type === 'select')
            "
            ref="popupRef"
            class="fixed z-[99999] bg-white rounded-lg shadow-2xl border border-gray-200/80 overflow-hidden flex flex-col max-h-48"
            :style="popupStyle"
            @click.stop
            @mousedown.stop
          >
            <!-- Search Input (Present on all dropdowns) -->
            <div
              class="p-2 border-b border-gray-100 flex items-center relative bg-white sticky top-0 z-10"
              @click.stop
            >
              <input
                ref="selectSearchInputRef"
                v-model="selectSearchQuery"
                type="text"
                placeholder="Cari Data ..."
                class="w-full h-8 pl-3 pr-8 text-xs bg-white border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400"
                @click.stop
                @keydown.space.stop
                @keydown.enter.stop.prevent
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
                class="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between cursor-pointer"
                :class="{
                  'bg-blue-50/80 font-semibold text-blue-600':
                    value === opt.value,
                }"
                @click.stop="selectOption(opt.value)"
              >
                <div
                  v-if="opt.description || opt.subtitle"
                  class="flex flex-col gap-0.5 text-left py-0.5 flex-1 min-w-0"
                >
                  <span
                    class="font-bold text-xs text-gray-900 leading-tight truncate"
                    >{{ opt.title || opt.label }}</span
                  >
                  <span
                    class="text-[11px] text-gray-500 font-normal leading-tight truncate"
                    >{{ opt.description || opt.subtitle }}</span
                  >
                </div>
                <span v-else class="flex-1 truncate">{{ opt.label }}</span>
                <svg
                  v-if="value === opt.value"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-blue-600 shrink-0 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
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

    <!-- Date Field — PrimeVue DatePicker -->
    <div
      v-else-if="field.type === 'date'"
      class="pv-datepicker-wrap w-full"
      :class="{ 'is-error': error, 'is-disabled': isDisabled }"
    >
      <DatePicker
        :id="field.key"
        :model-value="dateValue"
        :placeholder="field.placeholder || 'Pilih Tanggal'"
        :disabled="isDisabled"
        date-format="dd/mm/yy"
        show-icon
        :show-button-bar="true"
        fluid
        @update:model-value="onDateSelect"
      />
    </div>

    <!-- Time Field — PrimeVue TimePicker (DatePicker time-only) -->
    <div
      v-else-if="field.type === 'time'"
      class="pv-datepicker-wrap w-full"
      :class="{ 'is-error': error, 'is-disabled': isDisabled }"
    >
      <DatePicker
        :id="field.key"
        :model-value="timeValue"
        :placeholder="field.placeholder || '00:00'"
        :disabled="isDisabled"
        time-only
        hour-format="24"
        show-icon
        fluid
        @update:model-value="onTimeSelect"
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
        :disabled="isDisabled"
        autocomplete="off"
        class="w-full h-10 pl-8 pr-3.5 text-xs bg-white border border-gray-200/80 rounded-lg text-gray-700 placeholder-gray-400 shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        :class="[
          isDisabled ? 'bg-[#E2E8F0] text-gray-600 cursor-not-allowed' : '',
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
        :disabled="isDisabled"
        :maxlength="field.maxLength || 500"
        :rows="field.rows || 4"
        autocomplete="off"
        class="w-full px-3.5 py-2.5 text-xs rounded-lg resize-none transition-all focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
        :class="[
          isDisabled
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
      <ToggleSwitch :id="field.key" v-model="value" :disabled="isDisabled" />
    </div>

    <!-- Coordinate Picker Field (Two-Way BaseMap Integration) -->
    <div
      v-else-if="field.type === 'coordinate-picker'"
      class="flex flex-col gap-3 w-full"
    >
      <!-- Dual Input: Latitude & Longitude Side-by-Side -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- Latitude -->
        <div class="flex flex-col">
          <label
            :for="`${field.key}-lat`"
            class="block text-xs font-semibold text-[#4D5E80] mb-1.5 select-none"
          >
            Latitude
            <span
              v-if="field.required"
              class="text-red-500 font-semibold ml-0.5"
              >*</span
            >
          </label>
          <input
            :id="`${field.key}-lat`"
            v-model="latValue"
            type="number"
            step="any"
            placeholder="Contoh: 1.4870"
            :disabled="isDisabled"
            autocomplete="off"
            class="w-full h-10 px-3.5 text-xs bg-white border border-gray-200/80 rounded-lg text-gray-700 placeholder-gray-400 font-mono shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            :class="[
              isDisabled
                ? 'bg-[#E2E8F0] text-gray-700 font-medium cursor-not-allowed'
                : '',
              error ? 'border-red-500 focus:ring-red-500' : '',
            ]"
          />
        </div>

        <!-- Longitude -->
        <div class="flex flex-col">
          <label
            :for="`${field.key}-lng`"
            class="block text-xs font-semibold text-[#4D5E80] mb-1.5 select-none"
          >
            Longitude
            <span
              v-if="field.required"
              class="text-red-500 font-semibold ml-0.5"
              >*</span
            >
          </label>
          <input
            :id="`${field.key}-lng`"
            v-model="lngValue"
            type="number"
            step="any"
            placeholder="Contoh: 124.8421"
            :disabled="isDisabled"
            autocomplete="off"
            class="w-full h-10 px-3.5 text-xs bg-white border border-gray-200/80 rounded-lg text-gray-700 placeholder-gray-400 font-mono shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            :class="[
              isDisabled
                ? 'bg-[#E2E8F0] text-gray-700 font-medium cursor-not-allowed'
                : '',
              error ? 'border-red-500 focus:ring-red-500' : '',
            ]"
          />
        </div>
      </div>

      <!-- Map Container (Clean BaseMap Only) -->
      <div
        class="relative w-full h-[400px] rounded-xl overflow-hidden border border-gray-200/90 shadow-xs"
      >
        <BaseMap
          :center="pickerCenter"
          :zoom="pickerZoom"
          :markers="pickerMarkers"
          :interactive-picker="true"
          :show-fullscreen-control="false"
          marker-color="#2563EB"
          :marker-radius="8"
          @map-click="onPickerMapClick"
        />
      </div>
    </div>

    <!-- Text / Number Field -->
    <div v-else class="relative flex items-center">
      <span
        v-if="computedPrefix"
        class="inline-flex items-center px-3 h-10 border border-r-0 border-gray-200/80 bg-gray-50 text-gray-600 font-mono text-xs rounded-l-lg select-none shrink-0"
      >
        {{ computedPrefix }}
      </span>
      <input
        :id="field.key"
        v-model="value"
        :type="field.type || 'text'"
        :step="field.step || (field.type === 'number' ? 'any' : undefined)"
        :placeholder="field.placeholder"
        :disabled="isDisabled"
        autocomplete="off"
        class="w-full h-10 px-3.5 text-xs rounded-lg transition-all shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400"
        :class="[
          computedPrefix ? 'rounded-l-none' : '',
          isDisabled
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
  padding: 0 2.25rem 0 0.875rem;
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

/* Calendar / Clock icon button */
.pv-datepicker-wrap :deep(.p-datepicker-dropdown) {
  background: transparent !important;
  border: none !important;
  color: #9ca3af;
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0;
  width: 1rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.pv-datepicker-wrap :deep(.p-datepicker-dropdown:hover),
.pv-datepicker-wrap:focus-within :deep(.p-datepicker-dropdown) {
  background: transparent !important;
  color: #2563eb;
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
