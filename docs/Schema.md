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

### 1.3. Master User & Role
```typescript
export interface User {
  id: string;
  nama: string;
  role: string;
  level: string;
  uiw: string;
  status: 'Pegawai' | 'Pengemudi';
}
```

### 1.4. Transaksi & Keuntungan
```typescript
export interface Transaksi {
  id: string;
  tanggal: string;
  nama: string;
  jumlah: number;
  kategori: string;
  status: 'Pending' | 'Selesai' | 'Batal';
}

export interface Keuntungan {
  id: string;
  periode: string;
  wilayah: string;
  pendapatan: number;
  beban: number;
  keuntungan: number;
  growth: number;
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
}
```

### 2.2. Form Field (`FormFieldConfig`)
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
  colSpan?: number; // 1 s/d 12
  required?: boolean;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
  helpText?: string;
  prefix?: string;
}
```
