<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem } from '~/types/master.types';
import type { TableColumn, FormSectionConfig, AssetItem } from "~/types";
import { getAssetFormSections } from "~/schemas/master/asset.schema";
import { formatNumber } from "~/utils/formatNumber";

const { assets, loading, fetchAssets, createAsset, updateAsset, deleteAsset } = useAsset();
const { systems, fetchSystems } = useSystem();
const { machineConditions, fetchMachineConditions } = useMachineCondition();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const toast = useAppToast();
const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isDetailModalOpen = ref(false);
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<AssetItem | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<AssetItem | null>(null);

const assetColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode_mesin", label: "Kode Mesin" },
  { key: "nama_mesin", label: "Nama Mesin Pembangkit" },
  { key: "kondisi_mesin", label: "Kondisi" },
  { key: "daya_terpasang", label: "Daya Terpasang (kW)" },
  { key: "daya_mampu_netto", label: "DMN (kW)" },
  { key: "daya_mampu_pasok", label: "DMP (kW)" },
  { key: "merk_mesin", label: "Merk / Tipe" },
  { key: "actions", label: "Aksi" }
];

const systemOptions = computed(() =>
  systems.value.map((s: any) => ({ label: `${s.name} (${s.code})`, value: s.id }))
);

const conditionOptions = computed(() => {
  if (machineConditions.value.length > 0) {
    return machineConditions.value.map((c: any) => ({ label: c.name, value: c.name }));
  }
  return [
    { label: "Beroperasi", value: "Beroperasi" },
    { label: "Standby", value: "Standby" },
    { label: "Derating", value: "Derating" },
    { label: "Gangguan", value: "Gangguan" },
    { label: "Pemeliharaan", value: "Pemeliharaan" }
  ];
});

const formSections = computed<FormSectionConfig[]>(() =>
  getAssetFormSections({
    systemOptions: systemOptions.value,
    conditionOptions: conditionOptions.value,
  })
);

onMounted(async () => {
  await Promise.allSettled([fetchAssets(), fetchSystems(), fetchMachineConditions()]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!searchQuery.value) return assets.value;
  const q = searchQuery.value.toLowerCase();
  return assets.value.filter(
    (a: AssetItem) =>
      (a.kode_mesin && a.kode_mesin.toLowerCase().includes(q)) ||
      (a.nama_mesin && a.nama_mesin.toLowerCase().includes(q)) ||
      (a.merk_mesin && a.merk_mesin.toLowerCase().includes(q)) ||
      (a.kondisi_mesin && a.kondisi_mesin.toLowerCase().includes(q))
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Aset Mesin Pembangkit" : "Tambah Aset Mesin Pembangkit"
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Ubah Aset"
    : "Form Tambah Aset"
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    kode_mesin: "",
    nama_mesin: "",
    serial_number: "",
    kondisi_mesin: "Beroperasi",
    daya_terpasang: 0,
    daya_mampu_netto: 0,
    daya_mampu_pasok: 0,
    merk_mesin: "",
    tipe_mesin: "",
    merk_generator: "",
    nama_trafo: "",
    jenis_tegangan: "Tegangan Menengah",
    tegangan_hv: 20,
    tegangan_lv: 0.4,
    kode_bahan_bakar: "101 - HSD",
    status_kepemilikan_mesin: "PLN Holding",
    status_kepemilikan_kwh: "Produksi Sendiri",
    tahun_operasi: new Date().getFullYear()
  };
  modalOpen.value = true;
};

const handleView = (row: AssetItem) => {
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

const handleEdit = (row: AssetItem) => {
  modalMode.value = "edit";
  formData.value = { ...row };
  modalOpen.value = true;
};

const handleDelete = (row: AssetItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteAsset(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (err: any) {
    // Handled by useApi
  } finally {
    isDeleting.value = false;
  }
};

const handleSave = async () => {
  if (!formData.value.kode_mesin || !formData.value.nama_mesin) {
    toast.error("Kode Mesin dan Nama Mesin wajib diisi.");
    return;
  }

  submitting.value = true;
  try {
    if (modalMode.value === "create") {
      await createAsset({
        kode_mesin: formData.value.kode_mesin.trim(),
        nama_mesin: formData.value.nama_mesin.trim(),
        serial_number: formData.value.serial_number?.trim() || "",
        merk_mesin: formData.value.merk_mesin?.trim() || "",
        tipe_mesin: formData.value.tipe_mesin?.trim() || "",
        daya_terpasang: Number(formData.value.daya_terpasang) || 0,
        daya_mampu_netto: Number(formData.value.daya_mampu_netto) || 0,
        daya_mampu_pasok: Number(formData.value.daya_mampu_pasok) || 0,
        kapasitas: Number(formData.value.daya_terpasang) || 0,
        jenis_tegangan: formData.value.jenis_tegangan || "Tegangan Menengah",
        tegangan_hv: Number(formData.value.tegangan_hv) || 20,
        tegangan_lv: Number(formData.value.tegangan_lv) || 0.4,
        merk_generator: formData.value.merk_generator || "",
        nama_trafo: formData.value.nama_trafo || "",
        kode_bahan_bakar: formData.value.kode_bahan_bakar || "101 - HSD",
        kondisi_mesin: formData.value.kondisi_mesin || "Beroperasi",
        status_kepemilikan_mesin: formData.value.status_kepemilikan_mesin || "PLN Holding",
        status_kepemilikan_kwh: formData.value.status_kepemilikan_kwh || "Produksi Sendiri",
        tahun_operasi: Number(formData.value.tahun_operasi) || new Date().getFullYear(),
        system_id: formData.value.system_id || undefined
      });
    } else {
      await updateAsset(formData.value.id, {
        kode_mesin: formData.value.kode_mesin.trim(),
        nama_mesin: formData.value.nama_mesin.trim(),
        serial_number: formData.value.serial_number?.trim() || "",
        daya_terpasang: Number(formData.value.daya_terpasang) || 0,
        daya_mampu_netto: Number(formData.value.daya_mampu_netto) || 0,
        daya_mampu_pasok: Number(formData.value.daya_mampu_pasok) || 0,
        kondisi_mesin: formData.value.kondisi_mesin || "Beroperasi",
        system_id: formData.value.system_id || undefined,
      });
    }
    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch {
    // Handled by useApi
  } finally {
    submitting.value = false;
  }
};

const getConditionBadgeVariant = (kondisi?: string) => {
  const k = (kondisi || "").toLowerCase();
  if (k.includes("operasi") || k.includes("normal")) return "success";
  if (k.includes("standby") || k.includes("siap")) return "info";
  if (k.includes("derating")) return "warning";
  if (k.includes("gangguan") || k.includes("trip")) return "danger";
  return "neutral";
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  return [
    { label: "Kode Mesin", value: detailRecord.value.kode_mesin },
    { label: "Nama Mesin", value: detailRecord.value.nama_mesin },
    { label: "Nomor Seri", value: detailRecord.value.serial_number || "-" },
    { label: "Kondisi Mesin", value: detailRecord.value.kondisi_mesin || "Beroperasi" },
    { label: "Daya Terpasang", value: `${formatNumber(detailRecord.value.daya_terpasang || 0)} kW` },
    { label: "Daya Mampu Netto (DMN)", value: `${formatNumber(detailRecord.value.daya_mampu_netto || 0)} kW` },
    { label: "Daya Mampu Pasok (DMP)", value: `${formatNumber(detailRecord.value.daya_mampu_pasok || 0)} kW` },
    { label: "Merk / Tipe Mesin", value: `${detailRecord.value.merk_mesin || "-"} / ${detailRecord.value.tipe_mesin || "-"}` },
    { label: "Merk Generator", value: detailRecord.value.merk_generator || "-" },
    { label: "Nama Trafo", value: detailRecord.value.nama_trafo || "-" },
    { label: "Bahan Bakar", value: detailRecord.value.kode_bahan_bakar || "-" },
    { label: "Kepemilikan Mesin", value: detailRecord.value.status_kepemilikan_mesin || "-" },
    { label: "Kepemilikan kWh", value: detailRecord.value.status_kepemilikan_kwh || "-" },
    { label: "Tahun Operasi", value: String(detailRecord.value.tahun_operasi || "-") }
  ];
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- ── Page Title Header ───────────────────────────────── -->
    <BasePageHeader />

    <!-- ── Main Card Container ─────────────────────────────── -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- ── Action Controls Bar ───────────────────────────────── -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" />
          </div>

          <BaseCreateButton resource="ASSET" @click="openCreateModal" />
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
        <BaseTable
          :columns="assetColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchAssets"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #kode_mesin-data="{ row }">
            <BaseBadge variant="mono">
              {{ row.kode_mesin }}
            </BaseBadge>
          </template>

          <template #nama_mesin-data="{ row }">
            <span class="text-xs text-gray-900 font-semibold">{{ row.nama_mesin }}</span>
          </template>

          <template #kondisi_mesin-data="{ row }">
            <BaseBadge :variant="getConditionBadgeVariant(row.kondisi_mesin)">
              {{ row.kondisi_mesin || 'Beroperasi' }}
            </BaseBadge>
          </template>

          <template #daya_terpasang-data="{ row }">
            <span class="font-mono text-xs text-gray-800 font-medium">
              {{ formatNumber(row.daya_terpasang || 0) }}
            </span>
          </template>

          <template #daya_mampu_netto-data="{ row }">
            <span class="font-mono text-xs text-blue-700 font-medium">
              {{ formatNumber(row.daya_mampu_netto || 0) }}
            </span>
          </template>

          <template #daya_mampu_pasok-data="{ row }">
            <span class="font-mono text-xs text-emerald-700 font-medium">
              {{ formatNumber(row.daya_mampu_pasok || 0) }}
            </span>
          </template>

          <template #merk_mesin-data="{ row }">
            <span class="text-xs text-gray-600 truncate max-w-xs block">
              {{ row.merk_mesin || '-' }} {{ row.tipe_mesin ? `(${row.tipe_mesin})` : '' }}
            </span>
          </template>

          <!-- Action Buttons Cell Slot -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton type="edit" resource="ASSET" @click="handleEdit(row)" />
              <BaseActionButton type="delete" resource="ASSET" @click="handleDelete(row)" />
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

    <!-- ── Form Drawer Modal ─────────────────────────────────── -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="formSections"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Aset Mesin"
      :message="`Apakah Anda yakin ingin menghapus aset '${deleteTarget?.nama_mesin || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />

    <!-- ── View Detail Modal ─────────────────────────────────── -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Aset Mesin"
      subtitle="Informasi Aset Mesin"
      :record="detailRecord"
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
      @close="closeDetailModal"
    />
  </div>
</template>
