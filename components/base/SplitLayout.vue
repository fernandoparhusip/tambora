<script setup lang="ts">
interface Props {
  reverse?: boolean;
}

withDefaults(defineProps<Props>(), {
  reverse: false,
});
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <!-- Main Column (8/12 width) -->
    <div
      class="lg:col-span-8 w-full"
      :class="[reverse ? 'lg:order-last' : 'lg:order-first']"
    >
      <slot name="main" />
    </div>

    <!-- Aside Column (4/12 width) -->
    <div
      class="lg:col-span-4 w-full"
      :class="[reverse ? 'lg:order-first' : 'lg:order-last']"
    >
      <slot name="sidebar" />
    </div>
  </div>
</template>
