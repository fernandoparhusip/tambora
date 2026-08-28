<script setup lang="ts">
navigateTo('/home/transaksi/operasi-harian', { replace: true })
</script>

<template>
  <div class="p-6 flex items-center justify-center min-h-[50vh]">
    <div class="flex flex-col items-center gap-2">
      <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-primary-500" />
      <span class="text-xs text-gray-500">Mengarahkan ke Operasi Harian...</span>
    </div>
  </div>
</template>
