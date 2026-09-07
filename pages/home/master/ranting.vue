<script setup lang="ts">
import { computed, onMounted } from "vue";
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

const {
  searchQuery,
  currentPage,
  pageSize,
  paginateList,
  modalOpen,
  modalMode,
  formData,
  submitting,
  isSuccessModalOpen,
  modalTitle,
  modalSubtitle,
  openCreateModal,
  openEditModal,
  isConfirmDialogOpen,
  deleteTarget,
  isDeleting,
  openDeleteDialog,
  executeDelete,
} = useCrudState<RantingItem>({ resourceName: "Ranting" });

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
    value: c.id,
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

const paginatedData = computed(() => paginateList(filteredData.value));

const handleCreate = () => {
  openCreateModal({
    kode_cabang: "",
    kode_ranting: "",
    nama_ranting: "",
  });
};

const handleEdit = (row: RantingItem) => {
  const matchedCabang = cabangList.value.find(
    (c) =>
      c.id === row.kode_cabang ||
      c.kode_cabang === row.kode_cabang,
  );
  openEditModal({
    ...row,
    kode_cabang:
      matchedCabang?.id || row.kode_cabang || "",
  });
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
  openDeleteDialog(row);
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  await executeDelete((id) => deleteRanting(String(id)), {
    targetId: deleteTarget.value.id || deleteTarget.value.kode_ranting,
    targetName: deleteTarget.value.nama_ranting,
  });
};

const handleSave = async (data: Record<string, any>) => {
  submitting.value = true;
  try {
    const matchedCabang = cabangList.value.find(
      (c) =>
        c.id === data.kode_cabang ||
        c.kode_cabang === data.kode_cabang,
    );
    const cabId = matchedCabang?.id || data.kode_cabang;
    const payload = {
      kode_cabang: cabId,
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
    {
      label: "Cabang",
      value:
        cabangList.value.find((c) => c.id === detailRecord.value?.kode_cabang)
          ?.nama_cabang ||
        detailRecord.value.nama_cabang ||
        detailRecord.value.kode_cabang,
    },
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

          <BaseCreateButton resource="RANTING" @click="handleCreate" />
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
              cabangList.find((c) => c.id === row.kode_cabang)?.nama_cabang ||
              row.nama_cabang ||
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
            <BaseTableActions
              resource="RANTING"
              @view="handleView(row)"
              @edit="handleEdit(row)"
              @delete="handleDelete(row)"
            />
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
