<script setup lang="ts">
defineProps<{
  modelValue?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <div class="relative flex items-center h-12 w-full sm:w-64 shrink-0">
    <input
      id="base-search-input"
      aria-label="Cari Data"
      :value="modelValue"
      type="text"
      placeholder="Cari Data"
      autocomplete="off"
      class="w-full h-12 bg-white border border-gray-200 rounded-lg pl-3.5 pr-9 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-[#2563EB] transition-all shadow-2xs"
      @input="
        $emit('update:modelValue', ($event.target as HTMLInputElement).value)
      "
    >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-4 h-4 absolute right-3 text-[#2563EB] pointer-events-none"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  </div>
</template>
