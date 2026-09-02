<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, FormSectionConfig, OperasiHarianDTO } from "~/types";
import type { DetailDataItem } from '~/types/master.types';
import { getOperasiHarianFormSections } from "~/schemas/transaksi/operasi-harian.schema";

const { list, loading, fetchList, createItem, updateItem, deleteItem } = useOperasiHarian();
const { organizations, fetchOrganizations } = useOrganization();
const { assets, fetchAssets } = useAsset();

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
const deleteTarget = ref<OperasiHarianDTO | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<OperasiHarianDTO | null>(null);

const columns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "tanggal", label: "Tanggal & Jam" },
  { key: "nama_sentral", label: "Sentral Pembangkit" },
  { key: "daya_terpasang", label: "Daya Terpasang" },
  { key: "daya_mampu_netto", label: "DMN (MW)" },
  { key: "daya_mampu_pasok", label: "DMP (MW)" },
  { key: "produksi", label: "Produksi (MWh)" },
  { key: "jenis_bahan_bakar", label: "Bahan Bakar" },
  { key: "actions", label: "Aksi" }
];

const sentralOptions = computed(() =>
  organizations.value.map((org: any) => ({
    label: `${org.nama} (${org.kode})`,
    value: org.id
  }))
);

const mesinOptions = computed(() =>
  assets.value.map((a: any) => ({
    label: `${a.nama_mesin} - ${a.tipe_mesin || "Unit"}`,
    value: a.id
  }))
);

const formSections = computed<FormSectionConfig[]>(() =>
  getOperasiHarianFormSections({
    sentralOptions: sentralOptions.value,
    mesinOptions: mesinOptions.value
  })
);

onMounted(async () => {
  await Promise.all([fetchList(), fetchOrganizations(), fetchAssets()]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return list.value;
  const q = searchQuery.value.toLowerCase().trim();
  return list.value.filter(
    (item: OperasiHarianDTO) =>
      item.nama_sentral?.toLowerCase().includes(q) ||
      item.jenis_bahan_bakar?.toLowerCase().includes(q) ||
      item.tanggal?.toLowerCase().includes(q)
  );
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Data Operasi Harian" : "Tambah Data Operasi Harian"
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Ubah Parameter Operasi Pembangkit"
    : "Form Pencatatan Operasi Harian Pembangkit"
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    tanggal: new Date().toISOString().split("T")[0],
    jam: "08:00",
    sentral_id: "",
    mesin_id: "",
    daya_terpasang: 0,
    daya_mampu_netto: 0,
    daya_mampu_pasok: 0,
    daya_mampu_aktual: 0,
    produksi: 0,
    bahan_bakar: 0,
    jenis_bahan_bakar: "BATUBARA"
  };
  modalOpen.value = true;
};

const handleEdit = (row: OperasiHarianDTO) => {
  modalMode.value = "edit";
  formData.value = {
    ...row,
    tanggal: row.tanggal ? row.tanggal.split("T")[0] : "",
    jam: row.jam && row.jam.includes("T") ? row.jam.split("T")[1]?.substring(0, 5) : row.jam || "08:00"
  };
  modalOpen.value = true;
};

const handleView = (row: OperasiHarianDTO) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const handleDelete = (row: OperasiHarianDTO) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const selectedSentral = organizations.value.find((o: any) => o.id === data.sentral_id);
    const payload = {
      tanggal: data.tanggal ? `${data.tanggal}T00:00:00Z` : new Date().toISOString(),
      jam: data.jam ? `2026-01-01T${data.jam}:00Z` : new Date().toISOString(),
      sentral_id: data.sentral_id,
      nama_sentral: selectedSentral?.nama || data.nama_sentral || "Sentral Tambora",
      mesin_id: data.mesin_id,
      daya_terpasang: Number(data.daya_terpasang) || 0,
      daya_mampu_netto: Number(data.daya_mampu_netto) || 0,
      daya_mampu_pasok: Number(data.daya_mampu_pasok) || 0,
      daya_mampu_aktual: Number(data.daya_mampu_aktual) || 0,
      produksi: Number(data.produksi) || 0,
      bahan_bakar: Number(data.bahan_bakar) || 0,
      jenis_bahan_bakar: data.jenis_bahan_bakar || "BATUBARA"
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
    { label: "ID Operasi", value: r.id },
    { label: "Tanggal & Jam", value: `${r.tanggal?.split("T")[0] || "-"} ${r.jam && r.jam.includes("T") ? r.jam.split("T")[1]?.substring(0, 5) : r.jam || ""}` },
    { label: "Nama Sentral", value: r.nama_sentral || "-" },
    { label: "Daya Terpasang", value: `${r.daya_terpasang} MW` },
    { label: "Daya Mampu Netto (DMN)", value: `${r.daya_mampu_netto} MW` },
    { label: "Daya Mampu Pasok (DMP)", value: `${r.daya_mampu_pasok} MW` },
    { label: "Daya Mampu Pasok (DMP)", value: `${r.daya_mampu_pasok} MW` },
    { label: "Daya Mampu Aktual", value: `${r.daya_mampu_aktual} MW` },
    { label: "Produksi Energi", value: `${r.produksi} MWh` },
    { label: "Jenis Bahan Bakar", value: r.jenis_bahan_bakar },
    { label: "Konsumsi Bahan Bakar", value: `${r.bahan_bakar}` }
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

          <BaseCreateButton resource="OPERASI_HARIAN" @click="openCreateModal" />
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
            <div>
              <span class="font-medium text-gray-900 text-xs block">
                {{ row.tanggal ? row.tanggal.split("T")[0] : "-" }}
              </span>
              <span class="text-[11px] text-gray-400">
                {{ row.jam && row.jam.includes("T") ? row.jam.split("T")[1]?.substring(0, 5) : row.jam || "08:00" }} WITA
              </span>
            </div>
          </template>

          <template #nama_sentral-data="{ row }">
            <span class="text-xs font-semibold text-gray-900">{{ row.nama_sentral || "-" }}</span>
          </template>

          <template #daya_terpasang-data="{ row }">
            <span class="text-xs text-gray-700">{{ row.daya_terpasang }} MW</span>
          </template>

          <template #daya_mampu_netto-data="{ row }">
            <span class="text-xs text-blue-600 font-medium">{{ row.daya_mampu_netto }} MW</span>
          </template>

          <template #daya_mampu_pasok-data="{ row }">
            <span class="text-xs text-emerald-600 font-medium">{{ row.daya_mampu_pasok }} MW</span>
          </template>

          <template #produksi-data="{ row }">
            <span class="text-xs font-bold text-gray-800">{{ row.produksi }} MWh</span>
          </template>

          <template #jenis_bahan_bakar-data="{ row }">
            <BaseBadge :variant="row.jenis_bahan_bakar === 'BATUBARA' ? 'mono' : 'info'">
              {{ row.jenis_bahan_bakar }}
            </BaseBadge>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton type="edit" resource="OPERASI_HARIAN" @click="handleEdit(row)" />
              <BaseActionButton type="delete" resource="OPERASI_HARIAN" @click="handleDelete(row)" />
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
      :data-items="detailItems"
      @close="isDetailModalOpen = false"
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
