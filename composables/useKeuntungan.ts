import { storeToRefs } from 'pinia'
import { useKeuntunganStore } from '~/stores/keuntungan'
import type { Keuntungan } from '~/types'

export const useKeuntungan = () => {
  const store = useKeuntunganStore()
  const { filterPeriode, filterWilayah } = storeToRefs(store)

  // Reactive useFetch configuration mapping query params to reactive filters
  const { data, pending, error, refresh } = useFetch<Keuntungan[]>('/api/laporan/keuntungan', {
    query: {
      periode: filterPeriode,
      wilayah: filterWilayah
    },
    // Fallback Mock data since backend is provided by another team
    default: () => getMockKeuntungan(filterPeriode.value, filterWilayah.value),
    watch: [filterPeriode, filterWilayah]
  })

  return {
    data,
    pending,
    error,
    refresh
  }
}

// Mock database helper
function getMockKeuntungan(periode: string, wilayah: string): Keuntungan[] {
  const mockDb: Keuntungan[] = [
    { id: '1', periode: '2026', wilayah: 'UID Jawa Barat', pendapatan: 12500000000, beban: 8200000000, keuntungan: 4300000000, growth: 12.5 },
    { id: '2', periode: '2026', wilayah: 'UID Jawa Tengah', pendapatan: 9800000000, beban: 7100000000, keuntungan: 2700000000, growth: 8.3 },
    { id: '3', periode: '2026', wilayah: 'UID Jawa Timur', pendapatan: 14200000000, beban: 9500000000, keuntungan: 4700000000, growth: 14.2 },
    { id: '4', periode: '2026', wilayah: 'UID Jakarta Raya', pendapatan: 19800000000, beban: 13500000000, keuntungan: 6300000000, growth: 18.7 },
    
    { id: '5', periode: '2025', wilayah: 'UID Jawa Barat', pendapatan: 11100000000, beban: 7800000000, keuntungan: 3300000000, growth: 10.1 },
    { id: '6', periode: '2025', wilayah: 'UID Jawa Tengah', pendapatan: 9000000000, beban: 6800000000, keuntungan: 2200000000, growth: 6.4 },
    { id: '7', periode: '2025', wilayah: 'UID Jawa Timur', pendapatan: 12400000000, beban: 9000000000, keuntungan: 3400000000, growth: 9.8 },
    { id: '8', periode: '2025', wilayah: 'UID Jakarta Raya', pendapatan: 16700000000, beban: 12200000000, keuntungan: 4500000000, growth: 15.2 }
  ]

  return mockDb.filter(d => 
    d.periode === periode && 
    (wilayah === 'Semua' || d.wilayah === wilayah)
  )
}
