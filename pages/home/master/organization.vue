<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
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

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<OrganizationItem | null>(null);
const isDeleting = ref(false);

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
      (o.keterangan && o.keterangan.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit"
    ? "Edit Data Organisasi"
    : "Tambah Data Organisasi",
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Ubah Organisasi"
    : "Form Tambah Organisasi",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    kode: "",
    nama: "",
    parent_id: "",
    alamat: "",
    latitude: null,
    longitude: null,
    keterangan: "",
  };
  modalOpen.value = true;
};

const handleEdit = (row: OrganizationItem) => {
  modalMode.value = "edit";
  formData.value = { ...row };
  modalOpen.value = true;
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
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteOrganization(deleteTarget.value.id);
    toast.success(
      `Organisasi '${deleteTarget.value.nama}' berhasil dihapus.`,
      "Sukses",
    );
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (err: any) {
    // Handled by useApi
  } finally {
    isDeleting.value = false;
  }
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
      !isNaN(Number(currentData.latitude))
        ? Number(currentData.latitude)
        : undefined;
    const lng =
      currentData.longitude != null &&
      currentData.longitude !== "" &&
      !isNaN(Number(currentData.longitude))
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

          <BaseCreateButton resource="ORGANIZATION" @click="openCreateModal" />
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
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton
                type="edit"
                resource="ORGANIZATION"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                type="delete"
                resource="ORGANIZATION"
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
