<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem } from "~/types/master.types";
import type { TableColumn, FormSectionConfig, AssetItem } from "~/types";
import { getAssetFormSections } from "~/schemas/master/asset.schema";
import { formatNumber } from "~/utils/formatNumber";
import { useSentral } from "~/composables/master/useSentral";
import { useAsyncDetail } from "~/composables/useAsyncDetail";

const {
  assets,
  loading,
  detailLoading: assetDetailLoading,
  fetchAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
} = useAsset();
const { systems, fetchSystems } = useSystem();
const { machineConditions, fetchMachineConditions } = useMachineCondition();
const { sentralList, fetchSentral } = useSentral();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const toast = useAppToast();
const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<AssetItem | null>(null);
const isDeleting = ref(false);

const assetColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode_mesin", label: "Kode" },
  { key: "nama_mesin", label: "Nama" },
  { key: "kondisi_mesin", label: "Kondisi" },
  { key: "daya_terpasang", label: "Daya Terpasang (kW)" },
  { key: "daya_mampu_netto", label: "DMN (kW)" },
  { key: "daya_mampu_pasok", label: "DMP (kW)" },
  { key: "merk_mesin", label: "Merk" },
  { key: "actions", label: "Aksi" },
];

const systemOptions = computed(() =>
  systems.value.map((s: any) => ({
    label: `${s.name} (${s.code})`,
    value: s.id,
  })),
);

const powerPlantOptions = computed(() =>
  sentralList.value.map((s: any) => ({
    label: `${s.nama_sentral} (${s.kode_sentral})`,
    value: s.id || s.kode_sentral,
  })),
);

const conditionOptions = computed(() => {
  if (machineConditions.value.length > 0) {
    return machineConditions.value.map((c: any) => ({
      label: c.name,
      value: c.name,
    }));
  }
  return [
    { label: "Beroperasi", value: "Beroperasi" },
    { label: "Standby", value: "Standby" },
    { label: "Derating", value: "Derating" },
    { label: "Gangguan", value: "Gangguan" },
    { label: "Pemeliharaan", value: "Pemeliharaan" },
  ];
});

const formSections = computed<FormSectionConfig[]>(() =>
  getAssetFormSections({
    systemOptions: systemOptions.value,
    conditionOptions: conditionOptions.value,
    powerPlantOptions: powerPlantOptions.value,
  }),
);

onMounted(async () => {
  await Promise.allSettled([
    fetchAssets(),
    fetchSystems(),
    fetchMachineConditions(),
    fetchSentral({ limit: 100 }),
  ]);
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
      (a.kode_spln && a.kode_spln.toLowerCase().includes(q)) ||
      (a.merk_mesin && a.merk_mesin.toLowerCase().includes(q)) ||
      (a.kondisi_mesin && a.kondisi_mesin.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit"
    ? "Edit Aset Mesin Pembangkit"
    : "Tambah Aset Mesin Pembangkit",
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit" ? "Form Ubah Aset" : "Form Tambah Aset",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    kode_mesin: "",
    nama_mesin: "",
    kode_spln: "",
    serial_number: "",
    power_plant_id: "",
    system_id: "",
    kondisi_mesin: "",
    kode_bahan_bakar: "",
    daya_terpasang: null,
    daya_mampu_netto: null,
    daya_mampu_pasok: null,
    kapasitas: null,
    jenis_tegangan: "",
    tegangan_hv: null,
    tegangan_lv: null,
    merk_mesin: "",
    tipe_mesin: "",
    merk_generator: "",
    nama_trafo: "",
    status_kepemilikan_mesin: "",
    status_kepemilikan_kwh: "",
    tahun_operasi: null,
  };
  modalOpen.value = true;
};

// Universal Async Detail Management (Guarded against race conditions & memory leaks)
const {
  isDetailModalOpen,
  detailRecord,
  detailLoading: asyncDetailLoading,
  handleView,
  closeDetailModal,
  openEditFromDetail,
} = useAsyncDetail<AssetItem>({
  fetchDetail: (id) => getAssetById(id),
  onEdit: (record) => handleEdit(record),
});

const handleEdit = (row: AssetItem) => {
  modalMode.value = "edit";
  formData.value = {
    ...row,
    kode_spln: row.kode_spln || "",
    power_plant_id: row.power_plant_id || "",
    system_id: row.system_id || "",
    serial_number: row.serial_number || "",
    merk_mesin: row.merk_mesin || "",
    tipe_mesin: row.tipe_mesin || "",
    merk_generator: row.merk_generator || "",
    nama_trafo: row.nama_trafo || "",
    kode_bahan_bakar: row.kode_bahan_bakar || "",
    kondisi_mesin: row.kondisi_mesin || "",
    status_kepemilikan_mesin: row.status_kepemilikan_mesin || "",
    status_kepemilikan_kwh: row.status_kepemilikan_kwh || "",
    jenis_tegangan: row.jenis_tegangan || "",
    daya_terpasang: row.daya_terpasang ?? null,
    daya_mampu_netto: row.daya_mampu_netto ?? null,
    daya_mampu_pasok: row.daya_mampu_pasok ?? null,
    kapasitas: row.kapasitas ?? null,
    tegangan_hv: row.tegangan_hv ?? null,
    tegangan_lv: row.tegangan_lv ?? null,
    tahun_operasi: row.tahun_operasi ?? null,
  };
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
    const payload = {
      kode_mesin: formData.value.kode_mesin.trim(),
      nama_mesin: formData.value.nama_mesin.trim(),
      kode_spln: formData.value.kode_spln?.trim() || undefined,
      serial_number: formData.value.serial_number?.trim() || "",
      power_plant_id: formData.value.power_plant_id || undefined,
      system_id: formData.value.system_id || undefined,
      kondisi_mesin: formData.value.kondisi_mesin || undefined,
      kode_bahan_bakar: formData.value.kode_bahan_bakar || undefined,
      daya_terpasang:
        formData.value.daya_terpasang != null &&
        formData.value.daya_terpasang !== ""
          ? Number(formData.value.daya_terpasang)
          : 0,
      daya_mampu_netto:
        formData.value.daya_mampu_netto != null &&
        formData.value.daya_mampu_netto !== ""
          ? Number(formData.value.daya_mampu_netto)
          : 0,
      daya_mampu_pasok:
        formData.value.daya_mampu_pasok != null &&
        formData.value.daya_mampu_pasok !== ""
          ? Number(formData.value.daya_mampu_pasok)
          : 0,
      kapasitas:
        formData.value.kapasitas != null && formData.value.kapasitas !== ""
          ? Number(formData.value.kapasitas)
          : undefined,
      jenis_tegangan: formData.value.jenis_tegangan || undefined,
      tegangan_hv:
        formData.value.tegangan_hv != null && formData.value.tegangan_hv !== ""
          ? Number(formData.value.tegangan_hv)
          : undefined,
      tegangan_lv:
        formData.value.tegangan_lv != null && formData.value.tegangan_lv !== ""
          ? Number(formData.value.tegangan_lv)
          : undefined,
      merk_mesin: formData.value.merk_mesin?.trim() || undefined,
      tipe_mesin: formData.value.tipe_mesin?.trim() || undefined,
      merk_generator: formData.value.merk_generator?.trim() || undefined,
      nama_trafo: formData.value.nama_trafo?.trim() || undefined,
      status_kepemilikan_mesin:
        formData.value.status_kepemilikan_mesin || undefined,
      status_kepemilikan_kwh:
        formData.value.status_kepemilikan_kwh || undefined,
      tahun_operasi:
        formData.value.tahun_operasi != null &&
        formData.value.tahun_operasi !== ""
          ? (formData.value.tahun_operasi instanceof Date
              ? formData.value.tahun_operasi.getFullYear()
              : Number(formData.value.tahun_operasi))
          : undefined,
    };

    if (modalMode.value === "create") {
      await createAsset(payload as any);
    } else {
      await updateAsset(formData.value.id, payload as any);
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


const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const rec = detailRecord.value;
  const sys = systems.value.find((s) => s.id === rec.system_id);
  const sentral = sentralList.value.find(
    (s) => s.id === rec.power_plant_id || s.kode_sentral === rec.power_plant_id,
  );
  return [
    { label: "Kode", value: rec.kode_mesin },
    { label: "Nama", value: rec.nama_mesin },
    { label: "Kode SPLN", value: rec.kode_spln || "-" },
    { label: "Nomor Seri", value: rec.serial_number || "-" },
    {
      label: "Sentral",
      value: sentral?.nama_sentral || rec.power_plant_id || "-",
    },
    {
      label: "Sistem",
      value: sys ? `${sys.name} (${sys.code})` : rec.system_id || "-",
    },
    { label: "Kondisi Mesin", value: rec.kondisi_mesin || "Beroperasi" },
    {
      label: "Daya Terpasang",
      value: `${formatNumber(rec.daya_terpasang || 0)} kW`,
    },
    {
      label: "Daya Mampu Netto (DMN)",
      value: `${formatNumber(rec.daya_mampu_netto || 0)} kW`,
    },
    {
      label: "Daya Mampu Pasok (DMP)",
      value: `${formatNumber(rec.daya_mampu_pasok || 0)} kW`,
    },
    {
      label: "Kapasitas Generator",
      value: rec.kapasitas != null ? `${formatNumber(rec.kapasitas)} kVA` : "-",
    },
    { label: "Level Tegangan", value: rec.jenis_tegangan || "-" },
    {
      label: "Tegangan HV",
      value: rec.tegangan_hv != null ? `${rec.tegangan_hv} kV` : "-",
    },
    {
      label: "Tegangan LV",
      value: rec.tegangan_lv != null ? `${rec.tegangan_lv} kV` : "-",
    },
    {
      label: "Merk",
      value: `${rec.merk_mesin || "-"} / ${rec.tipe_mesin || "-"}`,
    },
    { label: "Merk Generator", value: rec.merk_generator || "-" },
    { label: "Nama Trafo", value: rec.nama_trafo || "-" },
    { label: "Bahan Bakar", value: rec.kode_bahan_bakar || "-" },
    { label: "Kepemilikan Mesin", value: rec.status_kepemilikan_mesin || "-" },
    { label: "Kepemilikan kWh", value: rec.status_kepemilikan_kwh || "-" },
    { label: "Tahun Operasi", value: String(rec.tahun_operasi || "-") },
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
            <span class="text-xs text-gray-600">
              {{ row.kode_mesin }}
            </span>
          </template>

          <template #nama_mesin-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.nama_mesin }}</span>
          </template>

          <template #kondisi_mesin-data="{ row }">
            <span class="text-xs text-gray-600">
              {{ row.kondisi_mesin || "-" }}
            </span>
          </template>

          <template #daya_terpasang-data="{ row }">
            <span class="text-xs text-gray-600">
              {{ formatNumber(row.daya_terpasang || 0) }}
            </span>
          </template>

          <template #daya_mampu_netto-data="{ row }">
            <span class="text-xs text-gray-600">
              {{ formatNumber(row.daya_mampu_netto || 0) }}
            </span>
          </template>

          <template #daya_mampu_pasok-data="{ row }">
            <span class="text-xs text-gray-600">
              {{ formatNumber(row.daya_mampu_pasok || 0) }}
            </span>
          </template>

          <template #merk_mesin-data="{ row }">
            <span class="text-xs text-gray-600">
              {{ row.merk_mesin || "-" }}
              {{ row.tipe_mesin ? `(${row.tipe_mesin})` : "" }}
            </span>
          </template>

          <!-- Action Buttons Cell Slot -->
          <template #actions-data="{ row }">
            <BaseTableActions
              resource="ASSET"
              @view="handleView(row)"
              @edit="handleEdit(row)"
              @delete="handleDelete(row)"
            />
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
      :loading="assetDetailLoading || asyncDetailLoading"
      @edit="openEditFromDetail"
      @close="closeDetailModal"
    />
  </div>
</template>
