<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Summary Card -->
    <BaseCard>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-xl font-bold text-gray-900 dark:text-white">
            Pencatatan Transaksi PLN
          </h1>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Riwayat pengeluaran, pemeliharaan gardu, log operasional, dan status pembayaran regional.
          </p>
        </div>
        <div>
          <UButton
            color="primary"
            icon="i-heroicons-plus"
            size="sm"
            @click="openCreateModal"
          >
            Catat Transaksi
          </UButton>
        </div>
      </div>
    </BaseCard>

    <!-- Table of Transactions -->
    <BaseTable
      :columns="columns"
      :rows="items"
      searchable
      pagination
      :loading="loading"
    >
      <template #tanggal-data="{ row }">
        <span class="text-sm font-medium">
          {{ dayjs(row.tanggal).format('DD MMM YYYY') }}
        </span>
      </template>

      <template #jumlah-data="{ row }">
        <span class="text-sm font-semibold font-mono">
          {{ formatCurrency(row.jumlah) }}
        </span>
      </template>

      <template #status-data="{ row }">
        <UBadge
          :color="getStatusColor(row.status)"
          variant="subtle"
          size="xs"
        >
          {{ row.status }}
        </UBadge>
      </template>

      <template #actions-data="{ row }">
        <div class="flex items-center gap-1.5 justify-end">
          <UButton color="gray" variant="ghost" icon="i-heroicons-eye" size="xs" @click="handleView(row)" />
          <UButton color="primary" variant="ghost" icon="i-heroicons-pencil-square" size="xs" @click="handleEdit(row)" />
          <UButton color="red" variant="ghost" icon="i-heroicons-trash" size="xs" @click="handleDelete(row)" />
        </div>
      </template>
    </BaseTable>

    <!-- Form modal -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :sections="formSections"
      :submitting="submitting"
      :errors="formErrors"
      @submit="handleSave"
      @cancel="clearErrors"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { z } from 'zod'
import { useTransaksi } from '~/composables/useTransaksi'
import { formatCurrency } from '~/utils/formatNumber'
import type { FormSectionConfig, TableColumn, Transaksi } from '~/types'

const { items, loading, fetchAll, create, update, remove } = useTransaksi()

onMounted(() => { fetchAll() })

const columns: TableColumn[] = [
  { key: 'id', label: 'ID Transaksi', sortable: true },
  { key: 'tanggal', label: 'Tanggal', sortable: true, type: 'custom' },
  { key: 'nama', label: 'Deskripsi Pekerjaan', sortable: true },
  { key: 'kategori', label: 'Kategori', sortable: true },
  { key: 'jumlah', label: 'Nilai Transaksi', sortable: true, type: 'custom' },
  { key: 'status', label: 'Status', sortable: true, type: 'custom' },
  { key: 'actions', label: 'Aksi', sortable: false, type: 'custom' }
]

const formSections: FormSectionConfig[] = [
  {
    title: 'Detail Pengeluaran',
    fields: [
      { key: 'tanggal', label: 'Tanggal Transaksi', type: 'date', colSpan: 6 },
      { key: 'kategori', label: 'Kategori Biaya', type: 'select', placeholder: 'Pilih Kategori', options: [
        { label: 'Operasional Kantor', value: 'Operasional' },
        { label: 'Pemeliharaan Gardu', value: 'Pemeliharaan' },
        { label: 'Sewa & Transportasi', value: 'Transportasi' }
      ], colSpan: 6 },
      { key: 'nama', label: 'Deskripsi / Nama Kegiatan', type: 'text', placeholder: 'Masukkan nama/tujuan pengeluaran', colSpan: 12 },
      { key: 'jumlah', label: 'Jumlah Anggaran (IDR)', type: 'currency', placeholder: '0', colSpan: 6 },
      { key: 'status', label: 'Status Persetujuan', type: 'select', placeholder: 'Pilih Status', options: [
        { label: 'Pending', value: 'Pending' },
        { label: 'Selesai', value: 'Selesai' },
        { label: 'Batal', value: 'Batal' }
      ], colSpan: 6 }
    ]
  }
]

const transactionValidationSchema = z.object({
  tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  kategori: z.string().min(1, 'Kategori wajib dipilih'),
  nama: z.string().min(5, 'Deskripsi minimal 5 karakter'),
  jumlah: z.number({ invalid_type_error: 'Nilai transaksi harus berupa angka' }).min(1000, 'Minimal nilai transaksi Rp 1.000'),
  status: z.enum(['Pending', 'Selesai', 'Batal'], { required_error: 'Status wajib dipilih' })
})

const modalOpen = ref(false)
const modalMode = ref<'create' | 'edit' | 'view'>('create')
const formData = ref<Record<string, any>>({})
const formErrors = ref<Record<string, string>>({})
const submitting = ref(false)

const modalTitle = computed(() => {
  if (modalMode.value === 'view') return 'Detail Catatan Transaksi'
  if (modalMode.value === 'edit') return 'Edit Catatan Transaksi'
  return 'Catat Transaksi Baru'
})

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Selesai': return 'green'
    case 'Pending': return 'amber'
    default: return 'red'
  }
}

const openCreateModal = () => {
  modalMode.value = 'create'
  formData.value = { tanggal: dayjs().format('YYYY-MM-DD'), kategori: '', nama: '', jumlah: 0, status: 'Pending' }
  clearErrors()
  modalOpen.value = true
}

const handleView = (row: Transaksi) => { modalMode.value = 'view'; formData.value = { ...row }; clearErrors(); modalOpen.value = true }
const handleEdit = (row: Transaksi) => { modalMode.value = 'edit'; formData.value = { ...row }; clearErrors(); modalOpen.value = true }

const handleDelete = async (row: Transaksi) => {
  if (confirm(`Apakah Anda yakin ingin menghapus transaksi ${row.id}?`)) {
    await remove(row.id)
  }
}

const clearErrors = () => { formErrors.value = {} }

const handleSave = async () => {
  if (modalMode.value === 'view') { modalOpen.value = false; return }
  clearErrors()
  const result = transactionValidationSchema.safeParse(formData.value)
  if (!result.success) {
    result.error.issues.forEach(issue => {
      const fieldKey = issue.path[0] as string
      formErrors.value[fieldKey] = issue.message
    })
    return
  }
  submitting.value = true
  try {
    if (modalMode.value === 'create') {
      await create(formData.value as any)
    } else {
      await update(formData.value.id, formData.value)
    }
    modalOpen.value = false
  } catch (err: any) {
    alert('Gagal mencatatkan transaksi: ' + err.message)
  } finally {
    submitting.value = false
  }
}
</script>
