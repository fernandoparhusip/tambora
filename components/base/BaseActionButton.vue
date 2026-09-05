<script setup lang="ts">
import { computed } from "vue";
import { useRbac } from "~/composables/useRbac";

const props = withDefaults(
  defineProps<{
    type: "view" | "edit" | "delete" | "download" | "custom";
    title?: string;
    resource?: string;
    permission?: string | string[];
    disabled?: boolean;
    disabledTooltip?: string;
  }>(),
  {
    title: "",
    resource: "",
    permission: "",
    disabled: false,
    disabledTooltip: "",
  },
);

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const { can } = useRbac();

const effectivePermission = computed(() => {
  if (props.permission) return props.permission;
  if (props.resource) {
    const res = props.resource.toUpperCase().trim();
    if (props.type === "edit") return `${res}.UPDATE`;
    if (props.type === "delete") return `${res}.DELETE`;
    if (props.type === "view" || props.type === "download") return `${res}.VIEW`;
  }
  return "";
});

const isPermissionDenied = computed(() => {
  if (effectivePermission.value) {
    return !can(effectivePermission.value);
  }
  return false;
});

const isDisabled = computed(() => {
  return props.disabled || isPermissionDenied.value;
});

const defaultDisabledTooltip = computed(() => {
  if (props.disabledTooltip) return props.disabledTooltip;
  if (props.type === "edit") return "Anda tidak memiliki hak akses untuk mengubah data ini.";
  if (props.type === "delete") return "Anda tidak memiliki hak akses untuk menghapus data ini.";
  if (props.type === "download") return "Anda tidak memiliki hak akses untuk mengunduh data ini.";
  return "Anda tidak memiliki hak akses untuk aksi ini.";
});

const buttonConfig = computed(() => {
  switch (props.type) {
    case "view":
      return {
        defaultTitle: "Detail",
        class: "bg-sky-50 text-sky-600 hover:bg-sky-100 border-sky-100",
        ariaLabel: "Lihat Detail",
      };
    case "edit":
      return {
        defaultTitle: "Edit",
        class: "bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100",
        ariaLabel: "Ubah Data",
      };
    case "delete":
      return {
        defaultTitle: "Hapus",
        class: "bg-red-50 text-red-500 hover:bg-red-100 border-red-100",
        ariaLabel: "Hapus Data",
      };
    case "download":
      return {
        defaultTitle: "Unduh",
        class: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100",
        ariaLabel: "Unduh File",
      };
    default:
      return {
        defaultTitle: "Aksi",
        class: "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200",
        ariaLabel: "Aksi",
      };
  }
});

const effectiveTooltip = computed(() => {
  if (isDisabled.value) {
    return defaultDisabledTooltip.value;
  }
  return props.title || buttonConfig.value.defaultTitle;
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
    v-tooltip.top="{ value: effectiveTooltip, showDelay: 100 }"
    type="button"
    :disabled="isDisabled"
    :aria-disabled="isDisabled"
    :aria-label="effectiveTooltip || buttonConfig.ariaLabel"
    class="w-7 h-7 flex items-center justify-center rounded-lg border transition-all duration-150 transform select-none shrink-0 outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
    :class="[
      isDisabled
        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60 shadow-none'
        : `${buttonConfig.class} cursor-pointer active:scale-[0.90] hover:scale-[1.06]`,
    ]"
    @click="handleClick"
  >
    <!-- View / Eye Icon -->
    <svg
      v-if="type === 'view'"
      xmlns="http://www.w3.org/2000/svg"
      class="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>

    <!-- Edit / Pencil Icon -->
    <svg
      v-else-if="type === 'edit'"
      xmlns="http://www.w3.org/2000/svg"
      class="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>

    <!-- Delete / Trash Icon -->
    <svg
      v-else-if="type === 'delete'"
      xmlns="http://www.w3.org/2000/svg"
      class="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>

    <!-- Download Icon -->
    <svg
      v-else-if="type === 'download'"
      xmlns="http://www.w3.org/2000/svg"
      class="w-3.5 h-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>

    <!-- Custom Slot Icon -->
    <slot v-else />
  </button>
</template>
