<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem } from "~/types/master.types";
import type { TableColumn, FormSectionConfig, SystemItem } from "~/types";
import { getSystemFormSections } from "~/schemas/master/system.schema";
import { useAsyncDetail } from "~/composables/useAsyncDetail";

const {
  systems,
  loading,
  detailLoading,
  fetchSystems,
  getSystemById,
  createSystem,
  updateSystem,
  deleteSystem,
} = useSystem();

const { organizations, fetchOrganizations } = useOrganization();
const toast = useAppToast();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<SystemItem | null>(null);
const isDeleting = ref(false);

const systemColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "code", label: "Kode " },
  { key: "name", label: "Nama" },
  { key: "system_type", label: "Tipe" },
  { key: "coordinates", label: "Koordinat (Lat, Lng)" },
  { key: "description", label: "Deskripsi" },
  { key: "actions", label: "Aksi" },
];

const orgOptions = computed(() =>
  organizations.value.map((o: any) => ({
    label: `${o.nama} (${o.kode})`,
    value: o.id,
  })),
);

const formSections = computed<FormSectionConfig[]>(() =>
  getSystemFormSections({ orgOptions: orgOptions.value }),
);

onMounted(async () => {
  await Promise.allSettled([fetchSystems(), fetchOrganizations()]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!searchQuery.value) return systems.value;
  const q = searchQuery.value.toLowerCase();
  return systems.value.filter(
    (s) =>
      (s.code && s.code.toLowerCase().includes(q)) ||
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.system_type && s.system_type.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Data Sistem" : "Tambah Data Sistem",
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit" ? "Form Edit Sistem" : "Form Tambah Sistem",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    code: "",
    name: "",
    system_type: "",
    upk_id: "",
    service_unit_ids: [],
    latitude: "",
    longitude: "",
    description: "",
  };
  modalOpen.value = true;
};

const handleEdit = (row: SystemItem) => {
  modalMode.value = "edit";
  formData.value = {
    ...row,
    upk_id: row.upk_id || "",
    service_unit_ids: row.service_unit_ids || [],
  };
  modalOpen.value = true;
};

// Universal Async Detail Management
const {
  isDetailModalOpen,
  detailRecord,
  detailLoading: asyncDetailLoading,
  handleView,
  closeDetailModal,
  openEditFromDetail,
} = useAsyncDetail<SystemItem>({
  fetchDetail: (id) => getSystemById(id),
  getId: (row) => row.id || row.code,
  onEdit: (record) => handleEdit(record),
});

const handleDelete = (row: SystemItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteSystem(deleteTarget.value.id);
    toast.success(
      `Sistem '${deleteTarget.value.name}' berhasil dihapus.`,
      "Sukses",
    );
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch {
    // Handled by useApi
  } finally {
    isDeleting.value = false;
  }
};

const handleSave = async (data?: Record<string, any>) => {
  const currentData = data || formData.value;
  if (!currentData.code || !currentData.name) {
    toast.warning("Kode Sistem dan Nama Sistem wajib diisi.", "Peringatan");
    return;
  }

  submitting.value = true;
  try {
    const lat =
      currentData.latitude != null &&
      currentData.latitude !== "" &&
      !isNaN(Number(currentData.latitude))
        ? Number(currentData.latitude)
        : undefined;
    const lng =
      currentData.longitude != null &&
      currentData.longitude !== "" &&
      !isNaN(Number(currentData.longitude))
        ? Number(currentData.longitude)
        : undefined;

    if (modalMode.value === "create") {
      await createSystem({
        code: currentData.code.toUpperCase().replace(/\s+/g, "-"),
        name: currentData.name,
        system_type: currentData.system_type || "BESAR",
        latitude: lat,
        longitude: lng,
        description: currentData.description || "",
        upk_id: currentData.upk_id || undefined,
        service_unit_ids: currentData.service_unit_ids || undefined,
      });
      modalOpen.value = false;
      setTimeout(() => {
        isSuccessModalOpen.value = true;
      }, 150);
    } else {
      await updateSystem(currentData.id || formData.value.id, {
        code: currentData.code.toUpperCase().replace(/\s+/g, "-"),
        name: currentData.name,
        system_type: currentData.system_type || "BESAR",
        latitude: lat,
        longitude: lng,
        description: currentData.description || "",
        upk_id: currentData.upk_id || undefined,
        service_unit_ids: currentData.service_unit_ids || undefined,
      });
      modalOpen.value = false;
      toast.success("Data sistem berhasil diperbarui.", "Sukses");
    }
  } catch {
    // Handled by useApi
  } finally {
    submitting.value = false;
  }
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const upk = organizations.value.find(
    (o) => o.id === detailRecord.value?.upk_id,
  );
  return [
    { label: "Kode Sistem", value: detailRecord.value.code },
    { label: "Nama Sistem", value: detailRecord.value.name },
    {
      label: "Tipe Sistem",
      value:
        detailRecord.value.system_type === "BESAR"
          ? "Sistem Besar (Interkoneksi)"
          : "Sistem Kecil (Isolated)",
    },
    {
      label: "Unit Pelaksana (UPK)",
      value: upk ? `${upk.nama} (${upk.kode})` : "-",
    },
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
    { label: "Deskripsi", value: detailRecord.value.description || "-" },
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

          <BaseCreateButton resource="SYSTEM" @click="openCreateModal" />
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
        <BaseTable
          :columns="systemColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchSystems"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #code-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.code }}</span>
          </template>

          <template #name-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.name }}</span>
          </template>

          <template #system_type-data="{ row }">
            <span class="text-xs text-gray-600">
              {{
                row.system_type === "BESAR" ? "Sistem Besar" : "Sistem Kecil"
              }}
            </span>
          </template>

          <template #coordinates-data="{ row }">
            <span
              v-if="row.latitude && row.longitude"
              class="text-xs text-gray-600"
            >
              {{ row.latitude }}, {{ row.longitude }}
            </span>
            <span v-else class="text-xs text-gray-400">-</span>
          </template>

          <template #description-data="{ row }">
            <span
              class="text-xs text-gray-600 truncate max-w-xs block"
              :title="row.description"
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
                resource="SYSTEM"
                title="Ubah Sistem"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                type="delete"
                resource="SYSTEM"
                title="Hapus Sistem"
                @click="handleDelete(row)"
              />
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

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Sistem Pembangkit"
      :message="`Apakah Anda yakin ingin menghapus sistem '${deleteTarget?.name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />

    <!-- ── View Detail Modal ─────────────────────────────────── -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Data Sistem Pembangkit"
      subtitle="Informasi Sistem Pembangkit"
      :record="detailRecord"
      :data-items="detailDataItems"
      :loading="detailLoading || asyncDetailLoading"
      @edit="openEditFromDetail"
      @close="closeDetailModal"
    />
  </div>
</template>
