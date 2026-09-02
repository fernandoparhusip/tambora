<script setup lang="ts">
defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    type="button"
    class="h-12 bg-[#2563EB] hover:bg-blue-700 active:scale-98 text-white font-bold rounded-lg px-4 text-xs tracking-wide flex items-center gap-2 shadow-sm transition-all cursor-pointer select-none shrink-0"
    @click="$emit('click')"
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
