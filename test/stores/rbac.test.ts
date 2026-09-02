import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useRbac } from '~/composables/useRbac'

// Mock Nuxt runtime variables
vi.mock('#app', () => ({
  useCookie: () => ({
    value: null,
  }),
  navigateTo: vi.fn(),
  useRuntimeConfig: () => ({
    public: {
      apiBaseUrl: '/api/v1',
    },
  }),
}))

describe('RBAC & Permission Check Suite', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('Persona 1: Super Admin (SUPER_ADMIN) has full global access', () => {
    const authStore = useAuthStore()
    authStore.setSession({
      nama: 'Super Admin',
      role: 'SUPER_ADMIN',
      permissions: ['*'],
    })

    const { can, isSuperAdmin } = useRbac()
    expect(isSuperAdmin.value).toBe(true)
    expect(can('SENTRAL.VIEW')).toBe(true)
    expect(can('SENTRAL.CREATE')).toBe(true)
    expect(can('SENTRAL.UPDATE')).toBe(true)
    expect(can('SENTRAL.DELETE')).toBe(true)
    expect(can('SENTRAL.APPROVE')).toBe(true)
    expect(can('REGIONAL.CREATE')).toBe(true)
    expect(can('CABANG.DELETE')).toBe(true)
  })

  it('Persona 2: Admin Regional (ORG_ADMIN) has full CRUD permissions', () => {
    const authStore = useAuthStore()
    authStore.setSession({
      nama: 'Admin Regional Sulut',
      role: 'ORG_ADMIN',
      permissions: [
        'REGIONAL.VIEW',
        'REGIONAL.CREATE',
        'REGIONAL.UPDATE',
        'CABANG.VIEW',
        'CABANG.CREATE',
        'CABANG.UPDATE',
        'CABANG.DELETE',
        'SENTRAL.VIEW',
        'SENTRAL.CREATE',
        'SENTRAL.UPDATE',
        'SENTRAL.DELETE',
        'SENTRAL.APPROVE',
      ],
    })

    const { can } = useRbac()
    expect(can('SENTRAL.VIEW')).toBe(true)
    expect(can('SENTRAL.CREATE')).toBe(true)
    expect(can('SENTRAL.UPDATE')).toBe(true)
    expect(can('SENTRAL.DELETE')).toBe(true)
    expect(can('SENTRAL.APPROVE')).toBe(true)
    expect(can('CABANG.DELETE')).toBe(true)
  })

  it('Persona 3: Operator Cabang (ORG_MANAGER) can CREATE/UPDATE but CANNOT DELETE', () => {
    const authStore = useAuthStore()
    authStore.setSession({
      nama: 'Operator Cabang Manado',
      role: 'ORG_MANAGER',
      permissions: [
        'CABANG.VIEW',
        'CABANG.UPDATE',
        'RANTING.VIEW',
        'RANTING.CREATE',
        'RANTING.UPDATE',
        'SENTRAL.VIEW',
        'SENTRAL.CREATE',
        'SENTRAL.UPDATE',
      ],
    })

    const { can } = useRbac()
    // Allowed actions
    expect(can('SENTRAL.VIEW')).toBe(true)
    expect(can('SENTRAL.CREATE')).toBe(true)
    expect(can('SENTRAL.UPDATE')).toBe(true)
    expect(can('RANTING.CREATE')).toBe(true)

    // Denied actions (No DELETE permission)
    expect(can('SENTRAL.DELETE')).toBe(false)
    expect(can('CABANG.DELETE')).toBe(false)
    expect(can('RANTING.DELETE')).toBe(false)
  })

  it('Persona 4: Viewer Ranting (ORG_VIEWER) is Read-Only and CANNOT CREATE/UPDATE/DELETE', () => {
    const authStore = useAuthStore()
    authStore.setSession({
      nama: 'Viewer Ranting Tomohon',
      role: 'ORG_VIEWER',
      permissions: [
        'CABANG.VIEW',
        'RANTING.VIEW',
        'SENTRAL.VIEW',
      ],
    })

    const { can } = useRbac()
    // Allowed views
    expect(can('CABANG.VIEW')).toBe(true)
    expect(can('RANTING.VIEW')).toBe(true)
    expect(can('SENTRAL.VIEW')).toBe(true)

    // Forbidden actions
    expect(can('CABANG.CREATE')).toBe(false)
    expect(can('RANTING.UPDATE')).toBe(false)
    expect(can('SENTRAL.CREATE')).toBe(false)
    expect(can('SENTRAL.DELETE')).toBe(false)
  })

  it('Persona 5: Operator Restricted with Permission Overrides (Deny Delete)', () => {
    const authStore = useAuthStore()
    authStore.setSession({
      nama: 'Operator Restricted',
      role: 'ORG_MANAGER',
      permissions: [
        'SENTRAL.VIEW',
        'SENTRAL.CREATE',
        'SENTRAL.UPDATE',
        'SENTRAL.DELETE',
        'CABANG.VIEW',
        'CABANG.CREATE',
        'CABANG.DELETE',
      ],
      permission_overrides: [
        { permission_key: 'SENTRAL.DELETE', is_granted: false },
        { permission_key: 'CABANG.DELETE', is_granted: false },
      ],
    })

    const { can } = useRbac()
    // Can still create and update
    expect(can('SENTRAL.VIEW')).toBe(true)
    expect(can('SENTRAL.CREATE')).toBe(true)
    expect(can('SENTRAL.UPDATE')).toBe(true)

    // Explicitly denied via permission_overrides
    expect(can('SENTRAL.DELETE')).toBe(false)
    expect(can('CABANG.DELETE')).toBe(false)
  })

  it('handles array of permissions with AND condition', () => {
    const authStore = useAuthStore()
    authStore.setSession({
      nama: 'Staff User',
      role: 'ORG_MANAGER',
      permissions: ['SENTRAL.VIEW', 'SENTRAL.CREATE'],
    })

    const { can } = useRbac()
    expect(can(['SENTRAL.VIEW', 'SENTRAL.CREATE'])).toBe(true)
    expect(can(['SENTRAL.VIEW', 'SENTRAL.DELETE'])).toBe(false)
  })

  it('safely handles backend object format permissions and superadmin variants', () => {
    const authStore = useAuthStore()
    authStore.setSession({
      nama: 'Superadmin User',
      email: 'superadmin@example.com',
      role: 'Super Admin',
      roles: ['SUPERADMIN'],
      permissions: [
        { ID: '1', Key: 'DRIVER.CREATE' },
        { ID: '2', Key: 'DRIVER.UPDATE' },
      ] as any,
    })

    const { can, isSuperAdmin } = useRbac()
    expect(isSuperAdmin.value).toBe(true)
    expect(can('DRIVER.CREATE')).toBe(true)
    expect(can('DRIVER.DELETE')).toBe(true)
  })

  it('validates dynamic menu RBAC filtering with hasMenuAccess', () => {
    const authStore = useAuthStore()
    authStore.setSession({
      nama: 'Operator Pembangkit',
      role: 'OPERATOR',
      roles: ['OPERATOR'],
      permissions: ['DRIVER.VIEW', 'DRIVER.CREATE'],
      menus: [
        { code: 'MENU_DRIVER', route: '/master-data/drivers' },
        { code: 'MENU_OPERASI_HARIAN', route: '/operasi-harian' },
      ],
    })

    // Allowed routes
    expect(authStore.hasMenuAccess('/home/master/driver', 'DRIVER.VIEW', 'MENU_DRIVER')).toBe(true)
    expect(authStore.hasMenuAccess('/home/transaksi/operasi-harian', 'OPERASI_HARIAN.VIEW', 'MENU_OPERASI_HARIAN')).toBe(true)
    expect(authStore.hasMenuAccess('/home')).toBe(true)
    expect(authStore.hasMenuAccess('/home/dashboard/operasiPembangkit')).toBe(true)

    // Denied routes
    expect(authStore.hasMenuAccess('/home/konfigurasi-aplikasi/akses-grup', 'ROLE.VIEW', 'MENU_ROLES')).toBe(false)
    expect(authStore.hasMenuAccess('/home/master/user', 'USER.VIEW', 'MENU_USERS')).toBe(false)
  })
})
