<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import type { TableColumn, FormSectionConfig } from "~/types";
import type { PaguItem, PaguBidangItem } from "~/types/transaksi/pagu.types";
import type { DetailDataItem } from "~/types/master.types";
import type { TabItem } from "~/components/base/BaseTabFilter.vue";
import { getPaguFormSections, getPaguBidangFormSections } from "~/schemas/transaksi";
import { usePaguBidang } from "~/composables/transaksi/usePaguBidang";
import { usePagu } from "~/composables/transaksi/usePagu";
import { useAppToast } from "~/composables/useAppToast";
import { exportToExcel } from "~/utils/exportExcel";
import { formatNumber, formatRupiah } from "~/utils/formatNumber";

// 1. State & Refs
const activeTab = ref<"unit" | "bidang">("unit");
const tabOptions: TabItem[] = [
  { key: "unit", label: "Pagu (Unit)" },
  { key: "bidang", label: "Pagu Bidang" }
];

const activityLogs = ref<any[]>([]);

// File Upload states
const selectedFile = ref<File | null>(null);
const pdfPreviewUrl = ref<string | null>(null);

const searchQuery = ref("");
const selectedDate = ref("");
const currentPage = ref(1);
const pageSize = ref(10);

// Modals state
const modalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const modalMode = ref<"create" | "edit">("create");
const isReviseMode = ref(false);
const formData = ref<Record<string, any>>({});
const submitting = ref(false);

const isDetailModalOpen = ref(false);
const isConfirmDialogOpen = ref(false);
const deleteTarget = ref<any>(null);
const isDeleting = ref(false);
const detailRecord = ref<PaguItem | null>(null);

// Table columns for Unit
const unitColumns: TableColumn[] = [
  { key: "no", label: "No." },
  { key: "jenis_pagu", label: "Jenis Pagu" },
  { key: "tanggal_input", label: "Tanggal Input" },
  { key: "revisi_ke", label: "Revisi" },
  { key: "dokumen_path", label: "Dokumen" },
  { key: "actions", label: "Aksi" }
];

const bidangColumns: TableColumn[] = [
  { key: 'no', label: 'No.' },
  { key: 'pagu_unit_id', label: 'ID Pagu Unit' },
  { key: 'periode', label: 'Periode' },
  { key: 'actions', label: 'Aksi' }
];

// 4. Computed Properties
const currentColumns = computed(() =>
  activeTab.value === "unit" ? unitColumns : bidangColumns
);

const currentLoading = computed(() =>
  activeTab.value === "unit" ? paguUnitLoading.value : paguBidangLoading.value
);

const { 
  list: paguUnitList, 
  loading: paguUnitLoading, 
  fetchList: fetchPaguUnitList, 
  createItem: createPaguUnit, 
  updateItem: updatePaguUnit, 
  deleteItem: deletePaguUnit, 
  reviseItem: revisePaguUnit, 
  exportExcel: exportPaguUnitExcel, 
  getById, 
  getRiwayat 
} = usePagu();

const { 
  list: paguBidangList, 
  loading: paguBidangLoading, 
  fetchList: fetchPaguBidangList, 
  createItem: createPaguBidang, 
  updateItem: updatePaguBidang, 
  deleteItem: deletePaguBidang 
} = usePaguBidang();

const paguUnitOptions = computed(() =>
  paguUnitList.value.map((p) => ({
    label: `Pagu ${p.jenis_pagu} - Tahun ${p.periode} (${p.scope})`,
    value: p.id
  }))
);

// Dynamic form sections based on active tab
const formSections = computed<FormSectionConfig[]>(() => {
  if (activeTab.value === "unit") {
    return getPaguFormSections();
  }
  return getPaguBidangFormSections({ paguUnitOptions: paguUnitOptions.value });
});

const filteredList = computed(() => {
  const q = searchQuery.value.toLowerCase().trim();
  const date = selectedDate.value;

  if (activeTab.value === "unit") {
    return paguUnitList.value.filter((item: PaguItem) => {
      const matchQuery =
        !q ||
        item.jenis_pagu?.toLowerCase().includes(q) ||
        item.scope?.toLowerCase().includes(q) ||
        item.periode?.toString().includes(q);
      const matchDate = !date || item.tanggal_input?.startsWith(date);
      return matchQuery && matchDate;
    });
  } else {
    return paguBidangList.value.filter((item: PaguBidangItem) => {
      const matchQuery =
        !q ||
        item.pagu_unit_id?.toLowerCase().includes(q) ||
        item.periode?.toString().includes(q);
      const matchDate = !date || item.created_at?.startsWith(date);
      return matchQuery && matchDate;
    });
  }
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredList.value.slice(start, start + pageSize.value);
});

const modalTitle = computed(() => {
  if (activeTab.value === "unit") {
    return isReviseMode.value
      ? "Revisi Pagu Anggaran"
      : modalMode.value === "edit"
        ? "Edit Data Pagu Unit"
        : "Tambah Dokumen Pagu Anggaran (Unit)";
  }
  return modalMode.value === "edit"
    ? "Edit Alokasi Pagu Bidang"
    : "Tambah Alokasi Pagu Bidang";
});

const modalSubtitle = computed(() => {
  if (activeTab.value === "unit") {
    return isReviseMode.value
      ? "Form Pengajuan Revisi Pagu Anggaran Unit"
      : "Form Pencatatan Pagu AO/AKO, AI/AKI & POS 54";
  }
  return modalMode.value === "edit"
    ? "Form Pembagian Anggaran Operasional Bidang"
    : "Form Alokasi Pagu Unit ke Bidang (Ophar, Adum, K3L)";
});

const detailItems = computed<DetailDataItem[]>(() => {
  if (!detailRecord.value) return [];
  const r = detailRecord.value;
  return [
    { label: "ID Pagu", value: r.id },
    { label: "Jenis Pagu", value: r.jenis_pagu },
    { label: "Tahun Periode", value: `${r.periode}` },
    { label: "Scope", value: r.scope },
    { label: "Revisi Ke", value: `Rev ${r.revisi || 0}` },
    { label: "Tanggal Input", value: r.tanggal_input?.split("T")[0] || "-" },
    { label: "Dokumen Pendukung", value: r.dokumen_path || "Tidak ada lampiran" },
    { label: "Jumlah Rincian Item", value: `${r.detail_ao_ako?.length || 0} Baris Anggaran` }
  ];
});

// 5. Composable Calls
const toast = useAppToast();

// 6. Watchers
watch(activeTab, () => {
  currentPage.value = 1;
  searchQuery.value = "";
});

watch([searchQuery, selectedDate], () => {
  currentPage.value = 1;
});

// 7. Methods & Event Handlers
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (file.type !== "application/pdf") {
      toast.error("Hanya file PDF yang diperbolehkan");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 10MB");
      return;
    }
    selectedFile.value = file;
    pdfPreviewUrl.value = URL.createObjectURL(file);
    formData.value.dokumen_path = file.name;
  }
};

const removeFile = () => {
  selectedFile.value = null;
  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value);
    pdfPreviewUrl.value = null;
  }
  formData.value.dokumen_path = "";
};

const openCreateModal = () => {
  modalMode.value = "create";
  isReviseMode.value = false;
  formData.value = {
    jenis_pagu: "AO_AKO",
    periode: new Date().getFullYear(),
    scope: "Unit",
    tanggal_input: new Date().toISOString().split("T")[0],
    dokumen_path: "Dokumen_Pagu_2026.pdf",
    detail_ao_ako: [
      { urutan: 1, level: 1, uraian: "Bahan Bakar dan Pelumas", ao: 1250000000, ako: 1000000000 },
      { urutan: 2, level: 1, uraian: "Pemeliharaan Mesin & Pembangkit", ao: 800000000, ako: 750000000 }
    ],
    detail_pos54: []
  };
  modalOpen.value = true;
};

const handleEdit = async (row: any) => {
  modalMode.value = "edit";
  isReviseMode.value = false;
  formData.value = {
    ...row,
    tanggal_input: row.tanggal_input ? row.tanggal_input.split("T")[0] : undefined
  };
  modalOpen.value = true;
  
  if (activeTab.value === "unit") {
    try {
      const res = await getById(row.id);
      if (res?.data) {
        formData.value = { ...res.data, tanggal_input: res.data.tanggal_input?.split("T")[0] };
      }
    } catch {
      toast.error("Gagal mengambil data lengkap untuk diedit");
    }
  }
};

const openReviseModal = async (row: any) => {
  modalMode.value = "edit";
  isReviseMode.value = true;
  formData.value = {
    ...row,
    tanggal_input: row.tanggal_input ? row.tanggal_input.split("T")[0] : undefined
  };
  modalOpen.value = true;
  
  try {
    const res = await getById(row.id);
    if (res?.data) {
      formData.value = { ...res.data, tanggal_input: res.data.tanggal_input?.split("T")[0] };
    }
  } catch {
    toast.error("Gagal mengambil data lengkap untuk direvisi");
  }
};

const handleView = async (row: any) => {
  detailRecord.value = row;
  activityLogs.value = [];
  isDetailModalOpen.value = true;
  
  if (activeTab.value === "unit") {
    try {
      const res = await getById(row.id);
      if (res?.data) {
        detailRecord.value = res.data;
      }
      
      const riwayatData = await getRiwayat(row.id);
      activityLogs.value = riwayatData.map((r: any) => {
        const dateObj = new Date(r.created_at);
        const formattedDate = dateObj.toLocaleDateString('id-ID', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        });
        const name = r.creator_name || 'Sistem';
        return {
          initial: name.charAt(0).toUpperCase(),
          user: name,
          action: r.aksi === 'REVISE' ? 'Revisi Pagu Anggaran' : (r.aksi === 'UPDATE' ? 'Edit Data Pagu' : (r.aksi === 'DELETE' ? 'Hapus Data Pagu' : r.aksi)),
          timestamp: formattedDate
        };
      });
    } catch {
      toast.error("Gagal mengambil detail pagu");
    }
  }
};

const handleDelete = (row: any) => {
  deleteTarget.value = row;
  isConfirmDialogOpen.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    const data = formData.value;
    if (activeTab.value === "unit") {
      const payload = {
        jenis_pagu: data.jenis_pagu || "AO_AKO",
        periode: Number(data.periode) || new Date().getFullYear(),
        scope: data.scope || "Unit",
        tanggal_input: data.tanggal_input ? `${data.tanggal_input}T00:00:00Z` : new Date().toISOString(),
        dokumen_path: data.dokumen_path || "/uploads/Dokumen_Pagu.pdf",
        detail_ao_ako: data.detail_ao_ako || [],
        detail_ai_aki: data.detail_ai_aki || [],
        detail_pos54: data.detail_pos54 || []
      };

      if (isReviseMode.value && formData.value.id) {
        await revisePaguUnit(formData.value.id, payload);
      } else if (modalMode.value === "create") {
        await createPaguUnit(payload);
      } else if (formData.value.id) {
        await updatePaguUnit(formData.value.id, payload);
      }
      await fetchPaguUnitList();
    } else {
      const payload = {
        pagu_unit_id: data.pagu_unit_id,
        periode: Number(data.periode) || new Date().getFullYear(),
        details: data.details || [
          { uraian: "Operasi & Pemeliharaan", ao: 500000000, ako: 450000000, persentase: 50 }
        ]
      };

      if (modalMode.value === "create") {
        await createPaguBidang(payload);
      } else if (formData.value.id) {
        await updatePaguBidang(formData.value.id, payload);
      }
      await fetchPaguBidangList();
    }

    modalOpen.value = false;
    setTimeout(() => {
      isSuccessModalOpen.value = true;
    }, 150);
  } catch (err: any) {
    toast.error(err?.message || "Terjadi kesalahan saat menyimpan data");
  } finally {
    submitting.value = false;
  }
};

const handleConfirmDelete = async () => {
  if (!deleteTarget.value) return;
  isDeleting.value = true;
  try {
    if (activeTab.value === "unit") {
      await deletePaguUnit(deleteTarget.value.id);
      await fetchPaguUnitList();
    } else {
      await deletePaguBidang(deleteTarget.value.id);
      await fetchPaguBidangList();
    }
    isConfirmDialogOpen.value = false;
    deleteTarget.value = null;
  } catch (err: any) {
    toast.error(err?.message || "Gagal menghapus data");
  } finally {
    isDeleting.value = false;
  }
};

const handleExport = () => {
  if (activeTab.value === "unit") {
    exportPaguUnitExcel();
  } else {
    exportToExcel(
      bidangColumns,
      filteredList.value,
      { fileName: `Pagu_Bidang_${new Date().toISOString().split("T")[0]}` }
    );
  }
};

// 8. Lifecycle Hooks
onMounted(async () => {
  await Promise.all([fetchPaguUnitList(), fetchPaguBidangList()]);
});
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <!-- Header -->
    <BasePageHeader />

    <!-- Main Card -->
    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- Action Controls Bar -->
        <div
          class="shrink-0 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-4"
        >
          <!-- Left filters: Search, Date Filter, Export -->
          <div class="flex flex-wrap items-center gap-3.5">
            <BaseSearchInput
              v-model="searchQuery"
              placeholder="Cari Data"
              class="w-48 sm:w-60 shrink-0"
            />

            <!-- Date Filter using BaseDateFilter -->
            <BaseDateFilter
              v-model="selectedDate"
              placeholder="Pilih Tanggal"
              class="w-48 sm:w-56 shrink-0"
            />

            <!-- Export Button -->
            <BaseExportButton @click="handleExport" />
          </div>

          <!-- Right controls: Tab Pills & Tambah Data -->
          <div class="flex items-center gap-3 self-end lg:self-auto">
            <!-- Tab Switcher: Unit | Bidang -->
            <BaseTabFilter
              v-model:active-tab="activeTab"
              :items="tabOptions"
              container-bg-color="#F1F5F9"
              indicator-bg-color="#FFFFFF"
              active-text-color="#1E293B"
              inactive-text-color="#64748B"
            />

            <BaseCreateButton
              label="TAMBAH DATA"
              @click="openCreateModal"
            />
          </div>
        </div>

        <!-- Table Container -->
        <BaseTable
          :columns="currentColumns"
          :rows="paginatedList"
          :loading="currentLoading"
          class="flex-1 min-h-0"
          @reload="activeTab === 'unit' ? fetchPaguUnitList() : fetchPaguBidangList()"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium">
              {{ (currentPage - 1) * pageSize + index + 1 }}.
            </span>
          </template>

          <!-- Tab Unit Slots -->
          <template #jenis_pagu-data="{ row }">
            <BaseBadge :variant="row.jenis_pagu === 'AO_AKO' ? 'primary' : row.jenis_pagu === 'AI_AKI' ? 'info' : 'warning'">
              {{ row.jenis_pagu === 'AO_AKO' ? 'Pagu AO/AKO' : row.jenis_pagu === 'AI_AKI' ? 'Pagu AI/AKI' : row.jenis_pagu }}
            </BaseBadge>
          </template>

          <template #tanggal_input-data="{ row }">
            <span class="text-xs text-gray-700 font-medium">
              {{ row.tanggal_input ? row.tanggal_input.split("T")[0] : "-" }}
            </span>
          </template>

          <template #revisi_ke-data="{ row }">
            <BaseBadge :variant="(row.revisi || 0) > 0 ? 'warning' : 'mono'">
              Rev {{ row.revisi || 0 }}
            </BaseBadge>
          </template>

          <!-- Actions -->
          <template #actions-data="{ row }">
            <div class="flex items-center gap-1.5">
              <BaseTableActions
                resource="PAGU"
                @view="handleView(row)"
                @edit="handleEdit(row)"
                @delete="handleDelete(row)"
              >
                <!-- Tombol Ekstra: Revisi hanya untuk Pagu Unit -->
                <template #extra v-if="activeTab === 'unit'">
                  <button
                    type="button"
                    class="px-2 py-1 text-[11px] font-semibold rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200 cursor-pointer flex items-center justify-center h-7"
                    title="Revisi Pagu"
                    @click.stop="openReviseModal(row)"
                  >
                    Revisi
                  </button>
                </template>
              </BaseTableActions>
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
      :draft-key="activeTab === 'unit' ? 'transaksi-pagu-unit' : 'transaksi-pagu-bidang'"
      @submit="handleSubmit"
      @cancel="modalOpen = false"
    >
      <template #append-form="{ formData }">
        <div v-if="activeTab === 'unit' && (formData.jenis_pagu === 'AO_AKO' || formData.jenis_pagu === 'POS_54')" class="space-y-3 pt-2 mt-2">
          <!-- Section Divider & Title -->
          <div class="flex items-center gap-3">
            <span class="w-1.5 h-4 bg-[#2671D9] rounded-full" />
            <h4 class="text-xs font-bold uppercase tracking-wider text-[#2671D9]">
              Detail Input {{ formData.jenis_pagu === 'AO_AKO' ? 'AO & AKO' : 'POS 54' }}
            </h4>
            <div class="flex-1 h-px bg-gray-200/80" />
          </div>

          <div class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
            <table class="w-full text-sm text-left">
              <thead class="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-[#2C3E50]">
                <tr>
                  <th rowspan="2" class="px-4 py-3 border-r border-gray-200 w-12 text-center align-middle">No.</th>
                  <th rowspan="2" class="px-4 py-3 border-r border-gray-200 align-middle">Uraian</th>
                  <th colspan="2" class="px-4 py-2 text-center border-b border-gray-200">Penetapan {{ formData.periode || new Date().getFullYear() }}</th>
                </tr>
                <tr>
                  <th class="px-4 py-2 border-r border-gray-200 text-center w-48">AO (Rp)</th>
                  <th class="px-4 py-2 text-center w-48">AKO (Rp)</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="(item, idx) in (formData.jenis_pagu === 'POS_54' ? formData.detail_pos54 : formData.detail_ao_ako)" :key="idx" 
                    class="transition-colors hover:bg-sky-50/30"
                    :class="{'bg-[#F4F7FB]/50': item.level === 1}">
                  <td class="px-4 py-2 border-r border-gray-100 text-center font-bold text-gray-700">
                    {{ item.level === 1 ? item.urutan : '' }}
                  </td>
                  <td class="px-4 py-2 border-r border-gray-100 text-gray-800" 
                      :class="{'pl-10 text-sm font-medium': item.level === 2, 'font-bold text-[#2C3E50]': item.level === 1}">
                    {{ item.uraian }}
                  </td>
                  <td class="px-1.5 py-1.5 border-r border-gray-100">
                    <input v-model="item.ao" type="number" 
                           class="w-full px-3 py-1.5 text-right text-sm border border-gray-200 focus:border-[#2671D9] focus:ring-1 focus:ring-[#2671D9] hover:border-gray-300 rounded bg-white transition-all placeholder:text-gray-300 font-medium" 
                           placeholder="0" />
                  </td>
                  <td class="px-1.5 py-1.5">
                    <input v-model="item.ako" type="number" 
                           class="w-full px-3 py-1.5 text-right text-sm border border-gray-200 focus:border-[#2671D9] focus:ring-1 focus:ring-[#2671D9] hover:border-gray-300 rounded bg-white transition-all placeholder:text-gray-300 font-medium" 
                           placeholder="0" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- File Upload Section -->
        <div v-if="activeTab === 'unit'" class="mt-8">
          <div class="flex items-center gap-3 mb-6">
            <span class="text-sm font-semibold text-gray-500 whitespace-nowrap">Upload Dokumen</span>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>

          <div class="bg-white rounded-xl shadow-xs border border-gray-100 p-5">
            <div class="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-1 h-4 bg-[#2671D9] rounded-sm"></div>
                  <span class="text-sm font-bold text-[#1e4e79]">Nama Dokumen</span>
                </div>
                <div class="text-sm font-medium text-gray-600 pl-3">
                  {{ selectedFile ? selectedFile.name : formData.dokumen_path || '-' }}
                </div>
              </div>
              <div>
                <div class="text-sm font-bold text-[#1e4e79] mb-2">Kapasitas</div>
                <div class="text-sm font-medium text-gray-600">
                  {{ selectedFile ? formatFileSize(selectedFile.size) : '- MB' }}
                </div>
              </div>
            </div>

            <!-- Dropzone -->
            <div v-if="!selectedFile && !pdfPreviewUrl" class="relative group">
              <input 
                type="file" 
                accept=".pdf" 
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                @change="handleFileUpload" 
              />
              <div class="border-2 border-dashed border-[#a6c4f0] bg-[#eef4ff]/50 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-[#2671D9] transition-all group-hover:bg-[#eef4ff] group-hover:border-[#2671D9]">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 transition-transform group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span class="font-bold text-sm text-gray-800">Pilih atau Tarik File Disini</span>
                <span class="text-xs text-gray-500">Maksimum ukuran file 10MB, format file PDF</span>
              </div>
            </div>

            <!-- PDF Preview -->
            <div v-else class="relative bg-gray-100 rounded-lg overflow-hidden border border-gray-200 h-[600px] shadow-inner group">
              <object v-if="pdfPreviewUrl" :data="pdfPreviewUrl" type="application/pdf" class="w-full h-full">
                <p>Browser Anda tidak mendukung preview PDF. <a :href="pdfPreviewUrl" class="text-blue-600 underline">Download File</a></p>
              </object>
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <p>File terlampir: {{ formData.dokumen_path }}</p>
              </div>
              
              <!-- Remove File Button -->
              <button 
                @click.prevent="removeFile" 
                class="absolute top-4 right-6 bg-white/90 hover:bg-red-50 text-red-600 rounded-full p-2 shadow-md transition-all opacity-0 group-hover:opacity-100"
                title="Hapus Dokumen"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </template>
    </BaseFormModal>

    <!-- Detail Modal -->
    <BaseDetailModal
      v-model:is-open="isDetailModalOpen"
      title="Detail Pagu Anggaran"
      subtitle="Rincian anggaran operasional dan investasi"
      :data-items="detailItems"
      :activity-logs="activityLogs"
      :record="detailRecord"
      @close="isDetailModalOpen = false"
      @edit="detailRecord && handleEdit(detailRecord)"
    >
      <template #body-content v-if="activeTab === 'unit'">
        <div class="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
          <table class="w-full text-sm text-left">
            <thead class="bg-gray-50/50 border-b border-gray-200 text-xs font-semibold text-[#2C3E50]">
              <tr>
                <th rowspan="2" class="px-4 py-3 border-r border-gray-200 w-12 text-center align-middle">No.</th>
                <th rowspan="2" class="px-4 py-3 border-r border-gray-200 align-middle">Uraian</th>
                <th colspan="2" class="px-4 py-2 text-center border-b border-gray-200">Penetapan {{ detailRecord?.periode || new Date().getFullYear() }}</th>
              </tr>
              <tr>
                <th class="px-4 py-2 border-r border-gray-200 text-center w-48">AO (Rp)</th>
                <th class="px-4 py-2 text-center w-48">AKO (Rp)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="(item, idx) in (detailRecord?.jenis_pagu === 'POS_54' ? detailRecord?.detail_pos54 : detailRecord?.detail_ao_ako)" :key="idx" 
                  class="transition-colors hover:bg-sky-50/30"
                  :class="{'bg-[#F4F7FB]/50': item.level === 1}">
                <td class="px-4 py-2 border-r border-gray-100 text-center font-bold text-gray-700">
                  {{ item.level === 1 ? item.urutan : '' }}
                </td>
                <td class="px-4 py-2 border-r border-gray-100 text-gray-800" 
                    :class="{'pl-10 text-sm font-medium': item.level === 2, 'font-bold text-[#2C3E50]': item.level === 1}">
                  {{ item.uraian }}
                </td>
                <td class="px-4 py-2 border-r border-gray-100 text-right">
                  {{ item.ao ? formatNumber(item.ao) : '-' }}
                </td>
                <td class="px-4 py-2 text-right">
                  {{ item.ako ? formatNumber(item.ako) : '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </BaseDetailModal>

    <!-- Delete Confirmation Modal -->
    <BaseConfirmDialog
      v-model:is-open="isConfirmDialogOpen"
      :title="activeTab === 'unit' ? 'Hapus Data Pagu Unit' : 'Hapus Data Pagu Bidang'"
      :message="`Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.`"
      :loading="isDeleting"
      @confirm="handleConfirmDelete"
    />

    <!-- Success Modal -->
    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
