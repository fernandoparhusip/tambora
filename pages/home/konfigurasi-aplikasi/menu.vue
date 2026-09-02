<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { DetailDataItem, MenuItem } from "~/types/master.types";
import type { TableColumn } from "~/types";
import { getMenuFormSections } from "~/schemas/konfigurasi-aplikasi/menu.schema";
import { useMenu } from "~/composables/konfigurasi-aplikasi/useMenu";

const {
  menus,
  loading,
  detailLoading,
  parentMenuOptions,
  fetchMenus,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu,
} = useMenu();
const toast = useAppToast();

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
const deleteTarget = ref<MenuItem | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<MenuItem | null>(null);

const menuColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "nama", label: "Nama Menu" },
  { key: "url", label: "URL Route" },
  { key: "icon", label: "Icon" },
  { key: "order", label: "Urutan" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Aksi" },
];

onMounted(async () => {
  await fetchMenus();
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const formSections = computed(() => getMenuFormSections(parentMenuOptions.value));

const filteredData = computed(() => {
  if (!searchQuery.value) return menus.value;
  const q = searchQuery.value.toLowerCase();
  return menus.value.filter(
    (item) =>
      (item.nama && item.nama.toLowerCase().includes(q)) ||
      (item.url && item.url.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q)),
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Menu Aplikasi" : "Tambah Menu Aplikasi",
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Perubahan Konfigurasi Navigasi Menu"
    : "Form Penambahan Konfigurasi Navigasi Menu",
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    nama: "",
    url: "",
    icon: "",
    order: (menus.value.length + 1) * 10,
    parent_id: "",
    status: 1,
    description: "",
  };
  modalOpen.value = true;
};

const handleView = async (row: MenuItem) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
  try {
    const fresh = await getMenuById(row.id);
    if (fresh) detailRecord.value = fresh;
  } catch {
    // Keep local fallback
  }
};

const handleEdit = (row: MenuItem) => {
  modalMode.value = "edit";
  formData.value = {
    id: row.id,
    nama: row.nama,
    url: row.url || "",
    icon: row.icon || "",
    order: row.order,
    parent_id: row.parent_id || "",
    status: row.status,
    description: row.description || "",
  };
  modalOpen.value = true;
};

const handleDelete = (row: MenuItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteMenu(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
    toast.success("Berhasil!", "Menu berhasil dihapus.");
  } catch (err: any) {
    toast.error("Gagal!", err?.message || "Gagal menghapus menu.");
  } finally {
    isDeleting.value = false;
  }
};

const handleSave = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const payload = {
      nama: data.nama,
      url: data.url || undefined,
      icon: data.icon || undefined,
      order: Number(data.order) || 1,
      parent_id: data.parent_id || undefined,
      status: Number(data.status),
      description: data.description || undefined,
    };

    if (modalMode.value === "edit" && data.id) {
      await updateMenu(data.id, payload);
    } else {
      await createMenu(payload);
    }
    modalOpen.value = false;
    isSuccessModalOpen.value = true;
  } catch (err: any) {
    toast.error("Gagal Menyimpan!", err?.message || "Terjadi kesalahan saat menyimpan data menu.");
  } finally {
    submitting.value = false;
  }
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const m = detailRecord.value;
  return [
    { label: "Nama Menu", value: m.nama },
    { label: "URL Route", value: m.url || "-" },
    { label: "Icon Identifier", value: m.icon || "-" },
    { label: "Urutan (Order)", value: String(m.order) },
    { label: "Parent Menu", value: m.parent_nama || m.parent_id || "-" },
    { label: "Status", value: m.status === 1 ? "Aktif" : "Non-Aktif" },
    { label: "Deskripsi", value: m.description || "-" },
  ];
});

const createdDateFormatted = computed(() => {
  if (!detailRecord.value?.created_at) return "-";
  try {
    return new Date(detailRecord.value.created_at).toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });
  } catch {
    return detailRecord.value.created_at;
  }
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <BasePageHeader />

    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0">
        <!-- Controls Bar -->
        <div class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" />
          </div>
          <BaseCreateButton resource="MENU" @click="openCreateModal" />
        </div>

        <!-- Table -->
        <BaseTable
          :columns="menuColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchMenus"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #nama-data="{ row }">
            <div>
              <div class="font-medium text-gray-900 text-xs">{{ row.nama }}</div>
              <div v-if="row.description" class="text-[11px] text-gray-500 line-clamp-1">{{ row.description }}</div>
            </div>
          </template>

          <template #url-data="{ row }">
            <span v-if="row.url" class="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {{ row.url }}
            </span>
            <span v-else class="text-xs text-gray-400 italic">Group Menu</span>
          </template>

          <template #icon-data="{ row }">
            <span v-if="row.icon" class="text-xs font-mono text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
              {{ row.icon }}
            </span>
            <span v-else class="text-xs text-gray-400">-</span>
          </template>

          <template #order-data="{ row }">
            <span class="font-mono text-xs text-gray-800 font-semibold">{{ row.order }}</span>
          </template>

          <template #status-data="{ row }">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
              :class="row.status === 1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'"
            >
              {{ row.status === 1 ? 'Aktif' : 'Non-Aktif' }}
            </span>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton type="edit" resource="MENU" @click="handleEdit(row)" />
              <BaseActionButton type="delete" resource="MENU" @click="handleDelete(row)" />
            </div>
          </template>
        </BaseTable>

        <!-- Pagination -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredData.length"
          class="shrink-0 pt-4 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- Form Modal -->
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

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Konfigurasi Menu"
      subtitle="Informasi data teknis konfigurasi menu navigasi"
      :data-items="detailDataItems"
      :created-date="createdDateFormatted"
      :is-loading="detailLoading"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Menu"
      :message="`Apakah Anda yakin ingin menghapus menu '${deleteTarget?.nama || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
