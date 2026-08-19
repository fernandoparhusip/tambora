import { ref, computed } from 'vue'
import type { User } from '~/types'

export const useMasterUser = () => {
  // Shared state using Nuxt's useState utility
  const users = useState<User[]>('master-users', () => [
    { id: 'USR-001', nama: 'Budi Santoso', email: 'budi.santoso@pln.co.id', organisasi: 'PLN Puspus', role: 'Admin', level: 'Pusat', uiw: 'UIW Jabar', status: 'Pegawai' },
    { id: 'USR-002', nama: 'Siti Rahma', email: 'siti.rahma@pln.co.id', organisasi: 'PLN UID Jabar', role: 'Operator', level: 'Unit Induk', uiw: 'UIW Jabar', status: 'Pegawai' },
    { id: 'USR-003', nama: 'Agus Salim', email: 'agus.salim@pln.co.id', organisasi: 'PLN UP3 Bandung', role: 'Supervisor', level: 'UP3', uiw: 'UIW Jabar', status: 'Pengemudi' }
  ])
  const loading = ref(false)

  const fetchAll = async () => {
    loading.value = true
    try {
      // In real app: const { data } = await useFetch<User[]>('/api/users')
      // if (data.value) users.value = data.value
    } finally {
      loading.value = false
    }
  }

  const create = async (payload: Omit<User, 'id'>) => {
    const newUser: User = {
      ...payload,
      id: `USR-${Math.floor(100 + Math.random() * 900)}`
    }
    // In real app: await $fetch('/api/users', { method: 'POST', body: newUser })
    users.value.unshift(newUser)
    return newUser
  }

  const update = async (id: string, payload: Partial<User>) => {
    // In real app: await $fetch(`/api/users/${id}`, { method: 'PUT', body: payload })
    const idx = users.value.findIndex(u => u.id === id)
    if (idx !== -1) {
      users.value[idx] = { ...users.value[idx], ...payload } as User
    }
  }

  const remove = async (id: string) => {
    // In real app: await $fetch(`/api/users/${id}`, { method: 'DELETE' })
    users.value = users.value.filter(u => u.id !== id)
  }

  return {
    users: computed(() => users.value),
    loading: computed(() => loading.value),
    fetchAll,
    create,
    update,
    remove
  }
}
