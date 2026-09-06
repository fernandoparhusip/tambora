<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { DetailDataItem, CreateUserRequest } from "~/types/master.types";
import type { TableColumn } from "~/types";
import type { ActivityLogItem } from "~/components/base/BaseDetailModal.vue";
import { formatAppDateTime } from "~/utils/formatDate";
import {
  getUserFormSections,
  userValidationSchema,
} from "~/schemas/master/user.schema";
import { useTableState } from "~/composables/useTableState";
import { useAsyncDetail } from "~/composables/useAsyncDetail";
import { useScope } from "~/composables/master/useScope";
import { KeyRound } from "@lucide/vue";

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
  roles.value.map((r: any) => {
    const code = r.code || r.Code || r.role_code || r.RoleCode || r.id;
    const name = r.name || r.Name || r.role_name || r.nama || code;
    return {
      label: name && name !== code ? `${name} (${code})` : name || code,
      value: code,
    };
  }),
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
  permissions.value.map((p: any) => {
    const key = p.permission_key || p.Key || p.id;
    const desc = p.description || p.Description || p.name || "";
    return {
      label: desc ? `${key} - ${desc}` : key,
      value: key,
    };
  }),
);

// Dynamic Form Sections Config
const activeFormSections = computed(() => {
  return getUserFormSections({
    orgOptions: orgOptions.value,
    roleOptions: roleOptions.value,
    scopeOptions: scopeOptions.value,
    permissionOptions: permissionOptions.value,
  });
});

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
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit" | "view">("create");
const formData = ref<Record<string, any>>({});
const formErrors = ref<Record<string, string>>({});
const submitting = ref(false);

const modalTitle = computed(() => {
  if (modalMode.value === "view") return "Detail Data Pengguna";
  if (modalMode.value === "edit") return "Ubah Data Pengguna";
  return "Tambah Data Pengguna";
});

const modalSubtitle = computed(() => {
  if (modalMode.value === "view") return "Informasi Pengguna";
  if (modalMode.value === "edit") return "Form Ubah Pengguna";
  return "Form Tambah Pengguna";
});

const openCreateModal = () => {
  if (roles.value.length === 0) fetchRoles().catch(() => {});
  if (organizations.value.length === 0) fetchOrganizations().catch(() => {});
  if (scopes.value.length === 0) fetchScopes().catch(() => {});
  if (permissions.value.length === 0) fetchPermissions().catch(() => {});

  modalMode.value = "create";
  formData.value = {
    tipe: "SSO PLN",
    akunPengelola: false,
    organisasi: "",
    aksesLevel: "",
    scopeLevel: "",
    permissions: [],
    pengelola: "",
    nama: "",
    username: "",
    jabatan: "",
    statusKaryawan: "",
    email: "",
    password: "",
    noTelp: "",
    perNr: "",
    nip: "",
    alamat: "",
  };
  clearErrors();
  modalOpen.value = true;
};

const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<any>(null);
const isDeleting = ref(false);
const detailRoles = ref<any[]>([]);
const detailPermissions = ref<any[]>([]);
const permissionSearch = ref("");
const hoveredPermission = ref<any>(null);

const {
  isDetailModalOpen,
  detailRecord,
  detailLoading: isDetailLoading,
  handleView: baseHandleView,
  closeDetailModal: baseCloseDetailModal,
  openEditFromDetail: openEditFromUserDetail,
} = useAsyncDetail<any>({
  fetchDetail: async (id: string) => {
    const res: any = await getUserById(id);
    if (res) {
      if (res.roles && Array.isArray(res.roles)) {
        detailRoles.value = res.roles;
      }
      if (res.access?.permissions && Array.isArray(res.access.permissions)) {
        detailPermissions.value = res.access.permissions;
      }
    }
    return res;
  },
  onEdit: (record: any) => handleEdit(record),
});

const handleView = (row: any) => {
  detailRoles.value = row.role_assignments || [];
  detailPermissions.value = [];
  permissionSearch.value = "";
  hoveredPermission.value = null;
  baseHandleView(row);
};

const closeUserDetailModal = () => {
  baseCloseDetailModal();
  detailRoles.value = [];
  detailPermissions.value = [];
  permissionSearch.value = "";
  hoveredPermission.value = null;
};

const detailModalTitle = computed(() => "Detail Pengguna");
const detailModalSubtitle = computed(() => "Informasi Pengguna");

const currentUserData = computed(() => {
  if (!detailRecord.value) return null;
  return detailRecord.value.user || detailRecord.value;
});

const formattedCreatedDate = computed(() => {
  const u = currentUserData.value;
  const dt = u?.created_at;
  if (!dt || dt.startsWith("0001-01-01")) {
    const historyList = (detailRecord.value as any)?.history || u?.history;
    if (Array.isArray(historyList) && historyList.length > 0) {
      const createItem =
        historyList.find((h: any) => h.action === "CREATE") || historyList[0];
      if (
        createItem?.created_at &&
        !createItem.created_at.startsWith("0001-01-01")
      ) {
        return formatAppDateTime(createItem.created_at);
      }
    }
    return "-";
  }
  return formatAppDateTime(dt);
});

const activityLogs = computed<ActivityLogItem[]>(() => {
  if (!detailRecord.value) return [];
  const u = currentUserData.value;
  const historyList = (detailRecord.value as any)?.history || u?.history || [];

  if (Array.isArray(historyList) && historyList.length > 0) {
    return historyList.map((item: any) => {
      const userName =
        item.user_name ||
        item.created_by_name ||
        item.user ||
        u?.full_name ||
        u?.nama ||
        "Admin";
      const initial = (userName || "A").charAt(0).toUpperCase();
      const actionText =
        item.title ||
        (item.action === "CREATE"
          ? `Membuat Pengguna ${u?.full_name || u?.nama || ""}`.trim()
          : item.action === "UPDATE"
            ? `Mengubah Pengguna ${u?.full_name || u?.nama || ""}`.trim()
            : item.action || "Aktivitas Pengguna");
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
    u?.created_by_name ||
    u?.created_by ||
    "Admin";
  return [
    {
      initial: creator.charAt(0).toUpperCase(),
      user: creator,
      action: `Membuat Pengguna ${u?.full_name || u?.nama || ""}`.trim(),
      timestamp: formattedCreatedDate.value,
    },
  ];
});

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!currentUserData.value) return [];
  const u = currentUserData.value;
  const items: DetailDataItem[] = [
    {
      label: "Nama",
      value: u.nama || u.full_name || u.name || "-",
    },
    { label: "Email", value: u.email || "-" },
    { label: "Username", value: u.username || "-" },
    { label: "NIP", value: u.nip || "-" },
    {
      label: "PerNR",
      value: u.pernr || u.prnr || u.perNr || "-",
    },
    {
      label: "Organisasi",
      value: u.organisasi || u.organization || u.organization_name || "-",
    },
    {
      label: "Jabatan",
      value: u.jabatan || "-",
    },
    {
      label: "Role Akses",
      value:
        detailRoles.value.length > 0
          ? detailRoles.value
              .map((r: any) => r.role_name || r.name || r.role_code)
              .join(", ")
          : u.aksesLevel ||
            u.akses_grup ||
            u.role_assignments?.[0]?.role_code ||
            "-",
    },
    {
      label: "Status Karyawan",
      value:
        u.status_karyawan ||
        u.statusKaryawan ||
        (u.status === 1 || u.status === "1" ? "Aktif" : "Nonaktif"),
      isStatus: true,
    },
    {
      label: "Alamat",
      value: u.address || u.alamat || "-",
    },
    {
      label: "No. Telp",
      value: u.phone_number || u.noTelp || u.phone || "-",
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
  if (p.Description || p.description) {
    return p.Description || p.description;
  }
  if (p.ResourceName && p.ActionName) {
    return `${p.ResourceName} • ${p.ActionName}`;
  }
  return (
    p.Key ||
    p.permission_key ||
    `${p.ResourceCode || "SISTEM"}.${p.ActionCode || "AKSI"}`
  );
};

const handleEdit = async (row: any) => {
  modalMode.value = "edit";
  const userObj = row?.user || row;
  let matchedRole = "ORG_ADMIN";
  if (detailRoles.value && detailRoles.value.length > 0) {
    matchedRole =
      detailRoles.value[0].role_code ||
      detailRoles.value[0].role_name ||
      matchedRole;
  } else if (userObj.role_assignments && userObj.role_assignments.length > 0) {
    matchedRole = userObj.role_assignments[0].role_code;
  } else if (userObj.aksesLevel) {
    matchedRole = userObj.aksesLevel;
  } else if (userObj.role) {
    matchedRole = userObj.role;
  }

  // Prepopulate permissions
  const selectedPermissions: string[] = [];
  if (Array.isArray(userObj.permission_overrides)) {
    userObj.permission_overrides.forEach((o: any) => {
      if (o.is_granted && o.permission_key) {
        selectedPermissions.push(o.permission_key);
      }
    });
  } else if (Array.isArray(userObj.permissions)) {
    userObj.permissions.forEach((p: any) => {
      const key = typeof p === "string" ? p : p.permission_key || p.Key || p.id;
      if (key) selectedPermissions.push(key);
    });
  }

  formData.value = {
    ...userObj,
    id: userObj.id || row.id,
    nama: userObj.nama || userObj.full_name,
    username: userObj.username || "",
    email: userObj.email || "",
    organisasi: userObj.organisasi || userObj.organization || "",
    nip: userObj.nip || "",
    perNr: userObj.perNr || userObj.prnr || userObj.pernr || "",
    statusKaryawan:
      userObj.status === 0 ||
      userObj.status === "0" ||
      userObj.status_karyawan === "Nonaktif" ||
      userObj.statusKaryawan === "Nonaktif"
        ? "Nonaktif"
        : "Aktif",
    aksesLevel: matchedRole,
    scopeLevel: userObj.access_level || "CABANG",
    permissions: selectedPermissions,
    tipe: userObj.is_sso ? "SSO PLN" : userObj.tipe || "SSO PLN",
    akunPengelola: Boolean(userObj.is_pengelola || userObj.akunPengelola),
    pengelola: userObj.pengelola || "Sewa",
    jabatan: userObj.jabatan || "Staff",
    noTelp: userObj.phone_number || userObj.noTelp || "",
    alamat: userObj.address || userObj.alamat || "",
  };
  clearErrors();
  modalOpen.value = true;
};

const openEditFromDetail = () => {
  openEditFromUserDetail((record: any) => {
    handleEdit(record);
  });
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

const clearErrors = () => {
  formErrors.value = {};
};

const handleSave = async (data?: Record<string, any>) => {
  if (modalMode.value === "view") {
    modalOpen.value = false;
    return;
  }

  const currentData = data || formData.value;
  clearErrors();
  const result = userValidationSchema.safeParse(currentData);
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
      currentData.aksesLevel ||
      currentData.aksesGrup ||
      currentData.role ||
      "ORG_ADMIN";

    const matchedOrg = organizations.value.find(
      (o: any) =>
        o.nama === currentData.organisasi ||
        o.id === currentData.organization_id ||
        o.kode === currentData.organisasi,
    );
    const orgId =
      matchedOrg?.id ||
      currentData.organization_id ||
      "90000000-0000-0000-0000-000000000001";
    const orgName =
      matchedOrg?.nama || currentData.organisasi || "PLN Unit Induk Distribusi";
    const isSso = currentData.tipe === "SSO PLN" || currentData.is_sso === true;
    const isPengelola = Boolean(
      currentData.akunPengelola || currentData.is_pengelola,
    );
    const statusKaryawan = currentData.statusKaryawan || "Tetap";
    const accessLevel =
      currentData.scopeLevel ||
      currentData.access_level ||
      (isPengelola ? "GLOBAL" : "CABANG");
    const jabatan = currentData.jabatan || "Manager Operasi";
    const nip = currentData.nip || "";
    const pernr =
      currentData.perNr || currentData.pernr || currentData.prnr || "";
    const phoneNumber = currentData.noTelp || currentData.phone_number || "";
    const password = currentData.password || "Password123!";

    // Build permission overrides from multi-select array
    const selectedPerms: string[] = Array.isArray(currentData.permissions)
      ? currentData.permissions
      : [];
    const permissionOverrides = selectedPerms.map((permKey: string) => ({
      permission_key: permKey,
      is_granted: true,
    }));

    const roleAssignments = [
      {
        role_code: roleCode,
        scope_codes: currentData.scope_codes || [accessLevel],
      },
    ];

    const payload: CreateUserRequest = {
      access_level: accessLevel,
      address: currentData.alamat || currentData.address || "",
      akses_grup: roleCode,
      approval_code: currentData.approval_code || "APP-001",
      description: `User ${roleCode} unit ${orgName}`,
      email: currentData.email,
      username:
        currentData.username || currentData.email?.split("@")[0] || "user_pln",
      full_name: currentData.nama || currentData.full_name || "Pegawai PLN",
      is_pengelola: isPengelola,
      is_sso: isSso,
      jabatan: jabatan,
      jenis_pengguna: currentData.jenis_pengguna || "Pegawai",
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
      await updateUser(currentData.id, {
        ...payload,
        status:
          statusKaryawan === "Nonaktif" || currentData.status === 0 ? 0 : 1,
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
          <!-- Left: Search input -->
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" />
          </div>

          <div class="flex items-center gap-3">
            <BaseCreateButton resource="USER" @click="openCreateModal" />
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
              <BaseActionButton
                type="edit"
                resource="USER"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                type="delete"
                resource="USER"
                @click="handleDelete(row)"
              />
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

    <!-- ── Form Modal (Create / Edit) ─────────────────── -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="activeFormSections"
      :submitting="submitting"
      :errors="formErrors"
      draft-key="master_user_form_draft"
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
      :record-id="currentUserData?.id || detailRecord?.id"
      :loading="isDetailLoading"
      :created-date="formattedCreatedDate"
      :created-by="
        currentUserData?.created_by_name ||
        currentUserData?.created_by ||
        'Admin'
      "
      :activity-logs="activityLogs"
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
      @close="closeUserDetailModal"
    >
      <template #extra>
        <div class="mt-4 pt-4 border-t border-gray-100 space-y-4">
          <div>
            <div class="flex items-center justify-between mb-2">
              <span
                class="text-xs font-bold text-gray-700 flex items-center gap-1.5"
              >
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
