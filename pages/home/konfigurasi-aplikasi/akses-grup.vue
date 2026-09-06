<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { Key, RotateCcw } from "@lucide/vue";

import type { DetailDataItem } from "~/types/master.types";
import type { RoleItem, TableColumn, PermissionItem } from "~/types";
import type { ActivityLogItem } from "~/components/base/BaseDetailModal.vue";
import { useAksesGrup } from "~/composables/konfigurasi-aplikasi/useAksesGrup";
import { usePermission } from "~/composables/master/usePermission";
import { useAsyncDetail } from "~/composables/useAsyncDetail";
import { aksesGrupFormSections } from "~/schemas/konfigurasi-aplikasi/akses-grup.schema";
import { formatAppDateTime } from "~/utils/formatDate";

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
const {
  permissions: allPermissions,
  fetchPermissions,
  loading: permissionsLoading,
} = usePermission();
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
const deleteTarget = ref<RoleItem | null>(null);
const isDeleting = ref(false);

const modalTitle = computed(() =>
  isEditMode.value ? "Ubah Akses Grup" : "Tambah Akses Grup",
);
const modalSubtitle = computed(() =>
  isEditMode.value
    ? "Form Perubahan Master Akses Grup"
    : "Form Penambahan Master Akses Grup",
);

const aksesGrupColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "name", label: "Nama" },
  { key: "description", label: "Deskripsi" },
  { key: "actions", label: "Aksi" },
];

const formData = ref<Record<string, any>>({
  code: "",
  name: "",
  description: "",
});

// Permission checklist state
const selectedPermissionIds = ref<Set<string>>(new Set());
const selectedPermissionKeys = ref<Set<string>>(new Set());
const matrixSearch = ref("");

function formatResourceName(code: string): string {
  const mapping: Record<string, string> = {
    SENTRAL: "Sentral Pembangkit",
    CABANG: "Master Cabang",
    RANTING: "Master Ranting",
    REGIONAL: "Master Regional",
    USER: "Pengguna (User)",
    ROLE: "Akses Grup (Role)",
    PERMISSION: "Hak Akses (Permission)",
    SCOPE: "Akses Level (Scope)",
    ORGANIZATION: "Master Organisasi",
    SYSTEM: "Master Sistem",
    ASSET: "Asset Mesin Pembangkit",
    MACHINE_CONDITION: "Kondisi Mesin",
    DRIVER: "Master Pengemudi",
    OPERASI_HARIAN: "Operasi Harian",
    OPERASI: "Operasi Pembangkit",
    BAHAN_BAKAR: "Pemakaian Bahan Bakar",
    PEMBEBANAN: "Pembebanan Generator",
    PAGU: "Pagu Anggaran",
    PROGNOSA: "Prognosa Kinerja",
    NKO: "Perhitungan NKO",
  };
  return (
    mapping[code] ||
    code.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

onMounted(async () => {
  await Promise.allSettled([fetchAksesGrups(), fetchPermissions()]);
});

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

const syncPermissionsToFormData = () => {
  formData.value = {
    ...formData.value,
    permissions: Array.from(selectedPermissionKeys.value),
    permission_ids: Array.from(selectedPermissionIds.value),
  };
};

// Sync permissions back when draft is restored or formData changes
watch(
  () => formData.value?.permissions,
  (newPerms) => {
    if (!isModalOpen.value) return;
    if (Array.isArray(newPerms)) {
      selectedPermissionKeys.value = new Set(newPerms);
      selectedPermissionIds.value = new Set(
        formData.value?.permission_ids || [],
      );
      if (
        selectedPermissionIds.value.size === 0 &&
        allPermissions.value.length > 0
      ) {
        newPerms.forEach((pKey: string) => {
          const matched = allPermissions.value.find(
            (item) => item.permission_key === pKey || item.id === pKey,
          );
          if (matched) selectedPermissionIds.value.add(matched.id);
        });
      }
    }
  },
  { deep: true },
);

const togglePermission = (p: PermissionItem) => {
  const id = p.id || p.permission_key;
  const key = p.permission_key || p.id;

  if (
    selectedPermissionIds.value.has(id) ||
    selectedPermissionKeys.value.has(key)
  ) {
    selectedPermissionIds.value.delete(id);
    selectedPermissionKeys.value.delete(key);
  } else {
    selectedPermissionIds.value.add(id);
    selectedPermissionKeys.value.add(key);
  }
  syncPermissionsToFormData();
};

const isPermissionSelected = (p?: PermissionItem): boolean => {
  if (!p) return false;
  return (
    selectedPermissionIds.value.has(p.id) ||
    selectedPermissionKeys.value.has(p.permission_key)
  );
};

const isAllPermissionsSelected = computed(() => {
  if (allPermissions.value.length === 0) return false;
  return allPermissions.value.every((p) => isPermissionSelected(p));
});

const selectAllGlobal = () => {
  allPermissions.value.forEach((p) => {
    selectedPermissionIds.value.add(p.id || p.permission_key);
    selectedPermissionKeys.value.add(p.permission_key || p.id);
  });
  syncPermissionsToFormData();
};

const clearAllGlobal = () => {
  selectedPermissionIds.value.clear();
  selectedPermissionKeys.value.clear();
  syncPermissionsToFormData();
};

const toggleAllPermissions = () => {
  if (isAllPermissionsSelected.value) {
    clearAllGlobal();
  } else {
    selectAllGlobal();
  }
};

const selectedModuleFilter = ref("");

const moduleFilterOptions = computed(() => {
  const map = new Map<string, string>();
  allPermissions.value.forEach((p) => {
    const code = p.resource_code || "SISTEM";
    const name = p.resource_name || formatResourceName(code);
    map.set(code, name);
  });
  return [
    { label: "Semua Modul", value: "" },
    ...Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([code, name]) => ({
        label: name,
        value: code,
      })),
  ];
});

const getPermissionCardTitle = (p: PermissionItem): string => {
  const act = p.action_name || p.action_code;
  const res = p.resource_name || formatResourceName(p.resource_code || "");
  if (act && res) {
    return `${act} ${res}`;
  }
  return p.description || p.permission_key || "Hak Akses";
};

const filteredPermissionCards = computed(() => {
  let list = allPermissions.value;
  if (selectedModuleFilter.value) {
    list = list.filter(
      (p) => (p.resource_code || "SISTEM") === selectedModuleFilter.value,
    );
  }
  if (matrixSearch.value.trim()) {
    const q = matrixSearch.value.toLowerCase().trim();
    list = list.filter((p) => {
      const title = getPermissionCardTitle(p).toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const key = (p.permission_key || "").toLowerCase();
      return title.includes(q) || desc.includes(q) || key.includes(q);
    });
  }
  return list;
});

const openCreateModal = () => {
  if (allPermissions.value.length === 0) {
    fetchPermissions().catch(() => {});
  }
  isEditMode.value = false;
  editingId.value = null;
  formData.value = {
    code: "",
    name: "",
    description: "",
    permissions: [],
    permission_ids: [],
  };
  selectedPermissionIds.value.clear();
  selectedPermissionKeys.value.clear();
  matrixSearch.value = "";
  isModalOpen.value = true;
};

// Universal Async Detail Management (Guarded against race conditions & memory leaks)
const {
  isDetailModalOpen,
  detailRecord,
  detailLoading: asyncDetailLoading,
  handleView: baseHandleView,
  closeDetailModal,
  openEditFromDetail,
} = useAsyncDetail<RoleItem>({
  fetchDetail: (id) => getAksesGrupById(id),
  onEdit: (record) => handleEdit(record),
});

const handleView = (row: RoleItem) => {
  permissionSearch.value = "";
  baseHandleView(row);
};

const handleEdit = async (row: RoleItem) => {
  if (allPermissions.value.length === 0) {
    await fetchPermissions().catch(() => {});
  }
  isEditMode.value = true;
  editingId.value = row.id;
  formData.value = {
    code: row.code,
    name: row.name,
    description: row.description || "",
    permissions: [],
    permission_ids: [],
  };
  selectedPermissionIds.value.clear();
  selectedPermissionKeys.value.clear();
  matrixSearch.value = "";

  try {
    const res = await getAksesGrupById(row.id);
    const perms = res?.permissions || (row as any).permissions || [];
    perms.forEach((p: any) => {
      if (typeof p === "string") {
        selectedPermissionKeys.value.add(p);
        const matched = allPermissions.value.find(
          (item) => item.permission_key === p || item.id === p,
        );
        if (matched) selectedPermissionIds.value.add(matched.id);
      } else if (p && typeof p === "object") {
        if (p.id) selectedPermissionIds.value.add(p.id);
        if (p.permission_key)
          selectedPermissionKeys.value.add(p.permission_key);
      }
    });
    syncPermissionsToFormData();
  } catch {
    // Fallback
  }

  isModalOpen.value = true;
};

const handleSave = async (data?: Record<string, any>) => {
  const currentData = data || formData.value;
  if (!currentData.code || !currentData.name || !currentData.description) {
    toast.error(
      "Mohon lengkapi Kode Role, Nama Role, dan Deskripsi.",
      "Validasi Form",
    );
    return;
  }

  isSubmitting.value = true;
  try {
    const permissionIdsArray = Array.from(selectedPermissionIds.value);
    const permissionKeysArray = Array.from(selectedPermissionKeys.value);

    const payload = {
      code: currentData.code.toUpperCase().replace(/\s+/g, "_"),
      name: currentData.name,
      description: currentData.description || currentData.name,
      permission_ids: permissionIdsArray,
      permissions: permissionKeysArray,
    };

    if (isEditMode.value && editingId.value) {
      await updateAksesGrup(editingId.value, payload);
      toast.success(
        `Role '${currentData.name}' berhasil diperbarui.`,
        "Sukses",
      );
    } else {
      await createAksesGrup(payload);
      toast.success(
        `Role baru '${currentData.name}' berhasil dibuat.`,
        "Sukses",
      );
    }

    isModalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    toast.error(
      err?.message || "Gagal menyimpan data role.",
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
      `Role '${deleteTarget.value.name}' berhasil dihapus.`,
      "Sukses",
    );
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (err: any) {
    toast.error(err?.message || "Gagal menghapus role.", "Gagal Hapus");
  } finally {
    isDeleting.value = false;
  }
};

// Detail Data Items
const formattedCreatedDate = computed(() => {
  if (!detailRecord.value?.created_at) return "-";
  return formatAppDateTime(detailRecord.value.created_at);
});

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  return [
    { label: "Kode", value: detailRecord.value.code },
    { label: "Nama", value: detailRecord.value.name },
    { label: "Deskripsi", value: detailRecord.value.description || "-" },
  ];
});

const activityLogs = computed<ActivityLogItem[]>(() => {
  if (!detailRecord.value) return [];

  const historyList = (detailRecord.value as any)?.history;
  if (Array.isArray(historyList) && historyList.length > 0) {
    return historyList.map((item: any) => {
      const userName =
        item.user_name ||
        item.created_by_name ||
        item.updated_by_name ||
        (detailRecord.value as any)?.created_by_name ||
        "Super Administrator";
      const initial = (userName || "S").charAt(0).toUpperCase();
      const actionText =
        item.title ||
        (item.action === "CREATE"
          ? `Membuat Akses Grup ${detailRecord.value?.name || ""}`.trim()
          : item.action === "UPDATE"
            ? `Mengubah Akses Grup ${detailRecord.value?.name || ""}`.trim()
            : item.action || "Aktivitas Akses Grup");
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
    "Super Administrator";
  return [
    {
      initial: creator.charAt(0).toUpperCase(),
      user: creator,
      action: `Membuat Akses Grup ${detailRecord.value?.name || ""}`.trim(),
      timestamp: formattedCreatedDate.value,
    },
  ];
});

// Detail Modal Permissions & Search Helpers
const permissionSearch = ref("");

const detailPermissions = computed<string[]>(() => {
  if (!detailRecord.value?.permissions) return [];
  return detailRecord.value.permissions
    .map((p: any) =>
      typeof p === "string" ? p : p.permission_key || p.name || p.id || "",
    )
    .filter(Boolean);
});

const filteredDetailPermissions = computed(() => {
  if (!permissionSearch.value) return detailPermissions.value;
  const q = permissionSearch.value.toLowerCase();
  return detailPermissions.value.filter((p) => p.toLowerCase().includes(q));
});

function getPermissionTooltipContent(permKey: string): string {
  const matched = allPermissions.value.find(
    (p) => p.permission_key === permKey || p.id === permKey,
  );
  if (matched?.description) return matched.description;
  if (matched?.resource_name && matched?.action_name) {
    return `${matched.resource_name} • ${matched.action_name}`;
  }
  return permKey;
}
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

          <BaseCreateButton resource="ROLE" @click="openCreateModal" />
        </div>

        <!-- Table Container -->
        <BaseTable
          :columns="aksesGrupColumns"
          :rows="paginatedRows"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchAksesGrups"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-600">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #name-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.name || "-" }}</span>
          </template>

          <template #description-data="{ row }">
            <span
              v-tooltip.top="
                row.description
                  ? { value: row.description, showDelay: 200 }
                  : undefined
              "
              class="text-xs text-gray-500 truncate max-w-xs block cursor-default"
            >
              {{ row.description || "-" }}
            </span>
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
                resource="ROLE"
                title="Ubah Role & Izin"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                type="delete"
                resource="ROLE"
                title="Hapus Role"
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

    <!-- STANDARD FORM DRAWER (BaseFormModal) -->
    <BaseFormModal
      v-model:is-open="isModalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="aksesGrupFormSections"
      variant="drawer"
      :submitting="isSubmitting"
      @submit="handleSave"
      @cancel="isModalOpen = false"
    >
      <template #extra>
        <!-- ── Permission Card Grid ── -->
        <div class="space-y-1.5">
          <!-- Form Field Style Label -->
          <label
            class="block text-xs font-semibold text-[#4D5E80] mb-1.5 select-none"
          >
            Daftar Hak Akses
            <span class="text-red-500 font-semibold ml-0.5">*</span>
          </label>

          <!-- Main Permission Container Box (Modern Card Grid) -->
          <div
            class="border border-gray-200/80 rounded-2xl overflow-hidden bg-white shadow-xs p-5"
          >
            <!-- Top Master Switch Bar -->
            <div class="flex items-center justify-between mb-5">
              <div
                class="flex items-center gap-3.5 cursor-pointer select-none"
                @click="toggleAllPermissions"
              >
                <div
                  class="relative inline-flex h-4 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                  :class="
                    isAllPermissionsSelected ? 'bg-[#23A3F1]' : 'bg-[#DFE9F4]'
                  "
                >
                  <span
                    class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out"
                    :class="
                      isAllPermissionsSelected
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    "
                  />
                </div>
                <span class="text-xs text-slate-500 font-semibold">
                  Aktifkan Semua Hak Akses
                </span>
              </div>

              <span
                class="text-xs font-semibold"
                :class="
                  isAllPermissionsSelected ? 'text-[#23A3F1]' : 'text-slate-500'
                "
              >
                {{
                  isAllPermissionsSelected
                    ? "Semua opsi aktif"
                    : `${selectedPermissionKeys.size} / ${allPermissions.length} Terpilih`
                }}
              </span>
            </div>

            <!-- Search & Filter Controls -->
            <div
              class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5"
            >
              <div class="flex-1">
                <BaseSearchInput
                  v-model="matrixSearch"
                  placeholder="Cari hak akses..."
                />
              </div>
              <div class="w-full sm:w-60">
                <BaseSelect
                  v-model="selectedModuleFilter"
                  :options="moduleFilterOptions"
                  placeholder="Semua Modul"
                  width-class="w-full"
                />
              </div>
            </div>

            <!-- Grid 2 Kolom (Card Permission) -->
            <div
              v-if="filteredPermissionCards.length > 0"
              class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-1 custom-scrollbar"
            >
              <div
                v-for="p in filteredPermissionCards"
                :key="p.id || p.permission_key"
                class="rounded-2xl border p-5 transition-all duration-200 cursor-pointer select-none flex flex-col justify-between"
                :class="[
                  isPermissionSelected(p)
                    ? 'border-[#7BB2F8] bg-[#EEF5FF] shadow-xs'
                    : 'border-[#E4EFFB] bg-[#F4F8FD] hover:border-[#BFDBFE] hover:bg-[#EEF5FC]',
                ]"
                @click="togglePermission(p)"
              >
                <!-- Top Row: Title on Left, Switch Off/On on Right -->
                <div class="flex items-center justify-between gap-3">
                  <h4
                    class="text-xs font-bold text-slate-900 leading-snug tracking-tight line-clamp-1"
                  >
                    {{ getPermissionCardTitle(p) }}
                  </h4>

                  <!-- Switch with Off/On labels -->
                  <div class="flex items-center gap-2.5 shrink-0">
                    <span
                      class="text-xs font-medium transition-colors"
                      :class="
                        !isPermissionSelected(p)
                          ? 'text-slate-400 font-semibold'
                          : 'text-slate-300'
                      "
                    >
                      Off
                    </span>

                    <div
                      class="relative inline-flex h-4 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out"
                      :class="
                        isPermissionSelected(p)
                          ? 'bg-[#23A3F1]'
                          : 'bg-[#DFE9F4]'
                      "
                    >
                      <span
                        class="pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out"
                        :class="
                          isPermissionSelected(p)
                            ? 'translate-x-5'
                            : 'translate-x-0'
                        "
                      />
                    </div>

                    <span
                      class="text-xs font-medium transition-colors"
                      :class="
                        isPermissionSelected(p)
                          ? 'text-[#23A3F1] font-bold'
                          : 'text-slate-300'
                      "
                    >
                      On
                    </span>
                  </div>
                </div>

                <!-- Description below -->
                <p
                  class="text-[13px] text-slate-500 leading-relaxed mt-3 line-clamp-2"
                >
                  {{
                    p.description ||
                    `Memberikan hak akses ${p.action_name || p.action_code} pada modul ${p.resource_name || p.resource_code}.`
                  }}
                </p>
              </div>
            </div>

            <!-- Empty / Loading State -->
            <div
              v-else
              class="py-12 px-4 text-center bg-gray-50/40 rounded-xl border border-dashed border-gray-200"
            >
              <div
                v-if="permissionsLoading"
                class="flex flex-col items-center justify-center gap-2"
              >
                <svg
                  class="animate-spin h-5 w-5 text-primary-600"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p class="text-xs text-gray-400">Memuat daftar hak akses...</p>
              </div>
              <div
                v-else
                class="flex flex-col items-center justify-center gap-2"
              >
                <p class="text-xs text-gray-500 font-medium">
                  Tidak ada hak akses yang cocok dengan filter atau pencarian
                  saat ini.
                </p>
                <button
                  type="button"
                  class="mt-1 px-3 py-1 text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  @click="
                    matrixSearch = '';
                    selectedModuleFilter = '';
                  "
                >
                  <RotateCcw class="w-3 h-3" />
                  Reset Filter & Pencarian
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseFormModal>

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Akses Grup"
      subtitle="Informasi detail Akses Grup"
      :record-id="detailRecord?.id"
      :created-date="formattedCreatedDate"
      :created-by="
        (detailRecord as any)?.created_by_name ||
        (detailRecord as any)?.created_by ||
        'Admin'
      "
      :activity-logs="activityLogs"
      :data-items="detailDataItems"
      :loading="detailLoading || asyncDetailLoading"
      @close="closeDetailModal"
      @edit="openEditFromDetail()"
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
              <BaseSearchInput v-model="permissionSearch" />
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

              <div v-else class="py-3 text-center text-xs text-gray-400 italic">
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
