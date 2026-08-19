# Design System & UI Guidelines — Tambora Web App

## 1. Color Palette & Corporate Tokens
- **PLN Brand Colors**:
  - Primary Blue: `#0084C8` (PLN Blue) / `#005B94` (Darker Shade)
  - Accent Yellow: `#FFCE00` (PLN Yellow)
  - Secondary / Slate: `slate-800` (Header/Sidebar dark accents), `slate-50` (App background)
- **Status Badges & Markers**:
  - **Operasi / Normal**: `emerald-500` / `#10B981` (Green)
  - **Pemeliharaan / Standby**: `amber-500` / `#F59E0B` (Orange / Yellow)
  - **Gangguan / Emergency**: `rose-500` / `#EF4444` (Red)
  - **Netral / Info**: `sky-500` / `#0EA5E9` (Light Blue)

---

## 2. Layout Structure & Patterns
1. **App Shell**:
   - `AppHeader`: Navbar atas dengan info profil user, notifikasi, dan quick search.
   - `AppSidebar`: Navigasi menu utama dengan grouping (Dashboard, Master Data, Transaksi).
2. **Dashboard & Data Presentation Layouts**:
   - **Metric Cards Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` menggunakan `BaseCard`.
   - **Split Layout (`SplitLayout.vue`)**: Layout 2 kolom (contoh: Peta di kiri/atas, Tabel/Grafik di kanan/bawah) dengan responsif stacking.
   - **Header Halaman (`BasePageHeader` / `BaseDashboardHeader`)**: Judul modul, breadcrumb, filter tanggal, dan tombol aksi (Ekspor, Create).

---

## 3. Base Component Conventions
- **`BaseTable`**: Mendukung sorting, custom slot renderers, pagination (`BasePagination`), dan loading skeletons.
- **`BaseChart`**: Wrapper ECharts responsif dengan auto-resize listener dan tema visual yang konsisten.
- **`BaseMap`**: Wrapper OpenLayers interaktif dengan marker custom, popup hover/click, dan auto-zoom ke koordinat sentral.
- **`BaseFormModal` & `FormFieldRenderer`**: Dynamic form rendering berbasis skema JSON (`FormFieldConfig[]`) mendukung text, select, date, searchable-select, dll.
