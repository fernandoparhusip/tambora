<script setup lang="ts">
import { computed, onMounted } from "vue";
import type { DetailDataItem } from "~/types/master.types";
import type { TableColumn, FormSectionConfig, OrganizationItem } from "~/types";
import { getOrganizationFormSections } from "~/schemas/master/organization.schema";
import { useAsyncDetail } from "~/composables/useAsyncDetail";

const {
  organizations,
  loading,
  detailLoading,
  fetchOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
} = useOrganization();
const toast = useAppToast();

const {
  searchQuery,
  currentPage,
  pageSize,
  paginateList,
  modalOpen,
  modalMode,
  formData,
  submitting,
  isSuccessModalOpen,
  modalTitle,
  modalSubtitle,
  openCreateModal,
  openEditModal,
  isConfirmDialogOpen,
  deleteTarget,
  isDeleting,
  openDeleteDialog,
  executeDelete,
} = useCrudState<OrganizationItem>({ resourceName: "Organisasi" });

const orgColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode", label: "Kode" },
  { key: "nama", label: "Nama" },
  { key: "alamat", label: "Alamat" },
  { key: "keterangan", label: "Keterangan" },
  { key: "actions", label: "Aksi" },
];

const parentOptions = computed(() => {
  return organizations.value
    .filter((o: any) => !formData.value?.id || o.id !== formData.value.id)
    .map((o: any) => ({
      label: `${o.nama} (${o.kode})`,
      value: o.id,
    }));
});

const formSections = computed<FormSectionConfig[]>(() =>
  getOrganizationFormSections({ parentOptions: parentOptions.value }),
);

onMounted(async () => {
  await fetchOrganizations();
});

const filteredData = computed(() => {
  if (!searchQuery.value) return organizations.value;
  const q = searchQuery.value.toLowerCase();
  return organizations.value.filter(
    (o) =>
      (o.kode && o.kode.toLowerCase().includes(q)) ||
      (o.nama && o.nama.toLowerCase().includes(q)) ||
      (o.alamat && o.alamat.toLowerCase().includes(q)) ||
      (o.keterangan && o.keterangan.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => paginateList(filteredData.value));

const handleCreate = () => {
  openCreateModal({
    kode: "",
    nama: "",
    parent_id: "",
    alamat: "",
    latitude: null,
    longitude: null,
    keterangan: "",
  });
};

const handleEdit = (row: OrganizationItem) => {
  openEditModal(row);
};

// Universal Async Detail Management (Calls GET /api/v1/organization/{id})
const {
  isDetailModalOpen,
  detailRecord,
  detailLoading: asyncDetailLoading,
  handleView,
  closeDetailModal,
  openEditFromDetail,
} = useAsyncDetail<OrganizationItem>({
  fetchDetail: (id) => getOrganizationById(id),
  onEdit: (record) => handleEdit(record),
});

const handleDelete = (row: OrganizationItem) => {
  openDeleteDialog(row);
};

const confirmDelete = async () => {
  await executeDelete((id) => deleteOrganization(String(id)));
};

const handleSave = async (data?: Record<string, any>) => {
  const currentData = data || formData.value;
  if (!currentData.kode || !currentData.nama) {
    toast.error("Kode Organisasi dan Nama Organisasi wajib diisi.", "Validasi");
    return;
  }

  submitting.value = true;
  try {
    const parentId = currentData.parent_id || undefined;
    const lat =
      currentData.latitude != null &&
      currentData.latitude !== "" &&
      !Number.isNaN(Number(currentData.latitude))
        ? Number(currentData.latitude)
        : undefined;
    const lng =
      currentData.longitude != null &&
      currentData.longitude !== "" &&
      !Number.isNaN(Number(currentData.longitude))
        ? Number(currentData.longitude)
        : undefined;

    const payload = {
      kode: currentData.kode.toUpperCase().replace(/\s+/g, "-"),
      nama: currentData.nama,
      alamat: currentData.alamat || "",
      keterangan: currentData.keterangan || "",
      latitude: lat,
      longitude: lng,
      parent_id: parentId,
    };

    if (modalMode.value === "create") {
      await createOrganization(payload);
      toast.success(
        `Organisasi '${currentData.nama}' berhasil dibuat.`,
        "Sukses",
      );
    } else {
      await updateOrganization(currentData.id, payload);
      toast.success(
        `Organisasi '${currentData.nama}' berhasil diperbarui.`,
        "Sukses",
      );
    }
    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    // Handled by useApi
  } finally {
    submitting.value = false;
  }
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const parent = organizations.value.find(
    (o) => o.id === detailRecord.value?.parent_id,
  );
  return [
    { label: "Kode", value: detailRecord.value.kode },
    { label: "Nama", value: detailRecord.value.nama },
    {
      label: "Induk",
      value: parent ? `${parent.nama} (${parent.kode})` : "Root Node",
    },
    { label: "Alamat", value: detailRecord.value.alamat || "-" },
    {
      label: "Latitude",
      value: detailRecord.value.latitude
        ? String(detailRecord.value.latitude)
        : "-",
    },
    {
      label: "Longitude",
      value: detailRecord.value.longitude
        ? String(detailRecord.value.longitude)
        : "-",
    },
    { label: "Keterangan", value: detailRecord.value.keterangan || "-" },
  ];
});
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
            <BaseSearchInput v-model="searchQuery" />
          </div>

          <BaseCreateButton resource="ORGANIZATION" @click="handleCreate" />
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
        <BaseTable
          :columns="orgColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchOrganizations"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #kode-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.kode }}</span>
          </template>

          <template #nama-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.nama }}</span>
          </template>

          <template #alamat-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.alamat || "-" }}</span>
          </template>

          <template #keterangan-data="{ row }">
            <span
              class="text-xs text-gray-600 truncate max-w-xs block"
              :title="row.keterangan"
            >
              {{ row.keterangan || "-" }}
            </span>
          </template>

          <!-- Action Buttons Cell Slot -->
          <template #actions-data="{ row }">
            <BaseTableActions
              resource="ORGANIZATION"
              @view="handleView(row)"
              @edit="handleEdit(row)"
              @delete="handleDelete(row)"
            />
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

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Organisasi"
      :message="`Apakah Anda yakin ingin menghapus organisasi '${deleteTarget?.nama || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />

    <!-- ── View Detail Modal ───────────────────────── -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Organisasi"
      subtitle="Informasi Organisasi"
      :record="detailRecord"
      :loading="detailLoading || asyncDetailLoading"
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
      @close="closeDetailModal"
    />
  </div>
</template>
