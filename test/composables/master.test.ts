import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUser } from '~/composables/master/useUser'
import { useRole } from '~/composables/master/useRole'
import { usePermission } from '~/composables/master/usePermission'
import { useScope } from '~/composables/master/useScope'
import { useDriver } from '~/composables/master/useDriver'

// Mock useApi composable
const mockApi = vi.fn()
vi.mock('~/composables/useApi', () => ({
  useApi: () => mockApi
}))

describe('Master Composables Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useUser', () => {
    it('fetchUsers maps user response data correctly', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          {
            id: 'u-1',
            email: 'admin@pln.co.id',
            username: 'superadmin',
            full_name: 'Super Admin',
            organization: 'BaseTambora',
            status: 1,
            role_assignments: [{ role_code: 'SUPER_ADMIN' }]
          }
        ],
        meta: { total: 1 }
      })

      const { fetchUsers, users, total } = useUser()
      const result = await fetchUsers()

      expect(result).toHaveLength(1)
      expect(users.value[0]?.nama).toBe('Super Admin')
      expect(users.value[0]?.statusKaryawan).toBe('Aktif')
      expect(total.value).toBe(1)
      expect(mockApi).toHaveBeenCalledWith('/users', expect.any(Object))
    })

    it('createUser sends payload and calls fetchUsers', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'u-2', username: 'newuser' } })
        .mockResolvedValueOnce({ data: [] })

      const { createUser } = useUser()
      await createUser({
        email: 'newuser@pln.co.id',
        username: 'newuser',
        full_name: 'New User',
        password: 'Password123!'
      })

      expect(mockApi).toHaveBeenCalledWith('/users', {
        method: 'POST',
        body: expect.objectContaining({ username: 'newuser' })
      })
    })
    it('updateUser sends POST payload and refetches users', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'u-1', full_name: 'Super Admin Updated' } })
        .mockResolvedValueOnce({ data: [] })

      const { updateUser } = useUser()
      await updateUser('u-1', { full_name: 'Super Admin Updated' })

      expect(mockApi).toHaveBeenCalledWith('/users/u-1', {
        method: 'POST',
        body: expect.objectContaining({ full_name: 'Super Admin Updated' })
      })
    })

    it('deleteUser calls POST /users/:id/delete', async () => {
      mockApi
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] })

      const { deleteUser } = useUser()
      await deleteUser('u-1')

      expect(mockApi).toHaveBeenCalledWith('/users/u-1/delete', {
        method: 'POST'
      })
    })
  })

  describe('useRole', () => {
    it('fetchRoles returns roles from API', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          { id: 'r-1', code: 'SUPER_ADMIN', name: 'Super Admin', description: 'All access', status: 1 }
        ]
      })

      const { fetchRoles, roles } = useRole()
      const result = await fetchRoles()

      expect(result).toHaveLength(1)
      expect(roles.value[0]?.code).toBe('SUPER_ADMIN')
      expect(mockApi).toHaveBeenCalledWith('/roles')
    })
  })

  describe('usePermission', () => {
    it('fetchPermissions returns permissions from API', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          {
            id: 'p-1',
            permission_key: 'USER.CREATE',
            description: 'Create user',
            resource_code: 'USER',
            resource_name: 'User',
            action_code: 'CREATE',
            action_name: 'Create'
          }
        ]
      })

      const { fetchPermissions, permissions } = usePermission()
      const result = await fetchPermissions()

      expect(result).toHaveLength(1)
      expect(permissions.value[0]?.permission_key).toBe('USER.CREATE')
      expect(mockApi).toHaveBeenCalledWith('/permissions')
    })

    it('createPermission, updatePermission, and deletePermission work with POST', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'p-1', permission_key: 'USER.VIEW' } })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: { id: 'p-1', permission_key: 'USER.VIEW_UPDATED' } })
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] })

      const { createPermission, updatePermission, deletePermission } = usePermission()
      await createPermission({ permission_key: 'USER.VIEW' })
      expect(mockApi).toHaveBeenCalledWith('/permissions/create', {
        method: 'POST',
        body: expect.objectContaining({ permission_key: 'USER.VIEW' })
      })

      await updatePermission('p-1', { permission_key: 'USER.VIEW_UPDATED' })
      expect(mockApi).toHaveBeenCalledWith('/permissions/p-1', {
        method: 'POST',
        body: expect.objectContaining({ permission_key: 'USER.VIEW_UPDATED' })
      })

      await deletePermission('p-1')
      expect(mockApi).toHaveBeenCalledWith('/permissions/p-1/delete', {
        method: 'POST'
      })
    })
  })

  describe('useScope', () => {
    it('fetchScopes returns scopes from API', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          { id: 's-1', code: 'ORG-HQ', name: 'Headquarters', description: 'HQ Scope' }
        ]
      })

      const { fetchScopes, scopes } = useScope()
      const result = await fetchScopes()

      expect(result).toHaveLength(1)
      expect(scopes.value[0]?.code).toBe('ORG-HQ')
      expect(mockApi).toHaveBeenCalledWith('/scopes')
    })
  })

  describe('useDriver', () => {
    it('fetchDrivers maps driver items', async () => {
      mockApi.mockResolvedValueOnce({
        data: [
          { id: 'd-1', full_name: 'Driver Budiman', phone_number: '+628123', license_number: 'SIM-123', status: 1 }
        ]
      })

      const { fetchDrivers, drivers } = useDriver()
      const result = await fetchDrivers()

      expect(result).toHaveLength(1)
      expect(drivers.value[0]?.full_name).toBe('Driver Budiman')
      expect(mockApi).toHaveBeenCalledWith('/drivers', expect.any(Object))
    })

    it('createDriver sends payload to /drivers', async () => {
      mockApi
        .mockResolvedValueOnce({ data: { id: 'd-2', full_name: 'Driver Baru' } })
        .mockResolvedValueOnce({ data: [] })

      const { createDriver } = useDriver()
      await createDriver({
        full_name: 'Driver Baru',
        phone_number: '+628999'
      })

      expect(mockApi).toHaveBeenCalledWith('/drivers', {
        method: 'POST',
        body: expect.objectContaining({ full_name: 'Driver Baru' })
      })
    })

    it('deleteDriver calls /drivers/:id/delete', async () => {
      mockApi
        .mockResolvedValueOnce({ data: null })
        .mockResolvedValueOnce({ data: [] })

      const { deleteDriver } = useDriver()
      await deleteDriver('d-1')

      expect(mockApi).toHaveBeenCalledWith('/drivers/d-1/delete', {
        method: 'POST'
      })
    })
  })
})
