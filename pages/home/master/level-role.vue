<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- ── Page Title Header ─────────────────────────────────── -->
    <BasePageHeader title="Level Role" />

    <!-- ── Main Content Container ────────────────────────────── -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- ── Action Controls Bar ───────────────────────────────── -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
          <!-- Left: Search + Export button -->
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Data" />
            <BaseExportButton @click="handleExport" />
          </div>

          <!-- Right: Create Button -->
          <BaseCreateButton label="TAMBAH DATA" @click="openCreateModal" />
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
        <BaseTable
          :columns="tableColumns"
          :rows="paginatedRows"
          :loading="loading"
          class="flex-1 min-h-0"
        >
          <!-- Status Cell Slot (Pill Badge) -->
          <template #status-data="{ row }">
            <span
              class="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200/60"
            >
              {{ row.status }}
            </span>
          </template>

          <!-- Actions Cell Slot (Delete Only) -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="w-7 h-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
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

        <!-- ── Pagination Footer ─────────────────────────────────── -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredRows.length"
          class="shrink-0 pt-3 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- ── Centered Form Modal (Tambah Data Level Role) ────────── -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      variant="centered"
      title="Tambah Data Level Role"
      subtitle="Form Tambah Data Level Role"
      :sections="levelRoleFormSections"
      :submitting="submitting"
      :errors="formErrors"
      @submit="handleSave"
      @cancel="clearErrors"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  levelRoleFormSections,
  levelRoleValidationSchema,
} from "~/config/forms/levelRole";
import type { TableColumn } from "~/components/base/BaseTable.vue";

interface LevelRoleItem {
  id: string;
  no: number;
  levelRole: string;
  status: string;
}

// Table columns
const tableColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "levelRole", label: "Level Role" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Aksi" },
];

// Initial mock data matching screenshot 1
const levelRoleList = ref<LevelRoleItem[]>([
  { id: "1", no: 1, levelRole: "UIW", status: "Aktif" },
  { id: "2", no: 2, levelRole: "UPK", status: "Aktif" },
  { id: "3", no: 3, levelRole: "ULPLTD", status: "Aktif" },
  { id: "4", no: 4, levelRole: "ULPLTU", status: "Aktif" },
  { id: "5", no: 5, levelRole: "ULPLTMG", status: "Aktif" },
]);

// Reactive states
const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(5);
const loading = ref(false);

// Filtered & Paginated Rows
const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return levelRoleList.value;
  return levelRoleList.value.filter((row) =>
    Object.values(row).some((val) => String(val).toLowerCase().includes(q)),
  );
});

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});

// Reset page on search change
watch(searchQuery, () => {
  currentPage.value = 1;
});

// Modal states
const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const formData = ref<Record<string, any>>({});
const formErrors = ref<Record<string, string>>({});
const submitting = ref(false);

const clearErrors = () => {
  formErrors.value = {};
};

const openCreateModal = () => {
  formData.value = {
    levelRole: "",
    status: true, // ON by default
  };
  clearErrors();
  modalOpen.value = true;
};

const handleSave = async () => {
  clearErrors();
  const result = levelRoleValidationSchema.safeParse(formData.value);
  if (!result.success) {
    result.error.issues.forEach((issue) => {
      const fieldKey = issue.path[0] as string;
      formErrors.value[fieldKey] = issue.message;
    });
    return;
  }

  submitting.value = true;
  try {
    const newId = String(Date.now());
    levelRoleList.value.unshift({
      id: newId,
      no: levelRoleList.value.length + 1,
      levelRole: formData.value.levelRole,
      status: formData.value.status ? "Aktif" : "Tidak Aktif",
    });

    // Re-index row numbers
    levelRoleList.value.forEach((item, idx) => {
      item.no = idx + 1;
    });

    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    alert("Gagal menyimpan: " + err.message);
  } finally {
    submitting.value = false;
  }
};

const handleDelete = (row: LevelRoleItem) => {
  if (
    confirm(`Apakah Anda yakin ingin menghapus Level Role "${row.levelRole}"?`)
  ) {
    levelRoleList.value = levelRoleList.value.filter(
      (item) => item.id !== row.id,
    );
    // Re-index row numbers
    levelRoleList.value.forEach((item, idx) => {
      item.no = idx + 1;
    });
  }
};

const handleExport = () => {
  alert("Mengunduh data Level Role (.xls)...");
};
</script>
