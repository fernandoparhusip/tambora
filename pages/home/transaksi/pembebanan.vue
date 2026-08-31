<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, FormSectionConfig, PembebananDTO } from "~/types";
import type { DetailDataItem } from '~/types/master.types';
import { getPembebananFormSections } from "~/schemas/transaksi/pembebanan.schema";
import { exportToExcel } from "~/utils/exportExcel";

const { list, loading, fetchList, createItem, updateItem, deleteItem } = usePembebanan();
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
const deleteTarget = ref<PembebananDTO | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<PembebananDTO | null>(null);

const columns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "tanggal", label: "Waktu Pencatatan" },
  { key: "sentral_id", label: "Sentral Pembangkit" },
  { key: "mesin_id", label: "Unit Generator" },
  { key: "beban_mw", label: "Beban (MW)" },
  { key: "tegangan_kv", label: "Tegangan (kV)" },
  { key: "frekuensi_hz", label: "Frekuensi (Hz)" },
  { key: "faktor_daya", label: "Cos φ (PF)" },
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
  getPembebananFormSections({
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
    (item: PembebananDTO) =>
      item.tanggal?.toLowerCase().includes(q) ||
      item.sentral_id?.toLowerCase().includes(q) ||
      item.mesin_id?.toLowerCase().includes(q)
  );
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Data Pembebanan Generator" : "Tambah Data Pembebanan"
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Parameter Elektrikal Generator"
    : "Form Pencatatan Beban, Tegangan & Frekuensi"
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    tanggal: new Date().toISOString().split("T")[0],
    jam: "10:00",
    sentral_id: "",
    mesin_id: "",
    beban_mw: 0,
    tegangan_kv: 20,
    frekuensi_hz: 50.0,
    faktor_daya: 0.85
  };
  modalOpen.value = true;
};

const handleEdit = (row: PembebananDTO) => {
  modalMode.value = "edit";
  formData.value = {
    ...row,
    tanggal: row.tanggal ? row.tanggal.split("T")[0] : "",
    jam: row.jam && row.jam.includes("T") ? row.jam.split("T")[1]?.substring(0, 5) : row.jam || "10:00"
  };
  modalOpen.value = true;
};

const handleView = (row: PembebananDTO) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const handleDelete = (row: PembebananDTO) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const payload = {
      tanggal: data.tanggal ? `${data.tanggal}T00:00:00Z` : new Date().toISOString(),
      jam: data.jam ? `2026-01-01T${data.jam}:00Z` : new Date().toISOString(),
      sentral_id: data.sentral_id,
      mesin_id: data.mesin_id,
      beban_mw: Number(data.beban_mw) || 0,
      tegangan_kv: Number(data.tegangan_kv) || 0,
      frekuensi_hz: Number(data.frekuensi_hz) || 0,
      faktor_daya: Number(data.faktor_daya) || 0.85
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
    fileName: "Data_Pembebanan_Generator_Tambora"
  });
};

const detailItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const r = detailRecord.value;
  return [
    { label: "ID Pencatatan", value: r.id },
    { label: "Tanggal & Jam", value: `${r.tanggal?.split("T")[0] || "-"} ${r.jam && r.jam.includes("T") ? r.jam.split("T")[1]?.substring(0, 5) : r.jam || ""}` },
    { label: "Sentral ID", value: r.sentral_id },
    { label: "Mesin ID", value: r.mesin_id },
    { label: "Beban Aktif", value: `${r.beban_mw} MW` },
    { label: "Tegangan", value: `${r.tegangan_kv} kV` },
    { label: "Frekuensi", value: `${r.frekuensi_hz} Hz` },
    { label: "Faktor Daya (Cos φ)", value: `${r.faktor_daya}` }
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
            <BaseSearchInput v-model="searchQuery" placeholder="Cari ID sentral atau tanggal..." />
            <BaseExportButton @click="handleExport" />
          </div>

          <BaseCreateButton label="TAMBAH BEBAN" @click="openCreateModal" />
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

          <template #tanggal-data="{ row }">
            <div>
              <span class="font-medium text-gray-900 text-xs block">
                {{ row.tanggal ? row.tanggal.split("T")[0] : "-" }}
              </span>
              <span class="text-[11px] text-gray-400">
                {{ row.jam && row.jam.includes("T") ? row.jam.split("T")[1]?.substring(0, 5) : row.jam || "10:00" }} WITA
              </span>
            </div>
          </template>

          <template #sentral_id-data="{ row }">
            <span class="text-xs text-gray-800 font-medium">{{ organizations.find((o: any) => o.id === row.sentral_id)?.nama || row.sentral_id }}</span>
          </template>

          <template #mesin_id-data="{ row }">
            <span class="text-xs text-gray-600">{{ assets.find((a: any) => a.id === row.mesin_id)?.nama_mesin || row.mesin_id }}</span>
          </template>

          <template #beban_mw-data="{ row }">
            <span class="text-xs font-bold text-blue-600">{{ row.beban_mw }} MW</span>
          </template>

          <template #tegangan_kv-data="{ row }">
            <span class="text-xs text-gray-800 font-medium">{{ row.tegangan_kv }} kV</span>
          </template>

          <template #frekuensi_hz-data="{ row }">
            <BaseBadge :variant="row.frekuensi_hz >= 49.5 && row.frekuensi_hz <= 50.5 ? 'success' : 'danger'">
              {{ row.frekuensi_hz }} Hz
            </BaseBadge>
          </template>

          <template #faktor_daya-data="{ row }">
            <span class="text-xs text-gray-700 font-medium">{{ row.faktor_daya }}</span>
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
      draft-key="transaksi-pembebanan"
      @submit="handleSubmit"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Pembebanan Generator"
      subtitle="Parameter operasional beban dan kestabilan frekuensi"
      :data-items="detailItems"
      @close="isDetailModalOpen = false"
    />

    <!-- Delete Confirmation Modal -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Pembebanan"
      :message="`Apakah Anda yakin ingin menghapus data pembebanan tanggal ${deleteTarget?.tanggal?.split('T')[0] || ''}?`"
      :loading="isDeleting"
      @confirm="handleConfirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
