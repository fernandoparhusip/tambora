<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem, Up2dItem } from "~/types/master.types";
import type { TableColumn } from "~/types";
import { getUp2dFormSections } from "~/schemas/master/up2d.schema";
import { useUp2d } from "~/composables/master/useUp2d";
import { useAsyncDetail } from "~/composables/useAsyncDetail";
import { useUiwUid } from "~/composables/master/useUiwUid";

const {
  up2ds,
  loading,
  detailLoading,
  fetchUp2ds,
  getUp2dById,
  createUp2d,
  updateUp2d,
  deleteUp2d,
} = useUp2d();

const { uiwUidCombo, fetchUiwUidCombo } = useUiwUid();
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
const deleteTarget = ref<Up2dItem | null>(null);
const isDeleting = ref(false);

const up2dColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode", label: "Kode UP2D" },
  { key: "nama", label: "Nama UP2D" },
  { key: "uiw_uid_nama", label: "Induk UIW/UID" },
  { key: "alamat", label: "Alamat Kantor" },
  { key: "actions", label: "Aksi" },
];

onMounted(async () => {
  await Promise.allSettled([fetchUp2ds(), fetchUiwUidCombo()]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!searchQuery.value) return up2ds.value;
  const q = searchQuery.value.toLowerCase();
  return up2ds.value.filter(
    (item) =>
      (item.kode && item.kode.toLowerCase().includes(q)) ||
      (item.nama && item.nama.toLowerCase().includes(q)) ||
      (item.uiw_uid_nama && item.uiw_uid_nama.toLowerCase().includes(q)) ||
      (item.alamat && item.alamat.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const formSections = computed(() => getUp2dFormSections(uiwUidCombo.value));

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Data UP2D" : "Tambah Data UP2D",
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Ubah UP2D"
    : "Form Tambah UP2D",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    kode: "",
    nama: "",
    uiw_uid_id: "",
    alamat: "",
    keterangan: "",
  };
  modalOpen.value = true;
};



const handleEdit = (row: Up2dItem) => {
  modalMode.value = "edit";
  formData.value = {
    id: row.id,
    kode: row.kode,
    nama: row.nama,
    uiw_uid_id: row.uiw_uid_id || "",
    alamat: row.alamat || "",
    keterangan: row.keterangan || "",
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
} = useAsyncDetail<Up2dItem>({
  fetchDetail: (id) => getUp2dById(id),
  onEdit: (record) => handleEdit(record),
});

const handleDelete = (row: Up2dItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteUp2d(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
    toast.success("Berhasil!", "Data UP2D berhasil dihapus.");
  } catch (err: any) {
    // Handled by global toast in useApi
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
      uiw_uid_id: data.uiw_uid_id || undefined,
      alamat: data.alamat || undefined,
      keterangan: data.keterangan || undefined,
    };

    if (modalMode.value === "edit" && data.id) {
      await updateUp2d(data.id, payload);
    } else {
      await createUp2d(payload);
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
    { label: "Kode UP2D", value: u.kode },
    { label: "Nama UP2D", value: u.nama },
    { label: "Induk UIW / UID", value: u.uiw_uid_nama || u.uiw_uid_id || "-" },
    { label: "Alamat Kantor", value: u.alamat || "-" },
    { label: "Keterangan", value: u.keterangan || "-" },
  ];
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
          <BaseCreateButton resource="UP2D" @click="openCreateModal" />
        </div>

        <!-- Table -->
        <BaseTable
          :columns="up2dColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchUp2ds"
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

          <template #uiw_uid_nama-data="{ row }">
            <span v-if="row.uiw_uid_nama || row.uiw_uid_id" class="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {{ row.uiw_uid_nama || row.uiw_uid_id }}
            </span>
            <span v-else class="text-xs text-gray-400 italic">-</span>
          </template>

          <template #alamat-data="{ row }">
            <span class="text-xs text-gray-600 line-clamp-1">{{ row.alamat || '-' }}</span>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton type="edit" resource="UP2D" @click="handleEdit(row)" />
              <BaseActionButton type="delete" resource="UP2D" @click="handleDelete(row)" />
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
      :sections="formSections"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail UP2D"
      subtitle="Informasi UP2D"
      :record="detailRecord"
      :data-items="detailDataItems"
      :loading="detailLoading || asyncDetailLoading"
      @close="closeDetailModal"
      @edit="openEditFromDetail()"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data UP2D"
      :message="`Apakah Anda yakin ingin menghapus data '${deleteTarget?.nama || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
