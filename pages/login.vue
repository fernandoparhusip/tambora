<template>
  <div
    class="h-screen w-screen overflow-hidden bg-white p-2 box-border flex items-center justify-center"
  >
    <div class="h-full w-full flex overflow-hidden">
      <div class="w-full lg:w-1/2 h-full mr-5">
        <ClientOnly>
          <LoginForm />
        </ClientOnly>
      </div>

      <div class="hidden lg:block lg:w-1/2 h-full relative">
        <ClientOnly>
          <LoginSlider />
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page meta & layout configuration for Login page
definePageMeta({
  layout: false
})
</script>

<style scoped>
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
