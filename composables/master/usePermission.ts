import { useApi } from '~/composables/useApi';
import { ref, computed } from 'vue'
import type {
  PermissionItem,
  CreatePermissionRequest,
  UpdatePermissionRequest,
  ApiResponse
} from '~/types'

export const usePermission = () => {
  const api = useApi()
  const permissions = ref<PermissionItem[]>([])
  const currentPermission = ref<PermissionItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPermissions = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<PermissionItem[]>>('/permissions')
      if (res?.data) {
        permissions.value = res.data
      }
      return permissions.value
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar permission.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getPermissionById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<PermissionItem>>(`/permissions/${id}`)
      if (res?.data) {
        currentPermission.value = res.data
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail permission.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createPermission = async (payload: CreatePermissionRequest) => {
    loading.value = true
    error.value = null
    try {
      let res: any
      try {
        res = await api<ApiResponse<PermissionItem>>('/permissions/create', {
          method: 'POST',
          body: payload
        })
      } catch {
        res = await api<ApiResponse<PermissionItem>>('/permissions', {
          method: 'POST',
          body: payload
        })
      }
      if (res?.data) {
        await fetchPermissions()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat permission.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updatePermission = async (id: string, payload: UpdatePermissionRequest) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<PermissionItem>>(`/permissions/${id}`, {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchPermissions()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal memperbarui permission.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deletePermission = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      let res: any
      try {
        res = await api<ApiResponse<null>>(`/permissions/${id}/delete`, {
          method: 'POST'
        })
      } catch {
        res = await api<ApiResponse<null>>(`/permissions/${id}`, {
          method: 'DELETE'
        })
      }
      await fetchPermissions()
      return res
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus permission.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    permissions: computed(() => permissions.value),
    currentPermission: computed(() => currentPermission.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchPermissions,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission
  }
}
