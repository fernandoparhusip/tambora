import { useApi } from '~/composables/useApi';
import { ref, computed } from 'vue'
import type {
  ScopeItem,
  CreateScopeRequest,
  UpdateScopeRequest,
  ApiResponse
} from '~/types'

export const useScope = () => {
  const api = useApi()
  const scopes = ref<ScopeItem[]>([])
  const currentScope = ref<ScopeItem | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchScopes = async () => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<ScopeItem[]>>('/scopes')
      if (res?.data) {
        scopes.value = res.data
      }
      return scopes.value
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar scope.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getScopeById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<ScopeItem>>(`/scopes/${id}`)
      if (res?.data) {
        currentScope.value = res.data
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail scope.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createScope = async (payload: CreateScopeRequest) => {
    error.value = null
    try {
      const res = await api<ApiResponse<ScopeItem>>('/scopes', {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchScopes()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat scope baru.'
      throw err
    }
  }

  const updateScope = async (id: string, payload: UpdateScopeRequest) => {
    error.value = null
    try {
      const res = await api<ApiResponse<ScopeItem>>(`/scopes/${id}`, {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchScopes()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengubah data scope.'
      throw err
    }
  }

  const deleteScope = async (id: string) => {
    error.value = null
    try {
      const res = await api<ApiResponse<null>>(`/scopes/${id}/delete`, {
        method: 'POST'
      })
      await fetchScopes()
      return res
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus scope.'
      throw err
    }
  }

  return {
    scopes: computed(() => scopes.value),
    currentScope: computed(() => currentScope.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchScopes,
    getScopeById,
    createScope,
    updateScope,
    deleteScope
  }
}
