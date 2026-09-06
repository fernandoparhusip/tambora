<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, SentralItem } from "~/types";
import { getSentralFormSections } from "~/schemas/master/sentral.schema";
import type { DetailDataItem } from "~/types/master.types";
import { useSentral } from "~/composables/master/useSentral";
import { useAsyncDetail } from "~/composables/useAsyncDetail";
import { useRegional } from "~/composables/master/useRegional";
import { useRanting } from "~/composables/master/useRanting";
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
const { rantingList, fetchRanting } = useRanting();
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
  { key: "kode_sentral", label: "Kode Sentral" },
  { key: "nama_sentral", label: "Nama Sentral" },
  { key: "kode_wilayah", label: "Regional" },
  { key: "kode_jenis_pembangkit", label: "Jenis" },
  { key: "daya_terpasang", label: "Daya Terpasang" },
  { key: "kondisi", label: "Kondisi" },
  { key: "approve_status", label: "Status" },
  { key: "actions", label: "Aksi" },
];

const regionalOptions = computed(() =>
  regionalList.value.map((r) => ({
    label: `${r.kode_regional} - ${r.nama_regional}`,
    value: r.id,
  })),
);

const rantingOptions = computed(() =>
  rantingList.value.map((rt) => ({
    label: `${rt.kode_ranting} - ${rt.nama_ranting}`,
    value: rt.id,
  })),
);

const formSections = computed(() =>
  getSentralFormSections({
    regionalOptions: regionalOptions.value,
    rantingOptions: rantingOptions.value,
  }),
);

onMounted(async () => {
  await Promise.allSettled([fetchSentral(), fetchRegional(), fetchRanting()]);
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
      (item.kode_jenis_pembangkit && item.kode_jenis_pembangkit.toLowerCase().includes(q)) ||
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
  modalMode.value === "create"
    ? "Form Tambah Sentral"
    : "Form Ubah Sentral",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    kode_wilayah: "",
    kode_ranting: "",
    kode_sentral: "",
    nama_sentral: "",
    kode_jenis_pembangkit: "PLTD",
    jenis_bahan_bakar: "HSD",
    daya_terpasang: null,
    daya_mampu: null,
    tahun_operasi: null,
    kondisi: "SIAP_OPERASI",
    latitude: 1.44,
    longitude: 125.18,
    approve_status: "DRAFT",
  };
  modalOpen.value = true;
};

const handleEdit = (row: SentralItem) => {
  modalMode.value = "edit";
  const matchedReg = regionalList.value.find(
    (r) =>
      r.id === row.kode_wilayah ||
      r.kode_regional === row.kode_wilayah,
  );
  const matchedRanting = rantingList.value.find(
    (rt) =>
      rt.id === row.kode_ranting ||
      rt.kode_ranting === row.kode_ranting,
  );
  formData.value = {
    ...row,
    kode_wilayah:
      matchedReg?.id || row.kode_wilayah || "",
    kode_ranting:
      matchedRanting?.id || row.kode_ranting || "",
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
    await deleteSentral(deleteTarget.value.id || deleteTarget.value.kode_sentral);
    toast.success(`Sentral '${deleteTarget.value.nama_sentral}' berhasil dihapus.`, "Sukses");
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
    await approveSentral(approveTarget.value.id || approveTarget.value.kode_sentral);
    toast.success(`Sentral '${approveTarget.value.nama_sentral}' berhasil disetujui (APPROVED).`, "Sukses");
    isApproveDialogOpen.value = false;
    approveTarget.value = null;
  } catch (err: any) {
    // Handled by global toast in useApi
  } finally {
    isApproving.value = false;
  }
};

const handleSave = async (data: Record<string, any>) => {
  submitting.value = true;
  try {
    const matchedReg = regionalList.value.find(
      (r) =>
        r.id === data.kode_wilayah ||
        r.kode_regional === data.kode_wilayah,
    );
    const regId = matchedReg?.id || data.kode_wilayah;
    const matchedRanting = rantingList.value.find(
      (rt) =>
        rt.id === data.kode_ranting ||
        rt.kode_ranting === data.kode_ranting,
    );
    const rantingId = matchedRanting?.id || data.kode_ranting;

    const payload = {
      kode_wilayah: regId,
      kode_ranting: rantingId,
      kode_sentral: data.kode_sentral,
      nama_sentral: data.nama_sentral,
      kode_jenis_pembangkit: data.kode_jenis_pembangkit,
      jenis_bahan_bakar: data.jenis_bahan_bakar,
      daya_terpasang: data.daya_terpasang ? Number(data.daya_terpasang) : undefined,
      daya_mampu: data.daya_mampu ? Number(data.daya_mampu) : undefined,
      tahun_operasi: data.tahun_operasi ? Number(data.tahun_operasi) : undefined,
      kondisi: data.kondisi,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
      approve_status: data.approve_status || "DRAFT",
    };

    if (modalMode.value === "create") {
      await createSentral(payload);
      modalOpen.value = false;
      setTimeout(() => {
        isSuccessModalOpen.value = true;
      }, 150);
    } else {
      const id = formData.value.id || formData.value.kode_sentral;
      await updateSentral(id, payload);
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

const getKondisiBadgeVariant = (kondisi?: string): any => {
  const k = (kondisi || "").toUpperCase();
  if (k.includes("SIAP") || k.includes("OPERASI")) return "success";
  if (k.includes("GANGGUAN") || k.includes("RUSAK")) return "danger";
  if (k.includes("PEMELIHARAAN") || k.includes("HAR")) return "warning";
  return "info";
};

const canApprove = computed(() => {
  return can("SENTRAL.APPROVE") || (can("SENTRAL.CREATE") && (isSuperAdmin.value || can("REGIONAL.CREATE")));
});

// Detail Data Items
const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  return [
    { label: "Kode Sentral", value: detailRecord.value.kode_sentral },
    { label: "Nama Sentral", value: detailRecord.value.nama_sentral },
    {
      label: "Regional",
      value:
        regionalList.value.find(
          (r) => r.id === detailRecord.value?.kode_wilayah,
        )?.nama_regional ||
        detailRecord.value.kode_wilayah ||
        "-",
    },
    {
      label: "Ranting",
      value:
        rantingList.value.find(
          (rt) => rt.id === detailRecord.value?.kode_ranting,
        )?.nama_ranting ||
        detailRecord.value.nama_ranting ||
        detailRecord.value.kode_ranting ||
        "-",
    },
    { label: "Jenis Pembangkit", value: detailRecord.value.kode_jenis_pembangkit || "-" },
    { label: "Jenis Bahan Bakar", value: detailRecord.value.jenis_bahan_bakar || "-" },
    { label: "Daya Terpasang", value: detailRecord.value.daya_terpasang ? `${detailRecord.value.daya_terpasang.toLocaleString("id-ID")} kW` : "-" },
    { label: "Daya Mampu", value: detailRecord.value.daya_mampu ? `${detailRecord.value.daya_mampu.toLocaleString("id-ID")} kW` : "-" },
    { label: "Tahun Operasi", value: detailRecord.value.tahun_operasi || "-" },
    {
      label: "Kondisi Operasi",
      value: detailRecord.value.kondisi || "SIAP_OPERASI",
      isStatus: true,
    },
    { label: "Latitude", value: detailRecord.value.latitude ?? "-" },
    { label: "Longitude", value: detailRecord.value.longitude ?? "-" },
    {
      label: "Status Approval",
      value: detailRecord.value.approve_status || "DRAFT",
      isStatus: true,
    },
    { label: "ID Record", value: detailRecord.value.id || detailRecord.value.kode_sentral },
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

          <BaseCreateButton
            resource="SENTRAL"
            @click="openCreateModal"
          />
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
            <span class="text-xs font-mono font-bold text-primary-700">{{ row.kode_sentral }}</span>
          </template>

          <template #nama_sentral-data="{ row }">
            <span class="text-xs font-semibold text-gray-800">{{ row.nama_sentral }}</span>
          </template>

          <template #kode_wilayah-data="{ row }">
            <span class="text-xs text-gray-600">{{
              regionalList.find((r) => r.id === row.kode_wilayah)?.nama_regional ||
              row.kode_wilayah ||
              '-'
            }}</span>
          </template>

          <template #kode_jenis_pembangkit-data="{ row }">
            <span class="text-xs font-medium text-gray-700">{{ row.kode_jenis_pembangkit || '-' }}</span>
          </template>

          <template #daya_terpasang-data="{ row }">
            <span class="text-xs font-mono font-medium text-gray-800">
              {{ row.daya_terpasang ? `${row.daya_terpasang.toLocaleString('id-ID')} kW` : '-' }}
            </span>
          </template>

          <template #kondisi-data="{ row }">
            <BaseBadge :variant="getKondisiBadgeVariant(row.kondisi)">
              {{ row.kondisi || 'SIAP_OPERASI' }}
            </BaseBadge>
          </template>

          <template #approve_status-data="{ row }">
            <BaseBadge :variant="getStatusBadgeVariant(row.approve_status)">
              {{ row.approve_status || 'DRAFT' }}
            </BaseBadge>
          </template>

          <!-- Action Buttons Cell Slot -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" title="Lihat Detail" @click="handleView(row)" />
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
