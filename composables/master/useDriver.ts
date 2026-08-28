import { useApi } from '~/composables/useApi';
import { ref, computed } from 'vue'
import type {
  DriverItem,
  CreateDriverRequest,
  UpdateDriverRequest,
  ApiResponse
} from '~/types'

const formatIsoDate = (dateStr?: string) => {
  if (!dateStr) return undefined
  if (dateStr.includes('T')) return dateStr
  return `${dateStr}T00:00:00Z`
}

export const useDriver = () => {
  const api = useApi()
  const drivers = ref<DriverItem[]>([])
  const currentDriver = ref<DriverItem | null>(null)
  const loading = ref(false)
  const total = ref(0)
  const error = ref<string | null>(null)

  const fetchDrivers = async (params: { limit?: number; offset?: number } = {}) => {
    loading.value = true
    error.value = null
    try {
      const query: Record<string, any> = {
        limit: params.limit || 50,
        offset: params.offset || 0
      }
      const res = await api<ApiResponse<DriverItem[]>>('/drivers', { query })
      if (res?.data && Array.isArray(res.data)) {
        drivers.value = res.data
        total.value = res.meta?.total || res.data.length
      } else {
        drivers.value = []
        total.value = 0
      }
      return drivers.value
    } catch (err: any) {
      error.value = err?.message || 'Gagal memuat daftar pengemudi.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const getDriverById = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<DriverItem>>(`/drivers/${id}`)
      if (res?.data) {
        currentDriver.value = res.data
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengambil detail pengemudi.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const createDriver = async (payload: CreateDriverRequest) => {
    loading.value = true
    error.value = null
    try {
      const body: CreateDriverRequest = {
        ...payload,
        birth_date: formatIsoDate(payload.birth_date),
        employment_start_date: formatIsoDate(payload.employment_start_date)
      }
      const res = await api<ApiResponse<DriverItem>>('/drivers', {
        method: 'POST',
        body
      })
      if (res?.data) {
        await fetchDrivers()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal membuat data pengemudi.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateDriver = async (id: string, payload: UpdateDriverRequest) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<DriverItem>>(`/drivers/${id}`, {
        method: 'POST',
        body: payload
      })
      if (res?.data) {
        await fetchDrivers()
      }
      return res?.data
    } catch (err: any) {
      error.value = err?.message || 'Gagal mengubah data pengemudi.'
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteDriver = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      const res = await api<ApiResponse<null>>(`/drivers/${id}/delete`, {
        method: 'POST'
      })
      await fetchDrivers()
      return res
    } catch (err: any) {
      error.value = err?.message || 'Gagal menghapus pengemudi.'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    drivers: computed(() => drivers.value),
    currentDriver: computed(() => currentDriver.value),
    loading: computed(() => loading.value),
    total: computed(() => total.value),
    error: computed(() => error.value),
    fetchDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    deleteDriver
  }
}
