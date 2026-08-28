import { useApi } from '~/composables/useApi';
import { ref, computed } from 'vue'
import type {
  PermissionItem,
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

  return {
    permissions: computed(() => permissions.value),
    currentPermission: computed(() => currentPermission.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchPermissions,
    getPermissionById
  }
}
