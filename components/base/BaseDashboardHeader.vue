<script setup lang="ts">
import { computed } from "vue";
import type { TabItem } from "./BaseTabFilter.vue";

export interface TabGroup {
  id: string;
  items: TabItem[];
  value: string;
}

interface Props {
  title: string;
  subtitle?: string;
  tabs?: TabItem[];
  tabValue?: string;
  tabGroups?: TabGroup[];
  datePickerView?: "year" | "month" | "date";
  dateValue?: Date | null;
  datePlaceholder?: string;
  bgClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: "",
  tabs: () => [],
  tabValue: "",
  tabGroups: () => [],
  datePickerView: undefined,
  dateValue: null,
  datePlaceholder: "",
  bgClass: "bg-white",
});

const emit = defineEmits<{
  "update:tabValue": [key: string];
  "update:groupTab": [payload: { id: string; value: string }];
  "update:dateValue": [date: Date | null];
}>();

const computedDateFormat = computed(() => {
  if (props.datePickerView === "year") return "yy";
  if (props.datePickerView === "month") return "mm/yy";
  return "dd/mm/yy";
});

const defaultPlaceholder = computed(() => {
  if (props.datePickerView === "year") return "Tahun";
  if (props.datePickerView === "month") return "Bulan";
  return "Tanggal";
});

const onTabChange = (val: string | number) => {
  emit("update:tabValue", String(val));
};

const onGroupTabChange = (id: string, value: string | number) => {
  emit("update:groupTab", { id, value: String(value) });
};

const onDateChange = (val: any) => {
  if (!val) {
    emit("update:dateValue", null);
  } else if (val instanceof Date) {
    emit("update:dateValue", val);
  }
};
</script>

<template>
  <div
    class="w-full bg-white p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs shrink-0"
    :class="bgClass"
  >
    <!-- Left Side: Title & Subtitle -->
    <div class="flex flex-col">
      <slot name="title">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="text-xs text-slate-500 mt-0.5 font-medium">
          {{ subtitle }}
        </p>
      </slot>
    </div>

    <!-- Right Side: Dynamic Actions (Multiple Tab Groups, DatePicker, Custom Slots) -->
    <div class="flex flex-wrap items-center gap-3 shrink-0">
      <!-- 1. Single Tab Group (via tabs prop) -->
      <BaseTabFilter
        v-if="tabs && tabs.length > 0"
        :items="tabs"
        :model-value="tabValue"
        @update:model-value="onTabChange"
      />

      <!-- 2. Multiple Tab Groups (via tabGroups prop: [{ id, items, value }]) -->
      <template v-if="tabGroups && tabGroups.length > 0">
        <BaseTabFilter
          v-for="group in tabGroups"
          :key="group.id"
          :items="group.items"
          :model-value="group.value"
          @update:model-value="onGroupTabChange(group.id, $event)"
        />
      </template>

      <!-- 3. PrimeVue DatePicker (Year, Month, or Date view) -->
      <div v-if="datePickerView" class="w-48 pv-dashboard-datepicker relative">
        <DatePicker
          :model-value="dateValue"
          :view="datePickerView"
          :date-format="computedDateFormat"
          show-icon
          icon-display="input"
          :placeholder="datePlaceholder || defaultPlaceholder"
          fluid
          @update:model-value="onDateChange"
        >
          <template #dropdownicon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 text-[#2563EB]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <rect x="3" y="4" width="18" height="16" rx="3" ry="3" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </template>
        </DatePicker>
      </div>

      <!-- 4. Custom Actions / Extra Tab Components via Slot -->
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="postcss">
/* Header DatePicker Styling using Tailwind CSS */
.pv-dashboard-datepicker :deep(.p-datepicker-input) {
  @apply h-[48px] text-sm font-medium bg-white text-slate-700 border border-slate-200 rounded-[8px] shadow-none pl-3.5 pr-9 transition-all hover:border-slate-300 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600;
}

.pv-dashboard-datepicker :deep(.p-datepicker-dropdown) {
  @apply absolute right-2.5 top-1/2 -translate-y-1/2 text-blue-600 bg-transparent border-none p-0 w-5 h-5 flex items-center justify-center pointer-events-none;
}
</style>
