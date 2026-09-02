<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem } from '~/types/master.types';
import type { TableColumn, FormSectionConfig, SystemItem } from "~/types";
import { getSystemFormSections } from "~/schemas/master/system.schema";

const {
  systems,
  loading,
  fetchSystems,
  createSystem,
  updateSystem,
  deleteSystem
} = useSystem();

const { organizations, fetchOrganizations } = useOrganization();

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
const deleteTarget = ref<SystemItem | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<SystemItem | null>(null);

const systemColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "code", label: "Kode Sistem" },
  { key: "name", label: "Nama Sistem Pembangkit" },
  { key: "system_type", label: "Tipe Sistem" },
  { key: "coordinates", label: "Koordinat (Lat, Lng)" },
  { key: "description", label: "Deskripsi" },
  { key: "actions", label: "Aksi" }
];

const orgOptions = computed(() =>
  organizations.value.map((o: any) => ({ label: `${o.nama} (${o.kode})`, value: o.id }))
);

const formSections = computed<FormSectionConfig[]>(() =>
  getSystemFormSections({ orgOptions: orgOptions.value })
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
      (s.system_type && s.system_type.toLowerCase().includes(q))
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Data Sistem" : "Tambah Data Sistem"
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Edit Sistem Pembangkit Listrik"
    : "Form Tambah Sistem Pembangkit Listrik"
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    code: "",
    name: "",
    system_type: "BESAR",
    latitude: "",
    longitude: "",
    description: ""
  };
  modalOpen.value = true;
};

const handleView = (row: SystemItem) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const openEditFromDetail = () => {
  if (detailRecord.value) {
    handleEdit(detailRecord.value);
  }
};

const handleEdit = (row: SystemItem) => {
  modalMode.value = "edit";
  formData.value = { ...row };
  modalOpen.value = true;
};

const handleDelete = (row: SystemItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteSystem(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (err: any) {
    // Handled by useApi
  } finally {
    isDeleting.value = false;
  }
};

const handleSave = async () => {
  if (!formData.value.code || !formData.value.name) {
    alert("Kode Sistem dan Nama Sistem wajib diisi.");
    return;
  }

  submitting.value = true;
  try {
    const lat = formData.value.latitude ? Number(formData.value.latitude) : undefined;
    const lng = formData.value.longitude ? Number(formData.value.longitude) : undefined;

    if (modalMode.value === "create") {
      await createSystem({
        code: formData.value.code.toUpperCase().replace(/\s+/g, "-"),
        name: formData.value.name,
        system_type: formData.value.system_type || "BESAR",
        latitude: lat,
        longitude: lng,
        description: formData.value.description || ""
      });
    } else {
      await updateSystem(formData.value.id, {
        code: formData.value.code.toUpperCase().replace(/\s+/g, "-"),
        name: formData.value.name,
        system_type: formData.value.system_type || "BESAR",
        latitude: lat,
        longitude: lng,
        description: formData.value.description || ""
      });
    }
    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    alert("Gagal menyimpan sistem: " + (err?.message || err));
  } finally {
    submitting.value = false;
  }
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const upk = organizations.value.find((o) => o.id === detailRecord.value?.upk_id);
  return [
    { label: "Kode Sistem", value: detailRecord.value.code },
    { label: "Nama Sistem", value: detailRecord.value.name },
    { label: "Tipe Sistem", value: detailRecord.value.system_type === "BESAR" ? "Sistem Besar (Interkoneksi)" : "Sistem Kecil (Isolated)" },
    { label: "Unit Pelaksana (UPK)", value: upk ? `${upk.nama} (${upk.kode})` : "-" },
    { label: "Latitude", value: detailRecord.value.latitude ? String(detailRecord.value.latitude) : "-" },
    { label: "Longitude", value: detailRecord.value.longitude ? String(detailRecord.value.longitude) : "-" },
    { label: "Deskripsi", value: detailRecord.value.description || "-" }
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

          <BaseCreateButton @click="openCreateModal" />
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
            <BaseBadge variant="mono">
              {{ row.code }}
            </BaseBadge>
          </template>

          <template #name-data="{ row }">
            <span class="text-xs text-gray-900 font-semibold">{{ row.name }}</span>
          </template>

          <template #system_type-data="{ row }">
            <BaseBadge :variant="row.system_type === 'BESAR' ? 'primary' : 'warning'">
              {{ row.system_type === 'BESAR' ? 'Sistem Besar' : 'Sistem Kecil' }}
            </BaseBadge>
          </template>

          <template #coordinates-data="{ row }">
            <span v-if="row.latitude && row.longitude" class="font-mono text-xs text-gray-600">
              {{ row.latitude }}, {{ row.longitude }}
            </span>
            <span v-else class="text-xs text-gray-400">-</span>
          </template>

          <template #description-data="{ row }">
            <span class="text-xs text-gray-500 truncate max-w-xs block" :title="row.description">
              {{ row.description || '-' }}
            </span>
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
      subtitle="Informasi Lengkap Sistem Interkoneksi Listrik"
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
    />
  </div>
</template>
