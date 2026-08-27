<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, FormSectionConfig, MachineConditionItem } from "~/types";
import { useMachineCondition } from "~/composables/master/useMachineCondition";

const {
  machineConditions,
  loading,
  fetchMachineConditions,
  createMachineCondition,
  updateMachineCondition,
  deleteMachineCondition
} = useMachineCondition();

const searchQuery = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const conditionColumns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "name", label: "Nama Kondisi Mesin" },
  { key: "description", label: "Deskripsi Operasional" },
  { key: "is_active", label: "Status" },
  { key: "actions", label: "Aksi" }
];

const formSections: FormSectionConfig[] = [
  {
    fields: [
      {
        key: "name",
        label: "Nama Kondisi Mesin",
        type: "text",
        placeholder: "Contoh: Beroperasi, Standby, Derating, Gangguan, Pemeliharaan",
        required: true,
        colSpan: 12
      },
      {
        key: "description",
        label: "Deskripsi Operasional",
        type: "textarea",
        placeholder: "Jelaskan definisi dan dampak operasional kondisi mesin ini...",
        required: false,
        colSpan: 12,
        rows: 3
      },
      {
        key: "is_active",
        label: "Status Aktif?",
        type: "switch",
        helpText: "Nonaktifkan jika status ini sudah tidak digunakan dalam pelaporan.",
        required: false,
        colSpan: 12
      }
    ]
  }
];

onMounted(async () => {
  await fetchMachineConditions();
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredData = computed(() => {
  if (!searchQuery.value) return machineConditions.value;
  const q = searchQuery.value.toLowerCase();
  return machineConditions.value.filter(
    (c) =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.description && c.description.toLowerCase().includes(q))
  );
});

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredData.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Kondisi Mesin" : "Tambah Kondisi Mesin"
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Edit Master Kondisi Mesin Pembangkit"
    : "Form Tambah Master Kondisi Mesin Pembangkit"
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    name: "",
    description: "",
    is_active: true
  };
  modalOpen.value = true;
};

const handleEdit = (row: MachineConditionItem) => {
  modalMode.value = "edit";
  formData.value = { ...row };
  modalOpen.value = true;
};

const handleDelete = async (row: MachineConditionItem) => {
  if (confirm(`Apakah Anda yakin ingin menghapus kondisi mesin "${row.name}"?`)) {
    try {
      await deleteMachineCondition(row.id);
    } catch (err: any) {
      alert("Gagal menghapus kondisi mesin: " + (err?.message || err));
    }
  }
};

const handleSave = async () => {
  if (!formData.value.name || formData.value.name.trim() === "") {
    alert("Nama Kondisi Mesin wajib diisi.");
    return;
  }

  submitting.value = true;
  try {
    if (modalMode.value === "create") {
      await createMachineCondition({
        name: formData.value.name.trim(),
        description: formData.value.description?.trim() || "",
        is_active: formData.value.is_active ?? true
      });
    } else {
      await updateMachineCondition(formData.value.id, {
        name: formData.value.name.trim(),
        description: formData.value.description?.trim() || "",
        is_active: formData.value.is_active ?? true
      });
    }
    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    alert("Gagal menyimpan kondisi mesin: " + (err?.message || err));
  } finally {
    submitting.value = false;
  }
};

const handleExport = () => {
  alert("Mengunduh data Kondisi Mesin ke .xls...");
};

const getConditionBadgeVariant = (name: string) => {
  const n = (name || "").toLowerCase();
  if (n.includes("operasi") || n.includes("normal")) return "success";
  if (n.includes("standby") || n.includes("siap")) return "info";
  if (n.includes("derating") || n.includes("turun")) return "warning";
  if (n.includes("gangguan") || n.includes("trip") || n.includes("rusak")) return "danger";
  if (n.includes("pelihara") || n.includes("overhaul")) return "primary";
  return "neutral";
};
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- ── Page Title Header ───────────────────────────────── -->
    <BasePageHeader title="Master Kondisi Mesin" />

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
            <BaseSearchInput v-model="searchQuery" placeholder="Cari Kondisi Mesin..." />
            <BaseExportButton @click="handleExport" />
          </div>

          <BaseCreateButton label="TAMBAH DATA" @click="openCreateModal" />
        </div>

        <!-- ── Table Container ───────────────────────────────────── -->
        <BaseTable
          :columns="conditionColumns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #name-data="{ row }">
            <div class="flex items-center gap-2">
              <BaseBadge :variant="getConditionBadgeVariant(row.name)">
                {{ row.name }}
              </BaseBadge>
            </div>
          </template>

          <template #description-data="{ row }">
            <span class="text-xs text-gray-600 truncate max-w-md block" :title="row.description">
              {{ row.description || '-' }}
            </span>
          </template>

          <template #is_active-data="{ row }">
            <BaseBadge :variant="row.is_active ? 'success' : 'danger'">
              {{ row.is_active ? 'Aktif' : 'Nonaktif' }}
            </BaseBadge>
          </template>

          <!-- Action Buttons Cell Slot -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
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

    <!-- ── Centered Form Modal ───────────────────────────────── -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="formSections"
      variant="centered"
      :submitting="submitting"
      @submit="handleSave"
      @cancel="modalOpen = false"
    />

    <!-- Success Modal Popup -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
