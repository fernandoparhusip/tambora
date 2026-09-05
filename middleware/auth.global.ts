import { useAuthStore } from '~/stores/auth'
import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware(async (to) => {
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

  // Route Menu RBAC Guard: Protect unauthorized manual URL navigation (evaluated on client where permissions & localStorage are loaded)
  if (import.meta.client && authStore.isLoggedIn && to.path.startsWith('/home') && to.path !== '/home') {
    // Hold the route if permissions are not yet resolved (e.g. cold start / empty cache)
    if ((!authStore.user || authStore.permissions.length === 0) && authStore.token) {
      try {
        await authStore.fetchUserMe()
      } catch {
        // Fallback gracefully
      }
    }

    if (!authStore.hasMenuAccess(to.path)) {
      return navigateTo('/home')
    }
  }
})
