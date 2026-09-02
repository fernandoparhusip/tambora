<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import {
  Key,
  ShieldCheck,
  CheckSquare,
  Square,
  Layers,
  RotateCcw,
  MinusSquare,
  Eye,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Check,
} from "@lucide/vue";
import type { DetailDataItem } from "~/types/master.types";
import type { RoleItem, TableColumn, PermissionItem } from "~/types";
import { useAksesGrup } from "~/composables/konfigurasi-aplikasi/useAksesGrup";
import { usePermission } from "~/composables/master/usePermission";
import { aksesGrupFormSections } from "~/schemas/konfigurasi-aplikasi/akses-grup.schema";

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

// Detail Modal States
const isDetailModalOpen = ref(false);
const detailRecord = ref<RoleItem | null>(null);

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
  { key: "code", label: "Kode" },
  { key: "name", label: "Nama" },
  { key: "description", label: "Deskripsi" },
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

// Action button definitions with clean unified theme
const actionPills = [
  {
    key: "VIEW",
    label: "Lihat",
    icon: Eye,
    aliases: ["VIEW", "READ", "LIST", "GET"],
  },
  {
    key: "CREATE",
    label: "Tambah",
    icon: Plus,
    aliases: ["CREATE", "INSERT", "ADD", "POST"],
  },
  {
    key: "UPDATE",
    label: "Ubah",
    icon: Pencil,
    aliases: ["UPDATE", "EDIT", "PUT"],
  },
  {
    key: "DELETE",
    label: "Hapus",
    icon: Trash2,
    aliases: ["DELETE", "REMOVE", "DESTROY"],
  },
  {
    key: "APPROVE",
    label: "Setujui",
    icon: CheckCircle2,
    aliases: ["APPROVE", "VERIFY", "REJECT"],
  },
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
    let resCode = (p.resource_code || p.resource_name || "")
      .toUpperCase()
      .trim();
    let actCode = (p.action_code || p.action_name || "").toUpperCase().trim();

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

    let matchedActionKey = actCode;
    for (const actionDef of actionPills) {
      if (
        actionDef.aliases.some(
          (alias) =>
            actCode.includes(alias) ||
            p.permission_key?.toUpperCase().endsWith(`.${alias}`),
        )
      ) {
        matchedActionKey = actionDef.key;
        break;
      }
    }

    row.permissionsByAction[matchedActionKey] = p;
    row.allPermissions.push(p);
  });

  return Object.values(map).sort((a, b) =>
    a.resourceName.localeCompare(b.resourceName),
  );
});

const filteredMatrixRows = computed(() => {
  if (!matrixSearch.value) return matrixRows.value;
  const q = matrixSearch.value.toLowerCase().trim();
  return matrixRows.value.filter(
    (row) =>
      row.resourceName.toLowerCase().includes(q) ||
      row.resourceCode.toLowerCase().includes(q),
  );
});

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
};

const isPermissionSelected = (p?: PermissionItem): boolean => {
  if (!p) return false;
  return (
    selectedPermissionIds.value.has(p.id) ||
    selectedPermissionKeys.value.has(p.permission_key)
  );
};

const getRowSelectedCount = (row: MatrixRow): number => {
  return row.allPermissions.filter((p) => isPermissionSelected(p)).length;
};

const isRowFullySelected = (row: MatrixRow): boolean => {
  if (row.allPermissions.length === 0) return false;
  return row.allPermissions.every((p) => isPermissionSelected(p));
};

const toggleRowAll = (row: MatrixRow) => {
  const isFull = isRowFullySelected(row);
  row.allPermissions.forEach((p) => {
    const id = p.id || p.permission_key;
    const key = p.permission_key || p.id;
    if (isFull) {
      selectedPermissionIds.value.delete(id);
      selectedPermissionKeys.value.delete(key);
    } else {
      selectedPermissionIds.value.add(id);
      selectedPermissionKeys.value.add(key);
    }
  });
};

const isAllPermissionsSelected = computed(() => {
  if (allPermissions.value.length === 0) return false;
  return allPermissions.value.every((p) => isPermissionSelected(p));
});

const isSomePermissionsSelected = computed(() => {
  return (
    selectedPermissionKeys.value.size > 0 && !isAllPermissionsSelected.value
  );
});

const selectAllGlobal = () => {
  allPermissions.value.forEach((p) => {
    selectedPermissionIds.value.add(p.id || p.permission_key);
    selectedPermissionKeys.value.add(p.permission_key || p.id);
  });
};

const clearAllGlobal = () => {
  selectedPermissionIds.value.clear();
  selectedPermissionKeys.value.clear();
};

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
  if (allPermissions.value.length === 0) {
    await fetchPermissions().catch(() => {});
  }
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

const handleSave = async (data?: Record<string, any>) => {
  const currentData = data || formData.value;
  if (!currentData.code || !currentData.name) {
    toast.error("Mohon lengkapi Kode Role dan Nama Role.", "Validasi Form");
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
  return new Date(detailRecord.value.created_at).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
  });
});

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  return [
    { label: "Kode", value: detailRecord.value.code },
    { label: "Nama", value: detailRecord.value.name },
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
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #code-data="{ row }">
            <span class="text-xs font-mono font-bold text-primary-700">{{
              row.code
            }}</span>
          </template>

          <template #name-data="{ row }">
            <div class="flex items-center gap-2">
              <ShieldCheck class="w-4 h-4 text-emerald-600 shrink-0" />
              <span class="text-xs font-semibold text-gray-800">{{
                row.name
              }}</span>
            </div>
          </template>

          <template #description-data="{ row }">
            <span
              v-tooltip.top="row.description ? { value: row.description, showDelay: 200 } : undefined"
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
        <!-- ── Emil Kowalski / High Taste Interactive Permission Matrix ── -->
        <div class="space-y-3">
          <!-- Section Header with Live Counter -->
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span class="w-1.5 h-4 bg-[#2671D9] rounded-full" />
              <p
                class="text-xs font-bold text-gray-800 tracking-wide uppercase"
              >
                Daftar Hak Akses
              </p>
            </div>

            <!-- Live Counter Chip Badge -->
            <div class="flex items-center gap-1.5">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold transition-all duration-200"
                :class="[
                  selectedPermissionKeys.size > 0
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs'
                    : 'bg-gray-100 text-gray-500 border border-gray-200',
                ]"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="
                    selectedPermissionKeys.size > 0
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-gray-400'
                  "
                />
                {{ selectedPermissionKeys.size }} /
                {{ allPermissions.length }} Terpilih
              </span>
            </div>
          </div>

          <!-- Main Permission Container Box -->
          <div
            class="border border-gray-200/90 rounded-xl overflow-hidden bg-white shadow-2xs"
          >
            <!-- Top Toolbar: Search & Global Presets -->
            <div
              class="p-3 bg-gray-50/70 border-b border-gray-200/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5"
            >
              <!-- Integrated BaseSearchInput -->
              <div class="w-full sm:w-64">
                <BaseSearchInput v-model="matrixSearch" />
              </div>

              <!-- Quick Global Preset Buttons (Tactile UX) -->
              <div
                class="flex items-center gap-1.5 flex-wrap self-end sm:self-auto"
              >
                <button
                  type="button"
                  class="px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all duration-100 active:scale-95 flex items-center gap-1 cursor-pointer select-none"
                  :class="[
                    isAllPermissionsSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100',
                  ]"
                  @click="
                    isAllPermissionsSelected
                      ? clearAllGlobal()
                      : selectAllGlobal()
                  "
                >
                  <component
                    :is="
                      isAllPermissionsSelected
                        ? CheckSquare
                        : isSomePermissionsSelected
                          ? MinusSquare
                          : Square
                    "
                    class="w-3.5 h-3.5"
                  />
                  <span>{{
                    isAllPermissionsSelected ? "Batal Semua" : "Pilih Semua"
                  }}</span>
                </button>
              </div>
            </div>

            <!-- Horizontal Scroll Wrapper for Responsive Tablet & Mobile Screens -->
            <div class="overflow-x-auto custom-scrollbar">
              <div class="min-w-[820px]">
                <!-- Column Headers (Clean Guide) -->
                <div
                  class="px-5 py-2.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-500 uppercase tracking-wider select-none"
                >
                  <span class="w-[220px] shrink-0">Nama Modul</span>
                  <div class="flex items-center gap-4">
                    <div class="grid grid-cols-5 gap-2 w-[440px] text-center">
                      <span>Lihat</span>
                      <span>Tambah</span>
                      <span>Ubah</span>
                      <span>Hapus</span>
                      <span>Setujui</span>
                    </div>
                    <span class="w-24 text-center">Aksi Cepat</span>
                  </div>
                </div>

                <!-- Interactive Module Rows List -->
                <div class="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  <!-- Module Item Row -->
                  <div
                    v-for="row in filteredMatrixRows"
                    :key="row.resourceCode"
                    class="px-5 py-3 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4 group"
                  >
                    <!-- Left: Module Meta & Badge (Guaranteed Width) -->
                    <div class="flex items-center gap-3 w-[220px] shrink-0">
                      <div
                        class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors border"
                        :class="[
                          getRowSelectedCount(row) > 0
                            ? 'bg-blue-50/70 border-blue-200 text-[#2671D9]'
                            : 'bg-gray-50 border-gray-200/80 text-gray-400 group-hover:text-gray-600',
                        ]"
                      >
                        <Layers class="w-4 h-4" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span
                            class="text-xs font-semibold text-gray-900 leading-tight"
                          >
                            {{ row.resourceName }}
                          </span>
                          <span
                            v-if="getRowSelectedCount(row) > 0"
                            class="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 shrink-0"
                          >
                            {{ getRowSelectedCount(row) }}/{{
                              row.allPermissions.length
                            }}
                          </span>
                        </div>
                        <span
                          class="text-[10px] font-mono text-gray-400 block"
                        >
                          {{ row.resourceCode }}
                        </span>
                      </div>
                    </div>

                    <!-- Right: Aligned Fixed 5-Column Grid & Quick Toggle -->
                    <div class="flex items-center gap-4 shrink-0">
                      <!-- 5 Fixed Action Columns -->
                      <div class="grid grid-cols-5 gap-2 w-[440px]">
                        <template v-for="act in actionPills" :key="act.key">
                          <button
                            v-if="row.permissionsByAction[act.key]"
                            v-tooltip.top="{
                              value: getPermissionTooltipContent(
                                row.permissionsByAction[act.key]?.permission_key ||
                                  '',
                              ),
                              showDelay: 120,
                              hideDelay: 50,
                            }"
                            type="button"
                            class="h-8 px-2 text-xs rounded-lg border transition-all duration-100 active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer select-none"
                            :class="[
                              isPermissionSelected(
                                row.permissionsByAction[act.key],
                              )
                                ? 'bg-[#2671D9] text-white border-[#2671D9] font-semibold shadow-2xs'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                            ]"
                            @click="
                              togglePermission(row.permissionsByAction[act.key]!)
                            "
                          >
                            <component
                              :is="
                                isPermissionSelected(
                                  row.permissionsByAction[act.key],
                                )
                                  ? Check
                                  : act.icon
                              "
                              class="w-3.5 h-3.5 shrink-0"
                            />
                            <span class="text-xs">{{ act.label }}</span>
                          </button>
                          <div
                            v-else
                            class="h-8 flex items-center justify-center text-gray-300 text-xs font-bold select-none"
                          >
                            -
                          </div>
                        </template>
                      </div>

                      <!-- Quick Action Button per Row -->
                      <div class="w-24 flex justify-center">
                        <button
                          type="button"
                          class="w-full h-8 text-xs font-semibold rounded-lg border transition-all duration-100 active:scale-95 cursor-pointer select-none"
                          :class="[
                            isRowFullySelected(row)
                              ? 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                          ]"
                          @click="toggleRowAll(row)"
                        >
                          {{
                            isRowFullySelected(row) ? "Batal" : "Pilih Semua"
                          }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Empty State / Loading State -->
                  <div
                    v-if="filteredMatrixRows.length === 0"
                    class="py-12 px-4 text-center bg-gray-50/40"
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
                      <p class="text-xs text-gray-400">
                        Memuat daftar hak akses...
                      </p>
                    </div>
                    <div
                      v-else-if="matrixSearch.trim()"
                      class="flex flex-col items-center justify-center gap-2"
                    >
                      <div
                        class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"
                      >
                        <Layers class="w-5 h-5" />
                      </div>
                      <p class="text-xs text-gray-500 font-medium">
                        Tidak ada modul yang cocok dengan "<span
                          class="font-bold text-gray-700"
                          >{{ matrixSearch }}</span
                        >"
                      </p>
                      <button
                        type="button"
                        class="mt-1 px-3 py-1 text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        @click="matrixSearch = ''"
                      >
                        <RotateCcw class="w-3 h-3" />
                        Reset Pencarian Modul
                      </button>
                    </div>
                    <div
                      v-else
                      class="flex flex-col items-center justify-center gap-2"
                    >
                      <div
                        class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400"
                      >
                        <Layers class="w-5 h-5" />
                      </div>
                      <p class="text-xs text-gray-500 font-medium">
                        Belum ada data modul hak akses.
                      </p>
                      <button
                        type="button"
                        class="mt-1 px-3 py-1 text-xs text-primary-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                        @click="fetchPermissions"
                      >
                        <RotateCcw class="w-3 h-3" />
                        Muat Ulang Izin
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </BaseFormModal>

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Role"
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
