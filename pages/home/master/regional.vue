<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem, RegionalItem } from "~/types/master.types";
import type { TableColumn } from "~/types";
import { regionalFormSections } from "~/schemas/master/regional.schema";
import { useRegional } from "~/composables/master/useRegional";

const {
  regionals,
  loading,
  detailLoading,
  fetchRegionals,
  getRegionalById,
  createRegional,
  updateRegional,
  deleteRegional,
} = useRegional();
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
const deleteTarget = ref<RegionalItem | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<RegionalItem | null>(null);

const regionalColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode_regional", label: "Kode Regional" },
  { key: "nama_regional", label: "Nama Regional" },
  { key: "coordinates", label: "Koordinat (Lat, Lng)" },
  { key: "actions", label: "Aksi" },
];

onMounted(async () => {
  await fetchRegionals();
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!searchQuery.value) return regionals.value;
  const q = searchQuery.value.toLowerCase();
  return regionals.value.filter(
    (item) =>
      (item.kode_regional && item.kode_regional.toLowerCase().includes(q)) ||
      (item.nama_regional && item.nama_regional.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Data Regional" : "Tambah Data Regional",
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Perubahan Master Regional PLN"
    : "Form Penambahan Master Regional PLN",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    kode_regional: "",
    nama_regional: "",
    latitude: null,
    longitude: null,
  };
  modalOpen.value = true;
};

const handleView = async (row: RegionalItem) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
  try {
    const fresh = await getRegionalById(row.id);
    if (fresh) detailRecord.value = fresh;
  } catch {
    // Keep local row fallback
  }
};

const handleEdit = (row: RegionalItem) => {
  modalMode.value = "edit";
  formData.value = {
    id: row.id,
    kode_regional: row.kode_regional,
    nama_regional: row.nama_regional,
    latitude: row.latitude,
    longitude: row.longitude,
  };
  modalOpen.value = true;
};

const handleDelete = (row: RegionalItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteRegional(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
    toast.success("Berhasil!", "Data master regional berhasil dihapus.");
  } catch (err: any) {
    toast.error("Gagal!", err?.message || "Gagal menghapus data regional.");
  } finally {
    isDeleting.value = false;
  }
};

const handleSave = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const payload = {
      kode_regional: data.kode_regional,
      nama_regional: data.nama_regional,
      latitude: data.latitude ? Number(data.latitude) : undefined,
      longitude: data.longitude ? Number(data.longitude) : undefined,
    };

    if (modalMode.value === "edit" && data.id) {
      await updateRegional(data.id, payload);
    } else {
      await createRegional(payload);
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
  const r = detailRecord.value;
  return [
    { label: "Kode Regional", value: r.kode_regional },
    { label: "Nama Regional", value: r.nama_regional },
    { label: "Latitude", value: r.latitude != null ? String(r.latitude) : "-" },
    { label: "Longitude", value: r.longitude != null ? String(r.longitude) : "-" },
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
          :columns="regionalColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchRegionals"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #kode_regional-data="{ row }">
            <span class="font-semibold text-gray-800 font-mono text-xs">{{ row.kode_regional }}</span>
          </template>

          <template #nama_regional-data="{ row }">
            <span class="font-medium text-gray-900 text-xs">{{ row.nama_regional }}</span>
          </template>

          <template #coordinates-data="{ row }">
            <span v-if="row.latitude != null && row.longitude != null" class="text-xs text-gray-600 font-mono">
              {{ row.latitude }}, {{ row.longitude }}
            </span>
            <span v-else class="text-xs text-gray-400 italic">Belum diset</span>
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
      :sections="regionalFormSections"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Master Regional"
      subtitle="Informasi data master regional PLN"
      :data-items="detailDataItems"
      :created-date="createdDateFormatted"
      :is-loading="detailLoading"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Regional"
      :message="`Apakah Anda yakin ingin menghapus data regional '${deleteTarget?.nama_regional || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
