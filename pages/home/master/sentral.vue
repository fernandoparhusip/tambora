<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, SentralItem } from "~/types";
import { getSentralFormSections } from "~/schemas/master/sentral.schema";
import type { DetailDataItem } from "~/types/master.types";
import { useSentral } from "~/composables/master/useSentral";
import { useAsyncDetail } from "~/composables/useAsyncDetail";
import { useRegional } from "~/composables/master/useRegional";
import { useCabang } from "~/composables/master/useCabang";
import { useRanting } from "~/composables/master/useRanting";
import { useSystem } from "~/composables/master/useSystem";
import { useRbac } from "~/composables/useRbac";

const {
  sentralList,
  loading,
  detailLoading,
  fetchSentral,
  getSentralById,
  createSentral,
  updateSentral,
  deleteSentral,
  approveSentral,
} = useSentral();
const { regionalList, fetchRegional } = useRegional();
const { cabangList, fetchCabang } = useCabang();
const { rantingList, fetchRanting } = useRanting();
const { systems, fetchSystems } = useSystem();
const { can, isSuperAdmin } = useRbac();
const toast = useAppToast();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<SentralItem | null>(null);
const isDeleting = ref(false);

const isApproveDialogOpen = ref(false);
const approveTarget = ref<SentralItem | null>(null);
const isApproving = ref(false);

const sentralColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode_wilayah", label: "Regional" },
  { key: "kode_sentral", label: "Kode" },
  { key: "nama_sentral", label: "Nama" },
  { key: "kode_jenis_pembangkit", label: "Jenis Pembangkit" },
  { key: "daya_terpasang", label: "Daya Terpasang" },
  { key: "kondisi", label: "Kondisi" },
  { key: "approve_status", label: "Status" },
  { key: "actions", label: "Aksi" },
];

const regionalOptions = computed(() =>
  regionalList.value.map((r) => ({
    label: `${r.kode_regional} - ${r.nama_regional}`,
    value: r.kode_regional || r.id,
  })),
);

const rantingOptions = computed(() => {
  const selectedWilayah = formData.value?.kode_wilayah;
  if (!selectedWilayah) return [];

  // Match regional in regionalList to cover both ID and code formats
  const matchedReg = regionalList.value.find(
    (r) => r.kode_regional === selectedWilayah || r.id === selectedWilayah,
  );
  const possibleWilayahKeys = new Set<string>([selectedWilayah]);
  if (matchedReg) {
    if (matchedReg.kode_regional)
      possibleWilayahKeys.add(matchedReg.kode_regional);
    if (matchedReg.id) possibleWilayahKeys.add(matchedReg.id);
  }

  // Find all cabang under this regional
  const matchingCabangCodes = new Set<string>();
  cabangList.value.forEach((c) => {
    if (
      possibleWilayahKeys.has(c.kode_wilayah) ||
      (c.kode_regional && possibleWilayahKeys.has(c.kode_regional)) ||
      possibleWilayahKeys.has(c.id)
    ) {
      if (c.kode_cabang) matchingCabangCodes.add(c.kode_cabang);
      if (c.id) matchingCabangCodes.add(c.id);
    }
  });

  // Filter ranting belonging to any matching cabang
  return rantingList.value
    .filter((rt) => {
      return (
        matchingCabangCodes.has(rt.kode_cabang) ||
        ((rt as any).kode_wilayah &&
          possibleWilayahKeys.has((rt as any).kode_wilayah))
      );
    })
    .map((rt) => ({
      label: `${rt.kode_ranting} - ${rt.nama_ranting}`,
      value: rt.kode_ranting || rt.id,
    }));
});

const systemOptions = computed(() =>
  systems.value.map((s) => ({
    label: `${s.code} - ${s.name}`,
    value: s.code,
  })),
);

const formSections = computed(() =>
  getSentralFormSections({
    regionalOptions: regionalOptions.value,
    rantingOptions: rantingOptions.value,
    systemOptions: systemOptions.value,
    hasSelectedRegional: !!formData.value?.kode_wilayah,
  }),
);

// Auto-reset ranting when regional changes
watch(
  () => formData.value?.kode_wilayah,
  (newVal, oldVal) => {
    if (
      modalOpen.value &&
      oldVal !== undefined &&
      oldVal !== "" &&
      newVal !== oldVal
    ) {
      formData.value.kode_ranting = "";
    }
  },
);

onMounted(async () => {
  await Promise.allSettled([
    fetchSentral(),
    fetchRegional({ limit: 100 }),
    fetchCabang({ limit: 200 }),
    fetchRanting({ limit: 200 }),
    fetchSystems(),
  ]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!searchQuery.value) return sentralList.value;
  const q = searchQuery.value.toLowerCase();
  return sentralList.value.filter(
    (item) =>
      (item.kode_sentral && item.kode_sentral.toLowerCase().includes(q)) ||
      (item.nama_sentral && item.nama_sentral.toLowerCase().includes(q)) ||
      (item.kode_jenis_pembangkit &&
        item.kode_jenis_pembangkit.toLowerCase().includes(q)) ||
      (item.kondisi && item.kondisi.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "create" ? "Tambah Data Sentral" : "Ubah Data Sentral",
);
const modalSubtitle = computed(() =>
  modalMode.value === "create" ? "Form Tambah Sentral" : "Form Ubah Sentral",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    alamat: "",
    approve_status: "",
    color: "",
    daya_mampu: null,
    daya_terpasang: null,
    deskripsi: "",
    jenis_bahan_bakar: "",
    kecamatan: "",
    kelurahan: "",
    keterangan: "",
    kode_jenis_pembangkit: "",
    kode_ranting: "",
    kode_sentral: "",
    kode_singkatan_sentral: "",
    kode_sistem: "",
    kode_status_milik: "",
    kode_wilayah: "",
    kondisi: "",
    kota_kabupaten: "",
    latitude: "",
    longitude: "",
    manager: "",
    manager_phone: "",
    nama_pulau: "",
    nama_sentral: "",
    nilai_asset_awal: null,
    pemegang_saham: "",
    pengelola: "",
    penghargaan: "",
    photo: "",
    provinsi: "",
    radius: null,
    sejarah: "",
    status_milik: "",
    status_milik_detail: "",
    tahun_operasi: null,
    wakil_manager: "",
    wakil_manager_phone: "",
  };
  modalOpen.value = true;
};

const handleEdit = (row: SentralItem) => {
  modalMode.value = "edit";
  const matchedReg = regionalList.value.find(
    (r) => r.id === row.kode_wilayah || r.kode_regional === row.kode_wilayah,
  );
  const matchedRanting = rantingList.value.find(
    (rt) => rt.id === row.kode_ranting || rt.kode_ranting === row.kode_ranting,
  );
  formData.value = {
    ...row,
    kode_wilayah:
      matchedReg?.kode_regional || matchedReg?.id || row.kode_wilayah || "",
    kode_ranting:
      matchedRanting?.kode_ranting ||
      matchedRanting?.id ||
      row.kode_ranting ||
      "",
    color: row.color || "",
    radius: row.radius ?? null,
    latitude: row.latitude ?? "",
    longitude: row.longitude ?? "",
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
} = useAsyncDetail<SentralItem>({
  fetchDetail: (id) => getSentralById(id),
  onEdit: (record) => handleEdit(record),
});

const handleDelete = (row: SentralItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteSentral(
      deleteTarget.value.id || deleteTarget.value.kode_sentral,
    );
    toast.success(
      `Sentral '${deleteTarget.value.nama_sentral}' berhasil dihapus.`,
      "Sukses",
    );
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (err: any) {
    // Handled by global toast in useApi
  } finally {
    isDeleting.value = false;
  }
};

const handleApprove = (row: SentralItem) => {
  approveTarget.value = row;
  isApproveDialogOpen.value = true;
};

const confirmApprove = async () => {
  if (!approveTarget.value) return;
  isApproving.value = true;
  try {
    await approveSentral(
      approveTarget.value.id || approveTarget.value.kode_sentral,
    );
    toast.success(
      `Sentral '${approveTarget.value.nama_sentral}' berhasil disetujui (APPROVED).`,
      "Sukses",
    );
    isApproveDialogOpen.value = false;
    approveTarget.value = null;
  } catch (err: any) {
    // Handled by global toast in useApi
  } finally {
    isApproving.value = false;
  }
};

const handleSave = async (data: Record<string, any>) => {
  const currentData = data || formData.value;
  if (!currentData.kode_sentral || !currentData.nama_sentral) {
    toast.warning("Kode Sentral dan Nama Sentral wajib diisi.", "Peringatan");
    return;
  }

  submitting.value = true;
  try {
    const matchedReg = regionalList.value.find(
      (r) =>
        r.id === currentData.kode_wilayah ||
        r.kode_regional === currentData.kode_wilayah,
    );
    const regId =
      matchedReg?.kode_regional ||
      matchedReg?.id ||
      currentData.kode_wilayah ||
      "";

    const matchedRanting = rantingList.value.find(
      (rt) =>
        rt.id === currentData.kode_ranting ||
        rt.kode_ranting === currentData.kode_ranting,
    );
    const rantingId =
      matchedRanting?.kode_ranting ||
      matchedRanting?.id ||
      currentData.kode_ranting ||
      "";

    const payload: Record<string, any> = {
      alamat: currentData.alamat || "",
      approve_status: currentData.approve_status || "DRAFT",
      color: currentData.color || "#FF5733",
      daya_mampu:
        currentData.daya_mampu != null && currentData.daya_mampu !== ""
          ? Number(currentData.daya_mampu)
          : undefined,
      daya_terpasang:
        currentData.daya_terpasang != null && currentData.daya_terpasang !== ""
          ? Number(currentData.daya_terpasang)
          : undefined,
      deskripsi: currentData.deskripsi || "",
      jenis_bahan_bakar: currentData.jenis_bahan_bakar || "",
      kecamatan: currentData.kecamatan || "",
      kelurahan: currentData.kelurahan || "",
      keterangan: currentData.keterangan || "",
      kode_jenis_pembangkit: currentData.kode_jenis_pembangkit || "",
      kode_ranting: rantingId,
      kode_sentral: currentData.kode_sentral,
      kode_singkatan_sentral: currentData.kode_singkatan_sentral || "",
      kode_sistem: currentData.kode_sistem || "",
      kode_status_milik: currentData.kode_status_milik || "",
      kode_wilayah: regId,
      kondisi: currentData.kondisi || "SIAP_OPERASI",
      kota_kabupaten: currentData.kota_kabupaten || "",
      latitude:
        currentData.latitude != null && currentData.latitude !== ""
          ? Number(currentData.latitude)
          : undefined,
      longitude:
        currentData.longitude != null && currentData.longitude !== ""
          ? Number(currentData.longitude)
          : undefined,
      manager: currentData.manager || "",
      manager_phone: currentData.manager_phone || "",
      nama_pulau: currentData.nama_pulau || "",
      nama_sentral: currentData.nama_sentral,
      nilai_asset_awal:
        currentData.nilai_asset_awal != null &&
        currentData.nilai_asset_awal !== ""
          ? Number(currentData.nilai_asset_awal)
          : undefined,
      pemegang_saham: currentData.pemegang_saham || "",
      pengelola: currentData.pengelola || "",
      penghargaan: currentData.penghargaan || "",
      photo: currentData.photo || "",
      provinsi: currentData.provinsi || "",
      radius:
        currentData.radius != null && currentData.radius !== ""
          ? Number(currentData.radius)
          : undefined,
      sejarah: currentData.sejarah || "",
      status_milik: currentData.status_milik || "",
      status_milik_detail: currentData.status_milik_detail || "",
      tahun_operasi:
        currentData.tahun_operasi != null && currentData.tahun_operasi !== ""
          ? Number(currentData.tahun_operasi)
          : undefined,
      wakil_manager: currentData.wakil_manager || "",
      wakil_manager_phone: currentData.wakil_manager_phone || "",
    };

    if (modalMode.value === "create") {
      await createSentral(payload as any);
      modalOpen.value = false;
      setTimeout(() => {
        isSuccessModalOpen.value = true;
      }, 150);
    } else {
      const id = formData.value.id || formData.value.kode_sentral;
      await updateSentral(id, payload as any);
      modalOpen.value = false;
      toast.success("Data sentral berhasil diperbarui.", "Sukses");
    }
  } catch (err: any) {
    // Handled by global toast in useApi
  } finally {
    submitting.value = false;
  }
};

const getStatusBadgeVariant = (status?: string): any => {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED") return "success";
  if (s === "REJECTED") return "danger";
  if (s === "DRAFT") return "warning";
  return "default";
};

const canApprove = computed(() => {
  return (
    can("SENTRAL.APPROVE") ||
    (can("SENTRAL.CREATE") && (isSuperAdmin.value || can("REGIONAL.CREATE")))
  );
});

// Detail Data Items
const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const rec = detailRecord.value;
  const reg = regionalList.value.find(
    (r) => r.id === rec.kode_wilayah || r.kode_regional === rec.kode_wilayah,
  );
  const rnt = rantingList.value.find(
    (rt) => rt.id === rec.kode_ranting || rt.kode_ranting === rec.kode_ranting,
  );

  return [
    { label: "Kode", value: rec.kode_sentral },
    { label: "Nama", value: rec.nama_sentral },
    { label: "Singkatan Sentral", value: rec.kode_singkatan_sentral || "-" },
    { label: "Regional", value: reg?.nama_regional || rec.kode_wilayah || "-" },
    {
      label: "Ranting",
      value: rnt?.nama_ranting || rec.nama_ranting || rec.kode_ranting || "-",
    },
    { label: "Sistem", value: rec.kode_sistem || "-" },
    { label: "Jenis Pembangkit", value: rec.kode_jenis_pembangkit || "-" },
    { label: "Bahan Bakar Utama", value: rec.jenis_bahan_bakar || "-" },
    {
      label: "Daya Terpasang",
      value:
        rec.daya_terpasang != null
          ? `${Number(rec.daya_terpasang).toLocaleString("id-ID")} kW`
          : "-",
    },
    {
      label: "Daya Mampu",
      value:
        rec.daya_mampu != null
          ? `${Number(rec.daya_mampu).toLocaleString("id-ID")} kW`
          : "-",
    },
    {
      label: "Kondisi Operasi",
      value: rec.kondisi || "SIAP_OPERASI",
      isStatus: true,
    },
    {
      label: "Tahun Operasi",
      value: rec.tahun_operasi != null ? String(rec.tahun_operasi) : "-",
    },
    {
      label: "Status Approval",
      value: rec.approve_status || "DRAFT",
      isStatus: true,
    },
    {
      label: "Status Kepemilikan",
      value: rec.status_milik
        ? `${rec.status_milik} (${rec.kode_status_milik || "-"})`
        : rec.kode_status_milik || "-",
    },
    { label: "Detail Status Milik", value: rec.status_milik_detail || "-" },
    { label: "Pengelola", value: rec.pengelola || "-" },
    { label: "Pemegang Saham", value: rec.pemegang_saham || "-" },
    {
      label: "Nilai Aset Awal",
      value:
        rec.nilai_asset_awal != null
          ? `Rp ${Number(rec.nilai_asset_awal).toLocaleString("id-ID")}`
          : "-",
    },
    { label: "Provinsi", value: rec.provinsi || "-" },
    { label: "Kota / Kabupaten", value: rec.kota_kabupaten || "-" },
    { label: "Kecamatan", value: rec.kecamatan || "-" },
    { label: "Kelurahan", value: rec.kelurahan || "-" },
    { label: "Alamat", value: rec.alamat || "-" },
    { label: "Nama Pulau", value: rec.nama_pulau || "-" },
    {
      label: "Radius Area",
      value: rec.radius != null ? `${rec.radius} meter` : "-",
    },
    {
      label: "Latitude",
      value: rec.latitude != null ? String(rec.latitude) : "-",
    },
    {
      label: "Longitude",
      value: rec.longitude != null ? String(rec.longitude) : "-",
    },
    {
      label: "Manager",
      value: rec.manager
        ? rec.manager_phone
          ? `${rec.manager} (${rec.manager_phone})`
          : rec.manager
        : "-",
    },
    {
      label: "Wakil Manager",
      value: rec.wakil_manager
        ? rec.wakil_manager_phone
          ? `${rec.wakil_manager} (${rec.wakil_manager_phone})`
          : rec.wakil_manager
        : "-",
    },
    { label: "Sejarah", value: rec.sejarah || "-" },
    { label: "Penghargaan", value: rec.penghargaan || "-" },
    { label: "Deskripsi", value: rec.deskripsi || "-" },
    { label: "Keterangan", value: rec.keterangan || "-" },
  ];
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- Page Title Header -->
    <BasePageHeader />

    <!-- Main Card Container -->
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

          <BaseCreateButton resource="SENTRAL" @click="openCreateModal" />
        </div>

        <!-- Table Container -->
        <BaseTable
          :columns="sentralColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchSentral"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #kode_sentral-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.kode_sentral }}</span>
          </template>

          <template #nama_sentral-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.nama_sentral }}</span>
          </template>

          <template #kode_wilayah-data="{ row }">
            <span class="text-xs text-gray-600">{{
              regionalList.find((r) => r.id === row.kode_wilayah)
                ?.nama_regional ||
              row.kode_wilayah ||
              "-"
            }}</span>
          </template>

          <template #kode_jenis_pembangkit-data="{ row }">
            <span class="text-xs text-gray-600">{{
              row.kode_jenis_pembangkit || "-"
            }}</span>
          </template>

          <template #daya_terpasang-data="{ row }">
            <span class="text-xs text-gray-600">
              {{
                row.daya_terpasang
                  ? `${row.daya_terpasang.toLocaleString("id-ID")} kW`
                  : "-"
              }}
            </span>
          </template>

          <template #kondisi-data="{ row }">
            <span class="text-xs text-gray-600">
              {{ row.kondisi || "SIAP_OPERASI" }}
            </span>
          </template>

          <template #approve_status-data="{ row }">
            <BaseBadge :variant="getStatusBadgeVariant(row.approve_status)">
              {{ row.approve_status || "DRAFT" }}
            </BaseBadge>
          </template>

          <!-- Action Buttons Cell Slot -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton
                type="view"
                title="Lihat Detail"
                @click="handleView(row)"
              />
              <BaseActionButton
                type="edit"
                resource="SENTRAL"
                title="Ubah Sentral"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                v-if="canApprove && row.approve_status !== 'APPROVED'"
                type="custom"
                permission="SENTRAL.APPROVE"
                title="Setujui Sentral (Approve)"
                class="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100"
                @click="handleApprove(row)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2.5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </BaseActionButton>
              <BaseActionButton
                type="delete"
                resource="SENTRAL"
                title="Hapus Sentral"
                @click="handleDelete(row)"
              />
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

    <!-- Form Drawer -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="formSections"
      variant="drawer"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Sentral"
      subtitle="Informasi Sentral"
      :record="detailRecord"
      :data-items="detailDataItems"
      :loading="detailLoading || asyncDetailLoading"
      @close="closeDetailModal"
      @edit="openEditFromDetail()"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Sentral"
      :message="`Apakah Anda yakin ingin menghapus Sentral '${deleteTarget?.nama_sentral || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Confirm Approve Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isApproveDialogOpen"
      title="Setujui Sentral Pembangkit"
      :message="`Apakah Anda yakin ingin menyetujui (Approve) Sentral '${approveTarget?.nama_sentral || ''}'? Status sentral akan menjadi APPROVED.`"
      :loading="isApproving"
      @confirm="confirmApprove"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
