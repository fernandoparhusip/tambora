import { useAuthStore } from '~/stores/auth'
import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // If the user is NOT logged in and is trying to access any page other than /login, redirect to /login with redirect query
  if (!authStore.isLoggedIn && to.path !== '/login') {
    return navigateTo({
      path: '/login',
      query: to.fullPath && to.fullPath !== '/' ? { redirect: to.fullPath } : undefined
    })
  }

  // If the user IS logged in and is trying to access /login, redirect them to intended target or /home
  if (authStore.isLoggedIn && to.path === '/login') {
    const redirectUrl = (to.query.redirect as string) || '/home'
    return navigateTo(redirectUrl)
  }
})
