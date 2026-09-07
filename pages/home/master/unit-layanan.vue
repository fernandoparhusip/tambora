<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem, UnitLayananItem } from "~/types/master.types";
import type { TableColumn } from "~/types";
import { getUnitLayananFormSections } from "~/schemas/master/unit-layanan.schema";
import { useUnitLayanan } from "~/composables/master/useUnitLayanan";
import { useAsyncDetail } from "~/composables/useAsyncDetail";
import { useUpk } from "~/composables/master/useUpk";

const {
  unitLayanans,
  loading,
  detailLoading,
  fetchUnitLayanans,
  getUnitLayananById,
  createUnitLayanan,
  updateUnitLayanan,
  deleteUnitLayanan,
} = useUnitLayanan();

const { upks, fetchUpks } = useUpk();
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
const deleteTarget = ref<UnitLayananItem | null>(null);
const isDeleting = ref(false);

const unitLayananColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "upk_nama", label: "UPK" },
  { key: "kode", label: "Kode" },
  { key: "nama", label: "Nama" },
  { key: "is_active", label: "Status" },
  { key: "actions", label: "Aksi" },
];

onMounted(async () => {
  await Promise.allSettled([fetchUnitLayanans(), fetchUpks()]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const upkOptions = computed(() =>
  upks.value.map((u) => ({
    label: u.nama ? `${u.kode} - ${u.nama}` : u.kode,
    value: u.id,
  })),
);

const formSections = computed(() =>
  getUnitLayananFormSections(upkOptions.value),
);

const filteredData = computed(() => {
  if (!searchQuery.value) return unitLayanans.value;
  const q = searchQuery.value.toLowerCase();
  return unitLayanans.value.filter(
    (item) =>
      (item.kode && item.kode.toLowerCase().includes(q)) ||
      (item.nama && item.nama.toLowerCase().includes(q)) ||
      (item.upk_nama && item.upk_nama.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit"
    ? "Edit Data Unit Layanan"
    : "Tambah Data Unit Layanan",
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Ubah Unit Layanan"
    : "Form Tambah Unit Layanan",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    kode: "",
    nama: "",
    upk_id: "",
    is_active: null,
  };
  modalOpen.value = true;
};

const handleEdit = (row: UnitLayananItem) => {
  modalMode.value = "edit";
  formData.value = {
    id: row.id,
    kode: row.kode,
    nama: row.nama,
    upk_id: row.upk_id || "",
    is_active: row.is_active ?? true,
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
} = useAsyncDetail<UnitLayananItem>({
  fetchDetail: (id) => getUnitLayananById(id),
  onEdit: (record) => handleEdit(record),
});

const handleDelete = (row: UnitLayananItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteUnitLayanan(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
    toast.success("Berhasil!", "Data Unit Layanan berhasil dihapus.");
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
      upk_id: data.upk_id || undefined,
      is_active:
        data.is_active !== undefined ? Boolean(data.is_active) : undefined,
    };

    if (modalMode.value === "edit" && data.id) {
      await updateUnitLayanan(data.id, payload);
    } else {
      await createUnitLayanan(payload);
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
    { label: "UPK", value: u.upk_nama || u.upk_id || "-" },
    { label: "Kode", value: u.kode },
    { label: "Nama", value: u.nama },
    { label: "Status", value: u.is_active !== false ? "Aktif" : "Non-Aktif" },
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
          <BaseCreateButton resource="UNIT_LAYANAN" @click="openCreateModal" />
        </div>

        <!-- Table -->
        <BaseTable
          :columns="unitLayananColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchUnitLayanans"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #upk_nama-data="{ row }">
            <span
              v-if="row.upk_nama || row.upk_id"
              class="text-xs text-gray-600"
            >
              {{ row.upk_nama || row.upk_id }}
            </span>
            <span v-else class="text-xs text-gray-600">-</span>
          </template>

          <template #kode-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.kode }}</span>
          </template>

          <template #nama-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.nama }}</span>
          </template>

          <template #is_active-data="{ row }">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
              :class="
                row.is_active !== false
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              "
            >
              {{ row.is_active !== false ? "Aktif" : "Non-Aktif" }}
            </span>
          </template>

          <template #actions-data="{ row }">
            <BaseTableActions
              resource="UNIT_LAYANAN"
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
      :sections="formSections"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Unit Layanan"
      subtitle="Informasi Unit Layanan"
      :record="detailRecord"
      :data-items="detailDataItems"
      :loading="detailLoading || asyncDetailLoading"
      @close="closeDetailModal"
      @edit="openEditFromDetail()"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Unit Layanan"
      :message="`Apakah Anda yakin ingin menghapus data '${deleteTarget?.nama || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
