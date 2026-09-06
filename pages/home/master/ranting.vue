<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, RantingItem } from "~/types";
import { getRantingFormSections } from "~/schemas/master/ranting.schema";
import type { DetailDataItem } from "~/types/master.types";
import { useRanting } from "~/composables/master/useRanting";
import { useCabang } from "~/composables/master/useCabang";
import { useAsyncDetail } from "~/composables/useAsyncDetail";

const {
  rantingList,
  loading,
  detailLoading,
  fetchRanting,
  getRantingById,
  createRanting,
  updateRanting,
  deleteRanting,
} = useRanting();
const { cabangList, fetchCabang } = useCabang();
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
const deleteTarget = ref<RantingItem | null>(null);
const isDeleting = ref(false);

const rantingColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode_cabang", label: "Kode Cabang" },
  { key: "kode_ranting", label: "Kode" },
  { key: "nama_ranting", label: "Nama" },
  { key: "actions", label: "Aksi" },
];

const cabangOptions = computed(() =>
  cabangList.value.map((c) => ({
    label: `${c.nama_cabang} (${c.kode_cabang})`,
    value: c.kode_cabang,
  })),
);

const formSections = computed(() =>
  getRantingFormSections({
    cabangOptions: cabangOptions.value,
  }),
);

onMounted(async () => {
  await Promise.allSettled([fetchRanting(), fetchCabang()]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!searchQuery.value) return rantingList.value;
  const q = searchQuery.value.toLowerCase();
  return rantingList.value.filter(
    (item) =>
      (item.kode_ranting && item.kode_ranting.toLowerCase().includes(q)) ||
      (item.nama_ranting && item.nama_ranting.toLowerCase().includes(q)) ||
      (item.kode_cabang && item.kode_cabang.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "create" ? "Tambah Data Ranting" : "Ubah Data Ranting",
);
const modalSubtitle = computed(() =>
  modalMode.value === "create"
    ? "Form Tambah Ranting"
    : "Form Ubah Ranting",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    kode_cabang: "",
    kode_ranting: "",
    nama_ranting: "",
  };
  modalOpen.value = true;
};

const handleEdit = (row: RantingItem) => {
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
} = useAsyncDetail<RantingItem>({
  fetchDetail: (id) => getRantingById(id),
  getId: (row) => row.id || row.kode_ranting,
  onEdit: (record) => handleEdit(record),
});

const handleDelete = (row: RantingItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteRanting(
      deleteTarget.value.id || deleteTarget.value.kode_ranting,
    );
    toast.success(
      `Ranting '${deleteTarget.value.nama_ranting}' berhasil dihapus.`,
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
      kode_cabang: data.kode_cabang,
      kode_ranting: data.kode_ranting,
      nama_ranting: data.nama_ranting,
    };

    if (modalMode.value === "create") {
      await createRanting(payload);
      modalOpen.value = false;
      setTimeout(() => {
        isSuccessModalOpen.value = true;
      }, 150);
    } else {
      const id = formData.value.id || formData.value.kode_ranting;
      await updateRanting(id, payload);
      modalOpen.value = false;
      toast.success("Data ranting berhasil diperbarui.", "Sukses");
    }
  } catch {
    // Error notifikasi sudah ditangani terpusat oleh useApi
  } finally {
    submitting.value = false;
  }
};

// Detail Data Items
const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  return [
    { label: "Kode Cabang", value: detailRecord.value.kode_cabang },
    { label: "Kode", value: detailRecord.value.kode_ranting },
    { label: "Nama", value: detailRecord.value.nama_ranting },
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

          <BaseCreateButton resource="RANTING" @click="openCreateModal" />
        </div>

        <!-- Table Container -->
        <BaseTable
          :columns="rantingColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchRanting"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #kode_cabang-data="{ row }">
            <span class="text-xs font-medium text-gray-600">{{
              row.kode_cabang
            }}</span>
          </template>

          <template #kode_ranting-data="{ row }">
            <span class="text-xs font-medium text-gray-600">{{
              row.kode_ranting
            }}</span>
          </template>

          <template #nama_ranting-data="{ row }">
            <span class="text-xs font-medium text-gray-600">{{
              row.nama_ranting
            }}</span>
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
                resource="RANTING"
                title="Ubah Ranting"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                type="delete"
                resource="RANTING"
                title="Hapus Ranting"
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
      title="Detail Ranting"
      subtitle="Informasi Ranting"
      :record="detailRecord"
      :data-items="detailDataItems"
      :loading="detailLoading || asyncDetailLoading"
      @edit="openEditFromDetail"
      @close="closeDetailModal"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Ranting"
      :message="`Apakah Anda yakin ingin menghapus Ranting '${deleteTarget?.nama_ranting || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
