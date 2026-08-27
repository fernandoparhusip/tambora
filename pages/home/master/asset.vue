<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem } from "~/components/base/BaseDetailModal.vue";
import type { TableColumn, FormSectionConfig, AssetItem } from "~/types";
import { useAsset } from "~/composables/master/useAsset";
import { useSystem } from "~/composables/master/useSystem";
import { useMachineCondition } from "~/composables/master/useMachineCondition";
import { formatNumber } from "~/utils/formatNumber";

const { assets, loading, fetchAssets, createAsset, updateAsset, deleteAsset } = useAsset();
const { systems, fetchSystems } = useSystem();
const { machineConditions, fetchMachineConditions } = useMachineCondition();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isDetailModalOpen = ref(false);
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
  systems.value.map((s) => ({ label: `${s.name} (${s.code})`, value: s.id }))
);

const conditionOptions = computed(() => {
  if (machineConditions.value.length > 0) {
    return machineConditions.value.map((c) => ({ label: c.name, value: c.name }));
  }
  return [
    { label: "Beroperasi", value: "Beroperasi" },
    { label: "Standby", value: "Standby" },
    { label: "Derating", value: "Derating" },
    { label: "Gangguan", value: "Gangguan" },
    { label: "Pemeliharaan", value: "Pemeliharaan" }
  ];
});

const formSections = computed<FormSectionConfig[]>(() => [
  {
    title: "1. Identitas Mesin & Sistem",
    fields: [
      {
        key: "kode_mesin",
        label: "Kode Mesin",
        type: "text",
        placeholder: "Contoh: 1010111",
        required: true,
        colSpan: 6
      },
      {
        key: "nama_mesin",
        label: "Nama Mesin Pembangkit",
        type: "text",
        placeholder: "Contoh: PLTD BIMA #07 (CATERPILLAR)",
        required: true,
        colSpan: 6
      },
      {
        key: "serial_number",
        label: "Nomor Seri (Serial Number)",
        type: "text",
        placeholder: "Contoh: 28617",
        required: false,
        colSpan: 6
      },
      {
        key: "system_id",
        label: "Sistem Pembangkit",
        type: "searchable-select",
        placeholder: "Pilih Sistem Pembangkit",
        options: systemOptions.value,
        required: false,
        colSpan: 6
      },
      {
        key: "kondisi_mesin",
        label: "Kondisi Mesin",
        type: "searchable-select",
        placeholder: "Pilih Kondisi Mesin",
        options: conditionOptions.value,
        required: true,
        colSpan: 6
      },
      {
        key: "kode_bahan_bakar",
        label: "Bahan Bakar",
        type: "searchable-select",
        placeholder: "Pilih Jenis Bahan Bakar",
        options: [
          { label: "101 - HSD (High Speed Diesel)", value: "101 - HSD" },
          { label: "102 - MFO (Marine Fuel Oil)", value: "102 - MFO" },
          { label: "103 - B30 / B35 Biosolar", value: "103 - B30" },
          { label: "201 - Gas Alam (LNG/CNG)", value: "201 - GAS" },
          { label: "301 - Batubara (Coal)", value: "301 - BATUBARA" },
          { label: "401 - Tenaga Surya (PLTS)", value: "401 - SURYA" },
          { label: "501 - Tenaga Air (PLTA/PLTM)", value: "501 - AIR" }
        ],
        required: false,
        colSpan: 6
      }
    ]
  },
  {
    title: "2. Spesifikasi Daya & Kelistrikan",
    fields: [
      {
        key: "daya_terpasang",
        label: "Daya Terpasang (kW)",
        type: "number",
        placeholder: "Contoh: 3231",
        required: true,
        colSpan: 4
      },
      {
        key: "daya_mampu_netto",
        label: "Daya Mampu Netto / DMN (kW)",
        type: "number",
        placeholder: "Contoh: 3131",
        required: true,
        colSpan: 4
      },
      {
        key: "daya_mampu_pasok",
        label: "Daya Mampu Pasok / DMP (kW)",
        type: "number",
        placeholder: "Contoh: 3000",
        required: true,
        colSpan: 4
      },
      {
        key: "merk_mesin",
        label: "Merk Mesin (Engine)",
        type: "text",
        placeholder: "Contoh: Caterpillar, Niigata, Daihatsu",
        required: false,
        colSpan: 6
      },
      {
        key: "tipe_mesin",
        label: "Tipe Mesin",
        type: "text",
        placeholder: "Contoh: 3156B-DITA",
        required: false,
        colSpan: 6
      },
      {
        key: "merk_generator",
        label: "Merk Generator",
        type: "text",
        placeholder: "Contoh: HYUNDAI, Leroy Somer",
        required: false,
        colSpan: 6
      },
      {
        key: "nama_trafo",
        label: "Nama Trafo",
        type: "text",
        placeholder: "Contoh: Sintra, Bambang Djaja",
        required: false,
        colSpan: 6
      },
      {
        key: "jenis_tegangan",
        label: "Jenis Tegangan",
        type: "searchable-select",
        placeholder: "Pilih Jenis Tegangan",
        options: [
          { label: "Tegangan Menengah (TM 20 kV)", value: "Tegangan Menengah" },
          { label: "Tegangan Rendah (TR 380V / 400V)", value: "Tegangan Rendah" },
          { label: "Tegangan Tinggi (TT 150 kV)", value: "Tegangan Tinggi" }
        ],
        required: false,
        colSpan: 4
      },
      {
        key: "tegangan_hv",
        label: "Tegangan HV (kV)",
        type: "number",
        placeholder: "Contoh: 20",
        required: false,
        colSpan: 4
      },
      {
        key: "tegangan_lv",
        label: "Tegangan LV (kV)",
        type: "number",
        placeholder: "Contoh: 0.4",
        required: false,
        colSpan: 4
      }
    ]
  },
  {
    title: "3. Kepemilikan & Operasional",
    fields: [
      {
        key: "status_kepemilikan_mesin",
        label: "Status Kepemilikan Mesin",
        type: "searchable-select",
        placeholder: "Pilih Kepemilikan Mesin",
        options: [
          { label: "PLN Holding (Aset Sendiri)", value: "PLN Holding" },
          { label: "Sewa (IPP / Rental Mitra)", value: "Sewa" },
          { label: "Kerjasama Operasi (KSO)", value: "KSO" }
        ],
        required: false,
        colSpan: 6
      },
      {
        key: "status_kepemilikan_kwh",
        label: "Status Kepemilikan kWh",
        type: "searchable-select",
        placeholder: "Pilih Kepemilikan kWh",
        options: [
          { label: "Produksi Sendiri", value: "Produksi Sendiri" },
          { label: "Beli Listrik (IPP)", value: "Beli Listrik" }
        ],
        required: false,
        colSpan: 6
      },
      {
        key: "tahun_operasi",
        label: "Tahun Mulai Operasi (COD)",
        type: "number",
        placeholder: "Contoh: 2021",
        required: false,
        colSpan: 12
      }
    ]
  }
]);

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
    (a) =>
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
    ? "Form Edit Data Spesifikasi & Rating Mesin"
    : "Form Tambah Data Spesifikasi & Rating Mesin"
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

const openEditFromDetail = () => {
  if (detailRecord.value) {
    handleEdit(detailRecord.value);
  }
};

const handleEdit = (row: AssetItem) => {
  modalMode.value = "edit";
  formData.value = { ...row };
  modalOpen.value = true;
};

const handleDelete = async (row: AssetItem) => {
  if (confirm(`Apakah Anda yakin ingin menghapus aset mesin "${row.nama_mesin}" (${row.kode_mesin})?`)) {
    try {
      await deleteAsset(row.id);
    } catch (err: any) {
      alert("Gagal menghapus aset mesin: " + (err?.message || err));
    }
  }
};

const handleSave = async () => {
  if (!formData.value.kode_mesin || !formData.value.nama_mesin) {
    alert("Kode Mesin dan Nama Mesin wajib diisi.");
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
        kondisi_mesin: formData.value.kondisi_mesin || "Beroperasi"
      });
    }
    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    alert("Gagal menyimpan aset mesin: " + (err?.message || err));
  } finally {
    submitting.value = false;
  }
};

const handleExport = () => {
  alert("Mengunduh data Aset Mesin ke .xls...");
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
    <BasePageHeader title="Master Aset Mesin Pembangkit" />

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
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Kode / Nama / Merk..." />
            <BaseExportButton @click="handleExport" />
          </div>

          <BaseCreateButton label="TAMBAH DATA" @click="openCreateModal" />
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
        <BaseTable
          :columns="assetColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
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
              <BaseActionButton type="edit" @click="handleEdit(row)" />
              <BaseActionButton type="delete" @click="handleDelete(row)" />
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

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />

    <!-- ── View Detail Modal ─────────────────────────────────── -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Aset Mesin Pembangkit"
      subtitle="Informasi Lengkap Spesifikasi & Rating Mesin"
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
    />
  </div>
</template>
