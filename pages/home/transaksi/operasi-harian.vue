<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, FormSectionConfig, OperasiHarianDTO } from "~/types";
import type { DetailDataItem } from "~/types/master.types";
import { getOperasiHarianFormSections } from "~/schemas/transaksi/operasi-harian.schema";
import { useAsyncDetail } from "~/composables/useAsyncDetail";

const {
  list,
  loading,
  fetchList,
  getById,
  createItem,
  updateItem,
  deleteItem,
} = useOperasiHarian();
const { assets, fetchAssets } = useAsset();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<OperasiHarianDTO | null>(null);
const isDeleting = ref(false);

const {
  isDetailModalOpen,
  detailRecord,
  detailLoading,
  handleView,
  closeDetailModal,
  openEditFromDetail,
} = useAsyncDetail<OperasiHarianDTO>({
  fetchDetail: (id) => getById(id),
  onEdit: (record) => handleEdit(record),
});

const columns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "tanggal", label: "Tanggal Transaksi" },
  { key: "nama_mesin", label: "Nama Mesin" },
  { key: "jenis_bahan_bakar", label: "Jenis Bahan Bakar" },
  { key: "produksi", label: "Produksi (kWh)" },
  { key: "daya_mampu_pasok", label: "DMP (kW)" },
  { key: "daya_mampu_netto", label: "DMN (kW)" },
  { key: "actions", label: "Aksi" },
];

const mesinOptions = computed(() =>
  assets.value.map((a: any) => ({
    label: `${a.kode_mesin || a.id} - ${a.nama_mesin}`,
    value: a.id,
  })),
);

const formSections = computed<FormSectionConfig[]>(() =>
  getOperasiHarianFormSections({
    mesinOptions: mesinOptions.value,
  }),
);

onMounted(async () => {
  await Promise.all([fetchList(), fetchAssets()]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

// Auto-fill defaults when mesin_id changes
watch(
  () => formData.value.mesin_id,
  (newMesinId) => {
    if (!newMesinId) return;
    const asset = assets.value.find((a: any) => a.id === newMesinId);
    if (asset) {
      if (asset.daya_terpasang && !formData.value.daya_terpasang) {
        formData.value.daya_terpasang = asset.daya_terpasang;
      }
      if (asset.daya_mampu_netto && !formData.value.daya_mampu_netto) {
        formData.value.daya_mampu_netto = asset.daya_mampu_netto;
      }
      if (asset.daya_mampu_pasok && !formData.value.daya_mampu_pasok) {
        formData.value.daya_mampu_pasok = asset.daya_mampu_pasok;
      }
      if (asset.kode_bahan_bakar && !formData.value.jenis_bahan_bakar) {
        formData.value.jenis_bahan_bakar = asset.kode_bahan_bakar;
      }
    }
  },
);

const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return list.value;
  const q = searchQuery.value.toLowerCase().trim();
  return list.value.filter(
    (item: OperasiHarianDTO) =>
      item.nama_sentral?.toLowerCase().includes(q) ||
      item.nama_mesin?.toLowerCase().includes(q) ||
      item.jenis_bahan_bakar?.toLowerCase().includes(q) ||
      item.tanggal?.toLowerCase().includes(q),
  );
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit"
    ? "Edit Data Operasi Harian"
    : "Tambah Data Operasi Harian",
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Ubah Operasi Harian"
    : "Form Pencatatan Operasi Harian",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    tanggal: new Date().toISOString().split("T")[0],
    jam: "",
    mesin_id: "",
    nama_sentral: "",
    daya_terpasang: null,
    daya_mampu_netto: null,
    daya_mampu_pasok: null,
    daya_mampu_aktual: null,
    produksi: null,
    bahan_bakar: null,
    jenis_bahan_bakar: "",
  };
  modalOpen.value = true;
};

const handleEdit = (row: OperasiHarianDTO) => {
  modalMode.value = "edit";
  formData.value = {
    ...row,
    tanggal: row.tanggal ? row.tanggal.split("T")[0] : "",
    jam:
      row.jam && row.jam.includes("T")
        ? row.jam.split("T")[1]?.substring(0, 5)
        : row.jam || "10:00",
  };
  modalOpen.value = true;
};

const handleDelete = (row: OperasiHarianDTO) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const formatTanggalTransaksi = (val: string | null | undefined): string => {
  if (!val) return "-";
  try {
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return String(val);
    const days = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    const dayName = days[d.getDay()];
    const day = String(d.getDate()).padStart(2, "0");
    const monthName = months[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}, ${day}-${monthName}-${year}`;
  } catch {
    return String(val);
  }
};

const getNamaMesin = (row: OperasiHarianDTO): string => {
  if (row.nama_mesin) return row.nama_mesin;
  const found = assets.value.find((a: any) => a.id === row.mesin_id);
  if (found) {
    return `${found.kode_mesin || found.id} - ${found.nama_mesin}`;
  }
  return row.mesin_id || "-";
};

const formatBahanBakar = (val: string | undefined): string => {
  if (!val) return "-";
  const map: Record<string, string> = {
    BATUBARA: "BBR - Batubara",
    HSD: "HSD - Solar",
    B30: "B30 - Biosolar",
    MFO: "MFO - Minyak Bakar",
    BIOMASSA: "BMS - Biomassa",
    GAS: "GAS - Gas Alam",
  };
  return map[val.toUpperCase()] || val;
};

const formatNumber = (val: number | string | undefined | null): string => {
  if (val === undefined || val === null || val === "") return "-";
  const num = Number(val);
  if (Number.isNaN(num)) return String(val);
  return num.toLocaleString("id-ID");
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const payload = {
      tanggal: data.tanggal
        ? `${data.tanggal}T00:00:00Z`
        : new Date().toISOString(),
      jam: data.jam
        ? data.jam.includes("T")
          ? data.jam
          : `2026-08-26T${data.jam}:00Z`
        : new Date().toISOString(),
      mesin_id: data.mesin_id,
      nama_sentral: data.nama_sentral || "PLTU Tambora 1",
      daya_terpasang: Number(data.daya_terpasang) || 0,
      daya_mampu_netto: Number(data.daya_mampu_netto) || 0,
      daya_mampu_pasok: Number(data.daya_mampu_pasok) || 0,
      daya_mampu_aktual: Number(data.daya_mampu_aktual) || 0,
      produksi: Number(data.produksi) || 0,
      bahan_bakar: Number(data.bahan_bakar) || 0,
      jenis_bahan_bakar: data.jenis_bahan_bakar || "BATUBARA",
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

const detailItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const r = detailRecord.value;
  return [
    { label: "Tanggal Transaksi", value: formatTanggalTransaksi(r.tanggal) },
    {
      label: "Jam",
      value:
        r.jam && r.jam.includes("T")
          ? r.jam.split("T")[1]?.substring(0, 5)
          : r.jam || "-",
    },
    { label: "Nama Mesin", value: getNamaMesin(r) },
    { label: "Nama Sentral", value: r.nama_sentral || "-" },
    { label: "Daya Terpasang", value: `${formatNumber(r.daya_terpasang)} kW` },
    {
      label: "Daya Mampu Netto (DMN)",
      value: `${formatNumber(r.daya_mampu_netto)} kW`,
    },
    {
      label: "Daya Mampu Pasok (DMP)",
      value: `${formatNumber(r.daya_mampu_pasok)} kW`,
    },
    {
      label: "Daya Mampu Aktual",
      value: `${formatNumber(r.daya_mampu_aktual)} kW`,
    },
    { label: "Produksi Energi", value: `${formatNumber(r.produksi)} kWh` },
    {
      label: "Jenis Bahan Bakar",
      value: formatBahanBakar(r.jenis_bahan_bakar),
    },
    { label: "Konsumsi Bahan Bakar", value: `${formatNumber(r.bahan_bakar)}` },
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
            <BaseSearchInput v-model="searchQuery" />
          </div>

          <BaseCreateButton
            resource="OPERASI_HARIAN"
            @click="openCreateModal"
          />
        </div>

        <!-- Table Container -->
        <BaseTable
          :columns="columns"
          :rows="paginatedList"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchList"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #tanggal-data="{ row }">
            <span class="text-xs text-gray-600">
              {{ formatTanggalTransaksi(row.tanggal) }}
            </span>
          </template>

          <template #nama_mesin-data="{ row }">
            <span class="text-xs text-gray-600">{{ getNamaMesin(row) }}</span>
          </template>

          <template #jenis_bahan_bakar-data="{ row }">
            <span class="text-xs text-gray-600">{{
              formatBahanBakar(row.jenis_bahan_bakar)
            }}</span>
          </template>

          <template #produksi-data="{ row }">
            <span class="text-xs text-gray-600">{{
              formatNumber(row.produksi)
            }}</span>
          </template>

          <template #daya_mampu_pasok-data="{ row }">
            <span class="text-xs text-gray-600">{{
              formatNumber(row.daya_mampu_pasok)
            }}</span>
          </template>

          <template #daya_mampu_netto-data="{ row }">
            <span class="text-xs text-gray-600">{{
              formatNumber(row.daya_mampu_netto)
            }}</span>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton
                type="edit"
                resource="OPERASI_HARIAN"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                type="delete"
                resource="OPERASI_HARIAN"
                @click="handleDelete(row)"
              />
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
      draft-key="transaksi-operasi-harian"
      @submit="handleSubmit"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Operasi Harian"
      subtitle="Rincian parameter daya & konsumsi bahan bakar"
      :record="detailRecord"
      :data-items="detailItems"
      :loading="detailLoading"
      @edit="openEditFromDetail"
      @close="closeDetailModal"
    />

    <!-- Delete Confirmation Modal -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Operasi Harian"
      :message="`Apakah Anda yakin ingin menghapus data operasi harian tanggal ${deleteTarget?.tanggal?.split('T')[0] || ''} di ${deleteTarget?.nama_sentral || ''}?`"
      :loading="isDeleting"
      @confirm="handleConfirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
