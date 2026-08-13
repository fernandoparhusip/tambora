<template>
  <AppNavigation />

  <main class="main-content">
    <RouterView />
  </main>
</template>

<script setup>
import AppNavigation from './components/AppNavigation.vue'
</script>

<style src="./css/App.css"></style>