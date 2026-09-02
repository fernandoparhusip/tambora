<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem, SentralItem } from "~/types/master.types";
import type { TableColumn } from "~/types";
import { sentralFormSections } from "~/schemas/master/sentral.schema";
import { useSentral } from "~/composables/master/useSentral";

const {
  sentrals,
  loading,
  detailLoading,
  fetchSentrals,
  getSentralById,
  createSentral,
  updateSentral,
  deleteSentral,
} = useSentral();
const toast = useAppToast();

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
const deleteTarget = ref<SentralItem | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<SentralItem | null>(null);

const sentralColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode_sentral", label: "Kode Sentral" },
  { key: "nama_sentral", label: "Nama Sentral" },
  { key: "jenis_pembangkit", label: "Jenis / BBM" },
  { key: "kapasitas", label: "Kapasitas (kW)" },
  { key: "kondisi", label: "Kondisi" },
  { key: "pengelola", label: "Pengelola" },
  { key: "actions", label: "Aksi" },
];

onMounted(async () => {
  await fetchSentrals();
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!searchQuery.value) return sentrals.value;
  const q = searchQuery.value.toLowerCase();
  return sentrals.value.filter(
    (item) =>
      (item.kode_sentral && item.kode_sentral.toLowerCase().includes(q)) ||
      (item.nama_sentral && item.nama_sentral.toLowerCase().includes(q)) ||
      (item.kode_jenis_pembangkit && item.kode_jenis_pembangkit.toLowerCase().includes(q)) ||
      (item.pengelola && item.pengelola.toLowerCase().includes(q)) ||
      (item.kota_kabupaten && item.kota_kabupaten.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Data Sentral Pembangkit" : "Tambah Data Sentral Pembangkit",
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Perubahan Sentral Pembangkit Listrik PLN"
    : "Form Penambahan Sentral Pembangkit Listrik PLN",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    nama_sentral: "",
    kode_sentral: "",
    kode_singkatan_sentral: "",
    kode_jenis_pembangkit: "PLTD",
    jenis_bahan_bakar: "HSD",
    daya_terpasang: null,
    daya_mampu: null,
    kondisi: "SIAP_OPERASI",
    latitude: null,
    longitude: null,
    radius: 500,
    color: "#2671D9",
    provinsi: "",
    kota_kabupaten: "",
    kecamatan: "",
    kelurahan: "",
    alamat: "",
    nama_pulau: "",
    pengelola: "PLN Indonesia Power",
    status_milik: "PLN",
    tahun_operasi: null,
    nilai_asset_awal: null,
    pemegang_saham: "PT PLN (Persero)",
    manager: "",
    manager_phone: "",
    wakil_manager: "",
    wakil_manager_phone: "",
    sejarah: "",
    keterangan: "",
  };
  modalOpen.value = true;
};

const handleView = async (row: SentralItem) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
  try {
    const fresh = await getSentralById(row.id);
    if (fresh) detailRecord.value = fresh;
  } catch {
    // Keep local fallback
  }
};

const handleEdit = (row: SentralItem) => {
  modalMode.value = "edit";
  formData.value = {
    id: row.id,
    nama_sentral: row.nama_sentral,
    kode_sentral: row.kode_sentral,
    kode_singkatan_sentral: row.kode_singkatan_sentral || "",
    kode_jenis_pembangkit: row.kode_jenis_pembangkit || "PLTD",
    jenis_bahan_bakar: row.jenis_bahan_bakar || "HSD",
    daya_terpasang: row.daya_terpasang,
    daya_mampu: row.daya_mampu,
    kondisi: row.kondisi || "SIAP_OPERASI",
    latitude: row.latitude,
    longitude: row.longitude,
    radius: row.radius || 500,
    color: row.color || "#2671D9",
    provinsi: row.provinsi || "",
    kota_kabupaten: row.kota_kabupaten || "",
    kecamatan: row.kecamatan || "",
    kelurahan: row.kelurahan || "",
    alamat: row.alamat || "",
    nama_pulau: row.nama_pulau || "",
    pengelola: row.pengelola || "",
    status_milik: row.status_milik || "PLN",
    tahun_operasi: row.tahun_operasi,
    nilai_asset_awal: row.nilai_asset_awal,
    pemegang_saham: row.pemegang_saham || "",
    manager: row.manager || "",
    manager_phone: row.manager_phone || "",
    wakil_manager: row.wakil_manager || "",
    wakil_manager_phone: row.wakil_manager_phone || "",
    sejarah: row.sejarah || "",
    keterangan: row.keterangan || "",
  };
  modalOpen.value = true;
};

const handleDelete = (row: SentralItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteSentral(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
    toast.success("Berhasil!", "Data sentral pembangkit berhasil dihapus.");
  } catch (err: any) {
    toast.error("Gagal!", err?.message || "Gagal menghapus data sentral pembangkit.");
  } finally {
    isDeleting.value = false;
  }
};

const handleSave = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const payload = {
      nama_sentral: data.nama_sentral,
      kode_sentral: data.kode_sentral,
      kode_singkatan_sentral: data.kode_singkatan_sentral || undefined,
      kode_jenis_pembangkit: data.kode_jenis_pembangkit || undefined,
      jenis_bahan_bakar: data.jenis_bahan_bakar || undefined,
      daya_terpasang: data.daya_terpasang ? Number(data.daya_terpasang) : undefined,
      daya_mampu: data.daya_mampu ? Number(data.daya_mampu) : undefined,
      kondisi: data.kondisi || undefined,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      radius: data.radius ? Number(data.radius) : undefined,
      color: data.color || undefined,
      provinsi: data.provinsi || undefined,
      kota_kabupaten: data.kota_kabupaten || undefined,
      kecamatan: data.kecamatan || undefined,
      kelurahan: data.kelurahan || undefined,
      alamat: data.alamat || undefined,
      nama_pulau: data.nama_pulau || undefined,
      pengelola: data.pengelola || undefined,
      status_milik: data.status_milik || undefined,
      tahun_operasi: data.tahun_operasi ? Number(data.tahun_operasi) : undefined,
      nilai_asset_awal: data.nilai_asset_awal ? Number(data.nilai_asset_awal) : undefined,
      pemegang_saham: data.pemegang_saham || undefined,
      manager: data.manager || undefined,
      manager_phone: data.manager_phone || undefined,
      wakil_manager: data.wakil_manager || undefined,
      wakil_manager_phone: data.wakil_manager_phone || undefined,
      sejarah: data.sejarah || undefined,
      keterangan: data.keterangan || undefined,
    };

    if (modalMode.value === "edit" && data.id) {
      await updateSentral(data.id, payload);
    } else {
      await createSentral(payload);
    }
    modalOpen.value = false;
    isSuccessModalOpen.value = true;
  } catch (err: any) {
    toast.error("Gagal Menyimpan!", err?.message || "Terjadi kesalahan saat menyimpan data.");
  } finally {
    submitting.value = false;
  }
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const s = detailRecord.value;
  return [
    { label: "Nama Sentral", value: s.nama_sentral },
    { label: "Kode Sentral", value: s.kode_sentral },
    { label: "Jenis Pembangkit", value: s.kode_jenis_pembangkit || "-" },
    { label: "Bahan Bakar Utama", value: s.jenis_bahan_bakar || "-" },
    { label: "Daya Terpasang", value: s.daya_terpasang ? `${s.daya_terpasang.toLocaleString("id-ID")} kW` : "-" },
    { label: "Daya Mampu", value: s.daya_mampu ? `${s.daya_mampu.toLocaleString("id-ID")} kW` : "-" },
    { label: "Kondisi Operasi", value: s.kondisi || "-" },
    { label: "Koordinat", value: s.latitude && s.longitude ? `${s.latitude}, ${s.longitude}` : "-" },
    { label: "Wilayah / Kota", value: [s.kecamatan, s.kota_kabupaten, s.provinsi].filter(Boolean).join(", ") || "-" },
    { label: "Alamat", value: s.alamat || "-" },
    { label: "Pengelola", value: s.pengelola || "-" },
    { label: "Status Kepemilikan", value: s.status_milik || "-" },
    { label: "Manager Unit", value: s.manager ? `${s.manager} (${s.manager_phone || "-"})` : "-" },
    { label: "Tahun Operasi (COD)", value: s.tahun_operasi ? String(s.tahun_operasi) : "-" },
  ];
});

const createdDateFormatted = computed(() => {
  if (!detailRecord.value?.created_at) return "-";
  try {
    return new Date(detailRecord.value.created_at).toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return detailRecord.value.created_at;
  }
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <BasePageHeader />

    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0">
        <!-- Controls Bar -->
        <div class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" />
          </div>
          <BaseCreateButton @click="openCreateModal" />
        </div>

        <!-- Table -->
        <BaseTable
          :columns="sentralColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchSentrals"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #kode_sentral-data="{ row }">
            <span class="font-semibold text-gray-800 font-mono text-xs">{{ row.kode_sentral }}</span>
          </template>

          <template #nama_sentral-data="{ row }">
            <div>
              <div class="font-medium text-gray-900 text-xs">{{ row.nama_sentral }}</div>
              <div v-if="row.kota_kabupaten" class="text-[11px] text-gray-500">{{ row.kota_kabupaten }}</div>
            </div>
          </template>

          <template #jenis_pembangkit-data="{ row }">
            <div class="text-xs">
              <span class="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                {{ row.kode_jenis_pembangkit || '-' }}
              </span>
              <span v-if="row.jenis_bahan_bakar" class="ml-1 text-gray-600">({{ row.jenis_bahan_bakar }})</span>
            </div>
          </template>

          <template #kapasitas-data="{ row }">
            <div class="text-xs font-mono">
              <div v-if="row.daya_terpasang != null"><span class="text-gray-400">P:</span> {{ row.daya_terpasang.toLocaleString('id-ID') }} kW</div>
              <div v-if="row.daya_mampu != null"><span class="text-gray-400">M:</span> {{ row.daya_mampu.toLocaleString('id-ID') }} kW</div>
            </div>
          </template>

          <template #kondisi-data="{ row }">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
              :class="row.kondisi === 'SIAP_OPERASI' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'"
            >
              {{ row.kondisi || 'STANDBY' }}
            </span>
          </template>

          <template #pengelola-data="{ row }">
            <span class="text-xs text-gray-700">{{ row.pengelola || '-' }}</span>
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
          :total="filteredData.length"
          class="shrink-0 pt-4 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- Form Modal -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="sentralFormSections"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Master Sentral Pembangkit"
      subtitle="Informasi data teknis & lokasi sentral pembangkit"
      :data-items="detailDataItems"
      :created-date="createdDateFormatted"
      :is-loading="detailLoading"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Sentral"
      :message="`Apakah Anda yakin ingin menghapus data sentral '${deleteTarget?.nama_sentral || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
