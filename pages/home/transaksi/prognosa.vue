<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, FormSectionConfig, PrognosaDTO } from "~/types";
import type { DetailDataItem } from "~/components/base/BaseDetailModal.vue";
import { usePrognosa } from "~/composables/transaksi/usePrognosa";
import { useOrganization } from "~/composables/master/useOrganization";
import { getPrognosaFormSections } from "~/schemas/transaksi/prognosa.schema";
import BaseConfirmDialog from "~/components/base/BaseConfirmDialog.vue";

const { list, loading, fetchList, createItem, updateItem, deleteItem, exportExcel } = usePrognosa();
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
const deleteTarget = ref<PrognosaDTO | null>(null);
const isDeleting = ref(false);
const detailRecord = ref<PrognosaDTO | null>(null);

const columns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "bulan_tahun", label: "Bulan & Tahun" },
  { key: "jenis", label: "Jenis Pembangkit" },
  { key: "wilayah_id", label: "Wilayah / ULPL" },
  { key: "keterangan_nilai", label: "Kategori Nilai" },
  { key: "total_mesin", label: "Jumlah Mesin" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Aksi" }
];

const orgOptions = computed(() =>
  organizations.value.map((o: any) => ({
    label: `${o.nama} (${o.kode})`,
    value: o.id
  }))
);

const formSections = computed<FormSectionConfig[]>(() =>
  getPrognosaFormSections({ orgOptions: orgOptions.value })
);

onMounted(async () => {
  await Promise.all([fetchList(), fetchOrganizations()]);
});

watch(searchQuery, () => {
  currentPage.value = 1;
});

const filteredList = computed(() => {
  if (!searchQuery.value.trim()) return list.value;
  const q = searchQuery.value.toLowerCase().trim();
  return list.value.filter(
    (item: PrognosaDTO) =>
      item.jenis?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q) ||
      item.bulan_tahun?.toLowerCase().includes(q)
  );
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() =>
  modalMode.value === "edit" ? "Edit Data Prognosa Pembangkit" : "Tambah Dokumen Prognosa"
);
const modalSubtitle = computed(() =>
  modalMode.value === "edit"
    ? "Form Parameter Kesiapan Mesin (DMN, DMP, FOH, POH)"
    : "Form Perencanaan Kesiapan & Kinerja Pembangkit PLTU / Non-PLTU"
);

const openCreateModal = () => {
  modalMode.value = "create";
  formData.value = {
    bulan_tahun: new Date().toISOString().split("T")[0],
    jenis: "PLTU",
    wilayah_id: organizations.value[0]?.id || "",
    ulpl_id: organizations.value[0]?.id || "",
    keterangan_nilai: "Prognosa",
    status: "Draft",
    mesin_list: [
      {
        nama_mesin: "Unit Pembangkit #01",
        dtp: 1400,
        dmn: 1200,
        dmp: 1100,
        ph: 720,
        sh: 600,
        rsh: 20,
        poh: 40,
        moh: 20,
        foh: 40,
        ah: 620,
        omc: 0,
        keterangan: "Data prognosa"
      }
    ]
  };
  modalOpen.value = true;
};

const handleEdit = (row: PrognosaDTO) => {
  modalMode.value = "edit";
  formData.value = { ...row, bulan_tahun: row.bulan_tahun?.split("T")[0] };
  modalOpen.value = true;
};

const handleView = (row: PrognosaDTO) => {
  detailRecord.value = row;
  isDetailModalOpen.value = true;
};

const handleDelete = (row: PrognosaDTO) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    const payload = {
      bulan_tahun: data.bulan_tahun ? `${data.bulan_tahun}T00:00:00Z` : new Date().toISOString(),
      jenis: data.jenis || "PLTU",
      wilayah_id: data.wilayah_id,
      ulpl_id: data.ulpl_id,
      keterangan_nilai: data.keterangan_nilai || "Prognosa",
      status: data.status || "Draft",
      mesin_list: data.mesin_list || [
        {
          nama_mesin: "Unit Pembangkit #01",
          dtp: 1400,
          dmn: 1200,
          dmp: 1100,
          ph: 720,
          sh: 600,
          rsh: 20,
          poh: 40,
          moh: 20,
          foh: 40,
          ah: 620,
          omc: 0,
          keterangan: "Data prognosa"
        }
      ]
    };

    if (modalMode.value === "create") {
      await createItem(payload);
    } else if (formData.value.id) {
      await updateItem(formData.value.id, payload);
    }
    modalOpen.value = false;
    isSuccessModalOpen.value = true;
  } finally {
    submitting.value = false;
  }
};

const handleConfirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    await deleteItem(deleteTarget.value.id);
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } finally {
    isDeleting.value = false;
  }
};

const detailItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const r = detailRecord.value;
  return [
    { label: "ID Prognosa", value: r.id },
    { label: "Bulan & Tahun", value: r.bulan_tahun?.split("T")[0] || "-" },
    { label: "Jenis Pembangkit", value: r.jenis },
    { label: "Keterangan Nilai", value: r.keterangan_nilai },
    { label: "Status Dokumen", value: r.status },
    { label: "Wilayah ID", value: r.wilayah_id },
    { label: "ULPL ID", value: r.ulpl_id },
    { label: "Jumlah Mesin Terdata", value: `${r.mesin_list?.length || 0} Unit Mesin` }
  ];
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- Header -->
    <BasePageHeader title="Prognosa Kinerja Pembangkit" />

    <!-- Main Card -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- Action Controls Bar -->
        <div
          class="shrink-0 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4"
        >
          <div class="flex items-center gap-3">
            <BaseSearchInput v-model="searchQuery" placeholder="Cari jenis atau status..." />
            <BaseExportButton @click="exportExcel" />
          </div>

          <BaseCreateButton label="TAMBAH PROGNOSA" @click="openCreateModal" />
        </div>

        <!-- Table Container -->
        <BaseTable
          :columns="columns"
          :rows="paginatedList"
          :loading="loading"
          class="flex-1 min-h-0"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <template #bulan_tahun-data="{ row }">
            <span class="text-xs font-bold text-gray-900">{{ row.bulan_tahun ? row.bulan_tahun.split("T")[0] : "-" }}</span>
          </template>

          <template #jenis-data="{ row }">
            <BaseBadge :variant="row.jenis === 'PLTU' ? 'primary' : 'info'">
              {{ row.jenis }}
            </BaseBadge>
          </template>

          <template #wilayah_id-data="{ row }">
            <span class="text-xs text-gray-800 font-medium truncate max-w-[160px] inline-block">
              {{ organizations.find((o: any) => o.id === row.ulpl_id)?.nama || organizations.find((o: any) => o.id === row.wilayah_id)?.nama || row.wilayah_id }}
            </span>
          </template>

          <template #keterangan_nilai-data="{ row }">
            <span class="text-xs text-gray-600">{{ row.keterangan_nilai }}</span>
          </template>

          <template #total_mesin-data="{ row }">
            <BaseBadge variant="mono">
              {{ row.mesin_list?.length || 0 }} Unit
            </BaseBadge>
          </template>

          <template #status-data="{ row }">
            <BaseBadge :variant="row.status === 'Approved' ? 'success' : row.status === 'Submitted' ? 'warning' : 'mono'">
              {{ row.status }}
            </BaseBadge>
          </template>

          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseActionButton type="view" @click="handleView(row)" />
              <BaseActionButton type="edit" @click="handleEdit(row)" />
              <BaseActionButton type="delete" @click="handleDelete(row)" />
            </div>
          </template>
        </BaseTable>

        <!-- Pagination -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="filteredList.length"
          class="shrink-0 pt-4 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- Form Drawer Modal -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      :title="modalTitle"
      :subtitle="modalSubtitle"
      :sections="formSections"
      :submitting="submitting"
      @submit="handleSubmit"
      @cancel="modalOpen = false"
    />

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Prognosa Pembangkit"
      subtitle="Rincian parameter prognosa kesiapan unit pembangkit"
      :data-items="detailItems"
      @close="isDetailModalOpen = false"
    />

    <!-- Delete Confirmation Modal -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      title="Hapus Data Prognosa"
      :message="`Apakah Anda yakin ingin menghapus data prognosa periode ${deleteTarget?.bulan_tahun?.split('T')[0] || ''}?`"
      :loading="isDeleting"
      @confirm="handleConfirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
