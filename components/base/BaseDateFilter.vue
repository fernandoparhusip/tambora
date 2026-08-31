<script setup lang="ts">
import { computed } from "vue";
import DatePicker from "primevue/datepicker";

const props = withDefaults(
  defineProps<{
    modelValue?: string | Date | null;
    placeholder?: string;
    dateFormat?: string;
  }>(),
  {
    modelValue: null,
    placeholder: "27 April 2026",
    dateFormat: "d MM yy",
  }
);

const emit = defineEmits<{
  "update:modelValue": [value: string | Date | null];
}>();

const dateValue = computed<Date | null>(() => {
  if (!props.modelValue) return null;
  if (props.modelValue instanceof Date) return props.modelValue;
  const d = new Date(props.modelValue);
  return isNaN(d.getTime()) ? null : d;
});

const onDateChange = (val: any) => {
  if (!val) {
    emit("update:modelValue", "");
    return;
  }
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    emit("update:modelValue", `${y}-${m}-${d}`);
  } else {
    emit("update:modelValue", val);
  }
};
</script>

<template>
  <div class="pv-date-filter relative w-48 sm:w-56 h-12 flex items-center shrink-0">
    <DatePicker
      :model-value="dateValue"
      :date-format="dateFormat"
      show-icon
      icon-display="input"
      :placeholder="placeholder"
      class="w-full h-12 flex items-center relative"
      @update:model-value="onDateChange"
    >
      <template #dropdownicon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-4 h-4 text-[#2563EB] pointer-events-none"
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
</template>

<style scoped>
.pv-date-filter :deep(.p-datepicker) {
  width: 100%;
  height: 3rem;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  display: flex;
  align-items: center;
  position: relative;
}

.pv-date-filter :deep(.p-datepicker-input),
.pv-date-filter :deep(.p-inputtext) {
  width: 100%;
  height: 3rem !important;
  background-color: #ffffff !important;
  color: #374151 !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 0.5rem !important;
  padding-left: 0.875rem !important;
  padding-right: 2.5rem !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important;
  cursor: pointer !important;
  transition: all 0.15s ease !important;
}

.pv-date-filter :deep(.p-datepicker-input::placeholder),
.pv-date-filter :deep(.p-inputtext::placeholder) {
  color: #9ca3af !important;
  font-weight: 400 !important;
}

.pv-date-filter :deep(.p-datepicker-input:focus),
.pv-date-filter :deep(.p-inputtext:focus) {
  outline: none !important;
  border-color: #2563eb !important;
  box-shadow: 0 0 0 1px #2563eb !important;
}

.pv-date-filter :deep(.p-datepicker-dropdown) {
  position: absolute !important;
  right: 0.75rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  background: transparent !important;
  border: none !important;
  color: #2563eb !important;
  width: 1.25rem !important;
  height: 1.25rem !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  cursor: pointer !important;
}
</style>
