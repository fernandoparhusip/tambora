<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { Key } from "@lucide/vue";
import type { DetailDataItem } from "~/types/master.types";
import { exportToExcel } from "~/utils/exportExcel";
import type { RoleItem, TableColumn } from "~/types";
import { aksesGrupFormSections } from "~/schemas/konfigurasi-aplikasi/akses-grup.schema";
import { useAksesGrup } from "~/composables/konfigurasi-aplikasi/useAksesGrup";

const {
  aksesGrups,
  loading,
  detailLoading,
  fetchAksesGrups,
  getAksesGrupById,
  createAksesGrup,
  updateAksesGrup,
  deleteAksesGrup,
} = useAksesGrup();
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
const detailRecord = ref<RoleItem | null>(null);

// Confirm Delete Dialog States
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<RoleItem | null>(null);
const isDeleting = ref(false);

const modalTitle = computed(() =>
  isEditMode.value ? "Ubah Data Akses Grup" : "Tambah Data Akses Grup",
);
const modalSubtitle = computed(() =>
  isEditMode.value ? "Form Ubah Data Akses Grup" : "Form Tambah Data Akses Grup",
);

const aksesGrupColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "code", label: "Kode Akses Grup" },
  { key: "name", label: "Nama Akses Grup" },
  { key: "description", label: "Deskripsi" },
  { key: "is_system", label: "Tipe" },
  { key: "actions", label: "Aksi" },
];

const formData = ref<Record<string, any>>({
  code: "",
  name: "",
  description: "",
});

onMounted(async () => {
  await fetchAksesGrups();
});

// Reset pagination when searching
watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredRows = computed(() => {
  if (!searchQuery.value) return aksesGrups.value;
  const q = searchQuery.value.toLowerCase();
  return aksesGrups.value.filter(
    (r) =>
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)),
  );
});

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

const handleExport = () => {
  exportToExcel(aksesGrupColumns, filteredRows.value, {
    fileName: "Data_Master_Akses_Grup_PLN",
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

const handleView = async (row: RoleItem) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
  try {
    const res = await getAksesGrupById(row.id);
    if (res) {
      detailRecord.value = res;
    }
  } catch {
    // Fallback to row data from table list
  }
};

const handleEdit = (row: RoleItem) => {
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
      "Mohon lengkapi Kode Akses Grup dan Nama Akses Grup.",
      "Validasi Form",
    );
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditMode.value && editingId.value) {
      await updateAksesGrup(editingId.value, {
        code: formData.value.code,
        name: formData.value.name,
        description: formData.value.description || formData.value.name,
        permissions: [],
      });
      toast.success(
        `Akses Grup '${formData.value.name}' berhasil diperbarui.`,
        "Sukses",
      );
    } else {
      await createAksesGrup({
        code: formData.value.code.toUpperCase().replace(/\s+/g, "_"),
        name: formData.value.name,
        description: formData.value.description || formData.value.name,
        permissions: [],
      });
      toast.success(
        `Akses Grup baru '${formData.value.name}' berhasil dibuat.`,
        "Sukses",
      );
    }

    isModalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    toast.error(
      err?.message || "Gagal menyimpan data akses grup.",
      "Terjadi Kesalahan",
    );
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = (row: RoleItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteAksesGrup(deleteTarget.value.id);
    toast.success(
      `Akses Grup '${deleteTarget.value.name}' berhasil dihapus.`,
      "Sukses",
    );
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (err: any) {
    toast.error(err?.message || "Gagal menghapus akses grup.", "Gagal Hapus");
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
      action: `Membuat Akses Grup ${detailRecord.value.name}`,
      timestamp: dt,
    },
  ];
});

const permissionSearch = ref("");

const detailPermissions = computed<string[]>(() => {
  return detailRecord.value?.permissions || [];
});

const filteredDetailPermissions = computed(() => {
  if (!permissionSearch.value) return detailPermissions.value;
  const q = permissionSearch.value.toLowerCase();
  return detailPermissions.value.filter((p) => p.toLowerCase().includes(q));
});

const getPermissionTooltipContent = (p: any) => {
  const key = typeof p === "string" ? p : p.Key || p.permission_key || "";
  const parts = key.split(".");
  const resource = p.ResourceCode || p.resource || parts[0] || "SISTEM";
  const action = p.ActionCode || p.action || parts[1] || "AKSI";
  const desc = p.Description || p.description;

  if (desc) {
    return `<div style="display: flex; flex-direction: column; gap: 2px;">
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="color: #34d399; font-weight: 700; font-size: 11px;">${resource}</span>
        <span style="color: #475569;">•</span>
        <span style="color: #6ee7b7; font-size: 10px; font-family: monospace; font-weight: 600;">${action}</span>
      </div>
      <div style="color: #e2e8f0; font-size: 11px; line-height: 1.3;">${desc}</div>
    </div>`;
  }

  return `<div style="display: flex; align-items: center; gap: 5px; white-space: nowrap; font-size: 11px; line-height: 1;">
    <span style="display: inline-block; width: 5px; height: 5px; border-radius: 9999px; background: #34d399; flex-shrink: 0;"></span>
    <span style="color: #94a3b8; line-height: 1;">Modul:</span>
    <span style="color: #f1f5f9; font-weight: 600; line-height: 1;">${resource}</span>
    <span style="color: #475569; margin: 0 1px; line-height: 1;">|</span>
    <span style="color: #94a3b8; line-height: 1;">Aksi:</span>
    <span style="color: #34d399; font-weight: 700; line-height: 1;">${action}</span>
  </div>`;
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  return [
    { label: "Kode Akses Grup", value: detailRecord.value.code },
    { label: "Nama Akses Grup", value: detailRecord.value.name },
    { label: "Deskripsi", value: detailRecord.value.description || "-" },
    {
      label: "Tipe",
      value: detailRecord.value.is_system ? "System" : "Custom",
      isStatus: true,
    },
    { label: "ID Akses Grup", value: detailRecord.value.id },
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

        <!-- Akses Grup Table -->
        <BaseTable
          :columns="aksesGrupColumns"
          :rows="paginatedRows"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchAksesGrups"
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

          <template #description-data="{ row }">
            <span
              class="text-xs text-gray-600 font-normal truncate max-w-xs block"
              :title="row.description"
            >
              {{ row.description || "-" }}
            </span>
          </template>

          <template #is_system-data="{ row }">
            <BaseBadge :variant="row.is_system ? 'info' : 'success'">
              {{ row.is_system ? "System" : "Custom" }}
            </BaseBadge>
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
                title="Ubah Akses Grup"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                type="delete"
                title="Hapus Akses Grup"
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
      :sections="aksesGrupFormSections"
      :submitting="isSubmitting"
      draft-key="konfigurasi-akses-grup"
      @submit="handleSave"
      @cancel="closeModal"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Akses Grup"
      subtitle="Informasi detail Akses Grup dan permission"
      :record-id="detailRecord?.id"
      :created-date="formattedCreatedDate"
      :created-by="(detailRecord as any)?.created_by || 'Admin'"
      :data-items="detailDataItems"
      :activity-logs="activityLogs"
      :loading="detailLoading"
      @close="isDetailModalOpen = false"
      @edit="openEditFromDetail"
    >
      <template #extra>
        <div class="mt-4 pt-4 border-t border-gray-100 space-y-4">
          <!-- Permissions Section -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span
                class="text-xs font-bold text-gray-700 flex items-center gap-1.5"
              >
                <Key class="w-4 h-4 text-emerald-600" />
                Akses Permission
              </span>
              <span
                v-if="detailPermissions.length"
                class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200"
              >
                {{ detailPermissions.length }} total
              </span>
            </div>

            <!-- Permission Search if permissions count > 6 -->
            <div v-if="detailPermissions.length > 6" class="mb-2.5">
              <input
                v-model="permissionSearch"
                type="text"
                placeholder="Cari akses permission..."
                class="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
              >
            </div>

            <div
              v-if="detailLoading"
              class="flex items-center justify-center py-4 text-xs text-gray-400 gap-2"
            >
              <svg
                class="animate-spin h-4 w-4 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <span>Memuat relasi hak akses...</span>
            </div>

            <div v-else>
              <!-- Permission Badges List -->
              <div
                v-if="filteredDetailPermissions.length > 0"
                class="max-h-56 overflow-y-auto p-1 flex flex-wrap gap-1.5"
              >
                <span
                  v-for="(p, pIdx) in filteredDetailPermissions"
                  :key="pIdx"
                  v-tooltip.top="{
                    value: getPermissionTooltipContent(p),
                    escape: false,
                    showDelay: 60,
                    hideDelay: 50,
                  }"
                  class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-gray-100 border border-gray-200/80 text-gray-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 transition-colors cursor-pointer select-none"
                >
                  {{ p }}
                </span>
              </div>

              <div
                v-else-if="detailPermissions.length > 0"
                class="py-3 text-center text-xs text-gray-400"
              >
                Tidak ada permission yang cocok dengan pencarian.
              </div>

              <div
                v-else
                class="py-3 text-center text-xs text-gray-400 italic"
              >
                Tidak ada hak akses permission yang terkait.
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseDetailModal>

    <!-- Confirm Delete Modal -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Akses Grup"
      :message="`Apakah Anda yakin ingin menghapus Akses Grup '${deleteTarget?.name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="isConfirmDialogOpen = false"
    />

    <!-- Success Modal -->
    <BaseSuccessModal
      v-model:is-open="isSuccessModalOpen"
      title="Berhasil Disimpan"
      :message="`Data Akses Grup '${formData.name}' berhasil disimpan.`"
      @close="isSuccessModalOpen = false"
    />
  </div>
</template>
