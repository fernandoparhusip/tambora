import { computed } from 'vue'
import { useTransaksiStore } from '~/stores/transaksi'
import type { Transaksi } from '~/types'

export const useTransaksi = () => {
  const store = useTransaksiStore()

  // Fetch all transactions and load them to the store
  const fetchAll = async () => {
    store.loading = true
    try {
      const { data } = await useFetch<Transaksi[]>('/api/transaksi', {
        default: () => [
          { id: 'TX-001', tanggal: '2026-07-20', nama: 'Pembayaran Listrik PLN UID Jabar', jumlah: 15000000, kategori: 'Operasional', status: 'Selesai' },
          { id: 'TX-002', tanggal: '2026-07-21', nama: 'Biaya Pemeliharaan Gardu Distribusi', jumlah: 45000000, kategori: 'Pemeliharaan', status: 'Pending' },
          { id: 'TX-003', tanggal: '2026-07-19', nama: 'Sewa Kendaraan Operasional UIW Jateng', jumlah: 12000000, kategori: 'Transportasi', status: 'Selesai' }
        ]
      })
      if (data.value) {
        store.setItems(data.value)
      }
    } finally {
      store.loading = false
    }
  }

  // Create transaction wrapper using $fetch under the hood
  const create = async (payload: Omit<Transaksi, 'id'>) => {
    const newTx: Transaksi = {
      ...payload,
      id: `TX-${Math.floor(100 + Math.random() * 900)}`
    }
    
    // In real app: await $fetch('/api/transaksi', { method: 'POST', body: newTx })
    store.addItem(newTx)
    return newTx
  }

  // Update transaction wrapper
  const update = async (id: string, payload: Partial<Transaksi>) => {
    // In real app: await $fetch(`/api/transaksi/${id}`, { method: 'PUT', body: payload })
    const existing = store.items.find(i => i.id === id)
    if (existing) {
      const updated = { ...existing, ...payload } as Transaksi
      store.updateItem(updated)
    }
  }

  // Delete transaction wrapper
  const remove = async (id: string) => {
    // In real app: await $fetch(`/api/transaksi/${id}`, { method: 'DELETE' })
    store.removeItem(id)
  }

  return {
    items: computed(() => store.items),
    loading: computed(() => store.loading),
    fetchAll,
    create,
    update,
    remove
  }
}
