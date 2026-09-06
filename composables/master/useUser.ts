import { useApi } from '~/composables/useApi';
import { ref, computed } from 'vue'
import type {
  UserItem,
  UserDetailData,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserPasswordRequest,
  ApiResponse
} from '~/types'

export const useUser = () => {
  const api = useApi()
  const users = ref<UserItem[]>([])
  const currentUser = ref<UserItem | null>(null)
  const userDetail = ref<UserDetailData | null>(null)
  const loading = ref(false)
  const detailLoading = ref(false)
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
    detailLoading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<UserDetailData | UserItem>>(`/users/${id}`)
      if (res?.data) {
        if ('user' in res.data && res.data.user) {
          const detail = res.data as UserDetailData
          userDetail.value = detail
          const userObj: UserItem = {
            ...detail.user,
            nama: detail.user.full_name || detail.user.username,
            statusKaryawan: detail.user.status === 1 || detail.user.status === '1' || detail.user.status === 'Aktif' ? 'Aktif' : 'Nonaktif',
            organisasi: detail.user.organization || 'PLN Unit',
            aksesLevel: detail.roles?.[0]?.role_code || 'USER',
            aksesGrup: 'Grup Operations',
            kategori: 'Pegawai'
          }
          currentUser.value = userObj
          return detail
        } else {
          const u = res.data as UserItem
          const userObj: UserItem = {
            ...u,
            nama: u.full_name || u.username,
            statusKaryawan: u.status === 1 || u.status === '1' || u.status === 'Aktif' ? 'Aktif' : 'Nonaktif',
            organisasi: u.organization || 'PLN Unit',
            aksesLevel: u.role_assignments?.[0]?.role_code || 'USER',
            aksesGrup: 'Grup Operations',
            kategori: 'Pegawai'
          }
          currentUser.value = userObj
          userDetail.value = {
            user: userObj,
            roles: u.role_assignments?.map(r => ({ role_id: '', role_code: r.role_code, role_name: r.role_code })) || [],
            access: { menus: [], permissions: [] }
          }
          return userDetail.value
        }

      }
      return null
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail user.'
      throw err
    } finally {
      detailLoading.value = false
    }
  }

  const createUser = async (payload: CreateUserRequest) => {
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
    }
  }

  const updateUser = async (id: string, payload: UpdateUserRequest) => {
    error.value = null
    try {
      const res = await api<ApiResponse<UserItem>>(`/users/${id}`, {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchUsers()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengubah data user.'
      throw err
    }
  }

  const deleteUser = async (id: string) => {
    error.value = null
    try {
      const res = await api<ApiResponse<null | { message?: string }>>(`/users/${id}/delete`, {
        method: 'POST'
      })
      await fetchUsers()
      return res
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus user.'
      throw err
    }
  }

  const updateUserPassword = async (id: string, payload: UpdateUserPasswordRequest) => {
    error.value = null
    try {
      const res = await api<ApiResponse<null>>(`/users/${id}/password`, {
        method: 'POST',
        body: payload
      })
      return res
    } catch (err: any) {
      error.value = err?.message || 'Gagal memperbarui password user.'
      throw err
    }
  }


  return {
    users: computed(() => users.value),
    currentUser: computed(() => currentUser.value),
    userDetail: computed(() => userDetail.value),
    loading: computed(() => loading.value),
    detailLoading: computed(() => detailLoading.value),
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

