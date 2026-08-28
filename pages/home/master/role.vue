<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { DetailDataItem } from '~/types/master.types';
import { exportToExcel } from '~/utils/exportExcel'
import type { RoleItem, TableColumn } from '~/types'
import { roleFormSections } from '~/schemas/master/role.schema'

const { roles, loading, fetchRoles, createRole, updateRole, deleteRole } = useRole()
const toast = useAppToast()

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

// Form Modal States
const isModalOpen = ref(false)
const isEditMode = ref(false)
const editingId = ref<string | null>(null)
const isSubmitting = ref(false)
const isSuccessModalOpen = ref(false)

// Detail Modal States
const isDetailModalOpen = ref(false)
const detailRecord = ref<RoleItem | null>(null)

// Confirm Delete Dialog States
const isConfirmDialogOpen = ref(false)
const deleteTarget = ref<RoleItem | null>(null)
const isDeleting = ref(false)

const modalTitle = computed(() => (isEditMode.value ? 'Ubah Data Role' : 'Tambah Data Role'))
const modalSubtitle = computed(() => (isEditMode.value ? 'Form Ubah Data Role' : 'Form Tambah Data Role'))

const masterRoleColumns: TableColumn[] = [
  { key: 'no', label: 'No' },
  { key: 'code', label: 'Kode Role' },
  { key: 'name', label: 'Nama Role' },
  { key: 'description', label: 'Deskripsi' },
  { key: 'is_system', label: 'Tipe' },
  { key: 'actions', label: 'Aksi' },
]

const formData = ref<Record<string, any>>({
  code: '',
  name: '',
  description: '',
  levelRole: '',
})

onMounted(async () => {
  await fetchRoles()
})

// Reset pagination when searching
watch(searchQuery, () => {
  currentPage.value = 1
})

const filteredRows = computed(() => {
  if (!searchQuery.value) return roles.value
  const q = searchQuery.value.toLowerCase()
  return roles.value.filter(
    r =>
      r.code.toLowerCase().includes(q)
      || r.name.toLowerCase().includes(q)
      || (r.description && r.description.toLowerCase().includes(q)),
  )
})

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const handleExport = () => {
  exportToExcel(masterRoleColumns, filteredRows.value, {
    fileName: 'Data_Role_PLN',
  })
}

// Modal Handlers
const openCreateModal = () => {
  isEditMode.value = false
  editingId.value = null
  formData.value = {
    code: '',
    name: '',
    description: '',
    levelRole: '',
  }
  isModalOpen.value = true
}

const handleView = (row: RoleItem) => {
  detailRecord.value = row
  isDetailModalOpen.value = true
}

const handleEdit = (row: RoleItem) => {
  isEditMode.value = true
  editingId.value = row.id
  formData.value = {
    code: row.code,
    name: row.name,
    description: row.description || '',
    levelRole: '',
  }
  isModalOpen.value = true
}

const openEditFromDetail = () => {
  if (detailRecord.value) {
    handleEdit(detailRecord.value)
  }
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSave = async () => {
  if (!formData.value.code || !formData.value.name) {
    toast.error('Mohon lengkapi Kode Role dan Nama Role.', 'Validasi Form')
    return
  }

  isSubmitting.value = true
  try {
    if (isEditMode.value && editingId.value) {
      await updateRole(editingId.value, {
        code: formData.value.code,
        name: formData.value.name,
        description: formData.value.description || formData.value.name,
        permissions: [],
      })
      toast.success(`Role '${formData.value.name}' berhasil diperbarui.`, 'Sukses')
    } else {
      await createRole({
        code: formData.value.code.toUpperCase().replace(/\s+/g, '_'),
        name: formData.value.name,
        description: formData.value.description || formData.value.name,
        permissions: [],
      })
      toast.success(`Role baru '${formData.value.name}' berhasil dibuat.`, 'Sukses')
    }

    isModalOpen.value = false
    setTimeout(() => {
      isSuccessModalOpen.value = true
    }, 150)
  } catch (err: any) {
    toast.error(err?.message || 'Gagal menyimpan data role.', 'Terjadi Kesalahan')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = (row: RoleItem) => {
  deleteTarget.value = row
  isConfirmDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await deleteRole(deleteTarget.value.id)
    toast.success(`Role '${deleteTarget.value.name}' berhasil dihapus.`, 'Sukses')
    isConfirmDialogOpen.value = false
    deleteTarget.value = null
  } catch (err: any) {
    toast.error(err?.message || 'Gagal menghapus role.', 'Gagal Hapus')
  } finally {
    isDeleting.value = false
  }
}

// Detail Data Items
const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return []
  return [
    { label: 'Kode Role', value: detailRecord.value.code },
    { label: 'Nama Role', value: detailRecord.value.name },
    { label: 'Deskripsi Role', value: detailRecord.value.description || '-' },
    {
      label: 'Tipe Role',
      value: detailRecord.value.is_system ? 'System Role' : 'Custom Role',
      isStatus: true,
    },
    { label: 'ID Role', value: detailRecord.value.id },
  ]
})
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#F4F7FE]">
    <!-- Top White Page Header -->
    <BasePageHeader />

    <!-- Container Padding -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <!-- White Main Card Container -->
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- Action Header Bar -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Kode atau Nama Role" />
            <BaseExportButton @click="handleExport" />
          </div>
          <BaseCreateButton label="TAMBAH DATA" @click="openCreateModal" />
        </div>

        <!-- Role Data Table -->
        <BaseTable
          :columns="masterRoleColumns"
          :rows="paginatedRows"
          :loading="loading"
          class="flex-1 min-h-0"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #code-data="{ row }">
            <BaseBadge variant="mono">
              {{ row.code }}
            </BaseBadge>
          </template>

          <template #name-data="{ row }">
            <span class="text-xs text-gray-900 font-medium">{{ row.name }}</span>
          </template>

          <template #description-data="{ row }">
            <span class="text-xs text-gray-600 font-normal truncate max-w-xs block" :title="row.description">
              {{ row.description || '-' }}
            </span>
          </template>

          <template #is_system-data="{ row }">
            <BaseBadge :variant="row.is_system ? 'system' : 'success'">
              {{ row.is_system ? 'System' : 'Custom' }}
            </BaseBadge>
          </template>

          <!-- Full Action Buttons Slot (Detail, Edit, Delete) -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" title="Lihat Detail" @click="handleView(row)" />
              <BaseActionButton type="edit" title="Ubah Role" @click="handleEdit(row)" />
              <BaseActionButton
                v-if="!row.is_system"
                type="delete"
                title="Hapus Role"
                @click="handleDelete(row)"
              />
            </div>
          </template>
        </BaseTable>

        <!-- Pagination -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredRows.length"
          class="shrink-0 pt-4 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- Form Drawer for Tambah/Ubah Data Role -->
    <BaseFormModal
      v-model:is-open="isModalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="roleFormSections"
      variant="drawer"
      :submitting="isSubmitting"
      @submit="handleSave"
      @cancel="closeModal"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Role"
      :message="`Apakah Anda yakin ingin menghapus role '${deleteTarget?.name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />

    <!-- View Detail Drawer/Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Data Role"
      subtitle="Informasi Hak Akses & Deskripsi Role"
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
    />
  </div>
</template>
