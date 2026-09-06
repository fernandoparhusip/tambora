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
- **Responsive Scrolling**: Tabel padat menggunakan pembungkus `overflow-x-auto` dengan lebar kolom yang proporsional agar label teks tidak terlipat. Untuk formulir Akses Grup, daftar izin menggunakan tata letak kartu 2 kolom (`grid-cols-2`) dengan switch On/Off, master toggle, dan filter modul.
- **Column Customizer**: Toggle visibilitas kolom (`enableColumnToggle`) dengan penyimpanan otomatis ke `localStorage`.
- **Row Animations**: Baris tabel menggunakan staggered animation.
- **Empty & Reload State**: Dilengkapi ilustrasi data kosong dan tombol `[ Muat Ulang ]` untuk refresh data instan.

### 3.2. `BaseFormModal` & Drawer Engine
- **Responsive Drawer Width**: Modal drawer form menggunakan kelas responsif berjenjang:
  ```css
  w-full sm:w-11/12 md:w-5/6 lg:w-3/4 xl:w-2/3 max-w-4xl
  ```
  memberikan ruang tampilan yang seimbang di Desktop, Laptop, Tablet, maupun Split-Screen.
- **Single-Page Form Flow**: Form dirancang mengalir dalam satu halaman drawer bersih (tanpa tab manual) yang dipisahkan oleh *Section Divider* yang jelas.
- **Safety & Form Draft**: Dilengkapi penyimpanan draf otomatis (`useFormDraft`) dan dialog konfirmasi *Unsaved Changes Guard* saat pengguna mencoba menutup form yang belum disimpan.

### 3.3. `FormFieldRenderer` & Popover Teleport
- **Body Teleportation**: Seluruh dropdown popover (`searchable-select` dan `searchable-multi-select`) di-teleport langsung ke `body` dengan `z-[99999]` dan penyesuaian posisi `getBoundingClientRect()` agar tidak terpotong (*clipped*) oleh kontainer drawer yang memiliki `overflow-y-auto`.
- **Form Controls Light Theme**: Seluruh input native (radio & checkbox) diatur ke `color-scheme: light !important` dan aksen biru PLN `#2563eb`.

### 3.4. Modal Layering & Stacking Context
- **Global Z-Index Hierarchy**:
  - `z-[1000000]`: Sesi Kedaluwarsa (`BaseSessionExpiredModal`).
  - `z-[999990]`: Popup Timer Inaktivitas (`BaseIdleWarningModal`) — teratas dari segala drawer & modal.
  - `z-[99999]`: Dropdown Searchable Select Popovers.
  - `z-[9999]`: Floating Toast Notifications (`BaseToastContainer`).
  - `z-[105]`: Unsaved Changes Guard Prompt.
  - `z-[100]`: Form Drawers (`BaseFormModal`) & Modal Detail (`BaseDetailModal`).
- **LIFO ESC Management**: Penggunaan `useModalEsc()` menjamin penekanan tombol `Esc` hanya menutup modal paling atas tanpa sengaja menutup modal di belakangnya.

### 3.5. Interactive GIS Coordinate Picker & Timezones
- **Two-Way Sync**: Sinkronisasi input numerik Latitude/Longitude dengan pin peta OpenLayers (`BaseMap`).
- **Zona Waktu & Guard Zero-Date**: Deteksi zona waktu (`WIB`, `WITA`, `WIT`) di `utils/formatDate.ts` dan filter zero date Go (`0001-01-01` / tahun < 1970) ke `"-"`.
- **Riwayat Modal Detail**: Binding array `history` backend (`CREATE` & `UPDATE`) ke panel status modal detail.

### 3.6. Standar Tampilan Tooltip
- **PrimeVue Tooltip**: Dikonfigurasi melalui `assets/css/primevue-overrides.css` dengan font `12px`, padding compact `4px 8px`, serta `white-space: nowrap` dan `width: max-content` agar teks tooltip tampil penuh dan rapi dalam satu baris.

