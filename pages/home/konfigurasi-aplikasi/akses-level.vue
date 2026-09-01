<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem } from "~/types/master.types";
import { exportToExcel } from "~/utils/exportExcel";
import type { ScopeItem, TableColumn } from "~/types";
import { aksesLevelFormSections } from "~/schemas/konfigurasi-aplikasi/akses-level.schema";
import { useAksesLevel } from "~/composables/konfigurasi-aplikasi/useAksesLevel";

const {
  aksesLevels,
  loading,
  detailLoading,
  fetchAksesLevels,
  getAksesLevelById,
  createAksesLevel,
  updateAksesLevel,
  deleteAksesLevel,
} = useAksesLevel();
const toast = useAppToast();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

// Form Modal States
const isModalOpen = ref(false);
const isEditMode = ref(false);
const editingId = ref<string | null>(null);
const isSubmitting = ref(false);
const isSuccessModalOpen = ref(false);

// Detail Modal States
const isDetailModalOpen = ref(false);
const detailRecord = ref<ScopeItem | null>(null);

// Confirm Delete Dialog States
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<ScopeItem | null>(null);
const isDeleting = ref(false);

const modalTitle = computed(() =>
  isEditMode.value ? "Ubah Data Akses Level" : "Tambah Data Akses Level",
);
const modalSubtitle = computed(() =>
  isEditMode.value
    ? "Form Ubah Akses Level Regional / Unit"
    : "Form Tambah Akses Level Regional / Unit",
);

const aksesLevelColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "code", label: "Kode Akses Level" },
  { key: "name", label: "Nama Akses Level" },
  { key: "scope_type_name", label: "Tipe" },
  { key: "description", label: "Deskripsi" },
  { key: "actions", label: "Aksi" },
];

const formData = ref<Record<string, any>>({
  code: "",
  name: "",
  description: "",
});

onMounted(async () => {
  await fetchAksesLevels();
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredRows = computed(() => {
  if (!searchQuery.value) return aksesLevels.value;
  const q = searchQuery.value.toLowerCase();
  return aksesLevels.value.filter(
    (s) =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)),
  );
});

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

const handleExport = () => {
  exportToExcel(aksesLevelColumns, filteredRows.value, {
    fileName: "Data_Master_Akses_Level_PLN",
  });
};

// Modal Handlers
const openCreateModal = () => {
  isEditMode.value = false;
  editingId.value = null;
  formData.value = {
    code: "",
    name: "",
    description: "",
  };
  isModalOpen.value = true;
};

const handleView = async (row: ScopeItem) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
  try {
    const res = await getAksesLevelById(row.id);
    if (res) {
      detailRecord.value = res;
    }
  } catch {
    // Fallback to row data from table list
  }
};

const handleEdit = (row: ScopeItem) => {
  isEditMode.value = true;
  editingId.value = row.id;
  formData.value = {
    code: row.code,
    name: row.name,
    description: row.description || "",
  };
  isModalOpen.value = true;
};

const openEditFromDetail = () => {
  if (detailRecord.value) {
    handleEdit(detailRecord.value);
  }
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSave = async () => {
  if (!formData.value.code || !formData.value.name) {
    toast.error(
      "Mohon lengkapi Kode Akses Level dan Nama Akses Level.",
      "Validasi Form",
    );
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateAksesLevel(editingId.value, {
        code: formData.value.code,
        name: formData.value.name,
        description: formData.value.description || formData.value.name,
      });
      toast.success(
        `Akses Level '${formData.value.name}' berhasil diperbarui.`,
        "Sukses",
      );
    } else {
      await createAksesLevel({
        code: formData.value.code.toUpperCase().replace(/\s+/g, "-"),
        name: formData.value.name,
        description: formData.value.description || formData.value.name,
      });
      toast.success(
        `Akses Level baru '${formData.value.name}' berhasil dibuat.`,
        "Sukses",
      );
    }

    isModalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    toast.error(
      err?.message || "Gagal menyimpan data akses level.",
      "Terjadi Kesalahan",
    );
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = (row: ScopeItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteAksesLevel(deleteTarget.value.id);
    toast.success(
      `Akses Level '${deleteTarget.value.name}' berhasil dihapus.`,
      "Sukses",
    );
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (err: any) {
    toast.error(err?.message || "Gagal menghapus akses level.", "Gagal Hapus");
  } finally {
    isDeleting.value = false;
  }
};

// Detail Data Items
const formattedCreatedDate = computed(() => {
  if (!detailRecord.value?.created_at) return "-";
  return new Date(detailRecord.value.created_at).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });
});

const activityLogs = computed(() => {
  if (!detailRecord.value) return [];
  const dt = detailRecord.value.created_at
    ? new Date(detailRecord.value.created_at).toLocaleString("id-ID", {
        dateStyle: "full",
        timeStyle: "short",
      })
    : "-";
  return [
    {
      initial: (
        ((detailRecord.value as any)?.created_by as string) || "A"
      )
        .charAt(0)
        .toUpperCase(),
      user: ((detailRecord.value as any)?.created_by as string) || "Admin",
      action: `Membuat Akses Level ${detailRecord.value.name}`,
      timestamp: dt,
    },
  ];
});

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  return [
    { label: "Kode Akses Level", value: detailRecord.value.code },
    { label: "Nama Akses Level", value: detailRecord.value.name },
    {
      label: "Tipe",
      value:
        detailRecord.value.scope_type_name ||
        detailRecord.value.scope_type_code ||
        "Organization",
      isStatus: true,
    },
    { label: "Deskripsi", value: detailRecord.value.description || "-" },
    { label: "ID Akses Level", value: detailRecord.value.id },
  ];
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <!-- Header Page -->
    <BasePageHeader />

    <!-- Main Content Panel -->
    <div class="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- Action Header Bar -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Data" />
            <BaseExportButton @click="handleExport" />
          </div>
          <BaseCreateButton label="TAMBAH DATA" @click="openCreateModal" />
        </div>

        <!-- Akses Level Table -->
        <BaseTable
          :columns="aksesLevelColumns"
          :rows="paginatedRows"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchAksesLevels"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #code-data="{ row }">
            <span class="text-xs font-semibold text-sky-800 font-mono">
              {{ row.code }}
            </span>
          </template>

          <template #name-data="{ row }">
            <span class="text-xs text-gray-900 font-medium">{{
              row.name
            }}</span>
          </template>

          <template #scope_type_name-data="{ row }">
            <BaseBadge variant="info">
              {{ row.scope_type_name || row.scope_type_code || "Organization" }}
            </BaseBadge>
          </template>

          <template #description-data="{ row }">
            <span
              class="text-xs text-gray-600 font-normal truncate max-w-xs block"
              :title="row.description"
            >
              {{ row.description || "-" }}
            </span>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton
                type="view"
                title="Lihat Detail"
                @click="handleView(row)"
              />
              <BaseActionButton
                type="edit"
                title="Ubah Akses Level"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                type="delete"
                title="Hapus Akses Level"
                @click="handleDelete(row)"
              />
            </div>
          </template>
        </BaseTable>

        <!-- Pagination -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredRows.length"
          class="shrink-0 pt-4 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- Form Modal (Create / Edit) -->
    <BaseFormModal
      v-model:is-open="isModalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="aksesLevelFormSections"
      :submitting="isSubmitting"
      draft-key="konfigurasi-akses-level"
      @submit="handleSave"
      @cancel="closeModal"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Akses Level"
      subtitle="Informasi lengkap cakupan Akses Level"
      :record-id="detailRecord?.id"
      :created-date="formattedCreatedDate"
      :created-by="(detailRecord as any)?.created_by || 'Admin'"
      :data-items="detailDataItems"
      :activity-logs="activityLogs"
      :loading="detailLoading"
      @close="isDetailModalOpen = false"
      @edit="openEditFromDetail"
    />

    <!-- Confirm Delete Modal -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Akses Level"
      :message="`Apakah Anda yakin ingin menghapus Akses Level '${deleteTarget?.name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="isConfirmDialogOpen = false"
    />

    <!-- Success Modal -->
    <BaseSuccessModal
      v-model:is-open="isSuccessModalOpen"
      title="Berhasil Disimpan"
      :message="`Data Akses Level '${formData.name}' berhasil disimpan.`"
      @close="isSuccessModalOpen = false"
    />
  </div>
</template>
