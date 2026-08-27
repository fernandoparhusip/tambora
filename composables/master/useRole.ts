import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import type {
  RoleItem,
  CreateRoleRequest,
  UpdateRoleRequest,
  ApiResponse
} from '~/types'

export const useRole = () => {
  const api = useApi()
  const roles = ref<RoleItem[]>([])
  const currentRole = ref<RoleItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchRoles = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<RoleItem[]>>('/roles')
      if (res?.data) {
        roles.value = res.data
      }
      return roles.value
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar role.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getRoleById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<RoleItem>>(`/roles/${id}`)
      if (res?.data) {
        currentRole.value = res.data
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail role.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createRole = async (payload: CreateRoleRequest) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<RoleItem>>('/roles', {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchRoles()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat role baru.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateRole = async (id: string, payload: UpdateRoleRequest) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<RoleItem>>(`/roles/${id}`, {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchRoles()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengubah data role.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteRole = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<null>>(`/roles/${id}/delete`, {
        method: 'POST'
      })
      await fetchRoles()
      return res
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus role.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    roles: computed(() => roles.value),
    currentRole: computed(() => currentRole.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole
  }
}
