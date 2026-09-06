import { useApi } from '~/composables/useApi';
import { ref, computed } from 'vue'
import type {
  RoleItem,
  CreateRoleRequest,
  UpdateRoleRequest,
  ApiResponse
} from '~/types'

export type AksesGrupItem = RoleItem;
export type CreateAksesGrupRequest = CreateRoleRequest;
export type UpdateAksesGrupRequest = UpdateRoleRequest;

export const useAksesGrup = () => {
  const api = useApi()
  const aksesGrups = ref<AksesGrupItem[]>([])
  const currentAksesGrup = ref<AksesGrupItem | null>(null)
  const loading = ref(false)
  const detailLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchAksesGrups = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<AksesGrupItem[]>>('/roles')
      if (res?.data) {
        aksesGrups.value = res.data
      }
      return aksesGrups.value
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar akses grup.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAksesGrupById = async (id: string) => {
    detailLoading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<AksesGrupItem>>(`/roles/${id}`)
      if (res?.data) {
        currentAksesGrup.value = res.data
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail akses grup.'
      throw err
    } finally {
      detailLoading.value = false
    }
  }

  const createAksesGrup = async (payload: CreateAksesGrupRequest) => {
    error.value = null
    try {
      const res = await api<ApiResponse<AksesGrupItem>>('/roles', {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchAksesGrups()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat akses grup baru.'
      throw err
    }
  }

  const updateAksesGrup = async (id: string, payload: UpdateAksesGrupRequest) => {
    error.value = null
    try {
      const res = await api<ApiResponse<AksesGrupItem>>(`/roles/${id}`, {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchAksesGrups()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengubah data akses grup.'
      throw err
    }
  }

  const deleteAksesGrup = async (id: string) => {
    error.value = null
    try {
      const res = await api<ApiResponse<null>>(`/roles/${id}/delete`, {
        method: 'POST'
      })
      await fetchAksesGrups()
      return res
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus akses grup.'
      throw err
    }
  }

  return {
    aksesGrups: computed(() => aksesGrups.value),
    roles: computed(() => aksesGrups.value),
    currentAksesGrup: computed(() => currentAksesGrup.value),
    loading: computed(() => loading.value),
    detailLoading: computed(() => detailLoading.value),
    error: computed(() => error.value),
    fetchAksesGrups,
    fetchRoles: fetchAksesGrups,
    getAksesGrupById,
    createAksesGrup,
    createRole: createAksesGrup,
    updateAksesGrup,
    updateRole: updateAksesGrup,
    deleteAksesGrup,
    deleteRole: deleteAksesGrup
  }
}
