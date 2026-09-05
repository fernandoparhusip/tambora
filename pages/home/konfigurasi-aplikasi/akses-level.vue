<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type {
  DetailDataItem,
  ActivityLogItem,
} from "~/components/base/BaseDetailModal.vue";
import type { ScopeItem, TableColumn } from "~/types";
import { formatAppDateTime } from "~/utils/formatDate";
import { getAksesLevelFormSections } from "~/schemas/konfigurasi-aplikasi/akses-level.schema";
import { useAksesLevel } from "~/composables/konfigurasi-aplikasi/useAksesLevel";

const {
  aksesLevels,
  scopeTypeOptions,
  loading,
  fetchAksesLevels,
  fetchScopeTypeCombo,
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

// Confirm Delete Dialog States
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<ScopeItem | null>(null);
const isDeleting = ref(false);

const modalTitle = computed(() =>
  isEditMode.value ? "Ubah Data Akses Level" : "Tambah Data Akses Level",
);
const modalSubtitle = computed(() =>
  isEditMode.value
    ? "Form Ubah Akses Level"
    : "Form Tambah Akses Level",
);

const aksesLevelColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "name", label: "Nama" },
  { key: "scope_type_name", label: "Tipe" },
  { key: "description", label: "Deskripsi" },
  { key: "actions", label: "Aksi" },
];

const formData = ref<Record<string, any>>({
  code: "",
  name: "",
  scope_type_id: "",
  description: "",
});

const activeFormSections = computed(() =>
  getAksesLevelFormSections(scopeTypeOptions.value),
);

onMounted(async () => {
  await Promise.allSettled([fetchAksesLevels(), fetchScopeTypeCombo()]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredRows = computed(() => {
  const list = Array.isArray(aksesLevels.value) ? aksesLevels.value : [];
  if (!searchQuery.value) return list;
  const q = searchQuery.value.toLowerCase().trim();
  return list.filter((s) => {
    const code = (s.code || "").toLowerCase();
    const name = (s.name || "").toLowerCase();
    const desc = (s.description || "").toLowerCase();
    return code.includes(q) || name.includes(q) || desc.includes(q);
  });
});

const paginatedRows = computed(() => {
  const rows = filteredRows.value || [];
  const start = (currentPage.value - 1) * pageSize.value;
  return rows.slice(start, start + pageSize.value);
});

// Modal Handlers
const openCreateModal = async () => {
  isEditMode.value = false;
  editingId.value = null;
  formData.value = {
    code: "",
    name: "",
    scope_type_id: "",
    description: "",
  };
  if (scopeTypeOptions.value.length === 0) {
    await fetchScopeTypeCombo();
  }
  isModalOpen.value = true;
};

const handleEdit = async (row: ScopeItem) => {
  isEditMode.value = true;
  editingId.value = row.id;

  if (scopeTypeOptions.value.length === 0) {
    await fetchScopeTypeCombo();
  }

  const rawId = (row as any).scope_type_id;
  const isZeroUuid = rawId === "00000000-0000-0000-0000-000000000000";
  const matchedTypeId = scopeTypeOptions.value.find(
    (opt) =>
      opt.value === rawId ||
      opt.label.toLowerCase() === (row.scope_type_name || "").toLowerCase(),
  )?.value;

  formData.value = {
    code: row.code || "",
    name: row.name || "",
    scope_type_id: matchedTypeId || (rawId && !isZeroUuid ? rawId : ""),
    description: row.description || "",
  };
  isModalOpen.value = true;
};

// Universal Async Detail Management (Guarded against race conditions & memory leaks)
const {
  isDetailModalOpen,
  detailRecord,
  detailLoading,
  handleView,
  closeDetailModal,
  openEditFromDetail,
} = useAsyncDetail<ScopeItem>({
  fetchDetail: (id) => getAksesLevelById(id),
  onEdit: (record) => handleEdit(record),
});

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSave = async () => {
  const name = (formData.value.name || "").trim();
  const scopeTypeId = formData.value.scope_type_id;
  const description = (formData.value.description || "").trim() || name;

  if (!scopeTypeId || !name) {
    toast.error(
      "Mohon lengkapi Tipe Akses Level dan Nama Akses Level.",
      "Validasi Form",
    );
    return;
  }

  isSubmitting.value = true;
  try {
    const payload: {
      name: string;
      scope_type_id: string;
      description: string;
      code?: string;
    } = {
      name,
      scope_type_id: scopeTypeId,
      description,
    };

    if (isEditMode.value && editingId.value) {
      // Backend scopes table requires 'code' not to be empty/omitted on update
      const existing = aksesLevels.value.find((s) => s.id === editingId.value);
      const codeToKeep = (formData.value.code || existing?.code || "").trim();
      if (codeToKeep) {
        payload.code = codeToKeep;
      }
      await updateAksesLevel(editingId.value, payload);
      toast.success(`Akses Level '${name}' berhasil diperbarui.`, "Sukses");
    } else {
      const codeToUse =
        (formData.value.code || "").trim() ||
        name
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      if (codeToUse) {
        payload.code = codeToUse;
      }
      await createAksesLevel(payload);
      toast.success(`Akses Level baru '${name}' berhasil dibuat.`, "Sukses");
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
  return formatAppDateTime(detailRecord.value.created_at);
});

const activityLogs = computed<ActivityLogItem[]>(() => {
  if (!detailRecord.value) return [];

  const historyList = (detailRecord.value as any)?.history;
  if (Array.isArray(historyList) && historyList.length > 0) {
    return historyList.map((item: any) => {
      const userName =
        item.user_name ||
        item.updated_by_name ||
        item.created_by_name ||
        (detailRecord.value as any)?.created_by_name ||
        "Super Administrator";
      const initial = userName.charAt(0).toUpperCase();
      const actionText =
        item.title ||
        (item.action === "CREATE"
          ? `Membuat Akses Level ${detailRecord.value?.name || ""}`
          : item.action === "UPDATE"
            ? `Mengubah Akses Level ${detailRecord.value?.name || ""}`
            : item.action || "Aktivitas Akses Level");
      const dt = formatAppDateTime(item.created_at || item.updated_at);
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
      action: `Membuat Akses Level ${detailRecord.value?.name || ""}`.trim(),
      timestamp: formattedCreatedDate.value,
    },
  ];
});

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  return [
    { label: "Kode", value: detailRecord.value.code },
    { label: "Nama", value: detailRecord.value.name },
    {
      label: "Tipe",
      value:
        detailRecord.value.scope_type_name ||
        detailRecord.value.scope_type_code ||
        "Organization",
      isStatus: false,
    },
    { label: "Deskripsi", value: detailRecord.value.description || "-" },
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
            <BaseSearchInput v-model="searchQuery" />
          </div>
          <BaseCreateButton resource="SCOPE" @click="openCreateModal" />
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
            <span class="text-xs text-gray-700">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #name-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.name }}</span>
          </template>

          <template #scope_type_name-data="{ row }">
            {{ row.scope_type_name || "-" }}
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
                resource="SCOPE"
                title="Ubah Akses Level"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                type="delete"
                resource="SCOPE"
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
      :sections="activeFormSections"
      :submitting="isSubmitting"
      draft-key="konfigurasi-akses-level"
      @submit="handleSave"
      @cancel="closeModal"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Akses Level"
      subtitle="Informasi Akses Level"
      :record-id="detailRecord?.id"
      :created-date="formattedCreatedDate"
      :created-by="
        (detailRecord as any)?.created_by_name ||
        (detailRecord as any)?.created_by ||
        'Admin'
      "
      :data-items="detailDataItems"
      :activity-logs="activityLogs"
      :loading="detailLoading"
      @close="closeDetailModal"
      @edit="openEditFromDetail()"
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
