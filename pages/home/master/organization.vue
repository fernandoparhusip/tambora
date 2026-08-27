<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem } from "~/components/base/BaseDetailModal.vue";
import type { TableColumn, FormSectionConfig, OrganizationItem } from "~/types";
import { getOrganizationFormSections } from "~/schemas/master/organization.schema";
import { useOrganization } from "~/composables/master/useOrganization";
import BaseConfirmDialog from "~/components/base/BaseConfirmDialog.vue";
import { exportToExcel } from "~/utils/exportExcel";

const {
  organizations,
  loading,
  fetchOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization
} = useOrganization();

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
const deleteTarget = ref<OrganizationItem | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<OrganizationItem | null>(null);

const orgColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "kode", label: "Kode Organisasi" },
  { key: "nama", label: "Nama Organisasi" },
  { key: "alamat", label: "Alamat / Wilayah" },
  { key: "keterangan", label: "Keterangan" },
  { key: "actions", label: "Aksi" }
];

const parentOptions = computed(() => {
  const list = [{ label: "-- Tanpa Parent (Root Node) --", value: "" }];
  organizations.value.forEach((o: any) => {
    list.push({ label: `${o.nama} (${o.kode})`, value: o.id });
  });
  return list;
});

const formSections = computed<FormSectionConfig[]>(() =>
  getOrganizationFormSections({ parentOptions: parentOptions.value })
);

onMounted(async () => {
  await fetchOrganizations();
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!searchQuery.value) return organizations.value;
  const q = searchQuery.value.toLowerCase();
  return organizations.value.filter(
    (o) =>
      (o.kode && o.kode.toLowerCase().includes(q)) ||
      (o.nama && o.nama.toLowerCase().includes(q)) ||
      (o.alamat && o.alamat.toLowerCase().includes(q)) ||
      (o.keterangan && o.keterangan.toLowerCase().includes(q))
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Data Organisasi" : "Tambah Data Organisasi"
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Edit Data Hierarki Organisasi"
    : "Form Tambah Data Hierarki Organisasi"
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    kode: "",
    nama: "",
    parent_id: "",
    alamat: "",
    latitude: "",
    longitude: "",
    keterangan: ""
  };
  modalOpen.value = true;
};

const handleView = (row: OrganizationItem) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const openEditFromDetail = () => {
  if (detailRecord.value) {
    handleEdit(detailRecord.value);
  }
};

const handleEdit = (row: OrganizationItem) => {
  modalMode.value = "edit";
  formData.value = { ...row };
  modalOpen.value = true;
};

const handleDelete = (row: OrganizationItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteOrganization(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (err: any) {
    // Handled by useApi
  } finally {
    isDeleting.value = false;
  }
};

const handleSave = async () => {
  if (!formData.value.kode || !formData.value.nama) {
    alert("Kode Organisasi dan Nama Organisasi wajib diisi.");
    return;
  }

  submitting.value = true;
  try {
    const parentId = formData.value.parent_id || undefined;
    if (modalMode.value === "create") {
      await createOrganization({
        kode: formData.value.kode.toUpperCase().replace(/\s+/g, "-"),
        nama: formData.value.nama,
        alamat: formData.value.alamat || "",
        keterangan: formData.value.keterangan || "",
        latitude: formData.value.latitude || undefined,
        longitude: formData.value.longitude || undefined,
        parent_id: parentId
      });
    } else {
      await updateOrganization(formData.value.id, {
        kode: formData.value.kode.toUpperCase().replace(/\s+/g, "-"),
        nama: formData.value.nama,
        alamat: formData.value.alamat,
        keterangan: formData.value.keterangan,
        latitude: formData.value.latitude,
        longitude: formData.value.longitude,
        parent_id: parentId
      });
    }
    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    alert("Gagal menyimpan organisasi: " + (err?.message || err));
  } finally {
    submitting.value = false;
  }
};

const handleExport = () => {
  exportToExcel(orgColumns, filteredData.value, {
    fileName: "Data_Organisasi_PLN",
  });
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const parent = organizations.value.find((o) => o.id === detailRecord.value?.parent_id);
  return [
    { label: "Kode Organisasi", value: detailRecord.value.kode },
    { label: "Nama Organisasi", value: detailRecord.value.nama },
    { label: "Induk Organisasi", value: parent ? `${parent.nama} (${parent.kode})` : "Root Node" },
    { label: "Alamat / Wilayah", value: detailRecord.value.alamat || "-" },
    { label: "Latitude", value: detailRecord.value.latitude ? String(detailRecord.value.latitude) : "-" },
    { label: "Longitude", value: detailRecord.value.longitude ? String(detailRecord.value.longitude) : "-" },
    { label: "Keterangan", value: detailRecord.value.keterangan || "-" }
  ];
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- ── Page Title Header ───────────────────────────────── -->
    <BasePageHeader title="Master Organisasi" />

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
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Kode / Nama / Alamat..." />
            <BaseExportButton @click="handleExport" />
          </div>

          <BaseCreateButton label="TAMBAH DATA" @click="openCreateModal" />
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
        <BaseTable
          :columns="orgColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #kode-data="{ row }">
            <BaseBadge variant="mono">
              {{ row.kode }}
            </BaseBadge>
          </template>

          <template #nama-data="{ row }">
            <span class="text-xs text-gray-900 font-semibold">{{ row.nama }}</span>
          </template>

          <template #alamat-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.alamat || '-' }}</span>
          </template>

          <template #keterangan-data="{ row }">
            <span class="text-xs text-gray-500 truncate max-w-xs block" :title="row.keterangan">
              {{ row.keterangan || '-' }}
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
      title="Hapus Organisasi"
      :message="`Apakah Anda yakin ingin menghapus organisasi '${deleteTarget?.nama || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />

    <!-- ── View Detail Modal ─────────────────────────────────── -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Data Organisasi"
      subtitle="Informasi Lengkap Hierarki Organisasi PLN"
      :data-items="detailDataItems"
      @edit="openEditFromDetail"
    />
  </div>
</template>
