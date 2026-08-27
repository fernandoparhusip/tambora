<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    variant?: "success" | "danger" | "warning" | "info" | "primary" | "neutral" | "mono" | "system";
    size?: "xs" | "sm" | "md";
    label?: string;
  }>(),
  {
    variant: "neutral",
    size: "xs",
    label: ""
  }
);

const variantClass = computed(() => {
  switch (props.variant) {
    case "success":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "danger":
      return "bg-red-50 text-red-700 border-red-200";
    case "warning":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "info":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "primary":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "system":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "mono":
      return "bg-slate-100 text-slate-800 border-slate-200 font-mono";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
});

const sizeClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "px-2 py-0.5 text-xs";
    case "md":
      return "px-2.5 py-1 text-sm";
    default:
      return "px-2 py-0.5 text-[11px]";
  }
});
</script>

<template>
  <span
    class="inline-flex items-center rounded-md font-semibold border transition-colors select-none"
    :class="[variantClass, sizeClass]"
  >
    <slot>{{ label }}</slot>
  </span>
</template>
