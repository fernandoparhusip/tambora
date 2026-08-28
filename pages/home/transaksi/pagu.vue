<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, FormSectionConfig, PaguDTO } from "~/types";
import type { DetailDataItem } from "~/components/base/BaseDetailModal.vue";
import { usePagu } from "~/composables/transaksi/usePagu";
import { getPaguFormSections } from "~/schemas/transaksi/pagu.schema";
import BaseConfirmDialog from "~/components/base/BaseConfirmDialog.vue";

const { list, loading, fetchList, createItem, updateItem, deleteItem, reviseItem, exportExcel } = usePagu();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const isReviseMode = ref(false);
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isDetailModalOpen = ref(false);
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<PaguDTO | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<PaguDTO | null>(null);

const columns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "jenis_pagu", label: "Jenis Pagu" },
  { key: "periode", label: "Tahun Periode" },
  { key: "scope", label: "Scope" },
  { key: "tanggal_input", label: "Tanggal Input" },
  { key: "revisi_ke", label: "Revisi" },
  { key: "dokumen_path", label: "Dokumen" },
  { key: "actions", label: "Aksi" }
];

const formSections = computed<FormSectionConfig[]>(() => getPaguFormSections());

onMounted(async () => {
  await fetchList();
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return list.value;
  const q = searchQuery.value.toLowerCase().trim();
  return list.value.filter(
    (item: PaguDTO) =>
      item.jenis_pagu?.toLowerCase().includes(q) ||
      item.scope?.toLowerCase().includes(q) ||
      item.periode?.toString().includes(q)
  );
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  isReviseMode.value
    ? "Revisi Pagu Anggaran"
    : modalMode.value === "edit"
      ? "Edit Data Pagu Anggaran"
      : "Tambah Dokumen Pagu Anggaran"
);
const modalSubtitle = computed(() =>
  isReviseMode.value
    ? "Form Pengajuan Revisi Pagu Anggaran"
    : "Form Pencatatan Pagu AO/AKO, AI/AKI & POS 54"
);

const openCreateModal = () => {
  modalMode.value = "create";
  isReviseMode.value = false;
  formData.value = {
    jenis_pagu: "AO_AKO",
    periode: new Date().getFullYear(),
    scope: "Unit",
    tanggal_input: new Date().toISOString().split("T")[0],
    dokumen_path: "Dokumen_Pagu_2026.pdf",
    detail_ao_ako: [
      { urutan: 1, level: 1, uraian: "Bahan Bakar dan Pelumas", ao: 1250000000, ako: 1000000000 },
      { urutan: 2, level: 1, uraian: "Pemeliharaan Mesin & Pembangkit", ao: 800000000, ako: 750000000 }
    ]
  };
  modalOpen.value = true;
};

const handleEdit = (row: PaguDTO) => {
  modalMode.value = "edit";
  isReviseMode.value = false;
  formData.value = { ...row, tanggal_input: row.tanggal_input?.split("T")[0] };
  modalOpen.value = true;
};

const openReviseModal = (row: PaguDTO) => {
  modalMode.value = "edit";
  isReviseMode.value = true;
  formData.value = { ...row, tanggal_input: row.tanggal_input?.split("T")[0] };
  modalOpen.value = true;
};

const handleView = (row: PaguDTO) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const handleDelete = (row: PaguDTO) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const payload = {
      jenis_pagu: data.jenis_pagu || "AO_AKO",
      periode: Number(data.periode) || 2026,
      scope: data.scope || "Unit",
      tanggal_input: data.tanggal_input ? `${data.tanggal_input}T00:00:00Z` : new Date().toISOString(),
      dokumen_path: data.dokumen_path || "/uploads/Dokumen_Pagu.pdf",
      detail_ao_ako: data.detail_ao_ako || [
        { urutan: 1, level: 1, uraian: "Bahan Bakar dan Pelumas", ao: 1250000000, ako: 1000000000 }
      ]
    };

    if (isReviseMode.value && formData.value.id) {
      await reviseItem(formData.value.id, payload);
    } else if (modalMode.value === "create") {
      await createItem(payload);
    } else if (formData.value.id) {
      await updateItem(formData.value.id, payload);
    }
    modalOpen.value = false;
    isSuccessModalOpen.value = true;
  } finally {
    submitting.value = false;
  }
};

const handleConfirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteItem(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } finally {
    isDeleting.value = false;
  }
};

const detailItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const r = detailRecord.value;
  return [
    { label: "ID Pagu", value: r.id },
    { label: "Jenis Pagu", value: r.jenis_pagu },
    { label: "Tahun Periode", value: `${r.periode}` },
    { label: "Scope", value: r.scope },
    { label: "Revisi Ke", value: `Rev ${r.revisi_ke || 0}` },
    { label: "Tanggal Input", value: r.tanggal_input?.split("T")[0] || "-" },
    { label: "Dokumen Pendukung", value: r.dokumen_path || "Tidak ada lampiran" },
    { label: "Jumlah Rincian Item", value: `${r.detail_ao_ako?.length || 0} Baris Anggaran` }
  ];
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- Header -->
    <BasePageHeader title="Pagu Anggaran" />

    <!-- Main Card -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- Action Controls Bar -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari jenis pagu atau periode..." />
            <BaseExportButton @click="exportExcel" />
          </div>

          <BaseCreateButton label="TAMBAH PAGU" @click="openCreateModal" />
        </div>

        <!-- Table Container -->
        <BaseTable
          :columns="columns"
          :rows="paginatedList"
          :loading="loading"
          class="flex-1 min-h-0"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #jenis_pagu-data="{ row }">
            <BaseBadge :variant="row.jenis_pagu === 'AO_AKO' ? 'primary' : row.jenis_pagu === 'AI_AKI' ? 'info' : 'warning'">
              {{ row.jenis_pagu }}
            </BaseBadge>
          </template>

          <template #periode-data="{ row }">
            <span class="text-xs font-bold text-gray-800">Tahun {{ row.periode }}</span>
          </template>

          <template #scope-data="{ row }">
            <span class="text-xs text-gray-700 font-medium">{{ row.scope }}</span>
          </template>

          <template #tanggal_input-data="{ row }">
            <span class="text-xs text-gray-500">{{ row.tanggal_input ? row.tanggal_input.split("T")[0] : "-" }}</span>
          </template>

          <template #revisi_ke-data="{ row }">
            <BaseBadge :variant="(row.revisi_ke || 0) > 0 ? 'warning' : 'mono'">
              Rev {{ row.revisi_ke || 0 }}
            </BaseBadge>
          </template>

          <template #dokumen_path-data="{ row }">
            <span class="text-xs text-blue-600 font-mono truncate max-w-[150px] inline-block">
              {{ row.dokumen_path ? row.dokumen_path.split('/').pop() : '-' }}
            </span>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton type="edit" @click="handleEdit(row)" />
              <button
                type="button"
                class="px-2 py-1 text-[11px] font-semibold rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200"
                title="Revisi Pagu"
                @click="openReviseModal(row)"
              >
                Revisi
              </button>
              <BaseActionButton type="delete" @click="handleDelete(row)" />
            </div>
          </template>
        </BaseTable>

        <!-- Pagination -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredList.length"
          class="shrink-0 pt-4 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- Form Drawer Modal -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="formSections"
      :submitting="submitting"
      @submit="handleSubmit"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Pagu Anggaran"
      subtitle="Rincian anggaran operasional dan investasi"
      :data-items="detailItems"
      @close="isDetailModalOpen = false"
    />

    <!-- Delete Confirmation Modal -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Pagu"
      :message="`Apakah Anda yakin ingin menghapus dokumen Pagu ${deleteTarget?.jenis_pagu || ''} Periode ${deleteTarget?.periode || ''}?`"
      :loading="isDeleting"
      @confirm="handleConfirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
