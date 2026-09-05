<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type {
  DetailDataItem,
  MenuItem,
  CreateMenuRequest,
  UpdateMenuRequest,
} from "~/types/master.types";
import type { TableColumn } from "~/types";
import { getMenuFormSections } from "~/schemas/konfigurasi-aplikasi/menu.schema";
import { useMenu } from "~/composables/konfigurasi-aplikasi/useMenu";
import { useAsyncDetail } from "~/composables/useAsyncDetail";

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
const selectedEditId = ref<string>("");
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<MenuItem | null>(null);
const isDeleting = ref(false);

const menuColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "nama", label: "Nama Menu" },
  { key: "route", label: "URL Route" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Aksi" },
];

onMounted(async () => {
  await fetchMenus();
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const formSections = computed(() =>
  getMenuFormSections(parentMenuOptions.value),
);

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
    ? "Form Ubah Menu"
    : "Form Tambah Menu",
);

const openCreateModal = () => {
  modalMode.value = "create";
  selectedEditId.value = "";
  formData.value = {
    nama: "",
    route: "",
    parent_id: "",
    status: "",
  };
  modalOpen.value = true;
};



const handleEdit = (row: MenuItem | any) => {
  modalMode.value = "edit";
  selectedEditId.value = String(row.id || row.ID || "");
  const parentId = row.parent_id || "";
  let routeVal = row.route || row.url || "";

  // If menu has a parent, strip parent route so input only shows suffix next to badge
  if (parentId) {
    const parentOpt = parentMenuOptions.value.find(
      (p) => String(p.value) === String(parentId),
    );
    const parentRoute = (parentOpt?.route || "").replace(/\/$/, "");
    if (parentRoute && routeVal.startsWith(parentRoute)) {
      routeVal = routeVal.slice(parentRoute.length);
      if (!routeVal.startsWith("/")) {
        routeVal = `/${routeVal}`;
      }
    }
  }

  formData.value = {
    id: selectedEditId.value,
    nama: row.nama || row.name || "",
    route: routeVal,
    parent_id: parentId,
    status: row.status ?? 1,
  };
  modalOpen.value = true;
};

// Universal Async Detail Management (Guarded against race conditions & memory leaks)
const {
  isDetailModalOpen,
  detailRecord,
  detailLoading: asyncDetailLoading,
  handleView,
  closeDetailModal,
  openEditFromDetail,
} = useAsyncDetail<MenuItem>({
  fetchDetail: (id) => getMenuById(id),
  onEdit: (record) => handleEdit(record),
});

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
    let routeVal = (data.route || data.url || "").trim();

    // If parent is selected, concatenate parent route with suffix
    if (data.parent_id && routeVal) {
      const parentOpt = parentMenuOptions.value.find(
        (p) => String(p.value) === String(data.parent_id),
      );
      const parentRoute = (parentOpt?.route || "").replace(/\/$/, "");
      if (parentRoute && !routeVal.startsWith(parentRoute)) {
        const cleanSuffix = routeVal.replace(/^\//, "");
        routeVal = `${parentRoute}/${cleanSuffix}`;
      }
    } else if (routeVal && !routeVal.startsWith("/")) {
      routeVal = `/${routeVal}`;
    }

    const payload: CreateMenuRequest = {
      nama: String(data.nama || data.name || "").trim(),
      route: routeVal,
      url: routeVal,
      status:
        data.status !== "" && data.status !== undefined
          ? Number(data.status)
          : 1,
    };
    if (data.parent_id) {
      payload.parent_id = data.parent_id;
    }

    const editId = selectedEditId.value || data.id || detailRecord.value?.id;
    if (modalMode.value === "edit" && editId) {
      await updateMenu(editId, payload as UpdateMenuRequest);
    } else {
      await createMenu(payload);
    }
    modalOpen.value = false;
    isSuccessModalOpen.value = true;
  } catch (err: any) {
    toast.error(
      "Gagal Menyimpan!",
      err?.message || "Terjadi kesalahan saat menyimpan data menu.",
    );
  } finally {
    submitting.value = false;
  }
};

const detailDataItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const m: any = detailRecord.value;
  return [
    { label: "Nama Menu", value: m.nama || m.name || "-" },
    { label: "URL Route", value: m.route || m.url || "-" },
    { label: "Parent Menu", value: m.parent_nama || m.parent_id || "-" },
    { label: "Urutan", value: String(m.order ?? m.sort_no ?? "-") },
    { label: "Status", value: m.status === 1 ? "Aktif" : "Non-Aktif" },
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
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- Controls Bar -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
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
              <div class="text-xs text-gray-900">
                {{ row.nama }}
              </div>
              <div
                v-if="row.description"
                class="text-[11px] text-gray-500 line-clamp-1"
              >
                {{ row.description }}
              </div>
            </div>
          </template>

          <template #route-data="{ row }">
            <span v-if="row.route || row.url" class="text-xs text-gray-800">
              {{ row.route || row.url }}
            </span>
            <span v-else class="text-xs text-gray-400 italic">Group Menu</span>
          </template>

          <template #order-data="{ row }">
            <span class="text-xs text-gray-800">{{
              row.order ?? row.sort_no ?? "-"
            }}</span>
          </template>

          <template #sort_no-data="{ row }">
            <span class="text-xs text-gray-800">{{
              row.order ?? row.sort_no ?? "-"
            }}</span>
          </template>

          <template #status-data="{ row }">
            <span
              class="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium"
              :class="
                row.status === 1
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              "
            >
              {{ row.status === 1 ? "Aktif" : "Non-Aktif" }}
            </span>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton
                type="edit"
                resource="MENU"
                @click="handleEdit(row)"
              />
              <BaseActionButton
                type="delete"
                resource="MENU"
                @click="handleDelete(row)"
              />
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
      title="Detail Menu"
      subtitle="Informasi Menu"
      :record-id="detailRecord?.id"
      :data-items="detailDataItems"
      :created-date="createdDateFormatted"
      :loading="detailLoading || asyncDetailLoading"
      @close="closeDetailModal"
      @edit="openEditFromDetail()"
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
