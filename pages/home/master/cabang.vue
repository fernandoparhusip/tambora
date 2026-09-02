<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { TableColumn, CabangItem } from '~/types'
import { getCabangFormSections } from '~/schemas/master/cabang.schema'
import type { DetailDataItem } from '~/types/master.types'
import { exportToExcel } from '~/utils/exportExcel'

const {
  cabangList,
  loading,
  fetchCabang,
  createCabang,
  updateCabang,
  deleteCabang,
} = useCabang()
const { regionalList, fetchRegional } = useRegional()
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
const deleteTarget = ref<CabangItem | null>(null)
const isDeleting = ref(false)

// Detail Modal States
const isDetailModalOpen = ref(false)
const detailRecord = ref<CabangItem | null>(null)

const cabangColumns: TableColumn[] = [
  { key: 'no', label: 'No' },
  { key: 'kode_wilayah', label: 'Regional / Wilayah' },
  { key: 'kode_cabang', label: 'Kode Cabang' },
  { key: 'nama_cabang', label: 'Nama Cabang' },
  { key: 'approve_status', label: 'Status Approval' },
  { key: 'keterangan', label: 'Keterangan' },
  { key: 'actions', label: 'Aksi' },
]

const regionalOptions = computed(() =>
  regionalList.value.map(r => ({
    label: `${r.nama_regional} (${r.kode_regional})`,
    value: r.kode_regional,
  }))
)

const formSections = computed(() =>
  getCabangFormSections({
    regionalOptions: regionalOptions.value,
  })
)

onMounted(async () => {
  await Promise.allSettled([fetchCabang(), fetchRegional()])
})

watch(searchQuery, () => {
  currentPage.value = 1
})

const filteredData = computed(() => {
  if (!searchQuery.value) return cabangList.value
  const q = searchQuery.value.toLowerCase()
  return cabangList.value.filter(
    item =>
      (item.kode_cabang && item.kode_cabang.toLowerCase().includes(q))
      || (item.nama_cabang && item.nama_cabang.toLowerCase().includes(q))
      || (item.kode_wilayah && item.kode_wilayah.toLowerCase().includes(q))
      || (item.approve_status && item.approve_status.toLowerCase().includes(q))
  )
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredData.value.slice(start, start + pageSize.value)
})

const modalTitle = computed(() =>
  modalMode.value === 'create' ? 'Tambah Data Cabang' : 'Ubah Data Cabang',
)
const modalSubtitle = computed(() =>
  modalMode.value === 'create'
    ? 'Form Tambah Master Data Cabang PLN'
    : 'Form Ubah Master Data Cabang PLN',
)

const openCreateModal = () => {
  modalMode.value = 'create'
  formData.value = {
    kode_wilayah: regionalList.value[0]?.kode_regional || '',
    kode_cabang: '',
    nama_cabang: '',
    approve_status: 'APPROVED',
    keterangan: '',
  }
  modalOpen.value = true
}

const handleView = (row: CabangItem) => {
  detailRecord.value = row
  isDetailModalOpen.value = true
}

const handleEdit = (row: CabangItem) => {
  modalMode.value = 'edit'
  formData.value = { ...row }
  modalOpen.value = true
}

const openEditFromDetail = () => {
  if (detailRecord.value) {
    handleEdit(detailRecord.value)
  }
}

const handleDelete = (row: CabangItem) => {
  deleteTarget.value = row
  isConfirmDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!deleteTarget.value) return
  isDeleting.value = true
  try {
    await deleteCabang(deleteTarget.value.id || deleteTarget.value.kode_cabang)
    toast.success(`Cabang '${deleteTarget.value.nama_cabang}' berhasil dihapus.`, 'Sukses')
    isConfirmDialogOpen.value = false
    deleteTarget.value = null
  } catch (err: any) {
    toast.error(err?.message || 'Gagal menghapus cabang.', 'Gagal Hapus')
  } finally {
    isDeleting.value = false
  }
}

const handleSave = async (data: Record<string, any>) => {
  submitting.value = true
  try {
    const payload = {
      kode_wilayah: data.kode_wilayah,
      kode_cabang: data.kode_cabang,
      nama_cabang: data.nama_cabang,
      approve_status: data.approve_status || 'APPROVED',
      keterangan: data.keterangan,
    }

    if (modalMode.value === 'create') {
      await createCabang(payload)
      modalOpen.value = false
      isSuccessModalOpen.value = true
    } else {
      const id = formData.value.id || formData.value.kode_cabang
      await updateCabang(id, payload)
      modalOpen.value = false
      toast.success('Data cabang berhasil diperbarui.', 'Sukses')
    }
  } catch (err: any) {
    toast.error(err?.message || 'Gagal menyimpan data cabang.', 'Terjadi Kesalahan')
  } finally {
    submitting.value = false
  }
}

const handleExport = () => {
  exportToExcel(cabangColumns, filteredData.value, {
    fileName: 'Master_Cabang_PLN',
  })
}

const getStatusBadgeVariant = (status?: string): any => {
  const s = (status || '').toUpperCase()
  if (s === 'APPROVED') return 'success'
  if (s === 'REJECTED') return 'danger'
  if (s === 'DRAFT') return 'warning'
  return 'default'
}

// Detail Data Items
const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return []
  return [
    { label: 'Kode Wilayah / Regional', value: detailRecord.value.kode_wilayah },
    { label: 'Kode Cabang', value: detailRecord.value.kode_cabang },
    { label: 'Nama Cabang', value: detailRecord.value.nama_cabang },
    {
      label: 'Status Approval',
      value: detailRecord.value.approve_status || 'APPROVED',
      isStatus: true,
    },
    { label: 'Keterangan', value: detailRecord.value.keterangan || '-' },
    { label: 'ID Record', value: detailRecord.value.id || detailRecord.value.kode_cabang },
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
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Cabang..." />
            <BaseExportButton @click="handleExport" />
          </div>

          <BaseCreateButton
            v-if="can('CABANG.CREATE')"
            label="TAMBAH DATA"
            @click="openCreateModal"
          />
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
        <BaseTable
          :columns="cabangColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchCabang"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #kode_wilayah-data="{ row }">
            <span class="text-xs font-semibold text-gray-800">{{ row.kode_wilayah }}</span>
          </template>

          <template #kode_cabang-data="{ row }">
            <span class="text-xs font-semibold text-primary-700">{{ row.kode_cabang }}</span>
          </template>

          <template #nama_cabang-data="{ row }">
            <span class="text-xs font-medium text-gray-700">{{ row.nama_cabang }}</span>
          </template>

          <template #approve_status-data="{ row }">
            <BaseBadge :variant="getStatusBadgeVariant(row.approve_status)">
              {{ row.approve_status || 'APPROVED' }}
            </BaseBadge>
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
                v-if="can('CABANG.UPDATE')"
                type="edit"
                title="Ubah Cabang"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                v-if="can('CABANG.DELETE')"
                type="delete"
                title="Hapus Cabang"
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
      title="Hapus Data Cabang"
      :message="`Apakah Anda yakin ingin menghapus Cabang '${deleteTarget?.nama_cabang || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />

    <!-- ── View Detail Modal ───────────────────────── -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Cabang"
      subtitle="Informasi Master Cabang PLN"
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
    />
  </div>
</template>
