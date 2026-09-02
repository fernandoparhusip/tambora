<script setup lang="ts">
import { computed } from "vue";
import { useRbac } from "~/composables/useRbac";

const props = withDefaults(
  defineProps<{
    resource?: string;
    permission?: string | string[];
    disabled?: boolean;
    disabledTooltip?: string;
  }>(),
  {
    resource: "",
    permission: "",
    disabled: false,
    disabledTooltip: "Anda tidak memiliki hak akses untuk menambah data.",
  },
);

const emit = defineEmits<{
  click: [event?: MouseEvent];
}>();

const { can } = useRbac();

const effectivePermission = computed(() => {
  if (props.permission) return props.permission;
  if (props.resource) return `${props.resource.toUpperCase().trim()}.CREATE`;
  return "";
});

const isDisabled = computed(() => {
  if (props.disabled) return true;
  if (effectivePermission.value) {
    return !can(effectivePermission.value);
  }
  return false;
});

const handleClick = (e: MouseEvent) => {
  if (isDisabled.value) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return;
  }
  emit("click", e);
};
</script>

<template>
  <button
    v-tooltip.top="isDisabled ? { value: disabledTooltip, showDelay: 100 } : undefined"
    type="button"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    class="h-12 font-bold rounded-lg px-4 text-xs tracking-wide flex items-center gap-2 transition-all select-none shrink-0"
    :class="[
      isDisabled
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-80 shadow-none'
        : 'bg-[#2563EB] hover:bg-blue-700 active:scale-98 text-white shadow-sm cursor-pointer',
    ]"
    @click="handleClick"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-4 h-4 stroke-[3]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
    <span>TAMBAH DATA</span>
  </button>
</template>
