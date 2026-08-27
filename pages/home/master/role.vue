<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRole } from "~/composables/master/useRole";
import BaseConfirmDialog from "~/components/base/BaseConfirmDialog.vue";
import { exportToExcel } from "~/utils/exportExcel";
import type { RoleItem, TableColumn } from "~/types";
import { roleFormSections } from "~/schemas/master/role.schema";

const { roles, loading, fetchRoles, createRole, deleteRole } = useRole();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const isModalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const isSubmitting = ref(false);
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<RoleItem | null>(null);
const isDeleting = ref(false);

const masterRoleColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "code", label: "Kode Role" },
  { key: "name", label: "Nama Role" },
  { key: "description", label: "Deskripsi" },
  { key: "is_system", label: "Tipe" },
  { key: "actions", label: "Aksi" }
];

const formData = ref<Record<string, any>>({
  code: "",
  name: "",
  description: "",
  levelRole: ""
});

onMounted(async () => {
  await fetchRoles();
});

// Reset pagination when searching
watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredRows = computed(() => {
  if (!searchQuery.value) return roles.value;
  const q = searchQuery.value.toLowerCase();
  return roles.value.filter(
    (r) =>
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q))
  );
});

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

const handleExport = () => {
  exportToExcel(masterRoleColumns, filteredData.value, {
    fileName: "Data_Role_PLN",
  });
};

const openModal = () => {
  formData.value = {
    code: "",
    name: "",
    description: "",
    levelRole: ""
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSave = async () => {
  if (!formData.value.code || !formData.value.name) {
    alert("Mohon lengkapi Kode Role dan Nama Role.");
    return;
  }

  isSubmitting.value = true;
  try {
    await createRole({
      code: formData.value.code.toUpperCase().replace(/\s+/g, "_"),
      name: formData.value.name,
      description: formData.value.description || formData.value.name,
      permissions: []
    });

    isModalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    alert("Gagal membuat role: " + (err?.message || err));
  } finally {
    isSubmitting.value = false;
  }
};

const handleDelete = (row: RoleItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteRole(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (err: any) {
    // Handled by useApi
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#F4F7FE]">
    <!-- Top White Page Header -->
    <BasePageHeader title="Role & Hak Akses" />

    <!-- Container Padding -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <!-- White Main Card Container -->
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- Action Header Bar -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Kode atau Nama Role" />
            <BaseExportButton @click="handleExport" />
          </div>
          <BaseCreateButton label="TAMBAH DATA" @click="openModal" />
        </div>

        <!-- Role Data Table -->
        <BaseTable
          :columns="masterRoleColumns"
          :rows="paginatedRows"
          :loading="loading"
          class="flex-1 min-h-0"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium"
              >{{ (currentPage - 1) * pageSize + index + 1 }}.</span
            >
          </template>

          <template #code-data="{ row }">
            <BaseBadge variant="mono">
              {{ row.code }}
            </BaseBadge>
          </template>

          <template #name-data="{ row }">
            <span class="text-xs text-gray-900 font-medium">{{
              row.name
            }}</span>
          </template>

          <template #description-data="{ row }">
            <span class="text-xs text-gray-600 font-normal truncate max-w-xs block" :title="row.description">{{
              row.description || '-'
            }}</span>
          </template>

          <template #is_system-data="{ row }">
            <BaseBadge :variant="row.is_system ? 'system' : 'success'">
              {{ row.is_system ? 'System' : 'Custom' }}
            </BaseBadge>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center justify-end gap-1.5">
              <BaseActionButton
                v-if="!row.is_system"
                type="delete"
                title="Hapus Role"
                @click="handleDelete(row)"
              />
            </div>
          </template>
        </BaseTable>

        <!-- Pagination -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredRows.length"
          class="shrink-0 pt-4 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- Centered Form Modal for Tambah Data Role -->
    <BaseFormModal
      v-model:is-open="isModalOpen"
      v-model:form-data="formData"
      title="Tambah Data Role"
      subtitle="Form Tambah Data Role"
      :sections="roleFormSections"
      variant="centered"
      :submitting="isSubmitting"
      @submit="handleSave"
      @cancel="closeModal"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Role"
      :message="`Apakah Anda yakin ingin menghapus role '${deleteTarget?.name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
