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
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Data" />
            <BaseExportButton @click="handleExport" />
          </div>

          <!-- Right: Dynamic Tab Filter + Create Data Button -->
          <div class="flex flex-wrap items-center gap-3">
            <BaseTabFilter v-model="activeTabKey" :items="userCategoryTabs" />
            <BaseCreateButton label="TAMBAH DATA" @click="openCreateModal" />
          </div>
        </div>

        <!-- ── Table Container (Flex-1 Scrollable) ───────────────── -->
        <BaseTable
          :columns="activeColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
        >
          <!-- Status Karyawan Cell Slot -->
          <template #statusKaryawan-data="{ row }">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold"
              :class="
                row.statusKaryawan === 'Aktif'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-red-50 text-red-600'
              "
            >
              {{ row.statusKaryawan || "Aktif" }}
            </span>
          </template>

          <!-- Status Slot for Pengemudi tab -->
          <template #status-data="{ row }">
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-600"
            >
              {{ row.status || "Aktif" }}
            </span>
          </template>

          <!-- Action Buttons Cell Slot -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <!-- View Button (Eye) -->
              <button
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors cursor-pointer"
                title="Detail"
                @click="handleView(row)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>

              <!-- Edit Button (Pencil) -->
              <button
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
                title="Edit"
                @click="handleEdit(row)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>

              <!-- Delete Button (Trash) -->
              <button
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                title="Hapus"
                @click="handleDelete(row)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
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

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import BaseDetailModal from "~/components/base/BaseDetailModal.vue";
import type { DetailDataItem } from "~/components/base/BaseDetailModal.vue";
import { userTableColumns } from "~/config/tables/masterUser";
import {
  getUnifiedFormSections,
  getUnifiedValidationSchema,
} from "~/config/forms/masterUser";
import type { TableColumn } from "~/components/base/BaseTable.vue";
import type { TabItem } from "~/components/base/BaseTabFilter.vue";

// ── Pengemudi Columns ─────────────────────────────────────────
const pengemudiColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "namaPengemudi", label: "Nama Pengemudi" },
  { key: "tempatLahir", label: "Tempat Lahir" },
  { key: "tanggalLahir", label: "Tanggal Lahir" },
  { key: "umurPengemudi", label: "Umur Pengemudi" },
  { key: "alamat", label: "Alamat" },
  { key: "tanggalMulaiBekerja", label: "Tanggal Mulai Bekerja" },
  { key: "tanggalAkhirBekerja", label: "Tanggal Akhir Bekerja" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Aksi" },
];

// Dynamic Tab Items
const userCategoryTabs: TabItem[] = [
  { key: "Pegawai", label: "Pegawai" },
  { key: "Pengemudi", label: "Pengemudi" },
];

// Reactive States
const searchQuery = ref("");
const activeTabKey = ref("Pegawai");
const currentPage = ref(1);
const pageSize = ref(5);
const loading = ref(false);

// ── Active Tab Computed ───────────────────────────────────────
const activeColumns = computed(() =>
  activeTabKey.value === "Pengemudi" ? pengemudiColumns : userTableColumns
);

// Dynamic Form Sections — driven by jenisPengguna + akunPengelola
const activeFormSections = computed(() =>
  getUnifiedFormSections(
    formData.value?.jenisPengguna || "Pegawai",
    Boolean(formData.value?.akunPengelola),
  )
);

const activeSchema = computed(() =>
  getUnifiedValidationSchema(formData.value?.jenisPengguna || "Pegawai")
);

interface UserItem {
  id: string;
  nama: string;
  aksesLevel: string;
  organisasi: string;
  aksesGrup: string;
  statusKaryawan: string;
  tipe?: string;
  akunPengelola?: boolean;
  aplikasiUtama?: string;
  pengelola?: string;
  approvalCode?: string[];
  jabatan?: string;
  email?: string;
  noTelp?: string;
  perNr?: string;
  nip?: string;
  deskripsi?: string;
  alamat?: string;
  kategori: string;
}

// Sample Mock Users Data matching design screenshot
const usersList = ref<UserItem[]>([
  {
    id: "1",
    nama: "FELDAN ILHAMI",
    aksesLevel: "MANAGER UPK",
    organisasi: "PLN UPK Tambora",
    aksesGrup: "Grup Operations",
    statusKaryawan: "Aktif",
    tipe: "SSO PLN",
    akunPengelola: false,
    aplikasiUtama: "APP 1 - Konfigurasi",
    jabatan: "Manager",
    email: "feldan.ilhami@pln.co.id",
    noTelp: "+6281234567890",
    perNr: "12345678",
    nip: "123456789012345678",
    deskripsi: "Manager UPK Tambora",
    alamat: "Mataram, NTB",
    kategori: "Pegawai",
  },
  {
    id: "2",
    nama: "Freya",
    aksesLevel: "STAFF UIW",
    organisasi: "UIW NTB",
    aksesGrup: "Grup Admin",
    statusKaryawan: "Aktif",
    tipe: "SSO PLN",
    akunPengelola: false,
    aplikasiUtama: "APP 1 - Konfigurasi",
    jabatan: "Staff",
    email: "freya@pln.co.id",
    noTelp: "+6281234567891",
    perNr: "23456789",
    nip: "234567890123456789",
    deskripsi: "Staff UIW NTB",
    alamat: "Mataram",
    kategori: "Pegawai",
  },
  {
    id: "3",
    nama: "Mike Portnoy",
    aksesLevel: "SUPERVISOR",
    organisasi: "PLN UPK Maluku",
    aksesGrup: "Grup Technical",
    statusKaryawan: "Aktif",
    tipe: "SSO PLN",
    akunPengelola: true,
    pengelola: "Sewa",
    aplikasiUtama: "APP 1 - Konfigurasi",
    jabatan: "Supervisor",
    email: "mike.portnoy@pln.co.id",
    noTelp: "+6281234567892",
    perNr: "34567890",
    nip: "345678901234567890",
    deskripsi: "Supervisor UPK Maluku",
    alamat: "Ambon",
    kategori: "Pegawai",
  },
  {
    id: "4",
    nama: "Kevin Moore",
    aksesLevel: "STAFF",
    organisasi: "PLN UPK Lombok",
    aksesGrup: "Grup Operations",
    statusKaryawan: "Aktif",
    tipe: "Non-SSO User",
    akunPengelola: false,
    aplikasiUtama: "APP 1 - Konfigurasi",
    jabatan: "Staff",
    email: "kevin.moore@pln.co.id",
    noTelp: "+6281234567893",
    perNr: "45678901",
    nip: "456789012345678901",
    deskripsi: "Staff UPK Lombok",
    alamat: "Lombok",
    kategori: "Pegawai",
  },
  {
    id: "5",
    nama: "John Petrucci",
    aksesLevel: "MANAGER UPK",
    organisasi: "PLN UPK Flores",
    aksesGrup: "Grup Operations",
    statusKaryawan: "Aktif",
    tipe: "SSO PLN",
    akunPengelola: false,
    aplikasiUtama: "APP 1 - Konfigurasi",
    jabatan: "Manager",
    email: "john.petrucci@pln.co.id",
    noTelp: "+6281234567894",
    perNr: "56789012",
    nip: "567890123456789012",
    deskripsi: "Manager UPK Flores",
    alamat: "Flores",
    kategori: "Pegawai",
  },
]);

// ── Pengemudi Data ────────────────────────────────────────────
interface PengemudiItem {
  id: string;
  no: number;
  namaPengemudi: string;
  tempatLahir: string;
  tanggalLahir: string;
  umurPengemudi: string;
  alamat: string;
  tanggalMulaiBekerja: string;
  tanggalAkhirBekerja: string;
  status: string;
  kategori: string;
}

const pengemudiList = ref<PengemudiItem[]>([
  {
    id: "p1",
    no: 1,
    namaPengemudi: "John Doe",
    tempatLahir: "Jakarta",
    tanggalLahir: "1986-03-14",
    umurPengemudi: "40",
    alamat: "Jl. Kemang IV No.7B, RT.11/RW.5, Bangka, Mampang Prapatan",
    tanggalMulaiBekerja: "2020-01-20",
    tanggalAkhirBekerja: "2030-01-20",
    status: "Aktif",
    kategori: "Pengemudi",
  },
  {
    id: "p2",
    no: 2,
    namaPengemudi: "Freya",
    tempatLahir: "Jakarta",
    tanggalLahir: "1996-03-14",
    umurPengemudi: "30",
    alamat: "Jl. Bangka IV No.7B, RT.11/RW.5, Bangka, Mampang Prapatan",
    tanggalMulaiBekerja: "2020-01-20",
    tanggalAkhirBekerja: "2030-01-20",
    status: "Aktif",
    kategori: "Pengemudi",
  },
  {
    id: "p3",
    no: 3,
    namaPengemudi: "John",
    tempatLahir: "Jakarta",
    tanggalLahir: "1991-03-11",
    umurPengemudi: "35",
    alamat: "Pasar Santa No.9B, RT.11/RW.5, Bangka, Kebayoran Baru",
    tanggalMulaiBekerja: "2020-01-20",
    tanggalAkhirBekerja: "2030-01-20",
    status: "Aktif",
    kategori: "Pengemudi",
  },
  {
    id: "p4",
    no: 4,
    namaPengemudi: "John",
    tempatLahir: "Jakarta",
    tanggalLahir: "1991-03-08",
    umurPengemudi: "35",
    alamat: "Jl. Mampang IV No.7B, RT.11/RW.5, Mampang, Jakarta Selatan",
    tanggalMulaiBekerja: "2020-01-20",
    tanggalAkhirBekerja: "2030-01-20",
    status: "Aktif",
    kategori: "Pengemudi",
  },
  {
    id: "p5",
    no: 5,
    namaPengemudi: "John",
    tempatLahir: "Jakarta",
    tanggalLahir: "1991-03-01",
    umurPengemudi: "35",
    alamat: "Jl. Setia Budi IV No.7B, RT.11/RW.5, Setiabudi, Jakarta Selatan",
    tanggalMulaiBekerja: "2020-01-20",
    tanggalAkhirBekerja: "2030-01-20",
    status: "Tidak Aktif",
    kategori: "Pengemudi",
  },
]);

// Reset pagination on search or tab change
watch([searchQuery, activeTabKey], () => {
  currentPage.value = 1;
});

// ── Filtered & Paginated ──────────────────────────────────────
const activeFilteredData = computed(() => {
  const list =
    activeTabKey.value === "Pengemudi" ? pengemudiList.value : usersList.value;
  const q = searchQuery.value.toLowerCase();
  if (!q) return list;
  return list.filter((row) =>
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

// Watch tanggalLahir to auto-calc umur (only for Pengemudi)
watch(
  () => formData.value.tanggalLahir,
  (tgl) => {
    if (tgl && formData.value.jenisPengguna === "Pengemudi") {
      const birth = new Date(tgl);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
      formData.value.umurPengemudi = age > 0 ? String(age) : "";
    } else {
      formData.value.umurPengemudi = "";
    }
  }
);

const modalTitle = computed(() => {
  const label =
    formData.value?.jenisPengguna === "Pengemudi" ? "Pengemudi" : "Pengguna";
  if (modalMode.value === "view") return `Detail Data ${label}`;
  if (modalMode.value === "edit") return `Edit Data ${label}`;
  return `Tambah Data ${label}`;
});

const modalSubtitle = computed(() => {
  const label =
    formData.value?.jenisPengguna === "Pengemudi" ? "Pengemudi" : "Pengguna";
  if (modalMode.value === "view") return `Detail Informasi ${label}`;
  if (modalMode.value === "edit") return `Form Edit Data ${label}`;
  return `Form Tambah Data ${label}`;
});

const openCreateModal = () => {
  modalMode.value = "create";
  const defaultJenis =
    activeTabKey.value === "Pengemudi" ? "Pengemudi" : "Pegawai";
  if (defaultJenis === "Pengemudi") {
    formData.value = {
      jenisPengguna: "Pengemudi",
      namaPengemudi: "",
      tempatLahir: "",
      tanggalLahir: "",
      umurPengemudi: "",
      tanggalMulaiBekerja: "",
      tanggalAkhirBekerja: "",
      statusBekerja: "Aktif",
      alamat: "",
      kategori: "Pengemudi",
    };
  } else {
    formData.value = {
      jenisPengguna: "Pegawai",
      tipe: "SSO PLN",
      akunPengelola: false,
      organisasi: "Dwipantara",
      aksesLevel: "MANAGER UPK",
      aksesGrup: ["Grup 1"],
      aplikasiUtama: "APP 1 - Konfigurasi",
      pengelola: "Sewa",
      nama: "",
      approvalCode: [],
      jabatan: "",
      statusKaryawan: "Aktif",
      email: "",
      noTelp: "",
      perNr: "",
      nip: "",
      deskripsi: "",
      alamat: "",
      kategori: "Pegawai",
    };
  }
  clearErrors();
  modalOpen.value = true;
};

const isDetailModalOpen = ref(false);
const detailRecord = ref<any>(null);

const detailModalTitle = computed(() =>
  detailRecord.value?.kategori === "Pengemudi"
    ? "View Data Pengemudi"
    : "View Data Pengguna"
);

const detailModalSubtitle = computed(() =>
  detailRecord.value?.kategori === "Pengemudi"
    ? "Form View Data Pengemudi"
    : "Form View Data Pengguna"
);

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  if (activeTabKey.value === "Pengemudi") {
    return [
      { label: "Nama Pengemudi", value: detailRecord.value.namaPengemudi },
      { label: "Tempat Lahir", value: detailRecord.value.tempatLahir },
      {
        label: "Tanggal Lahir",
        value: detailRecord.value.tanggalLahir
          ? detailRecord.value.tanggalLahir.split("-").reverse().join("/")
          : "-",
      },
      { label: "Umur Pengemudi", value: detailRecord.value.umurPengemudi },
      {
        label: "Tanggal Mulai Bekerja",
        value: detailRecord.value.tanggalMulaiBekerja
          ? detailRecord.value.tanggalMulaiBekerja.split("-").reverse().join("/")
          : "-",
      },
      {
        label: "Tanggal Akhir Bekerja",
        value: detailRecord.value.tanggalAkhirBekerja
          ? detailRecord.value.tanggalAkhirBekerja.split("-").reverse().join("/")
          : "-",
      },
      {
        label: "Status Bekerja",
        value: detailRecord.value.status,
        isStatus: true,
      },
      { label: "Alamat", value: detailRecord.value.alamat },
    ];
  }

  const items: DetailDataItem[] = [
    { label: "Type", value: detailRecord.value.tipe || "SSO PLN" },
    {
      label: "Akun Pengelola",
      value: detailRecord.value.akunPengelola ? "Ya" : "Tidak",
    },
  ];

  if (detailRecord.value.akunPengelola) {
    items.push({
      label: "Aplikasi Utama",
      value: detailRecord.value.aplikasiUtama || "APP 1 - Konfigurasi",
    });
    items.push({
      label: "Pengelola",
      value: detailRecord.value.pengelola || "Sewa",
    });
  } else {
    items.push({
      label: "Organisasi",
      value: detailRecord.value.organisasi || "Dwipantara",
    });
    items.push({
      label: "Akses Level",
      value: detailRecord.value.aksesLevel || "MANAGER UPK",
    });
    items.push({
      label: "Akses Grup",
      value: Array.isArray(detailRecord.value.aksesGrup)
        ? detailRecord.value.aksesGrup.join(", ")
        : detailRecord.value.aksesGrup || "-",
    });
    items.push({
      label: "Aplikasi Utama",
      value: detailRecord.value.aplikasiUtama || "APP 1 - Konfigurasi",
    });
  }

  items.push({ label: "Nama", value: detailRecord.value.nama || "-" });
  items.push({
    label: "Approval Code",
    value: Array.isArray(detailRecord.value.approvalCode)
      ? detailRecord.value.approvalCode.join(", ")
      : detailRecord.value.approvalCode || "-",
  });
  items.push({ label: "Jabatan", value: detailRecord.value.jabatan || "-" });
  items.push({
    label: "Status Karyawan",
    value: detailRecord.value.statusKaryawan || "Aktif",
    isStatus: true,
  });
  items.push({ label: "Email", value: detailRecord.value.email || "-" });
  items.push({ label: "No telp", value: detailRecord.value.noTelp || "-" });
  items.push({ label: "Pernr", value: detailRecord.value.perNr || "-" });
  items.push({ label: "NIP", value: detailRecord.value.nip || "-" });
  items.push({
    label: "Deskripsi",
    value: detailRecord.value.deskripsi || "-",
  });
  items.push({ label: "Alamat", value: detailRecord.value.alamat || "-" });

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
  const jenisPengguna = row.kategori === "Pengemudi" ? "Pengemudi" : "Pegawai";
  formData.value = { ...row, jenisPengguna };
  clearErrors();
  modalOpen.value = true;
};

const handleDelete = (row: any) => {
  if (
    typeof window !== "undefined" &&
    window.confirm(
      `Apakah Anda yakin ingin menghapus ${
        activeTabKey.value === "Pengemudi"
          ? row.namaPengemudi
          : row.nama
      }?`
    )
  ) {
    if (activeTabKey.value === "Pengemudi") {
      pengemudiList.value = pengemudiList.value.filter((p) => p.id !== row.id);
    } else {
      usersList.value = usersList.value.filter((u) => u.id !== row.id);
    }
  }
};

const handleExport = () => {
  alert("Memproses download file Excel (.xls)...");
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
  const result = activeSchema.value.safeParse(formData.value);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const fieldKey = issue.path[0] as string;
      formErrors.value[fieldKey] = issue.message;
    });
    return;
  }

  submitting.value = true;
  try {
    const isPengemudi = formData.value.jenisPengguna === "Pengemudi";

    if (isPengemudi) {
      if (modalMode.value === "create") {
        const newId = String(Date.now());
        pengemudiList.value.unshift({
          id: newId,
          no: pengemudiList.value.length + 1,
          namaPengemudi: formData.value.namaPengemudi,
          tempatLahir: formData.value.tempatLahir,
          tanggalLahir: formData.value.tanggalLahir,
          umurPengemudi: formData.value.umurPengemudi || "-",
          alamat: formData.value.alamat,
          tanggalMulaiBekerja: formData.value.tanggalMulaiBekerja,
          tanggalAkhirBekerja: formData.value.tanggalAkhirBekerja,
          status: formData.value.statusBekerja || "Aktif",
          kategori: "Pengemudi",
        });
      } else {
        const idx = pengemudiList.value.findIndex(
          (p) => p.id === formData.value.id
        );
        if (idx !== -1) {
          pengemudiList.value[idx] = {
            ...pengemudiList.value[idx],
            namaPengemudi: formData.value.namaPengemudi,
            tempatLahir: formData.value.tempatLahir,
            tanggalLahir: formData.value.tanggalLahir,
            umurPengemudi: formData.value.umurPengemudi || "-",
            alamat: formData.value.alamat,
            tanggalMulaiBekerja: formData.value.tanggalMulaiBekerja,
            tanggalAkhirBekerja: formData.value.tanggalAkhirBekerja,
            status: formData.value.statusBekerja || "Aktif",
          };
        }
      }
    } else {
      const g = Array.isArray(formData.value.aksesGrup)
        ? formData.value.aksesGrup.join(", ")
        : formData.value.aksesGrup || "-";

      if (modalMode.value === "create") {
        const newId = String(Date.now());
        usersList.value.unshift({
          id: newId,
          nama: formData.value.nama,
          aksesLevel: formData.value.aksesLevel || "-",
          organisasi: formData.value.organisasi || "-",
          aksesGrup: g,
          statusKaryawan: formData.value.statusKaryawan || "Aktif",
          tipe: formData.value.tipe,
          akunPengelola: isPengelola,
          aplikasiUtama: formData.value.aplikasiUtama,
          pengelola: formData.value.pengelola,
          approvalCode: formData.value.approvalCode,
          jabatan: formData.value.jabatan,
          email: formData.value.email,
          noTelp: formData.value.noTelp,
          perNr: formData.value.perNr,
          nip: formData.value.nip,
          deskripsi: formData.value.deskripsi,
          alamat: formData.value.alamat,
          kategori: "Pegawai",
        });
      } else {
        const idx = usersList.value.findIndex(
          (u) => u.id === formData.value.id
        );
        if (idx !== -1) {
          usersList.value[idx] = {
            ...usersList.value[idx],
            ...formData.value,
            akunPengelola: Boolean(formData.value.akunPengelola),
            aksesGrup: g,
          } as UserItem;
        }
      }
    }
    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    alert("Gagal menyimpan: " + err.message);
  } finally {
    submitting.value = false;
  }
};
</script>
