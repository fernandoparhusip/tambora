import { useApi } from '~/composables/useApi';
import { ref, computed } from 'vue'
import type {
  UserItem,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserPasswordRequest,
  ApiResponse
} from '~/types'

export const useUser = () => {
  const api = useApi()
  const users = ref<UserItem[]>([])
  const currentUser = ref<UserItem | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const error = ref<string | null>(null)

  const fetchUsers = async (params: { limit?: number; offset?: number; search?: string } = {}) => {
    loading.value = true
    error.value = null
    try {
      const query: Record<string, any> = {
        limit: params.limit || 50,
        offset: params.offset || 0
      }
      if (params.search) query.search = params.search

      const res = await api<ApiResponse<UserItem[]>>('/users', { query })
      if (res?.data) {
        users.value = res.data.map(u => ({
          ...u,
          nama: u.full_name || u.username,
          statusKaryawan: u.status === 1 || u.status === '1' || u.status === 'Aktif' ? 'Aktif' : 'Nonaktif',
          organisasi: u.organization || 'PLN Unit',
          aksesLevel: u.role_assignments?.[0]?.role_code || 'USER',
          aksesGrup: 'Grup Operations',
          kategori: 'Pegawai'
        }))
        if (res.meta) {
          total.value = res.meta.total
        } else {
          total.value = users.value.length
        }
      }
      return users.value
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar user.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getUserById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<UserItem>>(`/users/${id}`)
      if (res?.data) {
        currentUser.value = res.data
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail user.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createUser = async (payload: CreateUserRequest) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<UserItem>>('/users', {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchUsers()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat user baru.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id: string, payload: UpdateUserRequest) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<UserItem>>(`/users/${id}`, {
        method: 'PUT',
        body: payload
      })
      if (res?.data) {
        await fetchUsers()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengubah data user.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<null>>(`/users/${id}`, {
        method: 'DELETE'
      })
      await fetchUsers()
      return res
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus user.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateUserPassword = async (id: string, payload: UpdateUserPasswordRequest) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<null>>(`/users/${id}/password`, {
        method: 'PUT',
        body: payload
      })
      return res
    } catch (err: any) {
      error.value = err?.message || 'Gagal memperbarui password user.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    users: computed(() => users.value),
    currentUser: computed(() => currentUser.value),
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserPassword
  }
}
