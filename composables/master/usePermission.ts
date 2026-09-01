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
  const detailLoading = ref(false)
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
    detailLoading.value = true
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
      detailLoading.value = false
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
        res = await api<ApiResponse<null>>(`/permissions/${id}`, {
          method: 'DELETE'
        })
      } catch {
        res = await api<ApiResponse<null>>(`/permissions/${id}/delete`, {
          method: 'POST'
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

  const fetchPermissionsCombo = async (userId: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<any>>('/permissions/combo', {
        method: 'POST',
        body: { user_id: userId, id: userId }
      })
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat combo permission.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const resourcesCombo = ref<any[]>([])
  const actionsCombo = ref<any[]>([])

  const fetchResourcesCombo = async () => {
    try {
      let res: any
      try {
        res = await api<ApiResponse<any>>('/resources/combo')
      } catch {
        res = await api<ApiResponse<any>>('/resources/combo', { method: 'POST' })
      }
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      if (rawList.length > 0) {
        resourcesCombo.value = rawList.map((r: any) => {
          const id = r.id || r.ID || r.value || r.code || r.Code || ''
          const code = r.code || r.Code || r.resource_code || r.name || ''
          const desc = r.name || r.Name || r.description || r.Description || r.label || ''
          return {
            value: id,
            id: id,
            code: code,
            label: desc ? `${code} - ${desc}` : code,
            title: code,
            subtitle: desc,
            description: desc
          }
        })
      }
      return resourcesCombo.value
    } catch {
      return resourcesCombo.value
    }
  }

  const fetchActionsCombo = async () => {
    try {
      let res: any
      try {
        res = await api<ApiResponse<any>>('/actions/combo')
      } catch {
        res = await api<ApiResponse<any>>('/actions/combo', { method: 'POST' })
      }
      const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      if (rawList.length > 0) {
        actionsCombo.value = rawList.map((a: any) => {
          const id = a.id || a.ID || a.value || a.code || a.Code || ''
          const code = a.code || a.Code || a.action_code || a.name || ''
          const desc = a.name || a.Name || a.description || a.Description || a.label || ''
          return {
            value: id,
            id: id,
            code: code,
            label: desc ? `${code} - ${desc}` : code,
            title: code,
            subtitle: desc,
            description: desc
          }
        })
      }
      return actionsCombo.value
    } catch {
      return actionsCombo.value
    }
  }

  return {
    permissions: computed(() => permissions.value),
    currentPermission: computed(() => currentPermission.value),
    resourcesCombo: computed(() => resourcesCombo.value),
    actionsCombo: computed(() => actionsCombo.value),
    loading: computed(() => loading.value),
    detailLoading: computed(() => detailLoading.value),
    error: computed(() => error.value),
    fetchPermissions,
    fetchPermissionsCombo,
    fetchResourcesCombo,
    fetchActionsCombo,
    getPermissionById,
    createPermission,
    updatePermission,
    deletePermission
  }
}
