<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, FormSectionConfig, NKODTO } from "~/types";
import type { DetailDataItem } from '~/types/master.types';
import { getNKOFormSections } from "~/schemas/transaksi/nko.schema";

const { list, loading, fetchList, createBatch, updateItem, deleteItem, exportExcel } = useNKO();

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
const deleteTarget = ref<NKODTO | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<NKODTO | null>(null);

const columns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "bulan_tahun", label: "Bulan & Tahun" },
  { key: "indikator_nama", label: "Indikator KPI" },
  { key: "polaritas", label: "Polaritas" },
  { key: "bobot", label: "Bobot (%)" },
  { key: "target_bulanan", label: "Target" },
  { key: "realisasi", label: "Realisasi" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Aksi" }
];

const formSections = computed<FormSectionConfig[]>(() => getNKOFormSections());

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
    (item: NKODTO) =>
      item.indikator_nama?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q) ||
      item.bulan_tahun?.toLowerCase().includes(q)
  );
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Indikator KPI NKO" : "Input Realisasi KPI NKO"
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Evaluasi Realisasi KPI Organisasi"
    : "Form Pencatatan Indikator Nilai Kinerja Organisasi (NKO)"
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    bulan_tahun: new Date().toISOString().split("T")[0],
    indikator_nama: "Emergency Response Time (ERT)",
    polaritas: "Negatif",
    satuan: "Jam",
    bobot: 8,
    target_bulanan: 3,
    realisasi: 3,
    status: "Baik",
    keterangan: "Pencapaian target indikator operasional"
  };
  modalOpen.value = true;
};

const handleEdit = (row: NKODTO) => {
  modalMode.value = "edit";
  formData.value = { ...row, bulan_tahun: row.bulan_tahun?.split("T")[0] };
  modalOpen.value = true;
};

const handleView = (row: NKODTO) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const handleDelete = (row: NKODTO) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const formattedBulan = data.bulan_tahun ? `${data.bulan_tahun}T00:00:00Z` : new Date().toISOString();

    if (modalMode.value === "create") {
      await createBatch({
        bulan_tahun: formattedBulan,
        items: [
          {
            indikator_nama: data.indikator_nama || "Indikator KPI",
            polaritas: data.polaritas || "Positif",
            satuan: data.satuan || "%",
            bobot: Number(data.bobot) || 5,
            target_bulanan: Number(data.target_bulanan) || 0,
            realisasi: Number(data.realisasi) || 0,
            status: data.status || "Baik",
            keterangan: data.keterangan || ""
          }
        ]
      });
    } else if (formData.value.id) {
      await updateItem(formData.value.id, {
        bulan_tahun: formattedBulan,
        indikator_nama: data.indikator_nama,
        polaritas: data.polaritas,
        satuan: data.satuan,
        bobot: Number(data.bobot),
        target_bulanan: Number(data.target_bulanan),
        realisasi: Number(data.realisasi),
        status: data.status,
        keterangan: data.keterangan
      });
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
    { label: "ID Data NKO", value: r.id },
    { label: "Bulan & Tahun", value: r.bulan_tahun?.split("T")[0] || "-" },
    { label: "Indikator KPI", value: r.indikator_nama },
    { label: "Polaritas", value: r.polaritas },
    { label: "Bobot KPI", value: `${r.bobot} %` },
    { label: "Target Bulanan", value: `${r.target_bulanan} ${r.satuan}` },
    { label: "Realisasi Aktual", value: `${r.realisasi} ${r.satuan}` },
    { label: "Status Pencapaian", value: r.status },
    { label: "Keterangan Evaluasi", value: r.keterangan || "-" }
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
            <BaseSearchInput v-model="searchQuery" placeholder="Cari indikator KPI atau status..." />
            <BaseExportButton @click="exportExcel" />
          </div>

          <BaseCreateButton label="INPUT REALISASI KPI" @click="openCreateModal" />
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

          <template #bulan_tahun-data="{ row }">
            <span class="text-xs font-medium text-gray-900">{{ row.bulan_tahun ? row.bulan_tahun.split("T")[0] : "-" }}</span>
          </template>

          <template #indikator_nama-data="{ row }">
            <span class="text-xs font-semibold text-gray-900">{{ row.indikator_nama }}</span>
          </template>

          <template #polaritas-data="{ row }">
            <BaseBadge :variant="row.polaritas === 'Positif' ? 'success' : 'warning'">
              {{ row.polaritas }}
            </BaseBadge>
          </template>

          <template #bobot-data="{ row }">
            <span class="text-xs font-bold text-gray-700">{{ row.bobot }} %</span>
          </template>

          <template #target_bulanan-data="{ row }">
            <span class="text-xs text-gray-800">{{ row.target_bulanan }} {{ row.satuan }}</span>
          </template>

          <template #realisasi-data="{ row }">
            <span class="text-xs font-bold text-blue-600">{{ row.realisasi }} {{ row.satuan }}</span>
          </template>

          <template #status-data="{ row }">
            <BaseBadge :variant="row.status === 'Baik' ? 'success' : row.status === 'Cukup' ? 'warning' : 'danger'">
              {{ row.status }}
            </BaseBadge>
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
      draft-key="transaksi-nko"
      @submit="handleSubmit"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Indikator NKO"
      subtitle="Evaluasi pencapaian target dan realisasi KPI"
      :data-items="detailItems"
      @close="isDetailModalOpen = false"
    />

    <!-- Delete Confirmation Modal -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data NKO"
      :message="`Apakah Anda yakin ingin menghapus indikator KPI ${deleteTarget?.indikator_nama || ''}?`"
      :loading="isDeleting"
      @confirm="handleConfirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
