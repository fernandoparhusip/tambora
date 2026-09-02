import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'

/**
 * Composable for Role-Based Access Control (RBAC) & Scope Verification
 */
export const useRbac = () => {
  const authStore = useAuthStore()

  const permissions = computed(() => authStore.permissions)
  const scopes = computed(() => authStore.scopes)
  const user = computed(() => authStore.user)

  const can = (permissionKey: string | string[]): boolean => {
    return authStore.can(permissionKey)
  }

  const hasScope = (scopeCode: string): boolean => {
    return authStore.hasScope(scopeCode)
  }

  const isSuperAdmin = computed(() => {
    const roleCode = (authStore.user?.role || authStore.user?.akses_grup || '').toUpperCase()
    const userRoles = (authStore.user?.roles || []).map((r) => r.toUpperCase())
    return (
      roleCode === 'SUPER_ADMIN' ||
      userRoles.includes('SUPER_ADMIN') ||
      roleCode === 'SUPERADMIN' ||
      authStore.permissions.includes('*')
    )
  })

  return {
    permissions,
    scopes,
    user,
    isSuperAdmin,
    can,
    hasScope
  }
}
