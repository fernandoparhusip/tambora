<template>
  <div class="text-gray-900 font-sans">
    <ClientOnly>
      <ModalsContainer />
    </ClientOnly>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { ModalsContainer } from 'vue-final-modal'
</script>

<style>
/* Hide PrimeUI License badge and any bottom-right license notice */
body > div[style*="fixed"][style*="bottom"],
body > div[style*="position: fixed"][style*="right"],
body > div:has(a[href*="primeui"]),
body > div:has(a[href*="primevue"]),
[class*="primeui-license"],
[class*="p-license"],
.p-license-badge {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}

/* Ensure no page scrollbar on full-screen layout and set Inter as default font */
html,
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden !important;
  background-color: #ffffff !important;
}
</style>
