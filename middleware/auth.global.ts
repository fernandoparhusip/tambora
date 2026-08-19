import { useAuthStore } from '~/stores/auth'
import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // If the user is NOT logged in and is trying to access any page other than /login, redirect to /login
  if (!authStore.isLoggedIn && to.path !== '/login') {
    return navigateTo('/login')
  }

  // If the user IS logged in and is trying to access /login, redirect them to /home
  if (authStore.isLoggedIn && to.path === '/login') {
    return navigateTo('/home')
  }
})
