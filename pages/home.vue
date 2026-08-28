<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useIdleTimer } from '~/composables/useIdleTimer'
import BaseIdleWarningModal from '~/components/base/BaseIdleWarningModal.vue'

const { registerListeners, removeListeners } = useIdleTimer()

onMounted(() => {
  registerListeners()
})

onBeforeUnmount(() => {
  removeListeners()
})
</script>

<template>
  <!-- Outer container: relative sebagai anchor untuk sidebar absolute -->
  <div class="h-screen w-screen flex overflow-hidden bg-gray-50 relative">

    <!-- Sidebar: absolute overlay saat expanded (w-[72px] -> w-[260px]) -->
    <BaseAppSidebar />

    <!-- Right side: pl-[80px] biar konten tidak ketutupan sidebar collapsed -->
    <div class="flex flex-col flex-1 overflow-hidden pl-[80px]">
      <BaseAppHeader />
      <main class="flex-1 overflow-hidden bg-gray-50">
        <NuxtPage />
      </main>
    </div>

    <!-- Inactivity Idle Warning Modal -->
    <ClientOnly>
      <BaseIdleWarningModal />
    </ClientOnly>

  </div>
</template>
