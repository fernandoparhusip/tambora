# Data Schemas & API Contracts — Tambora Web App

## 1. Domain Entities

### 1.1. Sentral Pembangkit (`SentralItem`)
Data unit pembangkit yang ditampilkan pada Peta GIS dan Tabel Operasional:
```typescript
export interface SentralItem {
  id: string;
  name: string;
  status: 'operasi' | 'standby' | 'pemeliharaan' | 'gangguan';
  dmn: number;          // Daya Mampu Nyata (MW)
  dmp: number;          // Daya Mampu Pasok (MW)
  beban: number;        // Beban Realtime (MW)
  pomo: string;         // Status PO/MO
  foder: string;        // Forced Outage Derating
  lat: number;          // Latitude Koordinat
  lng: number;          // Longitude Koordinat
  kondisi?: string;     // Catatan kondisi lapangan
}
```

### 1.2. Ringkasan Sistem (`SystemSummary`)
Data KPI agregat di bagian atas dashboard operasi:
```typescript
export interface SystemSummary {
  title: string;        // e.g. "Sistem Tambora"
  statusBadge: string;  // e.g. "Normal" | "Siaga" | "Darurat"
  dmn: string;          // Total DMN (MW)
  dmp: string;          // Total DMP (MW)
  bebanSistem: string;  // Beban Puncak / Realtime (MW)
  unitMax: string;      // Kapasitas Unit Terbesar (MW)
  cadTotal: string;     // Cadangan Total (MW)
  cadPutar: string;     // Cadangan Putar (MW)
}
```

### 1.3. Konfigurasi Aplikasi & Master Entities (`types/master.types.ts`)
* **Konfigurasi Aplikasi**:
  * `ScopeItem` (Master Akses Level): Kode, Nama, Tipe Scope (`Organization`), Deskripsi, dan Audit Trail (`/api/v1/scopes`).
  * `RoleItem` (Master Akses Grup): Kode, Nama, Deskripsi, Tipe System/Custom, Hak Akses (`permissions`), dan Audit Trail (`/api/v1/roles`).
  * `MenuItemDTO` (Master Menu): UUID, Nama, URL Route, Icon, Order, Parent ID, Status (1/0), dan Description (`/api/v1/menu`).
* **Master Hierarki Unit PLN**:
  * `RegionalDTO`: Kode Regional, Nama Regional, Latitude, Longitude (`/api/v1/regional`).
  * `CabangItem`: Kode Wilayah, Kode Cabang, Nama Cabang, Approve Status, Keterangan (`/api/v1/cabang`).
  * `RantingItem`: Kode Cabang, Kode Ranting, Nama Ranting, Status Ranting (Aktif/Tidak Aktif), Approve Status (Approved/Draft/Rejected), Keterangan (`/api/v1/ranting`).
  * `UiwUidDTO`: Kode, Nama, Alamat, Keterangan (`/api/v1/uiw-uid`).
  * `UikDTO`: Kode, Nama (`/api/v1/uik`).
  * `Up2dDTO`: UIW/UID ID, Kode, Nama, Alamat, Keterangan (`/api/v1/up2d`).
  * `UpkDTO`: UIK ID, Kode, Nama, Is Active (`/api/v1/upk`).
  * `UnitLayananDTO`: UPK ID, Kode, Nama, Is Active (`/api/v1/unit-layanan`).
  * `SentralFullDTO`: Profil sentral lengkap (nama, kode, latitude, longitude, pengelola, daya terpasang/mampu, manager info, sejarah) (`/api/v1/sentral`).
* **Master Data Lainnya**:
  * `UserItem` (`CreateUserRequest` & `UpdateUserRequest`): 20-field schema (`access_level`, `address`, `akses_grup`, `approval_code`, `description`, `email`, `full_name`, `is_pengelola`, `is_sso`, `jabatan`, `jenis_pengguna`, `main_application`, `nip`, `organization`, `organization_id`, `password`, `permission_overrides`, `pernr`, `phone_number`, `role_assignments`, `status_karyawan`).
  * `PermissionItem`: Auto-generated `permission_key` (`{ResourceCode}.{ActionCode}`), resource ID, action ID, dan deskripsi.
  * `DriverDTO`: Master pengemudi operasional PLN.
  * `OrganizationDTO`: Struktur hierarki unit/induk/wilayah (*parent-child*).
  * `SystemDTO`: Master sistem ketenagalistrikan (Kode, Nama, Tipe Sistem, UPK ID, Unit Layanan IDs, Deskripsi, Latitude, Longitude) (`/api/v1/system`).
  * `AssetDTO` & `MachineConditionDTO`: Inventaris mesin pembangkit dan status kesiapan.

### 1.4. Transaksi Entities (`types/transaksi.types.ts`)
Kontrak DTO live untuk seluruh modul transaksi pembangkitan:
* **Operasi Harian (`OperasiHarianDTO`)**: Daya terpasang, DMN, DMP, Aktual, Produksi (kWh), dan Konsumsi Bahan Bakar.
* **Pemakaian BBM (`PemakaianBahanBakarDTO`)**: Konsumsi batubara, HSD, B30, MFO, Biomassa, Gas dan sisa stok.
* **Pembebanan Generator (`PembebananDTO`)**: Beban aktif (MW), tegangan (kV), frekuensi (Hz), dan faktor daya.
* **Pagu Anggaran (`PaguDTO`)**: Pagu AO & AKO, AI & AKI, POS 54, alur revisi (`/revise`), dan export (`/export`).
* **Prognosa Kinerja (`PrognosaDTO`)**: Parameter kesiapan mesin PLTU/Non-PLTU (DMN, DMP, PH, SH, RSH, POH, MOH, FOH, AH, OMC) dan export (`/export`).
* **Perhitungan NKO (`NKODTO`)**: Realisasi KPI bulanan vs target, skor polaritas, dan export (`/export`).

### 1.5. Autentikasi & User Session (`types/auth.types.ts`)
```typescript
export interface UserSession {
  id?: string;
  nama: string;           // full_name
  full_name?: string;
  username?: string;
  role?: string;          // e.g. "Admin"
  email?: string;
  level_id?: string;
  organization?: string;  // e.g. "PLN Tambora"
  nip?: string;
  prnr?: string;
  status?: number | string;
}

export interface AuthSession {
  isLoggedIn: boolean;
  user: UserSession | null;
  token?: string;
  refreshToken?: string;
}
```

---

## 2. Generic Config Schemas

### 2.1. Table Column (`TableColumn`)
Konfigurasi deklaratif untuk `BaseTable.vue`:
```typescript
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'currency' | 'number' | 'date' | 'percent' | 'custom';
  locked?: boolean; // Kolom wajib yang tidak bisa disembunyikan
}
```

### 2.2. Dynamic Form Engine (`FormSectionConfig` & `FormFieldConfig`)
Konfigurasi deklaratif untuk `BaseFormModal.vue` & `FormFieldRenderer.vue`:
```typescript
export interface FormFieldConfig {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'date'
    | 'select'
    | 'searchable-select'
    | 'multi-select'
    | 'searchable-multi-select'
    | 'radio'
    | 'phone'
    | 'currency'
    | 'textarea'
    | 'switch';
  placeholder?: string;
  options?: { label: string; value: any }[];
  colSpan?: number; // 1 s/d 12 (Grid 12-Column System)
  required?: boolean;
  disabled?: boolean | ((formData: Record<string, any>) => boolean);
  hidden?: (formData: Record<string, any>) => boolean;
  maxLength?: number;
  rows?: number;
  helpText?: string;
  prefix?: string;
}

export interface FormSectionConfig {
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
}
```

### 2.3. Form Schema Registry
* **Master Schemas:** `schemas/master/*.schema.ts` (User, Driver, Organization, System, Role, Scope, Machine Condition, Asset).
* **Transaksi Schemas:** `schemas/transaksi/*.schema.ts` (Operasi Harian, BBM, Pembebanan, Pagu, Pagu Bidang, Prognosa, NKO).
* **Central Barrel Export:** `schemas/index.ts`.
