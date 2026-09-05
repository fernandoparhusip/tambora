<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, CabangItem } from "~/types";
import { getCabangFormSections } from "~/schemas/master/cabang.schema";
import type { DetailDataItem } from "~/types/master.types";
import type { ActivityLogItem } from "~/components/base/BaseDetailModal.vue";
import { useCabang } from "~/composables/master/useCabang";
import { useRegional } from "~/composables/master/useRegional";
import { formatAppDateTime } from "~/utils/formatDate";
import { useAsyncDetail } from "~/composables/useAsyncDetail";

const {
  cabangList,
  loading,
  detailLoading,
  fetchCabang,
  getCabangById,
  createCabang,
  updateCabang,
  deleteCabang,
} = useCabang();
const { regionalList, fetchRegional } = useRegional();
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
const deleteTarget = ref<CabangItem | null>(null);
const isDeleting = ref(false);

const cabangColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode_wilayah", label: "Kode Regional" },
  { key: "kode_cabang", label: "Kode" },
  { key: "nama_cabang", label: "Nama" },
  { key: "approve_status", label: "Status" },
  { key: "actions", label: "Aksi" },
];

const regionalOptions = computed(() =>
  regionalList.value.map((r) => ({
    label: `${r.nama_regional} (${r.kode_regional})`,
    value: r.kode_regional,
  })),
);

const formSections = computed(() =>
  getCabangFormSections({
    regionalOptions: regionalOptions.value,
  }),
);

onMounted(async () => {
  await Promise.allSettled([fetchCabang(), fetchRegional()]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!searchQuery.value) return cabangList.value;
  const q = searchQuery.value.toLowerCase();
  return cabangList.value.filter(
    (item) =>
      (item.kode_cabang && item.kode_cabang.toLowerCase().includes(q)) ||
      (item.nama_cabang && item.nama_cabang.toLowerCase().includes(q)) ||
      (item.kode_wilayah && item.kode_wilayah.toLowerCase().includes(q)) ||
      (item.approve_status && item.approve_status.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "create" ? "Tambah Data Cabang" : "Ubah Data Cabang",
);
const modalSubtitle = computed(() =>
  modalMode.value === "create"
    ? "Form Tambah Cabang"
    : "Form Ubah Cabang",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    kode_wilayah: "",
    kode_cabang: "",
    nama_cabang: "",
    approve_status: "",
  };
  modalOpen.value = true;
};

const handleEdit = (row: CabangItem) => {
  modalMode.value = "edit";
  formData.value = { ...row };
  modalOpen.value = true;
};

// Universal Async Detail Management
const {
  isDetailModalOpen,
  detailRecord,
  detailLoading: asyncDetailLoading,
  handleView,
  closeDetailModal,
  openEditFromDetail,
} = useAsyncDetail<CabangItem>({
  fetchDetail: (id) => getCabangById(id),
  getId: (row) => row.id || row.kode_cabang,
  onEdit: (record) => handleEdit(record),
});

const formattedCreatedDate = computed(() => {
  if (!detailRecord.value?.created_at) return "-";
  return formatAppDateTime(detailRecord.value.created_at);
});

const activityLogs = computed<ActivityLogItem[]>(() => {
  if (!detailRecord.value) return [];
  const historyList = (detailRecord.value as any)?.history;
  if (Array.isArray(historyList) && historyList.length > 0) {
    return historyList.map((item: any) => {
      const userName = item.user_name || "Admin";
      const initial = userName.charAt(0).toUpperCase();
      const actionText =
        item.title ||
        (item.action === "CREATE"
          ? `Membuat Cabang ${detailRecord.value?.nama_cabang || ""}`.trim()
          : item.action === "UPDATE"
            ? `Mengubah Cabang ${detailRecord.value?.nama_cabang || ""}`.trim()
            : item.action || "Aktivitas Cabang");
      const dt = formatAppDateTime(item.created_at);
      return {
        initial,
        user: userName,
        action: actionText,
        timestamp: dt,
      };
    });
  }

  const creator =
    (detailRecord.value as any)?.created_by_name ||
    (detailRecord.value as any)?.created_by ||
    "Admin";
  return [
    {
      initial: creator.charAt(0).toUpperCase(),
      user: creator,
      action: `Membuat Cabang ${detailRecord.value?.nama_cabang || ""}`.trim(),
      timestamp: formattedCreatedDate.value,
    },
  ];
});

const handleDelete = (row: CabangItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteCabang(deleteTarget.value.id || deleteTarget.value.kode_cabang);
    toast.success(
      `Cabang '${deleteTarget.value.nama_cabang}' berhasil dihapus.`,
      "Sukses",
    );
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch {
    // Error notifikasi sudah ditangani terpusat oleh useApi
  } finally {
    isDeleting.value = false;
  }
};

const handleSave = async (data: Record<string, any>) => {
  submitting.value = true;
  try {
    const payload = {
      kode_wilayah: data.kode_wilayah,
      kode_cabang: data.kode_cabang,
      nama_cabang: data.nama_cabang,
      approve_status: data.approve_status || "APPROVED",
    };

    if (modalMode.value === "create") {
      await createCabang(payload);
      modalOpen.value = false;
      isSuccessModalOpen.value = true;
    } else {
      const id = formData.value.id || formData.value.kode_cabang;
      await updateCabang(id, payload);
      modalOpen.value = false;
      toast.success("Data cabang berhasil diperbarui.", "Sukses");
    }
  } catch {
    // Error notifikasi sudah ditangani terpusat oleh useApi
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

// Detail Data Items
const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  return [
    {
      label: "Kode Wilayah / Regional",
      value: detailRecord.value.kode_wilayah,
    },
    { label: "Kode Cabang", value: detailRecord.value.kode_cabang },
    { label: "Nama Cabang", value: detailRecord.value.nama_cabang },
    {
      label: "Status Approval",
      value: detailRecord.value.approve_status || "APPROVED",
      isStatus: true,
    },
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

          <BaseCreateButton resource="CABANG" @click="openCreateModal" />
        </div>

        <!-- Table Container -->
        <BaseTable
          :columns="cabangColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchCabang"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #kode_wilayah-data="{ row }">
            <span class="text-xs font-medium text-gray-600">{{
              row.kode_wilayah
            }}</span>
          </template>

          <template #kode_cabang-data="{ row }">
            <span class="text-xs font-medium text-gray-600">{{
              row.kode_cabang
            }}</span>
          </template>

          <template #nama_cabang-data="{ row }">
            <span class="text-xs font-medium text-gray-600">{{
              row.nama_cabang
            }}</span>
          </template>

          <template #approve_status-data="{ row }">
            <BaseBadge :variant="getStatusBadgeVariant(row.approve_status)">
              {{ row.approve_status || "APPROVED" }}
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
                resource="CABANG"
                title="Ubah Cabang"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                type="delete"
                resource="CABANG"
                title="Hapus Cabang"
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
      title="Detail Cabang"
      subtitle="Informasi Cabang"
      :record-id="detailRecord?.id || detailRecord?.kode_cabang"
      :created-date="formattedCreatedDate"
      :created-by="
        (detailRecord as any)?.created_by_name ||
        (detailRecord as any)?.created_by ||
        'Admin'
      "
      :data-items="detailDataItems"
      :activity-logs="activityLogs"
      :loading="detailLoading || asyncDetailLoading"
      @edit="openEditFromDetail"
      @close="closeDetailModal"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Cabang"
      :message="`Apakah Anda yakin ingin menghapus Cabang '${deleteTarget?.nama_cabang || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
