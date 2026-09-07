# Developer Guide — Tambora Web App

Panduan teknis dan standar operasional prosedur (SOP) bagi frontend engineer dalam mengembangkan fitur, menambah modul master/transaksi baru, serta menjaga kualitas kode di Tambora Web App.

---

## 1. Struktur Folder Project

```text
tambora-frontend/
├── assets/             # CSS, ikon SVG, logo PLN, gambar lokal
├── components/         # Komponen Vue
│   ├── base/           # Komponen murni generik (BaseTable, BaseFormModal, BaseMap, dll.)
│   ├── layout/         # Komponen layout (AppSidebar, AppHeader, BasePageHeader)
│   └── login/          # Komponen login & slider captcha
├── composables/        # State reaktif, auth, SWR cache, form draft, dan API CRUD
│   ├── konfigurasi-aplikasi/ # useAksesLevel, useAksesGrup, useMenu
│   ├── master/         # useRegional, useUiwUid, useUik, useUp2d, useUpk, useUnitLayanan, useSentral, useUser, dll.
│   └── transaksi/      # useOperasiHarian, usePagu, usePrognosa, dll.
├── config/             # Konfigurasi navigasi sidebar (config/navigation.ts)
├── docs/               # Dokumentasi arsitektur, PRD, schema, dan developer guide
├── pages/              # Halaman routing Nuxt
│   ├── home/
│   │   ├── dashboard/  # Halaman GIS & ECharts monitoring
│   │   ├── konfigurasi-aplikasi/ # Halaman Akses Level, Akses Grup, Menu
│   │   ├── master/     # Halaman CRUD data master (Regional, UIW/UID, UIK, UP2D, UPK, Unit Layanan, Sentral, dll.)
│   │   └── transaksi/  # Halaman CRUD modul transaksi
│   └── login.vue       # Halaman autentikasi
├── schemas/            # Definisi deklaratif Form Engine (12-column grid system)
│   ├── konfigurasi-aplikasi/ # Form schema untuk Akses Level, Akses Grup, Menu
│   ├── master/         # Form schema untuk master data
│   └── transaksi/      # Form schema untuk transaksi
├── stores/             # Pinia stores (auth.ts)
├── types/              # TypeScript interface & DTO contracts
├── utils/              # Pure utility functions (exportExcel, formatNumber, apiError)
└── test/               # Vitest unit test suite (466 tests across 78 suites, 80.43% coverage, 100% green required)
```

---

## 2. Standar 5 Langkah Menambahkan Modul / Menu Form Baru

Setiap modul baru (baik di kategori **Master Data** maupun **Transaksi**) wajib mengikuti 5 langkah standar berikut agar seragam, modular, dan otomatis mewarisi fitur keamanan & ketangguhan jaringan.

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ 1. Types & DTO  │ ──► │ 2. Form Schema  │ ──► │ 3. Composable   │
│ types/*.ts      │     │ schemas/*/*.ts  │     │ composables/*   │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
┌─────────────────┐     ┌─────────────────┐              │
│ 5. Page View    │ ◄── │ 4. Nav Sidebar  │ ◄────────────┘
│ pages/home/*    │     │ config/nav.ts   │
└─────────────────┘     └─────────────────┘
```

---

### Langkah 1: Definisikan Types & Kontrak DTO (`types/`)

Buka `types/master.types.ts` atau `types/transaksi.types.ts` dan buat interface:

```typescript
// types/transaksi.types.ts
export interface ContohItemDTO {
  id: string;
  nama_kegiatan: string;
  volume: number;
  tanggal: string;
  status?: string;
}

export interface CreateContohRequest {
  nama_kegiatan: string;
  volume: number;
  tanggal: string;
}
```

---

### Langkah 2: Buat Schema Form Deklaratif (`schemas/`)

Buat file schema di `schemas/transaksi/contoh.schema.ts` (atau `schemas/master/contoh.schema.ts`):

```typescript
// schemas/transaksi/contoh.schema.ts
import type { FormSectionConfig } from "~/types";

export interface ContohSchemaOptions {
  kategoriOptions?: { label: string; value: string }[];
}

export const getContohFormSections = (
  options: ContohSchemaOptions = {},
): FormSectionConfig[] => [
  {
    title: "Informasi Utama",
    fields: [
      {
        key: "nama_kegiatan",
        label: "Nama Kegiatan",
        type: "text",
        colSpan: 6,
        required: true,
        placeholder: "Masukkan nama kegiatan",
      },
      {
        key: "volume",
        label: "Volume (MWh)",
        type: "number",
        colSpan: 6,
        required: true,
        placeholder: "0",
      },
      {
        key: "tanggal",
        label: "Tanggal Pelaksanaan",
        type: "date",
        colSpan: 12,
        required: true,
      },
    ],
  },
];
```

> **Catatan:** Daftarkan fungsi schema di [`schemas/index.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/schemas/index.ts) agar mudah diimpor secara terpusat.

---

### Langkah 3: Buat Composable CRUD API (`composables/`)

Gunakan `useApi()` untuk memanggil backend proxy (`/api/v1`):

```typescript
// composables/transaksi/useContoh.ts
import { ref, computed } from "vue";
import { useApi } from "~/composables/useApi";
import type { ContohItemDTO, CreateContohRequest, ApiResponse } from "~/types";

export const useContoh = () => {
  const api = useApi();
  const list = ref<ContohItemDTO[]>([]);
  const loading = ref(false);

  const fetchList = async () => {
    loading.value = true;
    try {
      const res = await api<ApiResponse<ContohItemDTO[]>>("/contoh");
      list.value = res?.data || [];
      return list.value;
    } finally {
      loading.value = false;
    }
  };

  const createItem = async (payload: CreateContohRequest) => {
    return await api("/contoh", {
      method: "POST",
      body: payload,
    });
  };

  // Standard Tambora: Update menggunakan POST ke /contoh/:id
  const updateItem = async (
    id: string,
    payload: Partial<CreateContohRequest>,
  ) => {
    return await api(`/contoh/${id}`, {
      method: "POST",
      body: payload,
    });
  };

  // Standard Tambora: Delete menggunakan POST ke /contoh/:id/delete
  const deleteItem = async (id: string) => {
    return await api(`/contoh/${id}/delete`, {
      method: "POST",
    });
  };

  return {
    list: computed(() => list.value),
    loading: computed(() => loading.value),
    fetchList,
    createItem,
    updateItem,
    deleteItem,
  };
};
```

> [!IMPORTANT]
> **Kebijakan HTTP Methods Proyek Tambora:**
>
> - Method `PUT` dan `DELETE` dilarang digunakan di backend/frontend.
> - Operasi **Update / Edit** wajib menggunakan `POST /{resource}/{id}`.
> - Operasi **Delete / Hapus** wajib menggunakan `POST /{resource}/{id}/delete`.

---

### Langkah 4: Daftarkan Menu Sidebar (`config/navigation.ts`)

Tambahkan rute menu baru ke array `masterItems` atau `transaksiItems`:

```typescript
// config/navigation.ts
import { Activity } from "@lucide/vue";

export const transaksiItems: NavigationItem[] = [
  // ...menu sebelumnya
  {
    label: "Contoh Transaksi",
    to: "/home/transaksi/contoh",
    icon: Activity,
  },
];
```

---

### Langkah 5: Buat Halaman Page (`pages/home/transaksi/contoh.vue`)

Satukan komponen UI menggunakan template standar berikut:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { TableColumn, FormSectionConfig, ContohItemDTO } from "~/types";
import { getContohFormSections } from "~/schemas";
import { useTableState } from "~/composables/useTableState";

const { list, loading, fetchList, createItem, deleteItem } = useContoh();
const {
  searchQuery,
  currentPage,
  pageSize,
  activeFilteredData,
  paginatedData,
} = useTableState(list, { defaultPageSize: 10 });

const columns: TableColumn[] = [
  { key: "no", label: "No" },
  { key: "nama_kegiatan", label: "Nama Kegiatan" },
  { key: "volume", label: "Volume (MWh)" },
  { key: "tanggal", label: "Tanggal" },
  { key: "actions", label: "Aksi" },
];

const modalOpen = ref(false);
const formData = ref<Record<string, any>>({});
const submitting = ref(false);
const isSuccessModalOpen = ref(false);

const formSections = computed<FormSectionConfig[]>(() =>
  getContohFormSections(),
);

onMounted(async () => {
  await fetchList();
});

const openCreateModal = () => {
  formData.value = {
    nama_kegiatan: "",
    volume: 0,
    tanggal: new Date().toISOString().split("T")[0],
  };
  modalOpen.value = true;
};

const handleSubmit = async () => {
  submitting.value = true;
  try {
    await createItem(formData.value as any);
    modalOpen.value = false;
    isSuccessModalOpen.value = true;
    await fetchList();
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden bg-gray-50/50">
    <BasePageHeader />

    <div class="flex-1 flex flex-col p-4 sm:p-6 min-h-0 overflow-hidden">
      <div
        class="flex-1 flex flex-col bg-white rounded-lg border border-gray-100 p-4 sm:p-5 shadow-2xs overflow-hidden min-h-0"
      >
        <!-- Action Controls -->
        <div class="shrink-0 flex items-center justify-between mb-4">
          <BaseSearchInput v-model="searchQuery" />
          <BaseCreateButton @click="openCreateModal" />
        </div>

        <!-- Table (with Centralized Reload & Lucide Icons) -->
        <BaseTable
          :columns="columns"
          :rows="paginatedData"
          :loading="loading"
          class="flex-1 min-h-0"
          @reload="fetchList"
        >
          <template #no-data="{ index }">
            <span class="text-xs text-gray-700 font-medium"
              >{{ index + 1 }}.</span
            >
          </template>
        </BaseTable>

        <!-- Pagination -->
        <BasePagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="activeFilteredData.length"
          class="shrink-0 pt-3 border-t border-gray-100"
        />
      </div>
    </div>

    <!-- Form Modal dengan Auto-Save Draft -->
    <BaseFormModal
      v-model:is-open="modalOpen"
      v-model:form-data="formData"
      title="Tambah Data Contoh"
      subtitle="Silakan lengkapi parameter input di bawah ini"
      :sections="formSections"
      :submitting="submitting"
      draft-key="transaksi-contoh"
      @submit="handleSubmit"
      @cancel="modalOpen = false"
    />

    <BaseSuccessModal v-model:is-open="isSuccessModalOpen" />
  </div>
</template>
```

---

## 3. Fitur Remote & Low-Bandwidth Resilience (Sumbawa Ready)

Semua halaman yang mengikuti pola di atas secara otomatis mendapatkan 3 perlindungan:

1. **Auto-Save Draft Form (`draft-key`)**:
   - Mengetik di modal otomatis disimpan ke `localStorage` (debounced 500ms).
   - Jika laptop mati lampu / browser reload, muncul banner **[Pulihkan Draft]**.
   - Draft otomatis terhapus saat form sukses disubmit.
2. **SWR Caching (`useApiCache`)**:
   - Menampilkan data tabel instan 0ms saat navigasi antar tab, sambil revalidasi halus di background.
3. **Smart Network Retry (`useApi`)**:
   - Otomatis mencoba ulang request hingga 2x dengan jeda 1 detik jika koneksi drop/RTO.

---

---

## 4. Standar Modal Detail SSOT, Isolasi State Loading & Validasi Form

### 4.1 Standarisasi Metadata Modal Detail (`BaseDetailModal`)
Untuk mencegah duplikasi kode formatting tanggal, Published ID, dan parsing riwayat pada setiap halaman modul:
- Cukup kirimkan `:record="detailRecord"` ke `<BaseDetailModal />`.
- Komponen `BaseDetailModal` secara otomatis menyusun metadata standar (Published ID, Tanggal Pembuatan dengan filter tanggal nol Go `0001-01-01`, Pembuat, dan array riwayat aktivitas).
- Halaman hanya perlu mendefinisikan `:data-items="detailDataItems"` untuk field spesifik modul.

### 4.2 Isolasi State Loading Mutasi Composable
- Fungsi mutasi (`createItem`, `updateItem`, `deleteItem`) **DILARANG** mengubah state `loading.value` tabel utama. State `loading.value` tabel hanya dikontrol oleh fungsi pemuatan (`fetchList`).
- Form drawer mengelola state `submitting.value` tersendiri. Dengan demikian, jika validasi form gagal / backend mengembalikan error, tabel di latar belakang tidak berkedip (_flicker_).
- Setelah mutasi berhasil, composable langsung menjalankan `await fetchList()` untuk memperbarui data tabel secara elegan.

### 4.3 Jeda Transisi Modal Sukses (`BaseSuccessModal`)
Saat menutup drawer form setelah operasi berhasil, gunakan jeda waktu 150ms sebelum membuka modal sukses untuk mencegah konflik unmount transisi:
```typescript
modalOpen.value = false;
setTimeout(() => {
  isSuccessModalOpen.value = true;
}, 150);
```

### 4.4 Validasi Form `required: true/false`
- Pada skema deklaratif (`schemas/`), tetapkan `required: true` untuk field wajib dan `required: false` untuk opsional.
- `BaseFormModal` secara cerdas memvalidasi field:
  - Tipe `coordinate-picker`: Memvalidasi Latitude (`latKey`) dan Longitude (`lngKey`) saat `required: true`.
  - Tipe `multi-select`: Menolak array kosong `[]` jika `required: true`.
  - Tipe teks / select: Menolak string kosong / null / undefined.
- Indikator tanda bintang merah (`*`) pada `FormFieldRenderer` dievaluasi otomatis berdasarkan boolean `field.required`.

---

### 4.5 Standarisasi Aksi Tabel (`BaseTableActions`) & Manajemen State CRUD (`useCrudState`)
Untuk menjaga konsistensi antarmuka dan mengeliminasi duplikasi kode (< 3.0% SonarQube Clean As You Go):
- Gunakan `<BaseTableActions :record="slotProps.data" @view="..." @edit="..." @delete="..." />` di seluruh kolom aksi tabel data. Komponen ini menyediakan tombol Lihat Detail, Ubah, dan Hapus yang seragam dengan tooltip, accessibility label, dan slot `#extra` untuk aksi tambahan khusus (misal: tombol Setujui).
- Gunakan composable `useCrudState({ resourceName: 'NamaModul' })` untuk mengelola state pencarian, paginasi (`currentPage`, `pageSize`, `paginateList`), status modal (`modalOpen`, `modalMode`, `formData`, `submitting`), serta dialog konfirmasi hapus (`openDeleteDialog`, `executeDelete`).

### 4.6 Keamanan PRNG & Nilai Acak Kriptografis (`cryptoRandom.ts`)
- **DILARANG** menggunakan `Math.random()` untuk menghasilkan ID, sequence, token, atau operasi yang berdampak pada keamanan/keacakan (CWE-330 / SonarQube S2245).
- Selalu gunakan utilitas [`utils/cryptoRandom.ts`](file:///c:/Users/andym/Documents/Project%20Vue/tambora-frontend/utils/cryptoRandom.ts):
  - `getSecureRandom()`: Menghasilkan angka acak floating-point aman `[0, 1)` menggunakan Web Crypto API (`crypto.getRandomValues()`).
  - `getNextSequenceId(prefix)`: Menghasilkan ID unik berurutan yang aman dan deterministik.

---

## 5. Checklist Kualitas & Pre-Commit Verification

Sebelum melakukan commit kode baru, pastikan seluruh tahapan verifikasi wajib berhasil tanpa error:

1. **Linting Verification**:
   ```bash
   npm run lint
   ```
2. **Automated Unit Testing**:
   ```bash
   npm test
   ```
3. **Coverage Report Verification (SonarQube Quality Gate > 80%)**:
   ```bash
   npm run test:coverage
   ```
   > [!NOTE]
   > Menghasilkan artefak laporan `coverage/lcov.info` untuk SonarQube dengan target statement coverage > 80% (modul `**/transaksi/**` sementara dieksklusikan dari kalkulasi coverage hingga difinalisasi).
4. **Production Bundle Build**:
   ```bash
   npm run build
   ```
5. Pastikan tidak ada kredensial hardcoded, label usang / "Legacy", atau URL eksternal yang tidak stabil.
