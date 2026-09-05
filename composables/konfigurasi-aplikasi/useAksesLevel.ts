import { useApi } from '~/composables/useApi';
import { ref, computed } from 'vue'
import type {
  ScopeItem,
  CreateScopeRequest,
  UpdateScopeRequest,
  ApiResponse,
  SelectOption
} from '~/types'

export type AksesLevelItem = ScopeItem;
export type CreateAksesLevelRequest = CreateScopeRequest;
export type UpdateAksesLevelRequest = UpdateScopeRequest;

export const useAksesLevel = () => {
  const api = useApi()
  const aksesLevels = ref<AksesLevelItem[]>([])
  const currentAksesLevel = ref<AksesLevelItem | null>(null)
  const scopeTypeOptions = ref<SelectOption[]>([])
  const scopeTypesLoading = ref(false)
  const loading = ref(false)
  const detailLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchAksesLevels = async () => {
    loading.value = true
    error.value = null
    try {
      const res: any = await api<ApiResponse<AksesLevelItem[]>>('/scopes')
      const rawList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : Array.isArray(res?.data?.items)
            ? res.data.items
            : []
      aksesLevels.value = rawList
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
    error.value = null
    try {
      const res = await api<ApiResponse<AksesLevelItem>>('/scopes', {
        method: 'POST',
        body: payload
      })
      await fetchAksesLevels()
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat akses level baru.'
      throw err
    }
  }

  const updateAksesLevel = async (id: string, payload: UpdateAksesLevelRequest) => {
    error.value = null
    try {
      const res = await api<ApiResponse<AksesLevelItem>>(`/scopes/${id}`, {
        method: 'POST',
        body: payload
      })
      await fetchAksesLevels()
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengubah data akses level.'
      throw err
    }
  }

  const deleteAksesLevel = async (id: string) => {
    error.value = null
    try {
      let res: any
      try {
        res = await api<ApiResponse<null>>(`/scopes/${id}/delete`, {
          method: 'POST'
        })
      } catch {
        res = await api<ApiResponse<null>>(`/scopes/${id}`, {
          method: 'DELETE'
        })
      }
      await fetchAksesLevels()
      return res
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus akses level.'
      throw err
    }
  }

  const fetchScopeTypeCombo = async () => {
    scopeTypesLoading.value = true
    try {
      const res: any = await api<ApiResponse<any[]>>('/scope-types/combo')
      const rawList = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : Array.isArray(res?.data?.items)
            ? res.data.items
            : []
      scopeTypeOptions.value = rawList.map((item: any) => ({
        label: item.name ? `${item.name} (${item.code})` : item.code,
        value: item.id || item.ID || item.value,
        title: item.name || item.code,
        subtitle: item.code
      }))
      return scopeTypeOptions.value
    } catch {
      return scopeTypeOptions.value
    } finally {
      scopeTypesLoading.value = false
    }
  }

  return {
    aksesLevels: computed(() => aksesLevels.value),
    scopes: computed(() => aksesLevels.value),
    currentAksesLevel: computed(() => currentAksesLevel.value),
    scopeTypeOptions: computed(() => scopeTypeOptions.value),
    scopeTypesLoading: computed(() => scopeTypesLoading.value),
    loading: computed(() => loading.value),
    detailLoading: computed(() => detailLoading.value),
    error: computed(() => error.value),
    fetchAksesLevels,
    fetchScopes: fetchAksesLevels,
    fetchScopeTypeCombo,
    getAksesLevelById,
    createAksesLevel,
    createScope: createAksesLevel,
    updateAksesLevel,
    updateScope: updateAksesLevel,
    deleteAksesLevel,
    deleteScope: deleteAksesLevel
  }
}
