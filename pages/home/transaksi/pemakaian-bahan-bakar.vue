<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, FormSectionConfig, PemakaianBahanBakarDTO } from "~/types";
import type { DetailDataItem } from '~/types/master.types';
import { getPemakaianBahanBakarFormSections } from "~/schemas/transaksi/pemakaian-bahan-bakar.schema";

const { list, loading, fetchList, createItem, updateItem, deleteItem } = usePemakaianBahanBakar();
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
const deleteTarget = ref<PemakaianBahanBakarDTO | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<PemakaianBahanBakarDTO | null>(null);

const columns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "tanggal", label: "Tanggal" },
  { key: "nama_sentral", label: "Sentral Pembangkit" },
  { key: "nama_mesin", label: "Unit Mesin" },
  { key: "jenis_bahan_bakar", label: "Jenis BBM" },
  { key: "pemakaian", label: "Jumlah Pemakaian" },
  { key: "satuan", label: "Satuan" },
  { key: "sisa_stok", label: "Sisa Stok" },
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
  getPemakaianBahanBakarFormSections({
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
    (item: PemakaianBahanBakarDTO) =>
      item.jenis_bahan_bakar?.toLowerCase().includes(q) ||
      item.nama_sentral?.toLowerCase().includes(q) ||
      item.tanggal?.toLowerCase().includes(q)
  );
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Data Pemakaian BBM" : "Tambah Catatan Pemakaian BBM"
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Perubahan Catatan Konsumsi BBM"
    : "Form Pencatatan Konsumsi dan Stok Bahan Bakar"
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    tanggal: new Date().toISOString().split("T")[0],
    sentral_id: "",
    mesin_id: "",
    jenis_bahan_bakar: "BATUBARA",
    pemakaian: 0,
    satuan: "Ton",
    sisa_stok: 0
  };
  modalOpen.value = true;
};

const handleEdit = (row: PemakaianBahanBakarDTO) => {
  modalMode.value = "edit";
  formData.value = {
    ...row,
    tanggal: row.tanggal ? row.tanggal.split("T")[0] : ""
  };
  modalOpen.value = true;
};

const handleView = (row: PemakaianBahanBakarDTO) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const closeDetailModal = () => {
  isDetailModalOpen.value = false;
  detailRecord.value = null;
};

const openEditFromDetail = () => {
  if (detailRecord.value) {
    const rec = detailRecord.value;
    closeDetailModal();
    handleEdit(rec);
  }
};

const handleDelete = (row: PemakaianBahanBakarDTO) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const payload = {
      tanggal: data.tanggal ? `${data.tanggal}T00:00:00Z` : new Date().toISOString(),
      sentral_id: data.sentral_id,
      mesin_id: data.mesin_id,
      jenis_bahan_bakar: data.jenis_bahan_bakar || "BATUBARA",
      pemakaian: Number(data.pemakaian) || 0,
      satuan: data.satuan || "Ton",
      sisa_stok: Number(data.sisa_stok) || 0
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
    { label: "ID Data", value: r.id },
    { label: "Tanggal Pemakaian", value: r.tanggal?.split("T")[0] || "-" },
    { label: "Sentral ID", value: r.sentral_id },
    { label: "Mesin ID", value: r.mesin_id },
    { label: "Jenis Bahan Bakar", value: r.jenis_bahan_bakar },
    { label: "Jumlah Pemakaian", value: `${r.pemakaian.toLocaleString("id-ID")} ${r.satuan}` },
    { label: "Sisa Stok", value: `${r.sisa_stok.toLocaleString("id-ID")} ${r.satuan}` }
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

          <BaseCreateButton resource="BAHAN_BAKAR" @click="openCreateModal" />
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
            <span class="font-medium text-gray-900 text-xs">{{ row.tanggal ? row.tanggal.split("T")[0] : "-" }}</span>
          </template>

          <template #nama_sentral-data="{ row }">
            <span class="text-xs text-gray-800 font-medium">{{ organizations.find((o: any) => o.id === row.sentral_id)?.nama || row.sentral_id }}</span>
          </template>

          <template #nama_mesin-data="{ row }">
            <span class="text-xs text-gray-600">{{ assets.find((a: any) => a.id === row.mesin_id)?.nama_mesin || row.mesin_id }}</span>
          </template>

          <template #jenis_bahan_bakar-data="{ row }">
            <BaseBadge :variant="row.jenis_bahan_bakar === 'BATUBARA' ? 'mono' : 'warning'">
              {{ row.jenis_bahan_bakar }}
            </BaseBadge>
          </template>

          <template #pemakaian-data="{ row }">
            <span class="text-xs font-bold text-rose-600">{{ row.pemakaian.toLocaleString("id-ID") }}</span>
          </template>

          <template #satuan-data="{ row }">
            <span class="text-xs text-gray-500 font-medium">{{ row.satuan }}</span>
          </template>

          <template #sisa_stok-data="{ row }">
            <span class="text-xs font-bold text-emerald-600">{{ row.sisa_stok.toLocaleString("id-ID") }}</span>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton type="edit" resource="BAHAN_BAKAR" @click="handleEdit(row)" />
              <BaseActionButton type="delete" resource="BAHAN_BAKAR" @click="handleDelete(row)" />
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
      draft-key="transaksi-bbm"
      @submit="handleSubmit"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Pemakaian Bahan Bakar"
      subtitle="Rincian kuantitas konsumsi dan sisa stok BBM"
      :data-items="detailItems"
      @edit="openEditFromDetail"
      @close="closeDetailModal"
    />

    <!-- Delete Confirmation Modal -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Pemakaian BBM"
      :message="`Apakah Anda yakin ingin menghapus catatan pemakaian ${deleteTarget?.jenis_bahan_bakar || ''} tanggal ${deleteTarget?.tanggal?.split('T')[0] || ''}?`"
      :loading="isDeleting"
      @confirm="handleConfirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
