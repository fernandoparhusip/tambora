<template>
  <div class="flex items-center justify-center min-h-[50vh] bg-gray-50">
    <div class="flex flex-col items-center gap-2">
      <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-primary-500" />
      <span class="text-xs text-gray-500">Mengarahkan sistem...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { navigateTo } from '#app'

const authStore = useAuthStore()

// Redirection logic if global middleware is bypassed
if (authStore.isLoggedIn) {
  navigateTo('/home')
} else {
  navigateTo('/login')
}
</script>
