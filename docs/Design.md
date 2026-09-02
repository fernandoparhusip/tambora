# Design System & UI Guidelines — Tambora Web App

## 1. Color Palette & Corporate Tokens
- **PLN Brand Colors**:
  - Primary Blue: `#0084C8` (PLN Blue) / `#005B94` (Darker Shade) / `#2671D9` (Action Highlights)
  - Accent Yellow: `#FFCE00` (PLN Yellow)
  - Secondary / Slate: `slate-800` (Header/Sidebar dark accents), `slate-50` / `#F6FAFD` (App & Drawer background)
- **Status Badges & Markers**:
  - **Operasi / Normal**: `emerald-500` / `#10B981` (Green)
  - **Pemeliharaan / Standby**: `amber-500` / `#F59E0B` (Orange / Yellow)
  - **Gangguan / Emergency**: `rose-500` / `#EF4444` (Red)
  - **Netral / Info**: `sky-500` / `#0EA5E9` (Light Blue)

---

## 2. Layout Structure & Patterns
1. **App Shell**:
   - `AppHeader`: Navbar atas dengan info profil user, status hak akses, dan avatar profil.
   - `AppSidebar`: Navigasi menu utama bertingkat dengan grouping dinamis (*Dashboard, Konfigurasi Aplikasi, Master Data, Transaksi*) dan accordion 60 FPS.
2. **Dashboard & Data Presentation Layouts**:
   - **Metric Cards Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` menggunakan `BaseCard`.
   - **Split Layout (`SplitLayout.vue`)**: Layout 2 kolom (contoh: Peta di kiri/atas, Tabel/Grafik di kanan/bawah) dengan responsif stacking.
   - **Header Halaman (`BasePageHeader` / `BaseDashboardHeader`)**: Judul modul, breadcrumb, filter tanggal, dan tombol kontrol terstandarisasi (`BaseCreateButton`, `BaseSearchInput`).

---

## 3. Base Component Conventions & UX Guidelines

### 3.1. `BaseTable` & Data Grid
- **Responsive Scrolling**: Untuk tabel padat (seperti *Permission Matrix Akses Grup*), wajib menggunakan pembungkus `overflow-x-auto min-w-[820px]` dengan kolom modul terkunci `w-[220px] shrink-0` agar label teks tidak terlipat menjadi satu huruf pada layar tablet.
- **Column Customizer**: Toggle visibilitas kolom (`enableColumnToggle`) dengan penyimpanan otomatis ke `localStorage`.
- **Row Animations**: Baris tabel dirender dengan animasi berjenjang **GSAP Row Stagger** (`clearProps: 'transform,opacity'`) untuk tampilan berkelas.
- **Empty & Reload State**: Dilengkapi ilustrasi database dan tombol `[ 🔄 Muat Ulang ]` untuk refresh data instan.

### 3.2. `BaseFormModal` & Drawer Engine
- **Responsive Drawer Width**: Modal drawer form menggunakan kelas responsif berjenjang:
  ```css
  w-full sm:w-11/12 md:w-5/6 lg:w-3/4 xl:w-2/3 max-w-4xl
  ```
  memberikan ruang pernapasan optimal di Desktop, Laptop, Tablet, maupun Split-Screen.
- **Single-Page Form Flow**: Form dirancang mengalir dalam satu halaman drawer bersih (tanpa tab manual) yang dipisahkan oleh *Section Divider* yang jelas.
- **Safety & Zero Data Loss**: Dilengkapi **Auto-Save Draft** (`useFormDraft`) dan dialog konfirmasi **Unsaved Changes Guard** saat operator mencoba menutup form yang belum disimpan.

### 3.3. `FormFieldRenderer` & Popover Teleport
- **Body Teleportation**: Seluruh dropdown popover (`searchable-select` dan `searchable-multi-select`) di-teleport langsung ke `body` dengan `z-[99999]` dan penyesuaian posisi `getBoundingClientRect()` agar tidak terpotong (*clipped*) oleh kontainer drawer yang memiliki `overflow-y-auto`.
- **Form Controls Light Theme**: Seluruh input native (radio & checkbox) diatur ke `color-scheme: light !important` dan aksen biru PLN `#2563eb`.
