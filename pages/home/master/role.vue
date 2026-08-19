<template>
  <div class="h-full flex flex-col overflow-hidden bg-[#F4F7FE]">
    <!-- Top White Page Header -->
    <BasePageHeader title="Role" />

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
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Data" />
            <BaseExportButton @click="handleExport" />
          </div>
          <BaseCreateButton label="TAMBAH DATA" @click="openModal" />
        </div>

        <!-- Role Data Table -->
        <BaseTable
          :columns="masterRoleColumns"
          :rows="paginatedRows"
          class="flex-1 min-h-0"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium"
              >{{ (currentPage - 1) * pageSize + index + 1 }}.</span
            >
          </template>

          <template #roleName-data="{ row }">
            <span class="text-xs text-gray-800 font-normal">{{
              row.roleName
            }}</span>
          </template>

          <template #levelRole-data="{ row }">
            <span class="text-xs text-gray-800 font-normal">{{
              row.levelRole
            }}</span>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center justify-end">
              <button
                type="button"
                class="w-7 h-7 rounded-full bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                title="Hapus"
                @click="handleDelete(row)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
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
      :sections="masterRoleFormConfig"
      variant="centered"
      :submitting="isSubmitting"
      @submit="handleSave"
      @cancel="closeModal"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { masterRoleColumns } from "~/config/tables/masterRole";
import { masterRoleFormConfig } from "~/config/forms/masterRole";

interface RoleData {
  id: string;
  no?: number;
  roleName: string;
  levelRole: string;
}

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(5);
const isModalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const isSubmitting = ref(false);

const formData = ref<Record<string, any>>({
  roleName: "",
  levelRole: "",
});

const rows = ref<RoleData[]>([
  { id: "1", roleName: "Admin", levelRole: "Wilayah/Unit Induk" },
  { id: "2", roleName: "Operator Sentral", levelRole: "Sentral" },
  { id: "3", roleName: "Manager Unit", levelRole: "Cabang" },
  { id: "4", roleName: "Supervisor Ranting", levelRole: "Ranting" },
  { id: "5", roleName: "Dispatcher", levelRole: "Pengatur Beban" },
  { id: "6", roleName: "Pengelola Keuangan", levelRole: "Pengelola (SH/AP)" },
]);

// Reset pagination when searching
watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredRows = computed(() => {
  if (!searchQuery.value) return rows.value;
  const q = searchQuery.value.toLowerCase();
  return rows.value.filter(
    (r) =>
      r.roleName.toLowerCase().includes(q) ||
      r.levelRole.toLowerCase().includes(q),
  );
});

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

const handleExport = () => {
  alert("Mengunduh data Role ke .xls...");
};

const openModal = () => {
  formData.value = {
    roleName: "",
    levelRole: "",
  };
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSave = async () => {
  if (!formData.value.roleName || !formData.value.levelRole) {
    alert("Mohon lengkapi Nama Role dan Level Role.");
    return;
  }

  isSubmitting.value = true;
  await new Promise((resolve) => setTimeout(resolve, 500));

  rows.value.push({
    id: String(Date.now()),
    roleName: formData.value.roleName,
    levelRole: formData.value.levelRole,
  });

  isSubmitting.value = false;
  isModalOpen.value = false;

  // Smooth transition delay to open success modal
  setTimeout(() => {
    isSuccessModalOpen.value = true;
  }, 150);
};

const handleDelete = (row: RoleData) => {
  if (confirm(`Apakah Anda yakin ingin menghapus role "${row.roleName}"?`)) {
    rows.value = rows.value.filter((r) => r.id !== row.id);
  }
};
</script>
