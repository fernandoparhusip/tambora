<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type {
  DetailDataItem,
  CreateUserRequest,
} from "~/types/master.types";
import type { TableColumn } from "~/types";
import {
  userValidationSchema,
} from "~/schemas/master/user.schema";
import { exportToExcel } from "~/utils/exportExcel";
import { useTableState } from "~/composables/useTableState";
import { useScope } from "~/composables/master/useScope";
import { User, KeyRound, Search, CheckCircle2, XCircle, MinusCircle } from "@lucide/vue";

// ── Composables ──────────────────────────────────────────────
const {
  users,
  loading,
  fetchUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = useUser();
const { roles, fetchRoles } = useRole();
const { scopes, fetchScopes } = useScope();
const { organizations, fetchOrganizations } = useOrganization();
const { permissions, fetchPermissions } = usePermission();

// ── Table State (Search & Pagination) ─────────────────────────
const {
  searchQuery,
  currentPage,
  pageSize,
  activeFilteredData,
  paginatedData,
} = useTableState(users, { defaultPageSize: 10 });

// ── Table Columns Config ──────────────────────────────────────
const userTableColumns: TableColumn[] = [
  { key: "email", label: "Email", sortable: true, type: "text" },
  { key: "nama", label: "Nama", sortable: true, type: "text" },
  { key: "nip", label: "NIP", sortable: true, type: "text" },
  { key: "organisasi", label: "Organisasi", sortable: true, type: "text" },
  {
    key: "statusKaryawan",
    label: "Status Karyawan",
    sortable: true,
    type: "custom",
  },
  { key: "actions", label: "Aksi", sortable: false, type: "custom" },
];

const orgOptions = computed(() =>
  organizations.value.map((o: any) => ({
    label: `${o.nama} (${o.kode})`,
    value: o.nama,
  })),
);

const roleOptions = computed(() =>
  roles.value.map((r: any) => ({
    label: r.name || r.code,
    value: r.code,
  })),
);

const scopeOptions = computed(() => {
  if (scopes.value.length > 0) {
    return scopes.value.map((s: any) => ({
      label: `${s.name || s.code} (${s.code})`,
      value: s.code,
    }));
  }
  return [
    { label: "GLOBAL (Pusat)", value: "GLOBAL" },
    { label: "REGIONAL (Wilayah)", value: "REGIONAL" },
    { label: "CABANG (Unit Pelaksana)", value: "CABANG" },
    { label: "RANTING (Unit Layanan)", value: "RANTING" },
    { label: "SENTRAL (Unit Pembangkit)", value: "SENTRAL" },
  ];
});

const permissionOptions = computed(() =>
  permissions.value.map((p: any) => ({
    label: p.permission_key || p.description || p.id,
    value: p.permission_key || p.id,
  })),
);

onMounted(async () => {
  await Promise.allSettled([
    fetchUsers(),
    fetchRoles(),
    fetchScopes(),
    fetchOrganizations(),
    fetchPermissions(),
  ]);
});

// Modal states
const modalOpen = ref(false);
const activeModalTab = ref<"info" | "overrides">("info");
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit" | "view">("create");
const formData = ref<Record<string, any>>({});
const formErrors = ref<Record<string, string>>({});
const submitting = ref(false);

// Permission Overrides State (Map of permission_key -> 'DEFAULT' | 'GRANTED' | 'DENIED')
const userOverrides = ref<Record<string, "DEFAULT" | "GRANTED" | "DENIED">>({});
const overrideSearchQuery = ref("");

const filteredPermissionsForOverrides = computed(() => {
  if (!overrideSearchQuery.value) return permissions.value;
  const q = overrideSearchQuery.value.toLowerCase();
  return permissions.value.filter(
    (p) =>
      (p.permission_key && p.permission_key.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.resource_name && p.resource_name.toLowerCase().includes(q)) ||
      (p.resource_code && p.resource_code.toLowerCase().includes(q)),
  );
});

const activeOverridesCount = computed(() => {
  let granted = 0;
  let denied = 0;
  Object.values(userOverrides.value).forEach((state) => {
    if (state === "GRANTED") granted++;
    if (state === "DENIED") denied++;
  });
  return { total: granted + denied, granted, denied };
});

const modalTitle = computed(() => {
  if (modalMode.value === "view") return "Detail Data Pengguna";
  if (modalMode.value === "edit") return "Edit Data Pengguna & Hak Akses";
  return "Tambah Data Pengguna & Hak Akses";
});

const modalSubtitle = computed(() => {
  if (modalMode.value === "view") return "Detail Informasi Pengguna";
  if (modalMode.value === "edit") return "Form Edit Data Pengguna dan Pengaturan Permission Overrides";
  return "Form Tambah Data Pengguna dan Pengaturan Permission Overrides";
});

const openCreateModal = () => {
  modalMode.value = "create";
  activeModalTab.value = "info";
  formData.value = {
    tipe: "SSO PLN",
    akunPengelola: false,
    organisasi: organizations.value[0]?.nama || "",
    aksesLevel: roleOptions.value[0]?.value || "ORG_ADMIN",
    scopeLevel: "CABANG",
    permissions: [],
    pengelola: "Sewa",
    nama: "",
    username: "",
    jabatan: "Staff",
    statusKaryawan: "Aktif",
    email: "",
    password: "Password123!",
    noTelp: "",
    perNr: "",
    nip: "",
    alamat: "",
  };
  userOverrides.value = {};
  overrideSearchQuery.value = "";
  clearErrors();
  modalOpen.value = true;
};

const isDetailModalOpen = ref(false);
const isDetailLoading = ref(false);
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<any>(null);
const isDeleting = ref(false);
const detailRecord = ref<any>(null);
const detailRoles = ref<any[]>([]);
const detailPermissions = ref<any[]>([]);
const permissionSearch = ref("");
const hoveredPermission = ref<any>(null);

const detailModalTitle = computed(() => "View Data Pengguna");
const detailModalSubtitle = computed(() => "Form View Data Pengguna");

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const items: DetailDataItem[] = [
    {
      label: "Nama Lengkap",
      value: detailRecord.value.nama || detailRecord.value.full_name,
    },
    { label: "Email", value: detailRecord.value.email || "-" },
    { label: "Username", value: detailRecord.value.username || "-" },
    { label: "NIP", value: detailRecord.value.nip || "-" },
    {
      label: "No. Pekerja (PERNR)",
      value: detailRecord.value.pernr || detailRecord.value.prnr || "-",
    },
    {
      label: "Organisasi",
      value:
        detailRecord.value.organisasi ||
        detailRecord.value.organization ||
        "-",
    },
    {
      label: "Jabatan",
      value: detailRecord.value.jabatan || "Manager Operasi",
    },
    {
      label: "Role Akses",
      value:
        detailRoles.value.length > 0
          ? detailRoles.value
              .map((r: any) => r.role_name || r.role_code)
              .join(", ")
          : detailRecord.value.aksesLevel ||
            detailRecord.value.role_assignments?.[0]?.role_code ||
            "-",
    },
    {
      label: "Status Karyawan",
      value:
        detailRecord.value.statusKaryawan ||
        (detailRecord.value.status === 1 || detailRecord.value.status === "1"
          ? "Aktif"
          : "Nonaktif"),
      isStatus: true,
    },
    {
      label: "Alamat",
      value: detailRecord.value.address || detailRecord.value.alamat || "-",
    },
    {
      label: "No. Telp",
      value:
        detailRecord.value.phone_number ||
        detailRecord.value.noTelp ||
        "-",
    },
  ];
  return items;
});

const filteredDetailPermissions = computed(() => {
  const q = permissionSearch.value.toLowerCase().trim();
  if (!q) return detailPermissions.value;
  return detailPermissions.value.filter(
    (p: any) =>
      p.Key?.toLowerCase().includes(q) ||
      p.ResourceCode?.toLowerCase().includes(q) ||
      p.ActionCode?.toLowerCase().includes(q) ||
      p.permission_key?.toLowerCase().includes(q),
  );
});

const getPermissionTooltipContent = (p: any) => {
  const resource = p.ResourceCode || p.resource || "SISTEM";
  const action = p.ActionCode || p.action || "AKSI";
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

const handleView = async (row: any) => {
  detailRecord.value = row;
  detailRoles.value = row.role_assignments || [];
  detailPermissions.value = [];
  permissionSearch.value = "";
  hoveredPermission.value = null;
  isDetailModalOpen.value = true;
  isDetailLoading.value = true;

  try {
    const userDetailRes: any = await getUserById(row.id);
    if (userDetailRes) {
      if (userDetailRes.roles && Array.isArray(userDetailRes.roles)) {
        detailRoles.value = userDetailRes.roles;
      }
      if (
        userDetailRes.access?.permissions &&
        Array.isArray(userDetailRes.access.permissions)
      ) {
        detailPermissions.value = userDetailRes.access.permissions;
      }
    }
  } catch {
    // fallback
  } finally {
    isDetailLoading.value = false;
  }
};

const handleEdit = async (row: any) => {
  modalMode.value = "edit";
  activeModalTab.value = "info";
  let matchedRole = "ORG_ADMIN";
  if (row.role_assignments && row.role_assignments.length > 0) {
    matchedRole = row.role_assignments[0].role_code;
  } else if (row.aksesLevel) {
    matchedRole = row.aksesLevel;
  } else if (row.role) {
    matchedRole = row.role;
  }

  // Prepopulate Overrides
  userOverrides.value = {};
  overrideSearchQuery.value = "";
  if (Array.isArray(row.permission_overrides)) {
    row.permission_overrides.forEach((o: any) => {
      userOverrides.value[o.permission_key] = o.is_granted ? "GRANTED" : "DENIED";
    });
  }

  formData.value = {
    ...row,
    id: row.id,
    nama: row.nama || row.full_name,
    username: row.username || "",
    email: row.email || "",
    organisasi: row.organisasi || row.organization || "",
    nip: row.nip || "",
    perNr: row.perNr || row.prnr || "",
    statusKaryawan:
      row.status === 0 ||
      row.status === "0" ||
      row.statusKaryawan === "Nonaktif"
        ? "Nonaktif"
        : "Aktif",
    aksesLevel: matchedRole,
    scopeLevel: row.access_level || "CABANG",
    tipe: row.tipe || "SSO PLN",
    akunPengelola: row.akunPengelola || false,
    pengelola: row.pengelola || "Sewa",
    jabatan: row.jabatan || "Staff",
    noTelp: row.noTelp || "",
    alamat: row.alamat || "",
  };
  clearErrors();
  modalOpen.value = true;
};

const openEditFromDetail = () => {
  if (detailRecord.value) {
    isDetailModalOpen.value = false;
    handleEdit(detailRecord.value);
  }
};

const handleDelete = (row: any) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteUser(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch {
    // handled by toast
  } finally {
    isDeleting.value = false;
  }
};

const handleExport = () => {
  exportToExcel(userTableColumns, activeFilteredData.value, {
    fileName: "Data_Pengguna_PLN",
  });
};

const clearErrors = () => {
  formErrors.value = {};
};

const setOverrideState = (permKey: string, state: "DEFAULT" | "GRANTED" | "DENIED") => {
  if (state === "DEFAULT") {
    const { [permKey]: _removed, ...rest } = userOverrides.value;
    userOverrides.value = rest;
  } else {
    userOverrides.value[permKey] = state;
  }
};

const handleSave = async () => {
  if (modalMode.value === "view") {
    modalOpen.value = false;
    return;
  }

  clearErrors();
  const result = userValidationSchema.safeParse(formData.value);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const fieldKey = issue.path[0] as string;
      formErrors.value[fieldKey] = issue.message;
    });
    activeModalTab.value = "info";
    return;
  }

  submitting.value = true;
  try {
    const roleCode =
      formData.value.aksesLevel ||
      formData.value.aksesGrup ||
      formData.value.role ||
      "ORG_ADMIN";

    const matchedOrg = organizations.value.find(
      (o: any) =>
        o.nama === formData.value.organisasi ||
        o.id === formData.value.organization_id ||
        o.kode === formData.value.organisasi,
    );
    const orgId =
      matchedOrg?.id ||
      formData.value.organization_id ||
      "90000000-0000-0000-0000-000000000001";
    const orgName =
      matchedOrg?.nama ||
      formData.value.organisasi ||
      "PLN Unit Induk Distribusi";
    const isSso =
      formData.value.tipe === "SSO PLN" || formData.value.is_sso === true;
    const isPengelola = Boolean(
      formData.value.akunPengelola || formData.value.is_pengelola,
    );
    const statusKaryawan = formData.value.statusKaryawan || "Tetap";
    const accessLevel =
      formData.value.scopeLevel ||
      formData.value.access_level ||
      formData.value.aksesLevel ||
      (isPengelola ? "GLOBAL" : "CABANG");
    const jabatan = formData.value.jabatan || "Manager Operasi";
    const nip = formData.value.nip || "";
    const pernr =
      formData.value.perNr ||
      formData.value.pernr ||
      formData.value.prnr ||
      "";
    const phoneNumber =
      formData.value.noTelp || formData.value.phone_number || "";
    const password = formData.value.password || "Password123!";

    // Build permission overrides array from tab 2
    const permissionOverrides = Object.entries(userOverrides.value)
      .filter(([_, state]) => state === "GRANTED" || state === "DENIED")
      .map(([key, state]) => ({
        permission_key: key,
        is_granted: state === "GRANTED",
      }));

    const roleAssignments = [
      {
        role_code: roleCode,
        scope_codes: formData.value.scope_codes || [accessLevel],
      },
    ];

    const payload: CreateUserRequest = {
      access_level: accessLevel,
      address: formData.value.alamat || formData.value.address || "",
      akses_grup: roleCode,
      approval_code: formData.value.approval_code || "APP-001",
      description: `User ${roleCode} unit ${orgName}`,
      email: formData.value.email,
      username: formData.value.username || formData.value.email.split("@")[0],
      full_name:
        formData.value.nama || formData.value.full_name || "Pegawai PLN",
      is_pengelola: isPengelola,
      is_sso: isSso,
      jabatan: jabatan,
      jenis_pengguna: formData.value.jenis_pengguna || "Pegawai",
      main_application: "TAMBORA",
      nip: nip,
      organization: orgName,
      organization_id: orgId,
      password: password,
      permission_overrides: permissionOverrides,
      pernr: pernr,
      phone_number: phoneNumber,
      role_assignments: roleAssignments,
      status_karyawan: statusKaryawan,
    };

    if (modalMode.value === "create") {
      await createUser(payload);
    } else {
      await updateUser(formData.value.id, {
        ...payload,
        status:
          statusKaryawan === "Nonaktif" || formData.value.status === 0 ? 0 : 1,
      });
    }
    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    // Handled by global toast
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- ── Page Title Header ───────────────────────────────── -->
    <BasePageHeader />

    <!-- ── Main Card Container ─────────────────────────────── -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- ── Action Controls Bar ───────────────────────────────── -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Data Pengguna..." />
            <BaseExportButton @click="handleExport" />
          </div>

          <div class="flex items-center gap-3">
            <BaseCreateButton label="TAMBAH PENGGUNA" @click="openCreateModal" />
          </div>
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
        <BaseTable
          :columns="userTableColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchUsers"
        >
          <template #statusKaryawan-data="{ row }">
            <BaseBadge
              class="w-20 min-w-[76px]"
              :variant="row.statusKaryawan === 'Aktif' ? 'success' : 'danger'"
            >
              {{ row.statusKaryawan || "Aktif" }}
            </BaseBadge>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton type="edit" @click="handleEdit(row)" />
              <BaseActionButton type="delete" @click="handleDelete(row)" />
            </div>
          </template>
        </BaseTable>

        <!-- ── Pagination Footer ─────────────────────────────────── -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="activeFilteredData.length"
          class="shrink-0 pt-3 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- ── MODAL FORM 2-TAB: USER & PERMISSION OVERRIDES ───────── -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        class="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-primary-50 border border-primary-200 flex items-center justify-center text-primary-700">
              <User class="w-5 h-5" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">{{ modalTitle }}</h3>
              <p class="text-xs text-gray-500">{{ modalSubtitle }}</p>
            </div>
          </div>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            @click="modalOpen = false"
          >
            ✕
          </button>
        </div>

        <!-- Tab Selector Bar -->
        <div class="flex border-b border-gray-200 bg-gray-50/60 px-6 shrink-0">
          <button
            type="button"
            class="py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all"
            :class="
              activeModalTab === 'info'
                ? 'border-primary-600 text-primary-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            "
            @click="activeModalTab = 'info'"
          >
            <User class="w-4 h-4" />
            Tab 1: Informasi Pengguna & Role
          </button>

          <button
            type="button"
            class="py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all relative"
            :class="
              activeModalTab === 'overrides'
                ? 'border-primary-600 text-primary-700 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            "
            @click="activeModalTab = 'overrides'"
          >
            <KeyRound class="w-4 h-4 text-amber-600" />
            Tab 2: Hak Akses Khusus (Overrides)
            <span
              v-if="activeOverridesCount.total > 0"
              class="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300"
            >
              {{ activeOverridesCount.total }}
            </span>
          </button>
        </div>

        <!-- Modal Body Container -->
        <div class="p-6 overflow-y-auto flex-1">
          <!-- ── TAB 1: USER INFO & ROLE FORM ──────────────────── -->
          <div v-show="activeModalTab === 'info'" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Email Pengguna <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.email"
                  type="email"
                  placeholder="operator.manado@pln.co.id"
                  class="w-full text-xs px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  :class="{ 'border-red-400': formErrors.email }"
                >
                <span v-if="formErrors.email" class="text-[11px] text-red-500 mt-1 block">
                  {{ formErrors.email }}
                </span>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Username <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.username"
                  type="text"
                  placeholder="operator_manado"
                  class="w-full text-xs px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-mono"
                >
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Nama Lengkap <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.nama"
                  type="text"
                  placeholder="Operator Cabang Manado"
                  class="w-full text-xs px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  :class="{ 'border-red-400': formErrors.nama }"
                >
                <span v-if="formErrors.nama" class="text-[11px] text-red-500 mt-1 block">
                  {{ formErrors.nama }}
                </span>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Password {{ modalMode === 'create' ? '*' : '(Biarkan kosong jika tidak diubah)' }}
                </label>
                <input
                  v-model="formData.password"
                  type="password"
                  placeholder="Password123!"
                  class="w-full text-xs px-3.5 py-2.5 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-mono"
                >
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Akses Grup / Role Utama <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.aksesLevel"
                  class="w-full text-xs px-3 py-2.5 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-semibold text-gray-800"
                >
                  <option v-for="r in roleOptions" :key="r.value" :value="r.value">
                    {{ r.label }}
                  </option>
                </select>
                <span class="text-[10px] text-gray-500 mt-0.5 block">
                  Role default menentukan himpunan izin awal pengguna.
                </span>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Akses Level (Scope Wilayah) <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.scopeLevel"
                  class="w-full text-xs px-3 py-2.5 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white font-semibold text-gray-800"
                >
                  <option v-for="s in scopeOptions" :key="s.value" :value="s.value">
                    {{ s.label }}
                  </option>
                </select>
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-gray-700 mb-1">
                  Unit Organisasi <span class="text-red-500">*</span>
                </label>
                <select
                  v-model="formData.organisasi"
                  class="w-full text-xs px-3 py-2.5 bg-gray-50/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                >
                  <option v-for="org in orgOptions" :key="org.value" :value="org.value">
                    {{ org.label }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">Status Karyawan</label>
                <select
                  v-model="formData.statusKaryawan"
                  class="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-gray-700 mb-1">NIP / Nomor Pegawai</label>
                <input
                  v-model="formData.nip"
                  type="text"
                  placeholder="Contoh: 8912345Z"
                  class="w-full text-xs px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500 font-mono"
                >
              </div>
            </div>
          </div>

          <!-- ── TAB 2: PERMISSION OVERRIDES (HAK AKSES KHUSUS) ── -->
          <div v-show="activeModalTab === 'overrides'" class="space-y-4">
            <!-- Instruction Banner -->
            <div class="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
              <KeyRound class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div class="font-bold text-amber-900">Hak Akses Khusus (Permission Overrides)</div>
                <div class="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                  Gunakan bagian ini untuk membedakan hak akses 2 user dengan Role yang sama.
                  Misalnya melarang <strong>SENTRAL.DELETE</strong> atau <strong>CABANG.DELETE</strong> khusus untuk akun ini.
                </div>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="flex items-center justify-between gap-3">
              <div class="relative flex-1">
                <Search class="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                <input
                  v-model="overrideSearchQuery"
                  type="text"
                  placeholder="Cari izin fitur (e.g. SENTRAL.DELETE, CABANG.CREATE)..."
                  class="w-full text-xs pl-9 pr-3.5 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                >
              </div>

              <div class="text-xs text-gray-500 shrink-0">
                Total: <strong>{{ permissions.length }}</strong> izin
              </div>
            </div>

            <!-- Overrides Table List -->
            <div class="border border-gray-200 rounded-xl overflow-hidden shadow-2xs max-h-80 overflow-y-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-gray-100/80 text-gray-700 font-bold uppercase text-[10px] tracking-wider border-b border-gray-200 sticky top-0 z-10">
                  <tr>
                    <th class="py-2.5 px-4">Fitur / Permission Key</th>
                    <th class="py-2.5 px-4">Status Override</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr
                    v-for="p in filteredPermissionsForOverrides"
                    :key="p.permission_key"
                    class="hover:bg-gray-50/70 transition-colors"
                  >
                    <td class="py-2 px-4">
                      <div class="font-mono font-bold text-gray-800 text-xs">{{ p.permission_key }}</div>
                      <div class="text-[11px] text-gray-500">{{ p.description || p.resource_name || '-' }}</div>
                    </td>

                    <td class="py-2 px-4">
                      <div class="flex items-center gap-2">
                        <!-- Option 1: Default (Ikut Role) -->
                        <button
                          type="button"
                          class="px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all flex items-center gap-1"
                          :class="
                            !userOverrides[p.permission_key] || userOverrides[p.permission_key] === 'DEFAULT'
                              ? 'bg-gray-100 text-gray-700 border-gray-300 font-bold shadow-2xs'
                              : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                          "
                          @click="setOverrideState(p.permission_key, 'DEFAULT')"
                        >
                          <MinusCircle class="w-3 h-3 text-gray-400" />
                          Ikut Role
                        </button>

                        <!-- Option 2: Izinkan (Grant: true) -->
                        <button
                          type="button"
                          class="px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all flex items-center gap-1"
                          :class="
                            userOverrides[p.permission_key] === 'GRANTED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold shadow-2xs'
                              : 'bg-white text-gray-400 border-gray-200 hover:bg-emerald-50/50 hover:text-emerald-700'
                          "
                          @click="setOverrideState(p.permission_key, 'GRANTED')"
                        >
                          <CheckCircle2 class="w-3 h-3 text-emerald-600" />
                          Izinkan (ON)
                        </button>

                        <!-- Option 3: Blokir (Deny: false) -->
                        <button
                          type="button"
                          class="px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all flex items-center gap-1"
                          :class="
                            userOverrides[p.permission_key] === 'DENIED'
                              ? 'bg-red-50 text-red-800 border-red-300 font-bold shadow-2xs'
                              : 'bg-white text-gray-400 border-gray-200 hover:bg-red-50/50 hover:text-red-700'
                          "
                          @click="setOverrideState(p.permission_key, 'DENIED')"
                        >
                          <XCircle class="w-3 h-3 text-red-600" />
                          Blokir (OFF)
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr v-if="filteredPermissionsForOverrides.length === 0">
                    <td colspan="2" class="py-8 text-center text-gray-400">
                      Tidak ada permission yang cocok dengan kata kunci pencarian.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          <div class="text-xs text-gray-500">
            <span v-if="activeOverridesCount.total > 0">
              Overrides: <strong class="text-emerald-700">{{ activeOverridesCount.granted }} Izinkan</strong>, <strong class="text-red-700">{{ activeOverridesCount.denied }} Blokir</strong>
            </span>
          </div>

          <div class="flex items-center gap-3">
            <button
              type="button"
              class="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              @click="modalOpen = false"
            >
              Batal
            </button>
            <button
              type="button"
              :disabled="submitting"
              class="px-5 py-2 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors flex items-center gap-2 shadow-xs disabled:opacity-60"
              @click="handleSave"
            >
              <svg
                v-if="submitting"
                class="animate-spin h-3.5 w-3.5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>{{ modalMode === 'create' ? 'Simpan Pengguna & Izin' : 'Simpan Perubahan' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Pengguna"
      :message="`Apakah Anda yakin ingin menghapus pengguna '${deleteTarget?.nama || deleteTarget?.full_name || deleteTarget?.username || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />

    <!-- ── View Detail Modal ───────────────────────── -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      :title="detailModalTitle"
      :subtitle="detailModalSubtitle"
      :record-id="detailRecord?.id"
      :created-date="
        detailRecord?.created_at
          ? new Date(detailRecord.created_at).toLocaleString('id-ID', {
              dateStyle: 'full',
              timeStyle: 'short',
            })
          : 'Tidak tersedia'
      "
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
    >
      <template #extra>
        <div class="mt-4 pt-4 border-t border-gray-100 space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <KeyRound class="w-4 h-4 text-emerald-600" />
                Akses Permission
              </span>
              <span
                v-if="detailPermissions.length"
                class="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200"
              >
                {{ detailPermissions.length }} total
              </span>
            </div>

            <div v-if="detailPermissions.length > 6" class="mb-2.5">
              <input
                v-model="permissionSearch"
                type="text"
                placeholder="Cari akses permission..."
                class="w-full text-xs px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-colors"
              >
            </div>

            <div
              v-if="isDetailLoading"
              class="flex items-center justify-center py-4 text-xs text-gray-400 gap-2"
            >
              <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Memuat relasi hak akses user...</span>
            </div>

            <div v-else>
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
                  {{
                    p.Key ||
                    p.permission_key ||
                    `${p.ResourceCode}.${p.ActionCode}`
                  }}
                </span>
              </div>
              <p v-else class="text-xs text-gray-400 italic">
                {{
                  detailPermissions.length === 0
                    ? "Belum ada katalog hak akses yang terdata."
                    : "Tidak ada izin yang cocok dengan kata kunci pencarian."
                }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </BaseDetailModal>
  </div>
</template>
