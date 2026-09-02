<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem, UiwUidItem } from "~/types/master.types";
import type { TableColumn } from "~/types";
import { uiwUidFormSections } from "~/schemas/master/uiw-uid.schema";
import { useUiwUid } from "~/composables/master/useUiwUid";

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
const deleteTarget = ref<UiwUidItem | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<UiwUidItem | null>(null);

const uiwUidColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode", label: "Kode UIW / UID" },
  { key: "nama", label: "Nama Unit Induk" },
  { key: "alamat", label: "Alamat Kantor" },
  { key: "actions", label: "Aksi" },
];

onMounted(async () => {
  await fetchUiwUids();
});

watch(searchQuery, () => {
  currentPage.value = 1;
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

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Data UIW / UID" : "Tambah Data UIW / UID",
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Perubahan Unit Induk Wilayah / Distribusi PLN"
    : "Form Penambahan Unit Induk Wilayah / Distribusi PLN",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    kode: "",
    nama: "",
    alamat: "",
    keterangan: "",
  };
  modalOpen.value = true;
};

const handleView = async (row: UiwUidItem) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
  try {
    const fresh = await getUiwUidById(row.id);
    if (fresh) detailRecord.value = fresh;
  } catch {
    // Keep local fallback
  }
};

const handleEdit = (row: UiwUidItem) => {
  modalMode.value = "edit";
  formData.value = {
    id: row.id,
    kode: row.kode,
    nama: row.nama,
    alamat: row.alamat || "",
    keterangan: row.keterangan || "",
  };
  modalOpen.value = true;
};

const handleDelete = (row: UiwUidItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteUiwUid(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
    toast.success("Berhasil!", "Data UIW / UID berhasil dihapus.");
  } catch (err: any) {
    toast.error("Gagal!", err?.message || "Gagal menghapus data UIW / UID.");
  } finally {
    isDeleting.value = false;
  }
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
    isSuccessModalOpen.value = true;
  } catch (err: any) {
    toast.error("Gagal Menyimpan!", err?.message || "Terjadi kesalahan saat menyimpan data.");
  } finally {
    submitting.value = false;
  }
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const u = detailRecord.value;
  return [
    { label: "Kode UIW / UID", value: u.kode },
    { label: "Nama Unit Induk", value: u.nama },
    { label: "Alamat Kantor", value: u.alamat || "-" },
    { label: "Keterangan", value: u.keterangan || "-" },
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
            <span class="font-semibold text-gray-800 font-mono text-xs">{{ row.kode }}</span>
          </template>

          <template #nama-data="{ row }">
            <span class="font-medium text-gray-900 text-xs">{{ row.nama }}</span>
          </template>

          <template #alamat-data="{ row }">
            <span class="text-xs text-gray-600 line-clamp-1">{{ row.alamat || '-' }}</span>
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
      :sections="uiwUidFormSections"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Master UIW / UID"
      subtitle="Informasi data master Unit Induk Wilayah / Distribusi"
      :data-items="detailDataItems"
      :created-date="createdDateFormatted"
      :is-loading="detailLoading"
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
