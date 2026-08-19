import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Transaksi } from '~/types'

export const useTransaksiStore = defineStore('transaksi', () => {
  const items = ref<Transaksi[]>([])
  const loading = ref(false)

  const setItems = (newItems: Transaksi[]) => {
    items.value = newItems
  }

  const addItem = (item: Transaksi) => {
    items.value.unshift(item)
  }

  const updateItem = (updatedItem: Transaksi) => {
    const idx = items.value.findIndex(i => i.id === updatedItem.id)
    if (idx !== -1) {
      items.value[idx] = updatedItem
    }
  }

  const removeItem = (id: string) => {
    items.value = items.value.filter(i => i.id !== id)
  }

  return {
    items,
    loading,
    setItems,
    addItem,
    updateItem,
    removeItem
  }
})
