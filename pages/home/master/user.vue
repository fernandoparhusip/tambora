<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { z } from "zod";
import BaseDetailModal from "~/components/base/BaseDetailModal.vue";
import type { DetailDataItem } from "~/components/base/BaseDetailModal.vue";
import type { TableColumn, FormSectionConfig } from "~/types";
import { getUserFormSections } from "~/schemas/master/user.schema";
import { useUser } from "~/composables/master/useUser";
import { useRole } from "~/composables/master/useRole";
import { useOrganization } from "~/composables/master/useOrganization";
import BaseConfirmDialog from "~/components/base/BaseConfirmDialog.vue";
import { exportToExcel } from "~/utils/exportExcel";

// ── Composables ──────────────────────────────────────────────
const { users, loading, fetchUsers, createUser, updateUser, deleteUser } = useUser();
const { roles, fetchRoles } = useRole();
const { organizations, fetchOrganizations } = useOrganization();

// ── Table Columns Config ──────────────────────────────────────
const userTableColumns: TableColumn[] = [
  { key: "nama", label: "Nama", sortable: true, type: "text" },
  { key: "aksesLevel", label: "Akses Level", sortable: true, type: "text" },
  { key: "organisasi", label: "Organisasi", sortable: true, type: "text" },
  { key: "aksesGrup", label: "Akses Grup", sortable: true, type: "text" },
  { key: "statusKaryawan", label: "Status Karyawan", sortable: true, type: "custom" },
  { key: "actions", label: "Aksi", sortable: false, type: "custom" }
];

const orgOptions = computed(() =>
  organizations.value.map((o: any) => ({ label: `${o.nama} (${o.kode})`, value: o.nama }))
);

// ── Form Sections Config Builder ──────────────────────────────
const getUserFormSections = (akunPengelola: boolean = false): FormSectionConfig[] => {
  const headerFields: FormSectionConfig["fields"] = [
    {
      key: "tipe",
      label: "Type",
      type: "radio",
      options: [
        { label: "SSO PLN", value: "SSO PLN" },
        { label: "Non-SSO User", value: "Non-SSO User" }
      ],
      helpText: "Non-SSO User akan dibuatkan akun internal aplikasi.",
      colSpan: 12,
      required: true
    },
    {
      key: "akunPengelola",
      label: "Akun Pengelola?",
      type: "switch",
      helpText: "Akun pengelola dapat mengelola semua organisasi dalam grup.",
      colSpan: 12,
      required: false
    }
  ];

  const pengelolaOffFields: FormSectionConfig["fields"] = [
    {
      key: "organisasi",
      label: "Organisasi",
      type: "searchable-select",
      placeholder: "Pilih Organisasi...",
      options: orgOptions.value,
      colSpan: 12,
      required: true
    },
    {
      key: "aksesLevel",
      label: "Akses Level (Role)",
      type: "searchable-select",
      placeholder: "Pilih Role...",
      options: roles.value.map(r => ({ label: r.name || r.code, value: r.code })),
      helpText: "Pilih role hak akses pengguna",
      colSpan: 12,
      required: true
    },
    {
      key: "aksesGrup",
      label: "Akses Grup",
      type: "searchable-multi-select",
      placeholder: "Pilih Akses Grup...",
      options: [
        { label: "Grup 1", value: "Grup 1" },
        { label: "Grup 2", value: "Grup 2" },
        { label: "Grup Operations", value: "Grup Operations" }
      ],
      colSpan: 12,
      required: false
    },
    {
      key: "aplikasiUtama",
      label: "Aplikasi Utama",
      type: "searchable-select",
      placeholder: "Pilih Aplikasi...",
      options: [
        { label: "APP 1 - Konfigurasi", value: "APP 1 - Konfigurasi" },
        { label: "APP 2 - Operasi Pembangkit", value: "APP 2 - Operasi Pembangkit" },
        { label: "APP 3 - Laporan & Keuangan", value: "APP 3 - Laporan & Keuangan" }
      ],
      colSpan: 12,
      required: false
    }
  ];

  const pengelolaOnFields: FormSectionConfig["fields"] = [
    {
      key: "aplikasiUtama",
      label: "Aplikasi Utama",
      type: "searchable-select",
      placeholder: "Pilih Aplikasi...",
      options: [
        { label: "APP 1 - Konfigurasi", value: "APP 1 - Konfigurasi" },
        { label: "APP 2 - Operasi Pembangkit", value: "APP 2 - Operasi Pembangkit" }
      ],
      colSpan: 12,
      required: false
    },
    {
      key: "pengelola",
      label: "Pengelola",
      type: "searchable-select",
      placeholder: "Pilih Pengelola...",
      options: [
        { label: "Sewa", value: "Sewa" },
        { label: "PLN Pusat", value: "PLN Pusat" }
      ],
      colSpan: 12,
      required: false
    }
  ];

  const profileFields: FormSectionConfig["fields"] = [
    {
      key: "nama",
      label: "Nama Lengkap",
      type: "text",
      placeholder: "Masukkan nama lengkap...",
      colSpan: 12,
      required: true
    },
    {
      key: "jabatan",
      label: "Jabatan",
      type: "text",
      placeholder: "Contoh: Staff Operasi, Supervisor Unit",
      colSpan: 6,
      required: false
    },
    {
      key: "statusKaryawan",
      label: "Status Karyawan",
      type: "searchable-select",
      placeholder: "Pilih Status...",
      options: [
        { label: "Aktif", value: "Aktif" },
        { label: "Nonaktif", value: "Nonaktif" }
      ],
      colSpan: 6,
      required: true
    },
    {
      key: "email",
      label: "Email",
      type: "email",
      placeholder: "contoh@pln.co.id",
      colSpan: 6,
      required: true
    },
    {
      key: "noTelp",
      label: "No. Telepon / WA",
      type: "text",
      placeholder: "+6281234567890",
      colSpan: 6,
      required: false
    },
    {
      key: "nip",
      label: "NIP",
      type: "text",
      placeholder: "Masukkan NIP pegawai...",
      colSpan: 6,
      required: false
    },
    {
      key: "perNr",
      label: "PerNr",
      type: "text",
      placeholder: "Nomor Personnel...",
      colSpan: 6,
      required: false
    },
    {
      key: "alamat",
      label: "Alamat",
      type: "textarea",
      placeholder: "Alamat tempat tinggal...",
      colSpan: 12,
      required: false,
      rows: 2
    }
  ];

  return [
    {
      fields: [
        ...headerFields,
        ...(akunPengelola ? pengelolaOnFields : pengelolaOffFields),
        ...profileFields
      ]
    }
  ];
};

const userValidationSchema = z.object({
  nama: z.string().min(1, "Nama lengkap wajib diisi"),
  email: z.string().email("Format email tidak valid"),
  tipe: z.string().optional(),
  organisasi: z.string().optional(),
  aksesLevel: z.string().optional(),
  statusKaryawan: z.string().optional(),
  jabatan: z.string().optional(),
  nip: z.string().optional(),
  perNr: z.string().optional(),
  noTelp: z.string().optional(),
  alamat: z.string().optional(),
  akunPengelola: z.boolean().optional()
});

// Reactive States
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

onMounted(async () => {
  await Promise.allSettled([fetchUsers(), fetchRoles(), fetchOrganizations()]);
});

// Dynamic Form Sections — driven by akunPengelola
const activeFormSections = computed(() => {
  return getUserFormSections(Boolean(formData.value?.akunPengelola));
});

// Reset pagination on search
watch(searchQuery, () => {
  currentPage.value = 1;
});

// ── Filtered & Paginated ──────────────────────────────────────
const activeFilteredData = computed(() => {
  const list = users.value;
  const q = searchQuery.value.toLowerCase();
  if (!q) return list;
  return list.filter((row: any) =>
    Object.values(row).some((val) => String(val).toLowerCase().includes(q))
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return activeFilteredData.value.slice(start, start + pageSize.value);
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
    aksesGrup: ["Grup 1"],
    aplikasiUtama: "APP 1 - Konfigurasi",
    pengelola: "Sewa",
    nama: "",
    jabatan: "Staff",
    statusKaryawan: "Aktif",
    email: "",
    noTelp: "",
    perNr: "",
    nip: "",
    alamat: ""
  };
  clearErrors();
  modalOpen.value = true;
};

const isDetailModalOpen = ref(false);
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<any>(null);
const isDeleting = ref(false);
const detailRecord = ref<any>(null);

const detailModalTitle = computed(() => "View Data Pengguna");
const detailModalSubtitle = computed(() => "Form View Data Pengguna");

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const items: DetailDataItem[] = [
    { label: "Nama Lengkap", value: detailRecord.value.nama || detailRecord.value.full_name },
    { label: "Email", value: detailRecord.value.email || "-" },
    { label: "Username", value: detailRecord.value.username || "-" },
    { label: "NIP", value: detailRecord.value.nip || "-" },
    { label: "PerNr", value: detailRecord.value.prnr || detailRecord.value.perNr || "-" },
    { label: "Organisasi", value: detailRecord.value.organisasi || detailRecord.value.organization || "-" },
    { label: "Role Akses", value: detailRecord.value.aksesLevel || detailRecord.value.role_assignments?.[0]?.role_code || "-" },
    {
      label: "Status Karyawan",
      value: detailRecord.value.statusKaryawan || (detailRecord.value.status === 1 ? "Aktif" : "Nonaktif"),
      isStatus: true
    },
    { label: "Alamat", value: detailRecord.value.alamat || "-" },
    { label: "No. Telp", value: detailRecord.value.noTelp || "-" }
  ];
  return items;
});

const handleView = (row: any) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const openEditFromDetail = () => {
  if (detailRecord.value) {
    handleEdit(detailRecord.value);
  }
};

const handleEdit = (row: any) => {
  modalMode.value = "edit";
  formData.value = {
    ...row,
    nama: row.nama || row.full_name,
    organisasi: row.organisasi || row.organization,
    aksesLevel: row.aksesLevel || row.role_assignments?.[0]?.role_code || "SUPER_ADMIN"
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
    const roleCode = formData.value.aksesLevel || formData.value.role || "USER";
    if (modalMode.value === "create") {
      const username = formData.value.username || formData.value.email?.split("@")[0] || `user_${Date.now()}`;
      await createUser({
        email: formData.value.email || `${username}@pln.co.id`,
        username,
        full_name: formData.value.nama || "Pegawai PLN",
        password: formData.value.password || "PLN123!default",
        organization: formData.value.organisasi || "BaseTambora",
        nip: formData.value.nip || "",
        prnr: formData.value.perNr || formData.value.prnr || "",
        role_assignments: [{ role_code: roleCode, scope_codes: [] }]
      });
    } else {
      await updateUser(formData.value.id, {
        full_name: formData.value.nama || formData.value.full_name,
        organization: formData.value.organisasi,
        nip: formData.value.nip,
        prnr: formData.value.perNr || formData.value.prnr,
        status: formData.value.statusKaryawan === "Nonaktif" ? 0 : 1,
        role_assignments: [{ role_code: roleCode, scope_codes: [] }]
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
    <BasePageHeader title="Pengguna" />

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
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Nama / Email / NIP..." />
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
        >
          <!-- Status Karyawan Cell Slot -->
          <template #statusKaryawan-data="{ row }">
            <BaseBadge :variant="row.statusKaryawan === 'Aktif' ? 'success' : 'danger'">
              {{ row.statusKaryawan || 'Aktif' }}
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
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
    />
  </div>
</template>
