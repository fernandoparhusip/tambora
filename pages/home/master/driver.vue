<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import BaseDetailModal from "~/components/base/BaseDetailModal.vue";
import type { DetailDataItem } from "~/components/base/BaseDetailModal.vue";
import type { TableColumn, FormSectionConfig, DriverItem } from "~/types";
import { useDriver } from "~/composables/master/useDriver";

const { drivers, loading, fetchDrivers, createDriver, updateDriver, deleteDriver } = useDriver();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isDetailModalOpen = ref(false);
const detailRecord = ref<DriverItem | null>(null);

const driverColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "full_name", label: "Nama Pengemudi" },
  { key: "phone_number", label: "No. Telepon" },
  { key: "license_number", label: "No. SIM" },
  { key: "license_type", label: "Jenis SIM" },
  { key: "employment_status", label: "Status" },
  { key: "address", label: "Alamat" },
  { key: "actions", label: "Aksi" }
];

const formSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "full_name",
        label: "Nama Pengemudi",
        type: "text",
        placeholder: "Masukkan Nama Lengkap Pengemudi",
        colSpan: 6,
        required: true
      },
      {
        key: "phone_number",
        label: "No. Telepon / WA",
        type: "text",
        placeholder: "+6281234567890",
        colSpan: 6,
        required: false
      },
      {
        key: "nik",
        label: "NIK (KTP)",
        type: "text",
        placeholder: "Masukkan 16 digit NIK",
        colSpan: 6,
        required: false
      },
      {
        key: "license_number",
        label: "Nomor SIM",
        type: "text",
        placeholder: "Contoh: SIM-5271000123",
        colSpan: 6,
        required: false
      },
      {
        key: "license_type",
        label: "Jenis SIM",
        type: "searchable-select",
        placeholder: "Pilih Jenis SIM",
        colSpan: 6,
        required: false,
        options: [
          { label: "SIM A", value: "SIM A" },
          { label: "SIM B1", value: "SIM B1" },
          { label: "SIM B2 Umum", value: "SIM B2 Umum" },
          { label: "SIM C", value: "SIM C" }
        ]
      },
      {
        key: "employment_status",
        label: "Status Bekerja",
        type: "searchable-select",
        placeholder: "Pilih Status",
        colSpan: 6,
        required: true,
        options: [
          { label: "Aktif", value: "Aktif" },
          { label: "Nonaktif", value: "Nonaktif" }
        ]
      },
      {
        key: "birth_place",
        label: "Tempat Lahir",
        type: "text",
        placeholder: "Contoh: Mataram",
        colSpan: 6,
        required: false
      },
      {
        key: "birth_date",
        label: "Tanggal Lahir",
        type: "date",
        placeholder: "Pilih Tanggal Lahir",
        colSpan: 6,
        required: false
      },
      {
        key: "employment_start_date",
        label: "Tanggal Mulai Bekerja",
        type: "date",
        placeholder: "Pilih Tanggal Mulai",
        colSpan: 12,
        required: false
      },
      {
        key: "address",
        label: "Alamat",
        type: "textarea",
        placeholder: "Masukkan Alamat Tempat Tinggal",
        colSpan: 12,
        required: false,
        rows: 3
      },
      {
        key: "description",
        label: "Catatan / Deskripsi",
        type: "textarea",
        placeholder: "Catatan operasional...",
        colSpan: 12,
        required: false,
        rows: 2
      }
    ]
  }
];

onMounted(async () => {
  await fetchDrivers();
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!searchQuery.value) return drivers.value;
  const q = searchQuery.value.toLowerCase();
  return drivers.value.filter(d =>
    (d.full_name && d.full_name.toLowerCase().includes(q)) ||
    (d.license_number && d.license_number.toLowerCase().includes(q)) ||
    (d.phone_number && d.phone_number.toLowerCase().includes(q)) ||
    (d.address && d.address.toLowerCase().includes(q))
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() => modalMode.value === "edit" ? "Edit Data Pengemudi" : "Tambah Data Pengemudi");
const modalSubtitle = computed(() => modalMode.value === "edit" ? "Form Edit Data Pengemudi" : "Form Tambah Data Pengemudi");

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    full_name: "",
    phone_number: "",
    nik: "",
    license_number: "",
    license_type: "SIM A",
    employment_status: "Aktif",
    birth_place: "",
    birth_date: "",
    employment_start_date: "",
    address: "",
    description: ""
  };
  modalOpen.value = true;
};

const handleView = (row: DriverItem) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const openEditFromDetail = () => {
  if (detailRecord.value) {
    handleEdit(detailRecord.value);
  }
};

const handleEdit = (row: DriverItem) => {
  modalMode.value = "edit";
  formData.value = { ...row };
  modalOpen.value = true;
};

const handleDelete = async (row: DriverItem) => {
  if (confirm(`Apakah Anda yakin ingin menghapus pengemudi "${row.full_name}"?`)) {
    try {
      await deleteDriver(row.id);
    } catch (err: any) {
      alert("Gagal menghapus pengemudi: " + (err?.message || err));
    }
  }
};

const formatDateDisplay = (dateStr?: string) => {
  if (!dateStr) return "-";
  const dateOnly = dateStr.split("T")[0];
  if (!dateOnly) return "-";
  const parts = dateOnly.split("-");
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

const handleSave = async () => {
  if (!formData.value.full_name || formData.value.full_name.trim() === "") {
    alert("Nama Pengemudi wajib diisi.");
    return;
  }

  // Auto-generate 16-digit valid NIK if left blank for smooth demo/dev
  let nik = formData.value.nik?.trim() || "";
  if (!nik) {
    nik = `5271${String(Date.now()).slice(-12)}`;
  } else if (nik.length !== 16) {
    alert("NIK (KTP) harus tepat 16 digit angka.");
    return;
  }

  submitting.value = true;
  try {
    if (modalMode.value === "create") {
      await createDriver({
        full_name: formData.value.full_name.trim(),
        phone_number: formData.value.phone_number?.trim() || "+6281234567890",
        nik,
        license_number: formData.value.license_number?.trim() || `SIM-${Date.now().toString().slice(-6)}`,
        license_type: formData.value.license_type || "SIM A",
        birth_place: formData.value.birth_place?.trim() || "Mataram",
        birth_date: formData.value.birth_date || "1990-01-01",
        employment_start_date: formData.value.employment_start_date || "2024-01-01",
        employment_status: formData.value.employment_status || "Aktif",
        address: formData.value.address?.trim() || "Kota Bima",
        description: formData.value.description?.trim() || "Pengemudi kendaraan operasional"
      });
    } else {
      await updateDriver(formData.value.id, {
        full_name: formData.value.full_name.trim(),
        phone_number: formData.value.phone_number?.trim() || "+6281234567890",
        employment_status: formData.value.employment_status || "Aktif",
        address: formData.value.address?.trim() || "Kota Bima",
        description: formData.value.description?.trim() || "Pengemudi operasional"
      });
    }
    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    alert("Gagal menyimpan pengemudi: " + (err?.message || err));
  } finally {
    submitting.value = false;
  }
};

const handleExport = () => {
  alert("Mengunduh data Pengemudi ke .xls...");
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  return [
    { label: "Nama Lengkap", value: detailRecord.value.full_name },
    { label: "No. Telepon", value: detailRecord.value.phone_number || "-" },
    { label: "NIK", value: detailRecord.value.nik || "-" },
    { label: "Nomor SIM", value: detailRecord.value.license_number || "-" },
    { label: "Jenis SIM", value: detailRecord.value.license_type || "-" },
    { label: "Status Bekerja", value: detailRecord.value.employment_status || "Aktif", isStatus: true },
    { label: "Tempat Lahir", value: detailRecord.value.birth_place || "-" },
    { label: "Tanggal Lahir", value: formatDateDisplay(detailRecord.value.birth_date) },
    { label: "Mulai Bekerja", value: formatDateDisplay(detailRecord.value.employment_start_date) },
    { label: "Alamat", value: detailRecord.value.address || "-" },
    { label: "Catatan", value: detailRecord.value.description || "-" }
  ];
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- ── Page Title Header ───────────────────────────────── -->
    <BasePageHeader title="Master Pengemudi" />

    <!-- ── Main Card Container (Flex-1, No Page Scroll) ────────── -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- ── Action Controls Bar ───────────────────────────────── -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Nama / No SIM / Telp..." />
            <BaseExportButton @click="handleExport" />
          </div>

          <BaseCreateButton label="TAMBAH DATA" @click="openCreateModal" />
        </div>

        <!-- ── Table Container (Flex-1 Scrollable) ───────────────── -->
        <BaseTable
          :columns="driverColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #full_name-data="{ row }">
            <span class="text-xs text-gray-900 font-semibold">{{ row.full_name }}</span>
          </template>

          <template #license_number-data="{ row }">
            <BaseBadge variant="mono">
              {{ row.license_number || '-' }}
            </BaseBadge>
          </template>

          <template #employment_status-data="{ row }">
            <BaseBadge :variant="row.employment_status === 'Aktif' || row.status === 1 ? 'success' : 'danger'">
              {{ row.employment_status || (row.status === 1 ? 'Aktif' : 'Nonaktif') }}
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

        <!-- ── Pagination ────────────────────────────────────────── -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredData.length"
          class="shrink-0 pt-4 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- ── Form Drawer Modal ─────────────────────────────────── -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="formSections"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />

    <!-- ── View Detail Modal ───────────────────────── -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Data Pengemudi"
      subtitle="Informasi Lengkap Pengemudi Operasional"
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
    />
  </div>
</template>
