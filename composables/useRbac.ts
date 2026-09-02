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
    const roleCode = String(authStore.user?.role || authStore.user?.akses_grup || '').toUpperCase()
    const userRoles = (authStore.user?.roles || []).map((r: any) =>
      typeof r === 'string' ? r.toUpperCase() : String(r?.role_code || r?.name || '').toUpperCase()
    )
    return (
      roleCode === 'SUPER_ADMIN' ||
      roleCode === 'SUPERADMIN' ||
      roleCode.replace(/[\s_-]/g, '') === 'SUPERADMIN' ||
      userRoles.includes('SUPER_ADMIN') ||
      userRoles.includes('SUPERADMIN') ||
      userRoles.some((r) => r.replace(/[\s_-]/g, '') === 'SUPERADMIN') ||
      authStore.permissions.some((p: any) => {
        const key = typeof p === 'string' ? p : p?.permission_key || p?.code || p?.name || ''
        return key === '*'
      })
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
