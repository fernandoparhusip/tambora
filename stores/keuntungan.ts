import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Keuntungan } from '~/types'

export const useKeuntunganStore = defineStore('keuntungan', () => {
  const filterPeriode = ref('2026')
  const filterWilayah = ref('Semua')
  const data = ref<Keuntungan[]>([])
  const loading = ref(false)

  const setData = (newData: Keuntungan[]) => {
    data.value = newData
  }

  const setLoading = (state: boolean) => {
    loading.value = state
  }

  return {
    filterPeriode,
    filterWilayah,
    data,
    loading,
    setData,
    setLoading
  }
})
