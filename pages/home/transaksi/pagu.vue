<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, FormSectionConfig, PaguDTO, PaguBidangDTO } from "~/types";
import type { DetailDataItem } from "~/types/master.types";
import type { TabItem } from "~/components/base/BaseTabFilter.vue";
import { getPaguFormSections } from "~/schemas/transaksi/pagu.schema";
import { getPaguBidangFormSections } from "~/schemas/transaksi/pagu-bidang.schema";
import { exportToExcel } from "~/utils/exportExcel";
import { formatRupiah } from "~/utils/formatNumber";

// Tab state murni di dalam halaman: 'unit' | 'bidang'
const activeTab = ref<"unit" | "bidang">("unit");
const tabOptions: TabItem[] = [
  { key: "unit", label: "Unit" },
  { key: "bidang", label: "Bidang" }
];

// 1. Pagu Unit Composable
const {
  list: paguUnitList,
  loading: paguUnitLoading,
  fetchList: fetchPaguUnitList,
  createItem: createPaguUnit,
  updateItem: updatePaguUnit,
  deleteItem: deletePaguUnit,
  reviseItem: revisePaguUnit,
  exportExcel: exportPaguUnitExcel
} = usePagu();

// 2. Pagu Bidang Composable
const {
  list: paguBidangList,
  loading: paguBidangLoading,
  fetchList: fetchPaguBidangList,
  createItem: createPaguBidang,
  updateItem: updatePaguBidang,
  deleteItem: deletePaguBidang
} = usePaguBidang();

const searchQuery = ref("");
const selectedDate = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

// Modals state
const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const isReviseMode = ref(false);
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isDetailModalOpen = ref(false);
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<any>(null);
const isDeleting = ref(false);
const detailRecord = ref<any>(null);

// Table columns for Unit
const unitColumns: TableColumn[] = [
  { key: "no", label: "No." },
  { key: "jenis_pagu", label: "Jenis Pagu" },
  { key: "tanggal_input", label: "Tanggal Input" },
  { key: "revisi_ke", label: "Revisi" },
  { key: "actions", label: "Aksi" }
];

// Table columns for Bidang
const bidangColumns: TableColumn[] = [
  { key: "no", label: "No." },
  { key: "periode", label: "Periode Pagu AO/AKO" },
  { key: "total_bidang", label: "Alokasi Bidang" },
  { key: "total_ao", label: "Total AO (Rp)" },
  { key: "total_ako", label: "Total AKO (Rp)" },
  { key: "actions", label: "Aksi" }
];

const currentColumns = computed(() =>
  activeTab.value === "unit" ? unitColumns : bidangColumns
);

const currentLoading = computed(() =>
  activeTab.value === "unit" ? paguUnitLoading.value : paguBidangLoading.value
);

const paguUnitOptions = computed(() =>
  paguUnitList.value.map((p: any) => ({
    label: `Pagu ${p.jenis_pagu} - Tahun ${p.periode} (${p.scope})`,
    value: p.id
  }))
);

// Dynamic form sections based on active tab
const formSections = computed<FormSectionConfig[]>(() => {
  if (activeTab.value === "unit") {
    return getPaguFormSections();
  }
  return getPaguBidangFormSections({ paguUnitOptions: paguUnitOptions.value });
});

onMounted(async () => {
  await Promise.all([fetchPaguUnitList(), fetchPaguBidangList()]);
});

watch(activeTab, () => {
  currentPage.value = 1;
  searchQuery.value = "";
});

watch([searchQuery, selectedDate], () => {
  currentPage.value = 1;
});

const filteredList = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const date = selectedDate.value;

  if (activeTab.value === "unit") {
    return paguUnitList.value.filter((item: PaguDTO) => {
      const matchQuery =
        !q ||
        item.jenis_pagu?.toLowerCase().includes(q) ||
        item.scope?.toLowerCase().includes(q) ||
        item.periode?.toString().includes(q);
      const matchDate = !date || item.tanggal_input?.startsWith(date);
      return matchQuery && matchDate;
    });
  } else {
    return paguBidangList.value.filter((item: PaguBidangDTO) => {
      const matchQuery =
        !q ||
        item.pagu_unit_id?.toLowerCase().includes(q) ||
        item.periode?.toString().includes(q);
      const matchDate = !date || (item as any).created_at?.startsWith(date);
      return matchQuery && matchDate;
    });
  }
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() => {
  if (activeTab.value === "unit") {
    return isReviseMode.value
      ? "Revisi Pagu Anggaran"
      : modalMode.value === "edit"
        ? "Edit Data Pagu Unit"
        : "Tambah Dokumen Pagu Anggaran (Unit)";
  }
  return modalMode.value === "edit"
    ? "Edit Alokasi Pagu Bidang"
    : "Tambah Alokasi Pagu Bidang";
});

const modalSubtitle = computed(() => {
  if (activeTab.value === "unit") {
    return isReviseMode.value
      ? "Form Pengajuan Revisi Pagu Anggaran Unit"
      : "Form Pencatatan Pagu AO/AKO, AI/AKI & POS 54";
  }
  return modalMode.value === "edit"
    ? "Form Pembagian Anggaran Operasional Bidang"
    : "Form Alokasi Pagu Unit ke Bidang (Ophar, Adum, K3L)";
});

const openCreateModal = () => {
  modalMode.value = "create";
  isReviseMode.value = false;

  if (activeTab.value === "unit") {
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
  } else {
    formData.value = {
      pagu_unit_id: paguUnitList.value[0]?.id || "",
      periode: new Date().getFullYear(),
      details: [
        { uraian: "Operasi & Pemeliharaan (Ophar)", ao: 500000000, ako: 450000000, persentase: 50 },
        { uraian: "Administrasi & Umum (Adum)", ao: 300000000, ako: 250000000, persentase: 30 },
        { uraian: "K3L & Keamanan", ao: 200000000, ako: 180000000, persentase: 20 }
      ]
    };
  }

  modalOpen.value = true;
};

const handleEdit = (row: any) => {
  modalMode.value = "edit";
  isReviseMode.value = false;
  formData.value = {
    ...row,
    tanggal_input: row.tanggal_input ? row.tanggal_input.split("T")[0] : undefined
  };
  modalOpen.value = true;
};

const openReviseModal = (row: PaguDTO) => {
  modalMode.value = "edit";
  isReviseMode.value = true;
  formData.value = {
    ...row,
    tanggal_input: row.tanggal_input ? row.tanggal_input.split("T")[0] : undefined
  };
  modalOpen.value = true;
};

const handleView = (row: any) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const handleDelete = (row: any) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const data = formData.value;

    if (activeTab.value === "unit") {
      const payload = {
        jenis_pagu: data.jenis_pagu || "AO_AKO",
        periode: Number(data.periode) || 2026,
        scope: data.scope || "Unit",
        tanggal_input: data.tanggal_input
          ? `${data.tanggal_input}T00:00:00Z`
          : new Date().toISOString(),
        dokumen_path: data.dokumen_path || "/uploads/Dokumen_Pagu.pdf",
        detail_ao_ako: data.detail_ao_ako || [
          { urutan: 1, level: 1, uraian: "Bahan Bakar dan Pelumas", ao: 1250000000, ako: 1000000000 }
        ]
      };

      if (isReviseMode.value && formData.value.id) {
        await revisePaguUnit(formData.value.id, payload);
      } else if (modalMode.value === "create") {
        await createPaguUnit(payload);
      } else if (formData.value.id) {
        await updatePaguUnit(formData.value.id, payload);
      }
    } else {
      const payload = {
        pagu_unit_id: data.pagu_unit_id,
        periode: Number(data.periode) || 2026,
        details: data.details || [
          { uraian: "Operasi & Pemeliharaan", ao: 500000000, ako: 450000000, persentase: 50 }
        ]
      };

      if (modalMode.value === "create") {
        await createPaguBidang(payload);
      } else if (formData.value.id) {
        await updatePaguBidang(formData.value.id, payload);
      }
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
    if (activeTab.value === "unit") {
      await deletePaguUnit(deleteTarget.value.id);
    } else {
      await deletePaguBidang(deleteTarget.value.id);
    }
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } finally {
    isDeleting.value = false;
  }
};

const handleExport = () => {
  if (activeTab.value === "unit") {
    exportPaguUnitExcel();
  } else {
    exportToExcel(
      bidangColumns,
      filteredList.value,
      { fileName: `Pagu_Bidang_${new Date().toISOString().split("T")[0]}` }
    );
  }
};

const detailItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const r = detailRecord.value;

  if (activeTab.value === "unit") {
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
  } else {
    return [
      { label: "ID Pagu Bidang", value: r.id },
      { label: "Pagu Unit Referensi", value: r.pagu_unit_id },
      { label: "Tahun Periode", value: `${r.periode}` },
      { label: "Total Alokasi Bidang", value: `${r.total_bidang || 0} Bidang` },
      { label: "Total Anggaran Operasi (AO)", value: formatRupiah(r.total_ao || 0) },
      { label: "Total Anggaran Kas Operasi (AKO)", value: formatRupiah(r.total_ako || 0) }
    ];
  }
});

const handleReload = () => {
  if (activeTab.value === "unit") {
    fetchPaguUnitList();
  } else {
    fetchPaguBidangList();
  }
};
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- Header -->
    <BasePageHeader />

    <!-- Main Card -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- Action Controls Bar -->
        <div
          class="shrink-0 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4"
        >
          <!-- Left filters: Search, Date Filter, Export -->
          <div class="flex flex-wrap items-center gap-3.5">
            <BaseSearchInput v-model="searchQuery" />
            <BaseDateInput
              v-model="selectedDate"
              placeholder="Pilih Tanggal Input"
            />
            <BaseExportButton @click="handleExport" />
          </div>

          <!-- Right Action: Tab Filter Pill & Create Button -->
          <div class="flex flex-wrap items-center gap-3 self-end lg:self-auto">
            <!-- Pure Component Tab: Unit / Bidang -->
            <BaseTabFilter
              v-model="activeTab"
              :items="tabOptions"
            />

            <!-- Create Button -->
            <BaseCreateButton
              resource="PAGU"
              @click="openCreateModal"
            />
          </div>
        </div>

        <!-- Table Container -->
        <BaseTable
          :columns="currentColumns"
          :rows="paginatedList"
          :loading="currentLoading"
          class="flex-1 min-h-0"
          @reload="handleReload"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <!-- Tab Unit Slots -->
          <template #jenis_pagu-data="{ row }">
            <BaseBadge :variant="row.jenis_pagu === 'AO_AKO' ? 'primary' : row.jenis_pagu === 'AI_AKI' ? 'info' : 'warning'">
              {{ row.jenis_pagu === 'AO_AKO' ? 'Pagu AO/AKO' : row.jenis_pagu === 'AI_AKI' ? 'Pagu AI/AKI' : row.jenis_pagu }}
            </BaseBadge>
          </template>

          <template #tanggal_input-data="{ row }">
            <span class="text-xs text-gray-700 font-medium">
              {{ row.tanggal_input ? row.tanggal_input.split("T")[0] : "-" }}
            </span>
          </template>

          <template #revisi_ke-data="{ row }">
            <span class="text-xs font-semibold text-gray-800">
              {{ row.revisi_ke !== undefined ? row.revisi_ke : 0 }}
            </span>
          </template>

          <!-- Tab Bidang Slots -->
          <template #periode-data="{ row }">
            <span class="text-xs font-bold text-gray-800">
              Tahun {{ row.periode }}
            </span>
          </template>

          <template #total_bidang-data="{ row }">
            <span class="text-xs font-semibold text-blue-600">
              {{ row.total_bidang || 3 }} Bidang
            </span>
          </template>

          <template #total_ao-data="{ row }">
            <span class="text-xs font-mono font-medium text-gray-800">
              {{ formatRupiah(row.total_ao || 0) }}
            </span>
          </template>

          <template #total_ako-data="{ row }">
            <span class="text-xs font-mono font-medium text-gray-800">
              {{ formatRupiah(row.total_ako || 0) }}
            </span>
          </template>

          <!-- Actions -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton type="edit" resource="PAGU" @click="handleEdit(row)" />
              <button
                v-if="activeTab === 'unit'"
                type="button"
                class="px-2 py-1 text-[11px] font-semibold rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200 cursor-pointer"
                title="Revisi Pagu"
                @click="openReviseModal(row)"
              >
                Revisi
              </button>
              <BaseActionButton type="delete" resource="PAGU" @click="handleDelete(row)" />
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
      :draft-key="activeTab === 'unit' ? 'transaksi-pagu-unit' : 'transaksi-pagu-bidang'"
      @submit="handleSubmit"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      :title="activeTab === 'unit' ? 'Detail Pagu Anggaran (Unit)' : 'Detail Alokasi Pagu Bidang'"
      :subtitle="activeTab === 'unit' ? 'Rincian anggaran operasional dan investasi' : 'Rincian alokasi anggaran per bidang kerja'"
      :data-items="detailItems"
      @close="isDetailModalOpen = false"
    />

    <!-- Delete Confirmation Modal -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      :title="activeTab === 'unit' ? 'Hapus Data Pagu Unit' : 'Hapus Data Pagu Bidang'"
      :message="`Apakah Anda yakin ingin menghapus data ini?`"
      :loading="isDeleting"
      @confirm="handleConfirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
