<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type {
  DetailDataItem,
  CreateUserRequest,
  UpdateUserRequest,
} from "~/types/master.types";
import type { TableColumn } from "~/types";
import {
  getUserFormSections,
  userValidationSchema,
} from "~/schemas/master/user.schema";
import { exportToExcel } from "~/utils/exportExcel";
import { useTableState } from "~/composables/useTableState";

// ── Composables ──────────────────────────────────────────────
const {
  users,
  userDetail,
  loading,
  fetchUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} = useUser();
const { roles, fetchRoles } = useRole();
const { organizations, fetchOrganizations } = useOrganization();
const { permissions, fetchPermissions, fetchPermissionsCombo } =
  usePermission();

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
    fetchOrganizations(),
    fetchPermissions(),
  ]);
});

// Dynamic Form Sections — schema driven with reactive conditional visibility
const activeFormSections = computed(() => {
  return getUserFormSections({
    orgOptions: orgOptions.value,
    roleOptions: roleOptions.value,
    permissionOptions: permissionOptions.value,
  });
});

// Modal states
const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit" | "view">("create");
const formData = ref<Record<string, any>>({});
const formErrors = ref<Record<string, string>>({});
const submitting = ref(false);

const modalTitle = computed(() => {
  if (modalMode.value === "view") return "Detail Data Pengguna";
  if (modalMode.value === "edit") return "Edit Data Pengguna";
  return "Tambah Data Pengguna";
});

const modalSubtitle = computed(() => {
  if (modalMode.value === "view") return "Detail Informasi Pengguna";
  if (modalMode.value === "edit") return "Form Edit Data Pengguna";
  return "Form Tambah Data Pengguna";
});

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    tipe: "SSO PLN",
    akunPengelola: false,
    organisasi: organizations.value[0]?.nama || "",
    aksesLevel: roles.value[0]?.code || "SUPER_ADMIN",
    permissions: [],
    pengelola: "Sewa",
    nama: "",
    jabatan: "Staff",
    statusKaryawan: "Aktif",
    email: "",
    noTelp: "",
    perNr: "",
    nip: "",
    alamat: "",
  };
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
      label: "PerNr",
      value: detailRecord.value.prnr || detailRecord.value.perNr || "-",
    },
    {
      label: "Organisasi",
      value:
        detailRecord.value.organisasi || detailRecord.value.organization || "-",
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
    const res: any = await getUserById(row.id);
    if (res) {
      if (res.user) {
        detailRecord.value = {
          ...row,
          ...res.user,
          nama: res.user.full_name || res.user.username,
          organisasi: res.user.organization || row.organisasi,
          statusKaryawan:
            res.user.status === 1 || res.user.status === "1"
              ? "Aktif"
              : "Nonaktif",
        };
      }
      if (Array.isArray(res.roles)) {
        detailRoles.value = res.roles;
      }
      if (Array.isArray(res.access?.permissions)) {
        detailPermissions.value = res.access.permissions;
      }
    }
  } catch {
    // Fallback to table row data on fetch error
  } finally {
    isDetailLoading.value = false;
  }
};

const openEditFromDetail = () => {
  if (detailRecord.value) {
    handleEdit(detailRecord.value);
  }
};

const handleEdit = async (row: any) => {
  modalMode.value = "edit";
  const matchedRole =
    row.roles?.[0]?.role_code ||
    row.role_assignments?.[0]?.role_code ||
    row.aksesLevel ||
    roles.value[0]?.code ||
    "SUPER_ADMIN";

  let userPermissions: string[] = [];

  // 1. Fetch user detail & permissions via getUserById (GET /api/v1/users/:id)
  try {
    const userDetailRes: any = await getUserById(row.id);
    if (
      userDetailRes?.access?.permissions &&
      Array.isArray(userDetailRes.access.permissions)
    ) {
      userPermissions = userDetailRes.access.permissions.map(
        (p: any) =>
          p.Key ||
          p.permission_key ||
          p.ID ||
          `${p.ResourceCode}.${p.ActionCode}`,
      );
    }
  } catch {
    // fallback if getUserById fails
  }

  // 2. If permissions not in detail, attempt combo endpoint as fallback
  if (userPermissions.length === 0) {
    try {
      const comboRes: any = await fetchPermissionsCombo(row.id);
      if (Array.isArray(comboRes)) {
        userPermissions = comboRes
          .filter(
            (item: any) =>
              item.is_selected ||
              item.selected ||
              item.checked ||
              typeof item === "string",
          )
          .map((item: any) =>
            typeof item === "string"
              ? item
              : item.permission_key || item.key || item.id || item.code,
          );
        if (!userPermissions.length && comboRes.length) {
          userPermissions = comboRes.map((item: any) =>
            typeof item === "string"
              ? item
              : item.permission_key || item.key || item.id || item.code,
          );
        }
      } else if (comboRes && Array.isArray(comboRes.permissions)) {
        userPermissions = comboRes.permissions.map((p: any) =>
          typeof p === "string" ? p : p.permission_key || p.key || p.id,
        );
      }
    } catch {
      if (Array.isArray(row.permissions)) {
        userPermissions = row.permissions;
      } else if (Array.isArray(row.permission_overrides)) {
        userPermissions = row.permission_overrides
          .filter((o: any) => o.is_granted)
          .map((o: any) => o.permission_key);
      }
    }
  }

  formData.value = {
    ...row,
    id: row.id,
    nama: row.nama || row.full_name,
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
    permissions: userPermissions,
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
  } catch (err: any) {
    // Error is handled by useApi global toast
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
    return;
  }

  submitting.value = true;
  try {
    const roleCode =
      formData.value.aksesGrup ||
      formData.value.aksesLevel ||
      formData.value.role ||
      "SUPER_ADMIN";
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
      formData.value.access_level ||
      formData.value.aksesLevel ||
      (isPengelola ? "Pusat" : "Unit");
    const jabatan = formData.value.jabatan || "Manager Operasi";
    const nip = formData.value.nip || "";
    const pernr =
      formData.value.perNr ||
      formData.value.pernr ||
      formData.value.prnr ||
      "";
    const phoneNumber =
      formData.value.noTelp || formData.value.phone_number || "";
    const approvalCode = formData.value.approval_code || "APP-001";
    const description =
      formData.value.description ||
      (jabatan ? `User ${jabatan} wilayah` : "User manager operasi wilayah");
    const password = formData.value.password || "PLN@Tambora123";
    const permissionOverrides = formData.value.permission_overrides || [];
    const roleAssignments = [
      {
        role_code: roleCode,
        scope_codes: formData.value.scope_codes || [],
      },
    ];

    const payload: CreateUserRequest = {
      access_level: accessLevel,
      address: formData.value.alamat || formData.value.address || "",
      akses_grup: roleCode,
      approval_code: approvalCode,
      description: description,
      email: formData.value.email,
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
    alert("Gagal menyimpan: " + (err?.message || err));
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- ── Page Title Header ───────────────────────────────── -->
    <BasePageHeader />

    <!-- ── Main Card Container (Flex-1, No Page Scroll) ────────── -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- ── Action Controls Bar ───────────────────────────────── -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
          <!-- Left: Search input + Export button -->
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Data" />
            <BaseExportButton @click="handleExport" />
          </div>

          <!-- Right: Create Data Button -->
          <div class="flex items-center gap-3">
            <BaseCreateButton label="TAMBAH DATA" @click="openCreateModal" />
          </div>
        </div>

        <!-- ── Table Container (Flex-1 Scrollable) ───────────────── -->
        <BaseTable
          :columns="userTableColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchUsers"
        >
          <!-- Status Karyawan Cell Slot -->
          <template #statusKaryawan-data="{ row }">
            <BaseBadge
              class="w-20 min-w-[76px]"
              :variant="row.statusKaryawan === 'Aktif' ? 'success' : 'danger'"
            >
              {{ row.statusKaryawan || "Aktif" }}
            </BaseBadge>
          </template>

          <!-- Action Buttons Cell Slot -->
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

    <!-- ── Form Modal (Create / Edit / View) ─────────────────── -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="activeFormSections"
      :submitting="submitting"
      :errors="formErrors"
      @submit="handleSave"
      @cancel="clearErrors"
    />

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
          <!-- Permissions Section -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span
                class="text-xs font-bold text-gray-700 flex items-center gap-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-4 h-4 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                  />
                </svg>
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
              />
            </div>

            <div
              v-if="isDetailLoading"
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
              <span>Memuat relasi hak akses user...</span>
            </div>

            <div v-else>
              <!-- Permission Badges List with PrimeVue Tooltip -->
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
