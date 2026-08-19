<script setup lang="ts">
import FileTypeExcel from "@/assets/icon/FileTypeExcel.svg";

defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    type="button"
    class="h-12 bg-white border border-gray-200 rounded-lg px-3.5 hover:bg-gray-50 text-gray-600 flex items-center gap-2 cursor-pointer shadow-2xs transition-colors text-xs font-medium shrink-0"
    @click="$emit('click')"
  >
    <!-- Excel Green Icon Asset -->
    <img :src="FileTypeExcel" class="w-5 h-5 shrink-0" alt="Excel" />
    <div class="text-left leading-tight">
      <span class="block text-[10px] text-gray-400">Export to</span>
      <span class="block text-xs font-bold text-gray-700">.xls</span>
    </div>
  </button>
</template>
