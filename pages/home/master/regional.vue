<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { TableColumn, RegionalItem } from '~/types'
import { getRegionalFormSections } from '~/schemas/master/regional.schema'
import type { DetailDataItem } from '~/types/master.types'
import { exportToExcel } from '~/utils/exportExcel'

const {
  regionalList,
  loading,
  fetchRegional,
  createRegional,
  updateRegional,
  deleteRegional,
} = useRegional()
const { can } = useRbac()
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
const deleteTarget = ref<RegionalItem | null>(null)
const isDeleting = ref(false)

// Detail Modal States
const isDetailModalOpen = ref(false)
const detailRecord = ref<RegionalItem | null>(null)

const regionalColumns: TableColumn[] = [
  { key: 'no', label: 'No' },
  { key: 'kode_regional', label: 'Kode Regional' },
  { key: 'nama_regional', label: 'Nama Regional (Wilayah)' },
  { key: 'latitude', label: 'Latitude' },
  { key: 'longitude', label: 'Longitude' },
  { key: 'keterangan', label: 'Keterangan' },
  { key: 'actions', label: 'Aksi' },
]

const formSections = computed(() => getRegionalFormSections())

onMounted(async () => {
  await fetchRegional()
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const filteredData = computed(() => {
  if (!searchQuery.value) return regionalList.value
  const q = searchQuery.value.toLowerCase()
  return regionalList.value.filter(
    item =>
      (item.kode_regional && item.kode_regional.toLowerCase().includes(q))
      || (item.nama_regional && item.nama_regional.toLowerCase().includes(q))
      || (item.keterangan && item.keterangan.toLowerCase().includes(q))
  )
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const modalTitle = computed(() =>
  modalMode.value === 'create' ? 'Tambah Data Regional' : 'Ubah Data Regional',
)
const modalSubtitle = computed(() =>
  modalMode.value === 'create'
    ? 'Form Tambah Master Data Regional (Wilayah)'
    : 'Form Ubah Master Data Regional (Wilayah)',
)

const openCreateModal = () => {
  modalMode.value = 'create'
  formData.value = {
    kode_regional: '',
    nama_regional: '',
    latitude: '',
    longitude: '',
    keterangan: '',
  }
  modalOpen.value = true
}

const handleView = (row: RegionalItem) => {
  detailRecord.value = row
  isDetailModalOpen.value = true
}

const handleEdit = (row: RegionalItem) => {
  modalMode.value = 'edit'
  formData.value = { ...row }
  modalOpen.value = true
}

const openEditFromDetail = () => {
  if (detailRecord.value) {
    handleEdit(detailRecord.value)
  }
}

const handleDelete = (row: RegionalItem) => {
  deleteTarget.value = row
  isConfirmDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await deleteRegional(deleteTarget.value.id || deleteTarget.value.kode_regional)
    toast.success(`Regional '${deleteTarget.value.nama_regional}' berhasil dihapus.`, 'Sukses')
    isConfirmDialogOpen.value = false
    deleteTarget.value = null
  } catch (err: any) {
    toast.error(err?.message || 'Gagal menghapus regional.', 'Gagal Hapus')
  } finally {
    isDeleting.value = false
  }
}

const handleSave = async (data: Record<string, any>) => {
  submitting.value = true
  try {
    const payload = {
      kode_regional: data.kode_regional,
      nama_regional: data.nama_regional,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      keterangan: data.keterangan,
    }

    if (modalMode.value === 'create') {
      await createRegional(payload)
      modalOpen.value = false
      isSuccessModalOpen.value = true
    } else {
      const id = formData.value.id || formData.value.kode_regional
      await updateRegional(id, payload)
      modalOpen.value = false
      toast.success('Data regional berhasil diperbarui.', 'Sukses')
    }
  } catch (err: any) {
    toast.error(err?.message || 'Gagal menyimpan data regional.', 'Terjadi Kesalahan')
  } finally {
    submitting.value = false
  }
}

const handleExport = () => {
  exportToExcel(regionalColumns, filteredData.value, {
    fileName: 'Master_Regional_PLN',
  })
}

// Detail Data Items
const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return []
  return [
    { label: 'Kode Regional', value: detailRecord.value.kode_regional },
    { label: 'Nama Regional', value: detailRecord.value.nama_regional },
    { label: 'Latitude', value: detailRecord.value.latitude ?? '-' },
    { label: 'Longitude', value: detailRecord.value.longitude ?? '-' },
    { label: 'Keterangan', value: detailRecord.value.keterangan || '-' },
    { label: 'ID Record', value: detailRecord.value.id || detailRecord.value.kode_regional },
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
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Regional..." />
            <BaseExportButton @click="handleExport" />
          </div>

          <BaseCreateButton
            v-if="can('REGIONAL.CREATE')"
            label="TAMBAH DATA"
            @click="openCreateModal"
          />
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
        <BaseTable
          :columns="regionalColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchRegional"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #kode_regional-data="{ row }">
            <span class="text-xs font-semibold text-gray-800">{{ row.kode_regional }}</span>
          </template>

          <template #nama_regional-data="{ row }">
            <span class="text-xs font-medium text-gray-700">{{ row.nama_regional }}</span>
          </template>

          <template #latitude-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.latitude ?? '-' }}</span>
          </template>

          <template #longitude-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.longitude ?? '-' }}</span>
          </template>

          <template #keterangan-data="{ row }">
            <span class="text-xs text-gray-500 truncate max-w-xs block" :title="row.keterangan">
              {{ row.keterangan || '-' }}
            </span>
          </template>

          <!-- Action Buttons Cell Slot (View, Edit, Delete) -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" title="Lihat Detail" @click="handleView(row)" />
              <BaseActionButton
                v-if="can('REGIONAL.UPDATE')"
                type="edit"
                title="Ubah Regional"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                v-if="can('REGIONAL.DELETE')"
                type="delete"
                title="Hapus Regional"
                @click="handleDelete(row)"
              />
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
      :sections="formSections"
      variant="drawer"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Regional"
      :message="`Apakah Anda yakin ingin menghapus Regional '${deleteTarget?.nama_regional || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />

    <!-- ── View Detail Modal ───────────────────────── -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Regional"
      subtitle="Informasi Master Regional (Wilayah)"
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
    />
  </div>
</template>
