<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, FormSectionConfig, PaguBidangDTO } from "~/types";
import type { DetailDataItem } from '~/types/master.types';
import { getPaguBidangFormSections } from "~/schemas/transaksi/pagu-bidang.schema";
import { exportToExcel } from "~/utils/exportExcel";

const { list, loading, fetchList, createItem, updateItem, deleteItem } = usePaguBidang();
const { list: paguUnitList, fetchList: fetchPaguUnits } = usePagu();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isDetailModalOpen = ref(false);
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<PaguBidangDTO | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<PaguBidangDTO | null>(null);

const columns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "pagu_unit_id", label: "Pagu Unit Referensi" },
  { key: "periode", label: "Tahun Periode" },
  { key: "total_bidang", label: "Alokasi Bidang" },
  { key: "total_ao", label: "Total AO (Rp)" },
  { key: "total_ako", label: "Total AKO (Rp)" },
  { key: "actions", label: "Aksi" }
];

const paguUnitOptions = computed(() =>
  paguUnitList.value.map((p: any) => ({
    label: `Pagu ${p.jenis_pagu} - Tahun ${p.periode} (${p.scope})`,
    value: p.id
  }))
);

const formSections = computed<FormSectionConfig[]>(() =>
  getPaguBidangFormSections({ paguUnitOptions: paguUnitOptions.value })
);

onMounted(async () => {
  await Promise.all([fetchList(), fetchPaguUnits()]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return list.value;
  const q = searchQuery.value.toLowerCase().trim();
  return list.value.filter(
    (item: PaguBidangDTO) =>
      item.pagu_unit_id?.toLowerCase().includes(q) ||
      item.periode?.toString().includes(q)
  );
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Alokasi Pagu Bidang" : "Alokasi Pagu Bidang Baru"
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Pembagian Anggaran Operasional Bidang"
    : "Form Alokasi Pagu Unit ke Bidang (Ophar, Adum, K3L)"
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    pagu_unit_id: paguUnitList.value[0]?.id || "",
    periode: new Date().getFullYear(),
    details: [
      { uraian: "Operasi & Pemeliharaan (Ophar)", ao: 500000000, ako: 450000000, persentase: 50 },
      { uraian: "Administrasi & Umum (Adum)", ao: 300000000, ako: 250000000, persentase: 30 },
      { uraian: "K3L & Keamanan", ao: 200000000, ako: 180000000, persentase: 20 }
    ]
  };
  modalOpen.value = true;
};

const handleEdit = (row: PaguBidangDTO) => {
  modalMode.value = "edit";
  formData.value = { ...row };
  modalOpen.value = true;
};

const handleView = (row: PaguBidangDTO) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const handleDelete = (row: PaguBidangDTO) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const payload = {
      pagu_unit_id: data.pagu_unit_id,
      periode: Number(data.periode) || 2026,
      details: data.details || [
        { uraian: "Operasi & Pemeliharaan", ao: 500000000, ako: 450000000, persentase: 50 }
      ]
    };

    if (modalMode.value === "create") {
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

const handleExport = () => {
  exportToExcel(columns, filteredList.value, {
    fileName: "Data_Pagu_Bidang_Tambora"
  });
};

const detailItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const r = detailRecord.value;
  const totAo = r.details?.reduce((a: number, b: any) => a + (b.ao || 0), 0) || 0;
  const totAko = r.details?.reduce((a: number, b: any) => a + (b.ako || 0), 0) || 0;
  return [
    { label: "ID Pagu Bidang", value: r.id },
    { label: "Pagu Unit ID", value: r.pagu_unit_id },
    { label: "Tahun Periode", value: `${r.periode}` },
    { label: "Jumlah Bidang Terdaftar", value: `${r.details?.length || 0} Bidang` },
    { label: "Total Anggaran Operasi (AO)", value: `Rp ${totAo.toLocaleString("id-ID")}` },
    { label: "Total Anggaran Kas Operasi (AKO)", value: `Rp ${totAko.toLocaleString("id-ID")}` }
  ];
});
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
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari ID pagu unit atau periode..." />
            <BaseExportButton @click="handleExport" />
          </div>

          <BaseCreateButton label="ALOKASI PAGU BIDANG" @click="openCreateModal" />
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

          <template #pagu_unit_id-data="{ row }">
            <span class="text-xs font-medium text-gray-900 truncate max-w-[200px] inline-block">
              {{ paguUnitList.find((p: any) => p.id === row.pagu_unit_id)?.jenis_pagu || row.pagu_unit_id }}
            </span>
          </template>

          <template #periode-data="{ row }">
            <span class="text-xs font-bold text-gray-800">Tahun {{ row.periode }}</span>
          </template>

          <template #total_bidang-data="{ row }">
            <BaseBadge variant="info">
              {{ row.details?.length || 0 }} Bidang
            </BaseBadge>
          </template>

          <template #total_ao-data="{ row }">
            <span class="text-xs font-semibold text-blue-600">
              Rp {{ (row.details?.reduce((acc: number, d: any) => acc + (d.ao || 0), 0) || 0).toLocaleString("id-ID") }}
            </span>
          </template>

          <template #total_ako-data="{ row }">
            <span class="text-xs font-semibold text-emerald-600">
              Rp {{ (row.details?.reduce((acc: number, d: any) => acc + (d.ako || 0), 0) || 0).toLocaleString("id-ID") }}
            </span>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton type="edit" @click="handleEdit(row)" />
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
      title="Detail Pagu Bidang"
      subtitle="Rincian alokasi anggaran per bidang operasional"
      :data-items="detailItems"
      @close="isDetailModalOpen = false"
    />

    <!-- Delete Confirmation Modal -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Alokasi Pagu Bidang"
      :message="`Apakah Anda yakin ingin menghapus alokasi pagu bidang periode ${deleteTarget?.periode || ''}?`"
      :loading="isDeleting"
      @confirm="handleConfirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
