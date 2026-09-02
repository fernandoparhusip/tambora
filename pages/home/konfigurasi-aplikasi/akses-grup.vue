<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { Key, ShieldCheck, CheckSquare, Square, Search } from "@lucide/vue";
import type { DetailDataItem } from "~/types/master.types";
import { exportToExcel } from "~/utils/exportExcel";
import type { RoleItem, TableColumn, PermissionItem } from "~/types";
import { useAksesGrup } from "~/composables/konfigurasi-aplikasi/useAksesGrup";
import { usePermission } from "~/composables/master/usePermission";

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
const { permissions: allPermissions, fetchPermissions } = usePermission();
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
  isEditMode.value ? "Ubah Peran & Hak Akses (Role)" : "Tambah Peran & Hak Akses (Role)",
);
const modalSubtitle = computed(() =>
  isEditMode.value
    ? "Atur detail peran dan checklist matrix hak akses izin (permission)"
    : "Buat peran baru dan centang matrix hak akses izin (permission)",
);

const aksesGrupColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "code", label: "Kode Role" },
  { key: "name", label: "Nama Role" },
  { key: "description", label: "Deskripsi" },
  { key: "permission_count", label: "Jumlah Izin" },
  { key: "actions", label: "Aksi" },
];

const formData = ref<Record<string, any>>({
  code: "",
  name: "",
  description: "",
});

// Matrix checklist state
const selectedPermissionIds = ref<Set<string>>(new Set());
const selectedPermissionKeys = ref<Set<string>>(new Set());
const matrixSearch = ref("");

// Standard Action Column definitions
const standardActions = [
  { key: "VIEW", label: "View", aliases: ["VIEW", "READ", "LIST", "GET"] },
  { key: "CREATE", label: "Create", aliases: ["CREATE", "INSERT", "ADD", "POST"] },
  { key: "UPDATE", label: "Update", aliases: ["UPDATE", "EDIT", "PUT"] },
  { key: "DELETE", label: "Delete", aliases: ["DELETE", "REMOVE", "DESTROY"] },
  { key: "APPROVE", label: "Approve", aliases: ["APPROVE", "VERIFY", "REJECT"] },
];

interface MatrixRow {
  resourceCode: string;
  resourceName: string;
  permissionsByAction: Record<string, PermissionItem>;
  allPermissions: PermissionItem[];
}

// Group permissions into resource matrix rows
const matrixRows = computed<MatrixRow[]>(() => {
  const map: Record<string, MatrixRow> = {};

  allPermissions.value.forEach((p) => {
    let resCode = (p.resource_code || p.resource_name || "").toUpperCase().trim();
    let actCode = (p.action_code || p.action_name || "").toUpperCase().trim();

    // If resource_code is empty, parse from permission_key (e.g. SENTRAL.VIEW)
    if (!resCode && p.permission_key && p.permission_key.includes(".")) {
      const parts = p.permission_key.split(".");
      resCode = parts[0]?.toUpperCase() || "SISTEM";
      actCode = parts[1]?.toUpperCase() || "VIEW";
    }
    if (!resCode) resCode = "SISTEM";
    if (!actCode) actCode = "VIEW";

    const resName = p.resource_name || formatResourceName(resCode);

    let row = map[resCode];
    if (!row) {
      row = {
        resourceCode: resCode,
        resourceName: resName,
        permissionsByAction: {},
        allPermissions: [],
      };
      map[resCode] = row;
    }

    // Match to standard action or keep as custom
    let matchedActionKey = actCode;
    for (const actionDef of standardActions) {
      if (actionDef.aliases.some((alias) => actCode.includes(alias) || p.permission_key?.toUpperCase().endsWith(`.${alias}`))) {
        matchedActionKey = actionDef.key;
        break;
      }
    }

    row.permissionsByAction[matchedActionKey] = p;
    row.allPermissions.push(p);
  });

  return Object.values(map).sort((a, b) => a.resourceName.localeCompare(b.resourceName));
});

const filteredMatrixRows = computed(() => {
  if (!matrixSearch.value) return matrixRows.value;
  const q = matrixSearch.value.toLowerCase();
  return matrixRows.value.filter(
    (row) =>
      row.resourceName.toLowerCase().includes(q) ||
      row.resourceCode.toLowerCase().includes(q),
  );
});

function formatResourceName(code: string): string {
  const mapping: Record<string, string> = {
    SENTRAL: "Master Sentral Pembangkit",
    CABANG: "Master Cabang",
    RANTING: "Master Ranting",
    REGIONAL: "Master Regional (Wilayah)",
    USER: "Manajemen Pengguna (User)",
    ROLE: "Manajemen Peran (Role)",
    PERMISSION: "Akses Permission",
    SCOPE: "Akses Level (Scope)",
    ORGANIZATION: "Master Organisasi",
    SYSTEM: "Master Sistem",
    ASSET: "Master Aset Mesin",
    MACHINE_CONDITION: "Master Kondisi Mesin",
    DRIVER: "Master Pengemudi",
    OPERASI_HARIAN: "Operasi Harian",
    OPERASI: "Operasi Pembangkit",
    BAHAN_BAKAR: "Pemakaian Bahan Bakar",
    PEMBEBANAN: "Pembebanan Generator",
    PAGU: "Pagu Anggaran",
    PROGNOSA: "Prognosa Kinerja",
    NKO: "Perhitungan NKO",
  };
  return mapping[code] || code.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

onMounted(async () => {
  await Promise.allSettled([fetchAksesGrups(), fetchPermissions()]);
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
    fileName: "Data_Master_Role_PLN",
  });
};

// Toggle individual permission
const togglePermission = (p: PermissionItem) => {
  const id = p.id || p.permission_key;
  const key = p.permission_key || p.id;

  if (selectedPermissionIds.value.has(id) || selectedPermissionKeys.value.has(key)) {
    selectedPermissionIds.value.delete(id);
    selectedPermissionKeys.value.delete(key);
  } else {
    selectedPermissionIds.value.add(id);
    selectedPermissionKeys.value.add(key);
  }
};

const isPermissionSelected = (p?: PermissionItem): boolean => {
  if (!p) return false;
  return selectedPermissionIds.value.has(p.id) || selectedPermissionKeys.value.has(p.permission_key);
};

// Toggle all permissions for a specific row/resource
const isRowFullySelected = (row: MatrixRow): boolean => {
  if (row.allPermissions.length === 0) return false;
  return row.allPermissions.every((p) => isPermissionSelected(p));
};

const toggleRowPermissions = (row: MatrixRow) => {
  const allSelected = isRowFullySelected(row);
  row.allPermissions.forEach((p) => {
    const id = p.id || p.permission_key;
    const key = p.permission_key || p.id;
    if (allSelected) {
      selectedPermissionIds.value.delete(id);
      selectedPermissionKeys.value.delete(key);
    } else {
      selectedPermissionIds.value.add(id);
      selectedPermissionKeys.value.add(key);
    }
  });
};

// Global toggle all permissions
const isAllPermissionsSelected = computed(() => {
  if (allPermissions.value.length === 0) return false;
  return allPermissions.value.every((p) => isPermissionSelected(p));
});

const toggleAllPermissionsGlobal = () => {
  const allSelected = isAllPermissionsSelected.value;
  if (allSelected) {
    selectedPermissionIds.value.clear();
    selectedPermissionKeys.value.clear();
  } else {
    allPermissions.value.forEach((p) => {
      selectedPermissionIds.value.add(p.id || p.permission_key);
      selectedPermissionKeys.value.add(p.permission_key || p.id);
    });
  }
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
  selectedPermissionIds.value.clear();
  selectedPermissionKeys.value.clear();
  matrixSearch.value = "";
  isModalOpen.value = true;
};

const handleView = async (row: RoleItem) => {
  detailRecord.value = row;
  permissionSearch.value = "";
  isDetailModalOpen.value = true;
  try {
    const res = await getAksesGrupById(row.id);
    if (res) {
      detailRecord.value = res;
    }
  } catch {
    // Fallback
  }
};

const handleEdit = async (row: RoleItem) => {
  isEditMode.value = true;
  editingId.value = row.id;
  formData.value = {
    code: row.code,
    name: row.name,
    description: row.description || "",
  };
  selectedPermissionIds.value.clear();
  selectedPermissionKeys.value.clear();
  matrixSearch.value = "";

  // Pre-fill existing permissions from row or detail
  try {
    const res = await getAksesGrupById(row.id);
    const perms = res?.permissions || (row as any).permissions || [];
    perms.forEach((p: any) => {
      if (typeof p === "string") {
        selectedPermissionKeys.value.add(p);
        // Find matching ID in allPermissions
        const matched = allPermissions.value.find((item) => item.permission_key === p || item.id === p);
        if (matched) selectedPermissionIds.value.add(matched.id);
      } else if (p && typeof p === "object") {
        if (p.id) selectedPermissionIds.value.add(p.id);
        if (p.permission_key) selectedPermissionKeys.value.add(p.permission_key);
      }
    });
  } catch {
    // Fallback
  }

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
    toast.error("Mohon lengkapi Kode Role dan Nama Role.", "Validasi Form");
    return;
  }

  isSubmitting.value = true;
  try {
    const permissionIdsArray = Array.from(selectedPermissionIds.value);
    const permissionKeysArray = Array.from(selectedPermissionKeys.value);

    const payload = {
      code: formData.value.code.toUpperCase().replace(/\s+/g, "_"),
      name: formData.value.name,
      description: formData.value.description || formData.value.name,
      permission_ids: permissionIdsArray,
      permissions: permissionKeysArray,
    };

    if (isEditMode.value && editingId.value) {
      await updateAksesGrup(editingId.value, payload);
      toast.success(`Role '${formData.value.name}' berhasil diperbarui.`, "Sukses");
    } else {
      await createAksesGrup(payload);
      toast.success(`Role baru '${formData.value.name}' berhasil dibuat.`, "Sukses");
    }

    isModalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    toast.error(err?.message || "Gagal menyimpan data role.", "Terjadi Kesalahan");
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
    toast.success(`Role '${deleteTarget.value.name}' berhasil dihapus.`, "Sukses");
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
  return new Date(detailRecord.value.created_at).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });
});

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  return [
    { label: "Kode Role", value: detailRecord.value.code },
    { label: "Nama Role", value: detailRecord.value.name },
    { label: "Deskripsi", value: detailRecord.value.description || "-" },
    {
      label: "Jumlah Hak Akses",
      value: `${(detailRecord.value.permissions || []).length} Izin`,
      isStatus: true,
    },
    { label: "ID Record", value: detailRecord.value.id },
  ];
});

// Detail Modal Permissions & Search Helpers
const permissionSearch = ref("");

const detailPermissions = computed<string[]>(() => {
  if (!detailRecord.value?.permissions) return [];
  return detailRecord.value.permissions
    .map((p: any) =>
      typeof p === "string" ? p : p.permission_key || p.name || p.id || ""
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
    (p) => p.permission_key === permKey || p.id === permKey
  );
  if (matched) {
    return `<div class="text-left font-sans">
      <div class="font-bold text-xs">${matched.name || permKey}</div>
      <div class="text-[11px] text-gray-300">${matched.description || matched.resource_name || "-"}</div>
    </div>`;
  }
  return `<div class="text-xs font-mono">${permKey}</div>`;
}
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- ── Page Title Header ───────────────────────────────── -->
    <BasePageHeader />

    <!-- ── Main Card Container ───────────────────────────────── -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- ── Action Controls Bar ───────────────────────────────── -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Role & Akses Grup..." />
            <BaseExportButton @click="handleExport" />
          </div>

          <BaseCreateButton label="TAMBAH ROLE" @click="openCreateModal" />
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
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
            <span class="text-xs font-mono font-bold text-primary-700">{{ row.code }}</span>
          </template>

          <template #name-data="{ row }">
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0" />
              <span class="text-xs font-semibold text-gray-800">{{ row.name }}</span>
            </div>
          </template>

          <template #description-data="{ row }">
            <span class="text-xs text-gray-500 truncate max-w-xs block" :title="row.description">
              {{ row.description || '-' }}
            </span>
          </template>

          <template #permission_count-data="{ row }">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {{ (row.permissions || []).length }} Izin
            </span>
          </template>

          <!-- Action Buttons Cell Slot -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" title="Lihat Detail" @click="handleView(row)" />
              <BaseActionButton type="edit" title="Ubah Role & Izin" @click="handleEdit(row)" />
              <BaseActionButton type="delete" title="Hapus Role" @click="handleDelete(row)" />
            </div>
          </template>
        </BaseTable>

        <!-- ── Pagination ────────────────────────────────────────── -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredRows.length"
          class="shrink-0 pt-4 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- ── MODAL FORM ROLE & PERMISSION MATRIX CHECKLIST ─────────────── -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-4xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-700">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">{{ modalTitle }}</h3>
              <p class="text-xs text-gray-500">{{ modalSubtitle }}</p>
            </div>
          </div>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            @click="closeModal"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="p-6 overflow-y-auto flex-1 space-y-6">
          <!-- Role Metadata Inputs -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">
                Nama Role <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Contoh: Operator Pembangkit Sentral"
                class="w-full text-xs px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-medium text-gray-800"
                required
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-gray-700 mb-1.5">
                Kode Role <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.code"
                type="text"
                placeholder="Contoh: ROLE_OPERATOR_SENTRAL"
                class="w-full text-xs px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all font-mono font-semibold text-gray-800"
                required
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-xs font-bold text-gray-700 mb-1.5">Deskripsi Role</label>
              <textarea
                v-model="formData.description"
                rows="2"
                placeholder="Contoh: Khusus staf operasional di unit sentral pembangkit"
                class="w-full text-xs px-3.5 py-2 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-gray-800"
              ></textarea>
            </div>
          </div>

          <!-- Permission Matrix Table Checklist -->
          <div class="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
            <!-- Header Bar with Search and Bulk Toggle -->
            <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div>
                <span class="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Key class="w-4 h-4 text-emerald-600" />
                  DAFTAR HAK AKSES (PERMISSION MATRIX)
                </span>
                <span class="text-[11px] text-gray-500">
                  Terpilih: <strong class="text-emerald-700 font-bold">{{ selectedPermissionKeys.size }}</strong> izin
                </span>
              </div>

              <div class="flex items-center gap-2">
                <div class="relative">
                  <Search class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    v-model="matrixSearch"
                    type="text"
                    placeholder="Filter Modul..."
                    class="text-xs pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 w-44"
                  />
                </div>

                <button
                  type="button"
                  class="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-100 text-gray-700 flex items-center gap-1.5 transition-colors"
                  @click="toggleAllPermissionsGlobal"
                >
                  <component :is="isAllPermissionsSelected ? CheckSquare : Square" class="w-3.5 h-3.5 text-primary-600" />
                  {{ isAllPermissionsSelected ? 'Batal Semua' : 'Pilih Semua' }}
                </button>
              </div>
            </div>

            <!-- Matrix Table -->
            <div class="overflow-x-auto max-h-80">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-gray-100/75 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th class="py-2.5 px-4">Modul / Resource</th>
                    <th v-for="act in standardActions" :key="act.key" class="py-2.5 px-3 text-center">
                      {{ act.label }}
                    </th>
                    <th class="py-2.5 px-3 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr
                    v-for="row in filteredMatrixRows"
                    :key="row.resourceCode"
                    class="hover:bg-gray-50/80 transition-colors"
                  >
                    <td class="py-2 px-4">
                      <div class="font-semibold text-gray-900">{{ row.resourceName }}</div>
                      <div class="text-[10px] font-mono text-gray-400">{{ row.resourceCode }}</div>
                    </td>

                    <!-- Action Checkboxes Columns (View, Create, Update, Delete, Approve) -->
                    <td
                      v-for="act in standardActions"
                      :key="act.key"
                      class="py-2 px-3 text-center"
                    >
                      <template v-if="row.permissionsByAction[act.key]">
                        <input
                          type="checkbox"
                          :checked="isPermissionSelected(row.permissionsByAction[act.key])"
                          class="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-gray-300 cursor-pointer"
                          :title="row.permissionsByAction[act.key]?.permission_key"
                          @change="togglePermission(row.permissionsByAction[act.key]!)"
                        />
                      </template>
                      <template v-else>
                        <span class="text-gray-300 font-bold">-</span>
                      </template>
                    </td>

                    <!-- Select All per Row -->
                    <td class="py-2 px-3 text-center">
                      <button
                        type="button"
                        class="text-[11px] font-medium text-primary-600 hover:text-primary-800 hover:underline"
                        @click="toggleRowPermissions(row)"
                      >
                        {{ isRowFullySelected(row) ? 'Uncheck' : 'Pilih Baris' }}
                      </button>
                    </td>
                  </tr>

                  <tr v-if="filteredMatrixRows.length === 0">
                    <td colspan="7" class="py-8 text-center text-gray-400">
                      Tidak ada modul yang cocok dengan pencarian.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50 shrink-0">
          <button
            type="button"
            class="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            @click="closeModal"
          >
            Batal
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            class="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-60"
            @click="handleSave"
          >
            <svg
              v-if="isSubmitting"
              class="animate-spin h-3.5 w-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>{{ isEditMode ? 'Simpan Perubahan Role' : 'Simpan Peran & Hak Akses' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Role & Hak Akses"
      subtitle="Informasi detail Akses Grup dan permission"
      :record-id="detailRecord?.id"
      :created-date="formattedCreatedDate"
      :created-by="(detailRecord as any)?.created_by || 'Admin'"
      :data-items="detailDataItems"
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
      title="Hapus Role"
      :message="`Apakah Anda yakin ingin menghapus Role '${deleteTarget?.name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="isConfirmDialogOpen = false"
    />

    <!-- Success Modal -->
    <BaseSuccessModal
      v-model:is-open="isSuccessModalOpen"
      title="Berhasil Disimpan"
      :message="`Data Role '${formData.name}' berhasil disimpan.`"
      @close="isSuccessModalOpen = false"
    />
  </div>
</template>
