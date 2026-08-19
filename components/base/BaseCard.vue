<script setup lang="ts">
interface Props {
  title?: string;
  noPadding?: boolean;
  customClass?: string;
}

withDefaults(defineProps<Props>(), {
  title: "",
  noPadding: false,
  customClass: "",
});
</script>

<template>
  <div
    class="relative overflow-hidden rounded-lg border border-gray-200/80 dark:border-gray-800/80 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md"
    :class="[customClass]"
  >
    <!-- Background subtle gradient glow -->
    <div
      class="absolute -inset-px bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100 pointer-events-none"
    />

    <!-- Card Header -->
    <div
      v-if="$slots.header || title"
      class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between"
    >
      <slot name="header">
        <h3
          class="text-base font-semibold text-gray-900 dark:text-white leading-6"
        >
          {{ title }}
        </h3>
      </slot>
    </div>

    <!-- Card Body -->
    <div :class="[noPadding ? '' : 'px-5 py-5']">
      <slot />
    </div>

    <!-- Card Footer -->
    <div
      v-if="$slots.footer"
      class="px-5 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30"
    >
      <slot name="footer" />
    </div>
  </div>
</template>
