import { ref, computed, watch, type Ref } from 'vue'
import { useAppToast } from '~/composables/useAppToast'

export interface UseCrudStateOptions<_T = any> {
  resourceName?: string
  defaultPageSize?: number
  onResetPage?: () => void
}

export function useCrudState<T extends Record<string, any> = Record<string, any>>(
  options: UseCrudStateOptions<T> = {}
) {
  const { resourceName = 'Data', defaultPageSize = 10 } = options

  // Search & Pagination States
  const searchQuery = ref('')
  const currentPage = ref(1)
  const pageSize = ref(defaultPageSize)

  watch(searchQuery, () => {
    currentPage.value = 1
    options.onResetPage?.()
  })

  // Form Modal States
  const modalOpen = ref(false)
  const modalMode = ref<'create' | 'edit'>('create')
  const formData = ref<Record<string, any>>({})
  const submitting = ref(false)
  const isSuccessModalOpen = ref(false)

  // Confirm Delete Dialog States
  const isConfirmDialogOpen = ref(false)
  const deleteTarget = ref<T | null>(null) as Ref<T | null>
  const isDeleting = ref(false)

  // Computed Titles
  const modalTitle = computed(() =>
    modalMode.value === 'edit' ? `Ubah Data ${resourceName}` : `Tambah Data ${resourceName}`
  )
  const modalSubtitle = computed(() =>
    modalMode.value === 'edit' ? `Form Ubah ${resourceName}` : `Form Tambah ${resourceName}`
  )

  // Handlers
  const openCreateModal = (initialData: Record<string, any> = {}) => {
    modalMode.value = 'create'
    formData.value = { ...initialData }
    modalOpen.value = true
  }

  const openEditModal = (row: T) => {
    modalMode.value = 'edit'
    formData.value = { ...row }
    modalOpen.value = true
  }

  const openDeleteDialog = (row: T) => {
    deleteTarget.value = row
    isConfirmDialogOpen.value = true
  }

  const closeDeleteDialog = () => {
    isConfirmDialogOpen.value = false
    deleteTarget.value = null
  }

  const executeDelete = async (
    deleteFn: (id: any) => Promise<any>,
    options?: {
      targetId?: string | number
      targetName?: string
      successMessage?: string
    }
  ) => {
    if (!deleteTarget.value) return false
    const id = options?.targetId ?? deleteTarget.value.id
    const name = options?.targetName ?? deleteTarget.value.nama ?? deleteTarget.value.name ?? 'Data'
    
    isDeleting.value = true
    try {
      await deleteFn(id)
      const toast = useAppToast()
      toast.success(
        options?.successMessage || `${resourceName} '${name}' berhasil dihapus.`,
        'Sukses'
      )
      closeDeleteDialog()
      return true
    } catch {
      // Error handled by useApi
      return false
    } finally {
      isDeleting.value = false
    }
  }

  // Pagination Helper
  const paginateList = <U = T>(list: U[]): U[] => {
    const start = (currentPage.value - 1) * pageSize.value
    return list.slice(start, start + pageSize.value)
  }

  return {
    // Search & Pagination
    searchQuery,
    currentPage,
    pageSize,
    paginateList,

    // Form Modal
    modalOpen,
    modalMode,
    formData,
    submitting,
    isSuccessModalOpen,
    modalTitle,
    modalSubtitle,
    openCreateModal,
    openEditModal,

    // Delete Dialog
    isConfirmDialogOpen,
    deleteTarget,
    isDeleting,
    openDeleteDialog,
    closeDeleteDialog,
    executeDelete,
  }
}
