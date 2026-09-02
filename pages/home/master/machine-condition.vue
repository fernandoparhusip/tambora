<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { TableColumn, MachineConditionItem } from '~/types'
import { machineConditionFormSections } from '~/schemas/master/machine-condition.schema'
import type { DetailDataItem } from '~/types/master.types';

const {
  machineConditions,
  loading,
  fetchMachineConditions,
  createMachineCondition,
  updateMachineCondition,
  deleteMachineCondition,
} = useMachineCondition()
const toast = useAppToast()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const modalOpen = ref(false)
const isSuccessModalOpen = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const formData = ref<Record<string, any>>({})
const submitting = ref(false)
const isConfirmDialogOpen = ref(false)
const deleteTarget = ref<MachineConditionItem | null>(null)
const isDeleting = ref(false)

// Detail Modal States
const isDetailModalOpen = ref(false)
const detailRecord = ref<MachineConditionItem | null>(null)

const conditionColumns: TableColumn[] = [
  { key: 'no', label: 'No' },
  { key: 'name', label: 'Nama Kondisi Mesin' },
  { key: 'description', label: 'Deskripsi Operasional' },
  { key: 'is_active', label: 'Status' },
  { key: 'actions', label: 'Aksi' },
]

onMounted(async () => {
  await fetchMachineConditions()
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const filteredData = computed(() => {
  if (!searchQuery.value) return machineConditions.value
  const q = searchQuery.value.toLowerCase()
  return machineConditions.value.filter(
    item =>
      item.name.toLowerCase().includes(q)
      || (item.description && item.description.toLowerCase().includes(q)),
  )
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const modalTitle = computed(() =>
  modalMode.value === 'create' ? 'Tambah Kondisi Mesin' : 'Ubah Kondisi Mesin',
)
const modalSubtitle = computed(() =>
  modalMode.value === 'create'
    ? 'Form Tambah Master Kondisi Mesin Pembangkit'
    : 'Form Ubah Master Kondisi Mesin Pembangkit',
)

const openCreateModal = () => {
  modalMode.value = 'create'
  formData.value = {
    name: '',
    description: '',
    is_active: true,
  }
  modalOpen.value = true
}

const handleView = (row: MachineConditionItem) => {
  detailRecord.value = row
  isDetailModalOpen.value = true
}

const handleEdit = (row: MachineConditionItem) => {
  modalMode.value = 'edit'
  formData.value = { ...row }
  modalOpen.value = true
}

const openEditFromDetail = () => {
  if (detailRecord.value) {
    handleEdit(detailRecord.value)
  }
}

const handleDelete = (row: MachineConditionItem) => {
  deleteTarget.value = row
  isConfirmDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await deleteMachineCondition(deleteTarget.value.id)
    toast.success(`Kondisi mesin '${deleteTarget.value.name}' berhasil dihapus.`, 'Sukses')
    isConfirmDialogOpen.value = false
    deleteTarget.value = null
  } catch (err: any) {
    toast.error(err?.message || 'Gagal menghapus kondisi mesin.', 'Gagal Hapus')
  } finally {
    isDeleting.value = false
  }
}

const handleSave = async () => {
  if (!formData.value.name || formData.value.name.trim() === '') {
    toast.error('Nama Kondisi Mesin wajib diisi.', 'Validasi Form')
    return
  }

  submitting.value = true
  try {
    if (modalMode.value === 'create') {
      await createMachineCondition({
        name: formData.value.name.trim(),
        description: formData.value.description?.trim() || '',
        is_active: formData.value.is_active ?? true,
      })
      toast.success(`Kondisi mesin '${formData.value.name}' berhasil dibuat.`, 'Sukses')
    } else {
      await updateMachineCondition(formData.value.id, {
        name: formData.value.name.trim(),
        description: formData.value.description?.trim() || '',
        is_active: formData.value.is_active ?? true,
      })
      toast.success(`Kondisi mesin '${formData.value.name}' berhasil diperbarui.`, 'Sukses')
    }
    modalOpen.value = false
    setTimeout(() => {
      isSuccessModalOpen.value = true
    }, 150)
  } catch (err: any) {
    toast.error(err?.message || 'Gagal menyimpan kondisi mesin.', 'Terjadi Kesalahan')
  } finally {
    submitting.value = false
  }
}

const getConditionBadgeVariant = (name: string): any => {
  const n = (name || '').toUpperCase()
  if (n.includes('OPERASI') || n.includes('NORMAL')) return 'success'
  if (n.includes('GANGGUAN') || n.includes('RUSAK') || n.includes('TRIP')) return 'danger'
  if (n.includes('PEMELIHARAAN') || n.includes('OVERHAUL') || n.includes('HAR')) return 'warning'
  if (n.includes('STANDBY') || n.includes('CADANGAN')) return 'info'
  return 'default'
}

// Detail Data Items
const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return []
  return [
    { label: 'Nama Kondisi', value: detailRecord.value.name },
    { label: 'Deskripsi Operasional', value: detailRecord.value.description || '-' },
    {
      label: 'Status Aktif',
      value: detailRecord.value.is_active ? 'Aktif' : 'Nonaktif',
      isStatus: true,
    },
    { label: 'ID Record', value: detailRecord.value.id },
  ]
})
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- ── Page Title Header ───────────────────────────────── -->
    <BasePageHeader />

    <!-- ── Main Card Container ───────────────────────────────── -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- ── Action Controls Bar ───────────────────────────────── -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" />
          </div>

          <BaseCreateButton @click="openCreateModal" />
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
        <BaseTable
          :columns="conditionColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchMachineConditions"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #name-data="{ row }">
            <div class="flex items-center gap-2">
              <BaseBadge :variant="getConditionBadgeVariant(row.name)">
                {{ row.name }}
              </BaseBadge>
            </div>
          </template>

          <template #description-data="{ row }">
            <span class="text-xs text-gray-600 truncate max-w-md block" :title="row.description">
              {{ row.description || '-' }}
            </span>
          </template>

          <template #is_active-data="{ row }">
            <BaseBadge :variant="row.is_active ? 'success' : 'danger'">
              {{ row.is_active ? 'Aktif' : 'Nonaktif' }}
            </BaseBadge>
          </template>

          <!-- Action Buttons Cell Slot (View, Edit, Delete) -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" title="Lihat Detail" @click="handleView(row)" />
              <BaseActionButton type="edit" title="Ubah Kondisi" @click="handleEdit(row)" />
              <BaseActionButton type="delete" title="Hapus Kondisi" @click="handleDelete(row)" />
            </div>
          </template>
        </BaseTable>

        <!-- ── Pagination ────────────────────────────────────────── -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredData.length"
          class="shrink-0 pt-4 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- ── Form Drawer ─────────────────────────────────────────── -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="machineConditionFormSections"
      variant="drawer"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Kondisi Mesin"
      :message="`Apakah Anda yakin ingin menghapus kondisi mesin '${deleteTarget?.name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />

    <!-- ── View Detail Modal ───────────────────────── -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Kondisi Mesin"
      subtitle="Informasi Status & Deskripsi Operasional Mesin"
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
    />
  </div>
</template>
