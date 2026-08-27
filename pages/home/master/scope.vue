<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useScope } from "~/composables/master/useScope";
import BaseConfirmDialog from "~/components/base/BaseConfirmDialog.vue";
import { exportToExcel } from "~/utils/exportExcel";
import type { ScopeItem, TableColumn } from "~/types";
import { scopeFormSections } from "~/schemas/master/scope.schema";

const { scopes, loading, fetchScopes, createScope, deleteScope } = useScope();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);
const isModalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const isSubmitting = ref(false);
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<ScopeItem | null>(null);
const isDeleting = ref(false);

const scopeColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "code", label: "Kode Scope" },
  { key: "name", label: "Nama Scope" },
  { key: "scope_type_name", label: "Tipe Scope" },
  { key: "description", label: "Deskripsi" },
  { key: "actions", label: "Aksi" }
];

const formData = ref<Record<string, any>>({
  code: "",
  name: "",
  description: ""
});

onMounted(async () => {
  await fetchScopes();
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredRows = computed(() => {
  if (!searchQuery.value) return scopes.value;
  const q = searchQuery.value.toLowerCase();
  return scopes.value.filter(
    (s) =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q))
  );
});

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

const openModal = () => {
  formData.value = {
    code: "",
    name: "",
    description: ""
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSave = async () => {
  if (!formData.value.code || !formData.value.name) {
    alert("Mohon lengkapi Kode Scope dan Nama Scope.");
    return;
  }

  isSubmitting.value = true;
  try {
    await createScope({
      code: formData.value.code.toUpperCase().replace(/\s+/g, "-"),
      name: formData.value.name,
      description: formData.value.description || formData.value.name
    });

    isModalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    alert("Gagal membuat scope: " + (err?.message || err));
  } finally {
    isSubmitting.value = false;
  }
};

const handleExport = () => {
  exportToExcel(scopeColumns, filteredRows.value, {
    fileName: "Data_Scope_Wilayah_PLN",
  });
};

const handleDelete = (row: ScopeItem) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const confirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteScope(deleteTarget.value.id);
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
    <BasePageHeader title="Master Scope (Wilayah / Unit)" />

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
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Kode atau Nama Scope..." />
            <BaseExportButton @click="handleExport" />
          </div>
          <BaseCreateButton label="TAMBAH DATA" @click="openModal" />
        </div>

        <!-- Scope Table -->
        <BaseTable
          :columns="scopeColumns"
          :rows="paginatedRows"
          :loading="loading"
          class="flex-1 min-h-0"
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
            <span class="text-xs text-gray-900 font-medium">{{ row.name }}</span>
          </template>

          <template #scope_type_name-data="{ row }">
            <BaseBadge variant="info">
              {{ row.scope_type_name || row.scope_type_code || 'Organization' }}
            </BaseBadge>
          </template>

          <template #description-data="{ row }">
            <span class="text-xs text-gray-600 font-normal">
              {{ row.description || '-' }}
            </span>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center justify-end">
              <BaseActionButton
                type="delete"
                title="Hapus Scope"
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

    <!-- Centered Form Modal for Tambah Scope -->
    <BaseFormModal
      v-model:is-open="isModalOpen"
      v-model:form-data="formData"
      title="Tambah Data Scope"
      subtitle="Form Tambah Scope Regional / Unit"
      :sections="scopeFormSections"
      variant="centered"
      :submitting="isSubmitting"
      @submit="handleSave"
      @cancel="closeModal"
    />

    <!-- Confirm Delete Dialog -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Scope"
      :message="`Apakah Anda yakin ingin menghapus scope '${deleteTarget?.name || ''}'? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="confirmDelete"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
