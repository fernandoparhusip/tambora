<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div
    class="shrink-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
  >
    <div>
      <h1 class="text-xl font-bold text-[#4D5E80] tracking-tight leading-snug">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="text-xs text-gray-500 mt-0.5">
        {{ subtitle }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-3 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>
