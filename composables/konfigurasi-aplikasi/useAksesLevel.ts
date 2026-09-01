import { useApi } from '~/composables/useApi';
import { ref, computed } from 'vue'
import type {
  ScopeItem,
  CreateScopeRequest,
  UpdateScopeRequest,
  ApiResponse
} from '~/types'

export type AksesLevelItem = ScopeItem;
export type CreateAksesLevelRequest = CreateScopeRequest;
export type UpdateAksesLevelRequest = UpdateScopeRequest;

export const useAksesLevel = () => {
  const api = useApi()
  const aksesLevels = ref<AksesLevelItem[]>([])
  const currentAksesLevel = ref<AksesLevelItem | null>(null)
  const loading = ref(false)
  const detailLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchAksesLevels = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<AksesLevelItem[]>>('/scopes')
      if (res?.data) {
        aksesLevels.value = res.data
      }
      return aksesLevels.value
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar akses level.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getAksesLevelById = async (id: string) => {
    detailLoading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<AksesLevelItem>>(`/scopes/${id}`)
      if (res?.data) {
        currentAksesLevel.value = res.data
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail akses level.'
      throw err
    } finally {
      detailLoading.value = false
    }
  }

  const createAksesLevel = async (payload: CreateAksesLevelRequest) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<AksesLevelItem>>('/scopes', {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchAksesLevels()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat akses level baru.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAksesLevel = async (id: string, payload: UpdateAksesLevelRequest) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<AksesLevelItem>>(`/scopes/${id}`, {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchAksesLevels()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengubah data akses level.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAksesLevel = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<null>>(`/scopes/${id}/delete`, {
        method: 'POST'
      })
      await fetchAksesLevels()
      return res
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus akses level.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    aksesLevels: computed(() => aksesLevels.value),
    scopes: computed(() => aksesLevels.value),
    currentAksesLevel: computed(() => currentAksesLevel.value),
    loading: computed(() => loading.value),
    detailLoading: computed(() => detailLoading.value),
    error: computed(() => error.value),
    fetchAksesLevels,
    fetchScopes: fetchAksesLevels,
    getAksesLevelById,
    createAksesLevel,
    createScope: createAksesLevel,
    updateAksesLevel,
    updateScope: updateAksesLevel,
    deleteAksesLevel,
    deleteScope: deleteAksesLevel
  }
}
