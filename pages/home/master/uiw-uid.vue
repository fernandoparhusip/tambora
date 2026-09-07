<script setup lang="ts">
import { computed, onMounted } from "vue";
import type { DetailDataItem, UiwUidItem } from "~/types/master.types";
import type { TableColumn } from "~/types";
import { uiwUidFormSections } from "~/schemas/master/uiw-uid.schema";
import { useUiwUid } from "~/composables/master/useUiwUid";
import { useAsyncDetail } from "~/composables/useAsyncDetail";

const {
  uiwUids,
  loading,
  detailLoading,
  fetchUiwUids,
  getUiwUidById,
  createUiwUid,
  updateUiwUid,
  deleteUiwUid,
} = useUiwUid();

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
} = useCrudState<UiwUidItem>({ resourceName: "UIW / UID" });

const uiwUidColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode", label: "Kode" },
  { key: "nama", label: "Nama" },
  { key: "alamat", label: "Alamat" },
  { key: "actions", label: "Aksi" },
];

onMounted(async () => {
  await fetchUiwUids();
});

const filteredData = computed(() => {
  if (!searchQuery.value) return uiwUids.value;
  const q = searchQuery.value.toLowerCase();
  return uiwUids.value.filter(
    (item) =>
      (item.kode && item.kode.toLowerCase().includes(q)) ||
      (item.nama && item.nama.toLowerCase().includes(q)) ||
      (item.alamat && item.alamat.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => paginateList(filteredData.value));

const handleCreate = () => {
  openCreateModal({
    kode: "",
    nama: "",
    alamat: "",
    keterangan: "",
  });
};

const handleEdit = (row: UiwUidItem) => {
  openEditModal({
    id: row.id,
    kode: row.kode,
    nama: row.nama,
    alamat: row.alamat || "",
    keterangan: row.keterangan || "",
  });
};

// Universal Async Detail Management (Guarded against race conditions & memory leaks)
const {
  isDetailModalOpen,
  detailRecord,
  detailLoading: asyncDetailLoading,
  handleView,
  closeDetailModal,
  openEditFromDetail,
} = useAsyncDetail<UiwUidItem>({
  fetchDetail: (id) => getUiwUidById(id),
  onEdit: (record) => handleEdit(record),
});

const handleDelete = (row: UiwUidItem) => {
  openDeleteDialog(row);
};

const confirmDelete = async () => {
  await executeDelete((id) => deleteUiwUid(String(id)));
};

const handleSave = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const payload = {
      kode: data.kode,
      nama: data.nama,
      alamat: data.alamat || undefined,
      keterangan: data.keterangan || undefined,
    };

    if (modalMode.value === "edit" && data.id) {
      await updateUiwUid(data.id, payload);
    } else {
      await createUiwUid(payload);
    }
    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    // Handled by global toast in useApi
  } finally {
    submitting.value = false;
  }
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const u = detailRecord.value;
  return [
    { label: "Kode", value: u.kode },
    { label: "Nama", value: u.nama },
    { label: "Alamat", value: u.alamat || "-" },
    { label: "Keterangan", value: u.keterangan || "-" },
  ];
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <BasePageHeader />

    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- Controls Bar -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" />
          </div>
          <BaseCreateButton resource="UIW_UID" @click="handleCreate" />
        </div>

        <!-- Table -->
        <BaseTable
          :columns="uiwUidColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchUiwUids"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #kode-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.kode }}</span>
          </template>

          <template #nama-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.nama }}</span>
          </template>

          <template #alamat-data="{ row }">
            <span class="text-xs text-gray-600 line-clamp-1">{{
              row.alamat || "-"
            }}</span>
          </template>

          <template #actions-data="{ row }">
            <BaseTableActions
              resource="UIW_UID"
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

    <!-- Form Modal -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="uiwUidFormSections"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail UIW / UID"
      subtitle="Informasi UIW / UID"
      :record="detailRecord"
      :data-items="detailDataItems"
      :loading="detailLoading || asyncDetailLoading"
      @close="closeDetailModal"
      @edit="openEditFromDetail()"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data UIW / UID"
      :message="`Apakah Anda yakin ingin menghapus data '${deleteTarget?.nama || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
