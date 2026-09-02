<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem } from '~/types/master.types';
import type { TableColumn, DriverItem } from "~/types";
import { driverFormSections } from "~/schemas/master/driver.schema";

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
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<DriverItem | null>(null);
const isDeleting = ref(false);
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

const handleDelete = (row: DriverItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteDriver(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (err: any) {
    // Handled by useApi
  } finally {
    isDeleting.value = false;
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
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" />
          </div>

          <BaseCreateButton @click="openCreateModal" />
        </div>

        <!-- ── Table Container (Flex-1 Scrollable) ───────────────── -->
        <BaseTable
          :columns="driverColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchDrivers"
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
      :sections="driverFormSections"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Pengemudi"
      :message="`Apakah Anda yakin ingin menghapus data pengemudi '${deleteTarget?.full_name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
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
